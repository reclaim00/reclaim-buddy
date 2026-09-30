const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ServiceAccount = { project_id: string; client_email: string; private_key: string; token_uri?: string };
type FirestoreValue = Record<string, unknown>;

function unwrap(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    const array = value.arrayValue as { values?: FirestoreValue[] };
    return (array.values || []).map(unwrap);
  }
  if ("mapValue" in value) {
    const map = value.mapValue as { fields?: Record<string, FirestoreValue> };
    return decodeFields(map.fields || {});
  }
  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue>) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) result[key] = unwrap(value);
  return result;
}

function b64url(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

let cachedGoogleToken: { token: string; expiresAt: number } | null = null;

async function googleAccessToken(account: ServiceAccount) {
  if (cachedGoogleToken && cachedGoogleToken.expiresAt > Date.now() + 60_000) return cachedGoogleToken.token;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging",
    aud: account.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const pem = account.private_key.replace(/\\n/g, "\n").replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const raw = Uint8Array.from(atob(pem), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", raw, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned)));
  const assertion = `${unsigned}.${b64url(signature)}`;
  const response = await fetch(account.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!response.ok) throw new Error(`Google token exchange failed (${response.status})`);
  const body = await response.json();
  cachedGoogleToken = { token: body.access_token, expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000 };
  return cachedGoogleToken.token;
}

function accountCredentials(): ServiceAccount {
  const raw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!raw) throw new Error("Firebase service account secret is not configured");
  return JSON.parse(raw) as ServiceAccount;
}

async function verifyFirebaseUser(idToken: string) {
  const apiKey = Deno.env.get("FIREBASE_WEB_API_KEY");
  if (!apiKey) throw new Error("Firebase web API key secret is not configured");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }),
  });
  if (!response.ok) return null;
  const body = await response.json();
  const email = body.users?.[0]?.email;
  return typeof email === "string" ? email.toLowerCase() : null;
}

async function getDocument(project: string, collection: string, id: string, token: string) {
  const path = id.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${collection}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore read failed (${response.status})`);
  const doc = await response.json();
  return decodeFields(doc.fields || {});
}

async function markDispatch(project: string, id: string, token: string) {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/notificationDispatches?documentId=${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { createdAt: { timestampValue: new Date().toISOString() } } }),
  });
  if (response.status === 409) return false;
  if (!response.ok) throw new Error(`Could not record notification dispatch (${response.status})`);
  return true;
}

async function unmarkDispatch(project: string, id: string, token: string) {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/notificationDispatches/${encodeURIComponent(id)}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok && response.status !== 404) console.warn("Could not clear notification retry marker", response.status);
}

async function sendFcm(account: ServiceAccount, token: string, platform: string, title: string, body: string, tag: string, url: string) {
  const accessToken = await googleAccessToken(account);
  const message: Record<string, unknown> = {
    token,
    data: { title, body, icon: "icon-192.png", tag, url },
  };
  if (platform === "mobile") {
    message.notification = { title, body };
    message.android = { notification: { channel_id: "reclaim" } };
    message.apns = { payload: { aps: { sound: "default" } } };
  }
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error(`FCM send failed (${response.status})`);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const idToken = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!idToken) return Response.json({ error: "Sign-in required" }, { status: 401, headers: corsHeaders });
    const email = await verifyFirebaseUser(idToken);
    if (!email) return Response.json({ error: "Invalid sign-in" }, { status: 401, headers: corsHeaders });

    const input = await request.json();
    const kind = input?.kind;
    const documentId = input?.documentId;
    if (!(["message", "partnership_ended"].includes(kind)) || typeof documentId !== "string" || documentId.length > 200) {
      return Response.json({ error: "Invalid notification request" }, { status: 400, headers: corsHeaders });
    }

    const account = accountCredentials();
    const accessToken = await googleAccessToken(account);
    let recipient = "";
    let title = "";
    let body = "";
    let tag = "";
    let url = "app.html?action=buddy";

    if (kind === "message") {
      const message = await getDocument(account.project_id, "messages", documentId, accessToken) as Record<string, unknown> | null;
      if (!message || String(message.from || "").toLowerCase() !== email || typeof message.to !== "string" || typeof message.partnershipCode !== "string") {
        return Response.json({ error: "Message not found" }, { status: 404, headers: corsHeaders });
      }
      const link = await getDocument(account.project_id, "pairingCodes", message.partnershipCode, accessToken) as Record<string, unknown> | null;
      const participants = link && ((link.ownerEmail === email && link.consumedBy === message.to) || (link.consumedBy === email && link.ownerEmail === message.to));
      if (!link || link.accepted !== true || link.ended === true || !participants) return Response.json({ error: "Partner connection is not active" }, { status: 403, headers: corsHeaders });
      recipient = message.to;
      const senderName = typeof message.fromName === "string" ? message.fromName : email.split("@")[0];
      title = `New message from ${senderName}`;
      const text = typeof message.text === "string" ? message.text : "You have a new message.";
      body = text.length > 120 ? `${text.slice(0, 120)}…` : text;
      tag = `reclaim-msg-${documentId}`;
    } else {
      const link = await getDocument(account.project_id, "pairingCodes", documentId, accessToken) as Record<string, unknown> | null;
      if (!link || link.accepted !== true || link.ended !== true || String(link.endedBy || "").toLowerCase() !== email) {
        return Response.json({ error: "Ended connection not found" }, { status: 404, headers: corsHeaders });
      }
      recipient = link.endedBy === link.ownerEmail ? String(link.consumedBy || "") : String(link.ownerEmail || "");
      title = "Partner connection ended";
      body = "Your partner ended this connection. New messages and progress sharing are stopped.";
      tag = `reclaim-partner-ended-${documentId}`;
    }

    if (!recipient) return Response.json({ ok: true, sent: false }, { headers: corsHeaders });
    const subscription = await getDocument(account.project_id, "pushSubscriptions", recipient, accessToken) as Record<string, unknown> | null;
    if (!subscription || typeof subscription.token !== "string") return Response.json({ ok: true, sent: false }, { headers: corsHeaders });
    const markerId = `${kind}-${documentId}`;
    if (!await markDispatch(account.project_id, markerId, accessToken)) return Response.json({ ok: true, sent: false, duplicate: true }, { headers: corsHeaders });
    try {
      await sendFcm(account, subscription.token, String(subscription.platform || "web"), title, body, tag, url);
    } catch (error) {
      await unmarkDispatch(account.project_id, markerId, accessToken);
      throw error;
    }
    return Response.json({ ok: true, sent: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Partner notification error:", error);
    return Response.json({ error: "Notification could not be sent" }, { status: 500, headers: corsHeaders });
  }
});

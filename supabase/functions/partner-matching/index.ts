const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ServiceAccount = { project_id: string; client_email: string; private_key: string; token_uri?: string };
type FirestoreValue = Record<string, unknown>;
type FirestoreDocument = { name: string; fields?: Record<string, FirestoreValue>; updateTime?: string };

function unwrap(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return ((value.arrayValue as { values?: FirestoreValue[] }).values || []).map(unwrap);
  if ("mapValue" in value) return decodeFields((value.mapValue as { fields?: Record<string, FirestoreValue> }).fields || {});
  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue> = {}) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) result[key] = unwrap(value);
  return result;
}

function encodeValue(value: unknown): FirestoreValue {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (value === null) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  return { stringValue: String(value) };
}

function encodeFields(fields: Record<string, unknown>) {
  const result: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(fields)) result[key] = encodeValue(value);
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
    scope: "https://www.googleapis.com/auth/datastore",
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

function serviceAccount(): ServiceAccount {
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

function documentsUrl(project: string) {
  return `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
}

async function firestoreRequest(url: string, token: string, body?: unknown, method = "POST") {
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firestore request failed (${response.status})`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return payload;
}

function docPath(project: string, collection: string, id: string) {
  return `${documentsUrl(project)}/${collection}/${id.split("/").map(encodeURIComponent).join("/")}`;
}

async function beginTransaction(project: string, token: string) {
  const result = await firestoreRequest(`${documentsUrl(project)}:beginTransaction`, token, { options: { readWrite: {} } });
  if (!result?.transaction) throw new Error("Could not start a secure matching transaction");
  return result.transaction as string;
}

async function getDocuments(project: string, token: string, transaction: string, paths: string[]) {
  const rows = await firestoreRequest(`${documentsUrl(project)}:batchGet`, token, { documents: paths, transaction }) as Array<{ found?: FirestoreDocument; missing?: string }>;
  const result = new Map<string, Record<string, unknown>>();
  for (const row of rows || []) {
    if (row.found) result.set(row.found.name, decodeFields(row.found.fields));
  }
  return result;
}

async function queryDocuments(project: string, token: string, transaction: string, collection: string, field: string, value: string, status?: string) {
  const filters: Record<string, unknown>[] = [{
    fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: { stringValue: value } },
  }];
  if (status) filters.push({ fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: status } } });
  const where = filters.length === 1 ? filters[0] : { compositeFilter: { op: "AND", filters } };
  const query = {
    structuredQuery: { from: [{ collectionId: collection }], where, limit: 250 },
    transaction,
  };
  const rows = await firestoreRequest(`${documentsUrl(project)}:runQuery`, token, query) as Array<{ document?: FirestoreDocument }>;
  return (rows || []).flatMap((row) => row.document ? [{ document: row.document, data: decodeFields(row.document.fields) }] : []);
}

async function queryWaiting(project: string, token: string, transaction: string) {
  const query = {
    structuredQuery: {
      from: [{ collectionId: "partnerQueue" }],
      where: { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "waiting" } } },
      limit: 250,
    },
    transaction,
  };
  const rows = await firestoreRequest(`${documentsUrl(project)}:runQuery`, token, query) as Array<{ document?: FirestoreDocument }>;
  return (rows || []).flatMap((row) => row.document ? [{ document: row.document, data: decodeFields(row.document.fields) }] : []);
}

function activePairForEmail(records: Array<{ data: Record<string, unknown> }>) {
  return records.find((row) => row.data.accepted === true && row.data.ended !== true) || null;
}

function matchResult(code: string, pairing: Record<string, unknown>, email: string) {
  if (pairing.accepted !== true || pairing.ended === true) return null;
  const isOwner = pairing.ownerEmail === email;
  const otherEmail = isOwner ? pairing.consumedBy : pairing.ownerEmail;
  if (typeof otherEmail !== "string") return null;
  return {
    matched: true,
    partner: {
      email: otherEmail,
      name: String(isOwner ? pairing.requestName || "Your partner" : pairing.name || "Your partner"),
      language: String(isOwner ? pairing.requestLanguage || "English" : pairing.language || "English"),
    },
    partnershipCode: code,
  };
}

function documentId(document: FirestoreDocument) {
  return document.name.split("/").pop() || "";
}

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

async function commitWrites(project: string, token: string, transaction: string, writes: unknown[]) {
  await firestoreRequest(`${documentsUrl(project)}:commit`, token, { transaction, writes });
}

async function findPartner(project: string, token: string, email: string, name: string, language: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const transaction = await beginTransaction(project, token);
    try {
      const queuePath = docPath(project, "partnerQueue", email);
      const ownDataPath = docPath(project, "appData", email);
      const ownDocs = await getDocuments(project, token, transaction, [queuePath, ownDataPath]);
      const ownQueue = ownDocs.get(queuePath) || {};
      const ownApp = ownDocs.get(ownDataPath) || {};

      if (ownQueue.status === "paired" && typeof ownQueue.partnershipCode === "string") {
        const pairPath = docPath(project, "pairingCodes", ownQueue.partnershipCode);
        const pairDoc = (await getDocuments(project, token, transaction, [pairPath])).get(pairPath);
        const existing = pairDoc && matchResult(ownQueue.partnershipCode, pairDoc, email);
        if (existing) return existing;
      }

      const ownBuddy = ownApp.data && typeof ownApp.data === "object" ? (ownApp.data as Record<string, unknown>).buddy as Record<string, unknown> | undefined : undefined;
      const ownPairings = await Promise.all([
        queryDocuments(project, token, transaction, "pairingCodes", "ownerEmail", email),
        queryDocuments(project, token, transaction, "pairingCodes", "consumedBy", email),
      ]);
      if ((ownBuddy && ownBuddy.paired === true && ownBuddy.contact) || activePairForEmail(ownPairings.flat())) {
        throw new Error("You already have a connected partner. End that connection before finding another.");
      }

      const waiting = shuffle((await queryWaiting(project, token, transaction)).filter((row) => row.data.email !== email));
      for (const candidate of waiting) {
        const partnerEmail = String(candidate.data.email || documentId(candidate.document));
        if (!partnerEmail || partnerEmail === email) continue;
        const partnerPairings = await Promise.all([
          queryDocuments(project, token, transaction, "pairingCodes", "ownerEmail", partnerEmail),
          queryDocuments(project, token, transaction, "pairingCodes", "consumedBy", partnerEmail),
        ]);
        if (activePairForEmail(partnerPairings.flat())) {
          const stale = { delete: candidate.document.name };
          await commitWrites(project, token, transaction, [stale]);
          return await findPartner(project, token, email, name, language);
        }

        const now = new Date();
        const code = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
        const partnerQueue = { ...candidate.data, status: "paired", partnershipCode: code, updatedAt: now };
        const myQueue = { ...ownQueue, email, name, language, status: "paired", partnershipCode: code, joinedAt: ownQueue.joinedAt || now, updatedAt: now };
        const pairing = {
          code,
          ownerEmail: email,
          name,
          language,
          consumedBy: partnerEmail,
          requestName: String(candidate.data.name || "Re.Claim member"),
          requestLanguage: String(candidate.data.language || "English"),
          consumed: true,
          accepted: true,
          matchedRandomly: true,
          createdAt: now,
          acceptedAt: now,
          ended: false,
        };
        await commitWrites(project, token, transaction, [
          { update: { name: docPath(project, "pairingCodes", code), fields: encodeFields(pairing) }, currentDocument: { exists: false } },
          { update: { name: queuePath, fields: encodeFields(myQueue) } },
          { update: { name: candidate.document.name, fields: encodeFields(partnerQueue) } },
        ]);
        return { matched: true, partner: { email: partnerEmail, name: pairing.requestName, language: pairing.requestLanguage }, partnershipCode: code };
      }

      const now = new Date();
      const waitingQueue = { ...ownQueue, email, name, language, status: "waiting", joinedAt: ownQueue.joinedAt || now, updatedAt: now };
      await commitWrites(project, token, transaction, [{ update: { name: queuePath, fields: encodeFields(waitingQueue) } }]);
      return { matched: false, waiting: true };
    } catch (error) {
      if ((error as Error & { status?: number }).status === 409 && attempt < 4) continue;
      throw error;
    }
  }
  throw new Error("Matching is busy. Please try again.");
}

async function cancelSearch(project: string, token: string, email: string) {
  const transaction = await beginTransaction(project, token);
  const path = docPath(project, "partnerQueue", email);
  const record = (await getDocuments(project, token, transaction, [path])).get(path);
  if (record?.status === "paired" && typeof record.partnershipCode === "string") {
    const pairingPath = docPath(project, "pairingCodes", record.partnershipCode);
    const pairing = (await getDocuments(project, token, transaction, [pairingPath])).get(pairingPath);
    const match = pairing && matchResult(record.partnershipCode, pairing, email);
    if (match) return { cancelled: false, match };
  }
  if (record?.status === "waiting") await commitWrites(project, token, transaction, [{ delete: path }]);
  else await commitWrites(project, token, transaction, []);
  return { cancelled: true };
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
    const action = input?.action;
    if (action !== "search" && action !== "cancel") return Response.json({ error: "Invalid request" }, { status: 400, headers: corsHeaders });

    const account = serviceAccount();
    const accessToken = await googleAccessToken(account);
    if (action === "cancel") {
      return Response.json(await cancelSearch(account.project_id, accessToken, email), { headers: corsHeaders });
    }
    const name = String(input?.name || "Re.Claim member").trim().slice(0, 60) || "Re.Claim member";
    const language = String(input?.language || "English").trim().slice(0, 40) || "English";
    return Response.json(await findPartner(account.project_id, accessToken, email, name, language), { headers: corsHeaders });
  } catch (error) {
    console.error("Partner matching error:", error);
    const message = error instanceof Error && error.message.startsWith("You already have") ? error.message : "Partner matching could not be completed. Please try again.";
    const status = error instanceof Error && error.message.startsWith("You already have") ? 409 : 500;
    return Response.json({ error: message }, { status, headers: corsHeaders });
  }
});

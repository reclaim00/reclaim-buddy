const LANGUAGES = new Set(["English", "Español", "Français", "Deutsch", "Русский", "中文", "日本語", "العربية"]);

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
  const responseText = response.status === 204 ? "" : await response.text();
  let payload: unknown = null;
  if (responseText) {
    try { payload = JSON.parse(responseText); } catch { /* Keep the raw response below for Firestore errors. */ }
  }
  if (!response.ok) {
    const errorPayload = payload && typeof payload === "object"
      ? (payload as { error?: { message?: unknown } }).error
      : undefined;
    const detail = typeof errorPayload?.message === "string"
      ? errorPayload.message
      : responseText.trim().slice(0, 1000) || "Firestore returned an empty error response";
    const error = new Error(`Firestore request failed (${response.status}): ${detail}`);
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

function queueTimestamp(data: Record<string, unknown>) {
  const value = data.updatedAt || data.joinedAt;
  return typeof value === "string" ? Date.parse(value) || 0 : 0;
}

function queueExpired(data: Record<string, unknown>) {
  const timestamp = queueTimestamp(data);
  return !timestamp || Date.now() - timestamp > 15 * 60 * 1000;
}

function matchPreferenceScore(own: Record<string, unknown>, candidate: Record<string, unknown>) {
  const ownLanguage = String(own.language || "English");
  const candidateLanguage = String(candidate.language || "English");
  const ownPreferred = String(own.preferredLanguage || "Any language");
  const candidatePreferred = String(candidate.preferredLanguage || "Any language");
  const ownAvailability = String(own.availability || "Any time");
  const candidateAvailability = String(candidate.availability || "Any time");
  let score = 0;
  if (ownPreferred === "Any language" || ownPreferred === candidateLanguage) score++;
  if (candidatePreferred === "Any language" || candidatePreferred === ownLanguage) score++;
  if (ownAvailability === "Any time" || candidateAvailability === "Any time" || ownAvailability === candidateAvailability) score++;
  return score;
}

async function findPartner(project: string, token: string, email: string, name: string, language: string, preferredLanguage: string, availability: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const transaction = await beginTransaction(project, token);
    try {
      const queuePath = docPath(project, "partnerQueue", email);
      const ownDataPath = docPath(project, "appData", email);
      const ownDocs = await getDocuments(project, token, transaction, [queuePath, ownDataPath]);
      let ownQueue = ownDocs.get(queuePath) || {};
      const ownApp = ownDocs.get(ownDataPath) || {};

      if (ownQueue.status === "waiting" && queueExpired(ownQueue)) ownQueue = {};
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

      const [blockedByMe, blockingMe] = await Promise.all([
        queryDocuments(project, token, transaction, "partnerBlocks", "blockerEmail", email),
        queryDocuments(project, token, transaction, "partnerBlocks", "blockedEmail", email),
      ]);
      const blockedEmails = new Set<string>();
      blockedByMe.forEach((row) => { if (typeof row.data.blockedEmail === "string") blockedEmails.add(row.data.blockedEmail); });
      blockingMe.forEach((row) => { if (typeof row.data.blockerEmail === "string") blockedEmails.add(row.data.blockerEmail); });

      const staleQueuePaths: string[] = [];
      const waiting = shuffle((await queryWaiting(project, token, transaction)).filter((row) => {
        const candidateEmail = String(row.data.email || documentId(row.document));
        if (candidateEmail === email) return false;
        if (queueExpired(row.data)) { staleQueuePaths.push(row.document.name); return false; }
        return !blockedEmails.has(candidateEmail);
      })).sort((a, b) => matchPreferenceScore(b.data, { language, preferredLanguage, availability }) - matchPreferenceScore(a.data, { language, preferredLanguage, availability }));
      const staleWrites = staleQueuePaths.map((path) => ({ delete: path }));

      for (const candidate of waiting) {
        const partnerEmail = String(candidate.data.email || documentId(candidate.document));
        if (!partnerEmail || partnerEmail === email) continue;
        const partnerPairings = await Promise.all([
          queryDocuments(project, token, transaction, "pairingCodes", "ownerEmail", partnerEmail),
          queryDocuments(project, token, transaction, "pairingCodes", "consumedBy", partnerEmail),
        ]);
        if (activePairForEmail(partnerPairings.flat())) {
          staleWrites.push({ delete: candidate.document.name });
          continue;
        }

        const now = new Date();
        const code = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
        const partnerQueue = { ...candidate.data, status: "paired", partnershipCode: code, updatedAt: now };
        const myQueue = { ...ownQueue, email, name, language, preferredLanguage, availability, status: "paired", partnershipCode: code, joinedAt: ownQueue.joinedAt || now, updatedAt: now };
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
          ...staleWrites,
          { update: { name: docPath(project, "pairingCodes", code), fields: encodeFields(pairing) }, currentDocument: { exists: false } },
          { update: { name: queuePath, fields: encodeFields(myQueue) } },
          { update: { name: candidate.document.name, fields: encodeFields(partnerQueue) } },
        ]);
        return { matched: true, partner: { email: partnerEmail, name: pairing.requestName, language: pairing.requestLanguage }, partnershipCode: code };
      }

      const now = new Date();
      const waitingQueue = { ...ownQueue, email, name, language, preferredLanguage, availability, status: "waiting", joinedAt: ownQueue.joinedAt || now, updatedAt: now };
      await commitWrites(project, token, transaction, [...staleWrites, { update: { name: queuePath, fields: encodeFields(waitingQueue) } }]);
      return { matched: false, waiting: true };
    } catch (error) {
      if ((error as Error & { status?: number }).status === 409 && attempt < 4) continue;
      throw error;
    }
  }
  throw new Error("Matching is busy. Please try again.");
}

async function verifyActivePair(project: string, token: string, transaction: string, email: string, targetEmail: string, code: string) {
  const path = docPath(project, "pairingCodes", code);
  const pairing = (await getDocuments(project, token, transaction, [path])).get(path);
  const participants = pairing && ((pairing.ownerEmail === email && pairing.consumedBy === targetEmail) || (pairing.ownerEmail === targetEmail && pairing.consumedBy === email));
  if (!pairing || pairing.accepted !== true || pairing.ended === true || !participants) throw new Error("This partner connection is no longer active.");
  return { path, pairing };
}

async function blockPartner(project: string, token: string, email: string, targetEmail: string, code: string) {
  const transaction = await beginTransaction(project, token);
  const verified = await verifyActivePair(project, token, transaction, email, targetEmail, code);
  const blockId = b64url(`${email}\n${targetEmail}`);
  const blockPath = docPath(project, "partnerBlocks", blockId);
  const queuePaths = [docPath(project, "partnerQueue", email), docPath(project, "partnerQueue", targetEmail)];
  const current = await getDocuments(project, token, transaction, [blockPath]);
  const blocked = { ...(current.get(blockPath) || {}), blockerEmail: email, blockedEmail: targetEmail, partnershipCode: code, createdAt: new Date() };
  const ended = { ...verified.pairing, ended: true, endedBy: email, endedAt: new Date(), endedReason: "blocked" };
  const writes: unknown[] = [
    { update: { name: verified.path, fields: encodeFields(ended) } },
    { update: { name: blockPath, fields: encodeFields(blocked) }, ...(current.has(blockPath) ? {} : { currentDocument: { exists: false } }) },
    ...queuePaths.map((path) => ({ delete: path })),
  ];
  await commitWrites(project, token, transaction, writes);
  return { blocked: true };
}

async function unblockPartner(project: string, token: string, email: string, targetEmail: string) {
  const transaction = await beginTransaction(project, token);
  const blockPath = docPath(project, "partnerBlocks", b64url(`${email}\n${targetEmail}`));
  const record = (await getDocuments(project, token, transaction, [blockPath])).get(blockPath);
  if (!record || record.blockerEmail !== email) return { unblocked: true };
  await commitWrites(project, token, transaction, [{ delete: blockPath }]);
  return { unblocked: true };
}

async function reportPartner(project: string, token: string, email: string, targetEmail: string, code: string, category: string, alsoBlock: boolean) {
  const allowed = new Set(["harassment", "spam", "inappropriate", "safety", "other"]);
  if (!allowed.has(category)) throw new Error("Choose a report reason.");
  const transaction = await beginTransaction(project, token);
  await verifyActivePair(project, token, transaction, email, targetEmail, code);
  const id = crypto.randomUUID();
  const now = new Date();
  const report = { partnershipCode: code, category, reporterEmail: email, reportedEmail: targetEmail, createdAt: now, status: "new" };
  const writes: unknown[] = [{ update: { name: docPath(project, "partnerReports", id), fields: encodeFields(report) }, currentDocument: { exists: false } }];
  if (alsoBlock) {
    const blockId = b64url(`${email}\n${targetEmail}`);
    const blockPath = docPath(project, "partnerBlocks", blockId);
    const queuePaths = [docPath(project, "partnerQueue", email), docPath(project, "partnerQueue", targetEmail)];
    const current = await getDocuments(project, token, transaction, [blockPath]);
    const blocked = { ...(current.get(blockPath) || {}), blockerEmail: email, blockedEmail: targetEmail, partnershipCode: code, createdAt: now };
    const ended = { ...verified.pairing, ended: true, endedBy: email, endedAt: now, endedReason: "blocked" };
    writes.push(
      { update: { name: verified.path, fields: encodeFields(ended) } },
      { update: { name: blockPath, fields: encodeFields(blocked) }, ...(current.has(blockPath) ? {} : { currentDocument: { exists: false } }) },
      ...queuePaths.map((path) => ({ delete: path })),
    );
  }
  await commitWrites(project, token, transaction, writes);
  return { reported: true, blocked: alsoBlock };
}

function reportAdminEmails() {
  return new Set((Deno.env.get("PARTNER_REPORT_ADMIN_EMAILS") || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean));
}

async function listPartnerReports(project: string, token: string) {
  const query = {
    structuredQuery: {
      from: [{ collectionId: "partnerReports" }],
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
      limit: 100,
    },
  };
  const rows = await firestoreRequest(`${documentsUrl(project)}:runQuery`, token, query) as Array<{ document?: FirestoreDocument }>;
  return (rows || []).flatMap((row) => {
    if (!row.document) return [];
    const data = decodeFields(row.document.fields);
    return [{
      id: documentId(row.document),
      category: String(data.category || "other"),
      status: String(data.status || "new"),
      createdAt: data.createdAt || null,
      reporterEmail: typeof data.reporterEmail === "string" ? data.reporterEmail : "",
      reportedEmail: typeof data.reportedEmail === "string" ? data.reportedEmail : "",
      partnershipCode: typeof data.partnershipCode === "string" ? data.partnershipCode : "",
      reviewedAt: data.reviewedAt || null,
      reviewedBy: typeof data.reviewedBy === "string" ? data.reviewedBy : "",
    }];
  });
}

async function updatePartnerReport(project: string, token: string, adminEmail: string, reportId: string, status: string) {
  const allowedStatuses = new Set(["new", "in_review", "action_taken", "closed"]);
  if (!/^[0-9a-f-]{36}$/i.test(reportId) || !allowedStatuses.has(status)) throw new Error("Invalid report update.");
  const transaction = await beginTransaction(project, token);
  const path = docPath(project, "partnerReports", reportId);
  const existing = (await getDocuments(project, token, transaction, [path])).get(path);
  if (!existing) return { updated: false };
  const reviewedAt = new Date();
  await commitWrites(project, token, transaction, [{
    update: { name: path, fields: encodeFields({ status, reviewedAt, reviewedBy: adminEmail }) },
    updateMask: { fieldPaths: ["status", "reviewedAt", "reviewedBy"] },
  }]);
  return { updated: true };
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
    if (!["search", "cancel", "block", "unblock", "report", "admin_check", "admin_list_reports", "admin_update_report"].includes(action)) return Response.json({ error: "Invalid request" }, { status: 400, headers: corsHeaders });
    const isReportAdmin = reportAdminEmails().has(email);
    if (action === "admin_check") return Response.json({ isAdmin: isReportAdmin }, { headers: corsHeaders });
    if (action === "admin_list_reports" || action === "admin_update_report") {
      if (!isReportAdmin) return Response.json({ error: "You do not have access to review safety reports." }, { status: 403, headers: corsHeaders });
      const account = serviceAccount();
      const accessToken = await googleAccessToken(account);
      if (action === "admin_list_reports") return Response.json({ reports: await listPartnerReports(account.project_id, accessToken) }, { headers: corsHeaders });
      const reportId = String(input?.reportId || "");
      const status = String(input?.status || "");
      return Response.json(await updatePartnerReport(account.project_id, accessToken, email, reportId, status), { headers: corsHeaders });
    }

    const account = serviceAccount();
    const accessToken = await googleAccessToken(account);
    if (action === "cancel") {
      return Response.json(await cancelSearch(account.project_id, accessToken, email), { headers: corsHeaders });
    }
    if (["block", "unblock", "report"].includes(action)) {
      const targetEmail = String(input?.targetEmail || "").trim().toLowerCase();
      if (!targetEmail || targetEmail === email) return Response.json({ error: "Invalid partner connection" }, { status: 400, headers: corsHeaders });
      if (action === "unblock") return Response.json(await unblockPartner(account.project_id, accessToken, email, targetEmail), { headers: corsHeaders });
      const code = String(input?.partnershipCode || "").trim();
      if (!code) return Response.json({ error: "Invalid partner connection" }, { status: 400, headers: corsHeaders });
      const result = action === "block"
        ? await blockPartner(account.project_id, accessToken, email, targetEmail, code)
        : await reportPartner(account.project_id, accessToken, email, targetEmail, code, String(input?.category || ""), input?.block === true);
      return Response.json(result, { headers: corsHeaders });
    }
    const name = String(input?.name || "Re.Claim member").trim().slice(0, 60) || "Re.Claim member";
    const language = String(input?.language || "English").trim().slice(0, 40) || "English";
    const preferredLanguage = LANGUAGES.has(String(input?.preferredLanguage || "Any language")) ? String(input?.preferredLanguage || "Any language") : "Any language";
    const availabilityOptions = new Set(["Any time", "Morning", "Afternoon", "Evening"]);
    const availability = availabilityOptions.has(String(input?.availability || "Any time")) ? String(input?.availability || "Any time") : "Any time";
    return Response.json(await findPartner(account.project_id, accessToken, email, name, language, preferredLanguage, availability), { headers: corsHeaders });
  } catch (error) {
    console.error("Partner matching error:", error);
    const detail = error instanceof Error ? error.message : "";
    let message = "Partner matching could not be completed. Please try again.";
    let status = 500;
    if (detail.startsWith("You already have")) {
      message = detail;
      status = 409;
    } else if (detail.includes("service account secret is not configured") || detail.includes("web API key secret is not configured")) {
      message = "Partner matching setup is incomplete. The app administrator must finish the Firebase settings in Supabase.";
    } else if (detail.startsWith("Google token exchange failed")) {
      message = "Partner matching cannot connect to Firebase. The app administrator needs to check the Supabase service account settings.";
    } else if (detail.startsWith("Firestore request failed (403)")) {
      message = "Partner matching cannot access its database. The app administrator needs to grant the Supabase service account Firestore access.";
    } else if (detail.startsWith("Firestore request failed (")) {
      message = "Partner matching reached Firebase, but its database request failed. Please try again later; if it continues, the app administrator should check the Supabase function logs.";
    }
    return Response.json({ error: message }, { status, headers: corsHeaders });
  }
});

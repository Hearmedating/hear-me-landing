const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WAITLIST_ZSET = "waitlist:emails";
const WAITLIST_COUNT = "waitlist:count";

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { url, token };
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function text(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.end(body);
}

function allowMethods(req, res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", [...methods, "OPTIONS"].join(", "));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return false;
  }
  if (!methods.includes(req.method)) {
    json(res, 405, { detail: `Method ${req.method} not allowed` });
    return false;
  }
  return true;
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error("Invalid JSON body");
    err.statusCode = 400;
    throw err;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
  return EMAIL_RE.test(email);
}

function entryKey(email) {
  return `waitlist:entry:${email}`;
}

function positionKey(email) {
  return `waitlist:position:${email}`;
}

async function redisCommand(command) {
  const { url, token } = redisConfig();
  if (!url || !token) {
    const err = new Error("Waitlist storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) in Vercel.");
    err.statusCode = 503;
    throw err;
  }

  const response = await fetch(url.replace(/\/$/, ""), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.error) {
    const err = new Error(payload?.error || `Redis HTTP ${response.status}`);
    err.statusCode = response.ok ? 500 : response.status;
    throw err;
  }

  return payload?.result;
}

async function addWaitlistEmail({ email, source = "landing", language = "en" }) {
  const now = new Date().toISOString();
  const row = {
    email,
    source: String(source || "landing").slice(0, 80),
    language: String(language || "en").slice(0, 10),
    created_at: now,
    confirmation_sent: false,
    launch_email_sent: false,
  };

  const script = `
    if redis.call('EXISTS', KEYS[1]) == 1 then
      return {tonumber(redis.call('GET', KEYS[1])), 1}
    end
    local position = redis.call('INCR', KEYS[2])
    redis.call('SET', KEYS[1], position)
    redis.call('SET', KEYS[3], ARGV[1])
    redis.call('ZADD', KEYS[4], position, ARGV[2])
    return {position, 0}
  `;
  const result = await redisCommand([
    "EVAL",
    script,
    4,
    positionKey(email),
    WAITLIST_COUNT,
    entryKey(email),
    WAITLIST_ZSET,
    JSON.stringify(row),
    email,
  ]);

  return { position: Number(result?.[0] || 0), already: Boolean(Number(result?.[1] || 0)) };
}

async function countWaitlist() {
  const result = await redisCommand(["GET", WAITLIST_COUNT]);
  return Number(result || 0);
}

async function listWaitlist(q = "") {
  const zrange = await redisCommand(["ZRANGE", WAITLIST_ZSET, 0, -1, "WITHSCORES"]);
  const pairs = Array.isArray(zrange) ? zrange : [];
  const emails = [];
  const positions = new Map();
  for (let i = 0; i < pairs.length; i += 2) {
    const email = String(pairs[i]);
    emails.push(email);
    positions.set(email, Number(pairs[i + 1]));
  }

  if (!emails.length) return { items: [], total: 0 };

  const rawEntries = await redisCommand(["MGET", ...emails.map(entryKey)]);
  const needle = String(q || "").trim().toLowerCase();
  const items = (Array.isArray(rawEntries) ? rawEntries : [])
    .map((raw, index) => {
      try {
        const entry = JSON.parse(raw);
        return { position: positions.get(emails[index]) || index + 1, ...entry };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((entry) => !needle || entry.email.toLowerCase().includes(needle))
    .sort((a, b) => a.position - b.position);

  return { items, total: emails.length };
}

async function updateEntry(email, patch) {
  const raw = await redisCommand(["GET", entryKey(email)]);
  if (!raw) return null;
  const entry = { ...JSON.parse(raw), ...patch };
  await redisCommand(["SET", entryKey(email), JSON.stringify(entry)]);
  return entry;
}

function checkAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  const provided = req.headers["x-admin-token"] || new URL(req.url, "http://localhost").searchParams.get("token");
  if (!expected) {
    const err = new Error("ADMIN_TOKEN is not configured in Vercel.");
    err.statusCode = 503;
    throw err;
  }
  if (provided !== expected) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
}

module.exports = {
  addWaitlistEmail,
  allowMethods,
  checkAdmin,
  countWaitlist,
  json,
  listWaitlist,
  normalizeEmail,
  readJson,
  text,
  updateEntry,
  validateEmail,
};

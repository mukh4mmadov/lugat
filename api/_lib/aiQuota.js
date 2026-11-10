import { createClient } from "@supabase/supabase-js";

// Daily AI allowances counted in the database (consume_ai_quota), so every
// server instance shares one count. Memory is used only when the database
// can't be reached, so the AI never stops working because of the counter.
// Results have the Upstash Ratelimit shape: { success, remaining, reset }.

const DAY_MS = 24 * 60 * 60 * 1000;
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const memory = new Map();
let db;

function client() {
  if (db !== undefined) return db;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  db = url && key ? createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
  return db;
}

// Allowances restart at midnight in Tashkent.
function nextReset(now = Date.now()) {
  return (Math.floor((now + TASHKENT_OFFSET_MS) / DAY_MS) + 1) * DAY_MS - TASHKENT_OFFSET_MS;
}

function fromMemory(key, limit) {
  const now = Date.now();
  const record = memory.get(key);
  if (!record || now > record.reset) {
    memory.set(key, { count: 1, reset: nextReset(now) });
    return { success: true, remaining: limit - 1, reset: nextReset(now) };
  }
  if (record.count >= limit) return { success: false, remaining: 0, reset: record.reset };
  record.count += 1;
  return { success: true, remaining: limit - record.count, reset: record.reset };
}

export async function takeQuota(key, limit) {
  const reset = nextReset();
  if (!(limit > 0)) return { success: false, remaining: 0, reset };
  const database = client();
  if (database) {
    const { data, error } = await database.rpc("consume_ai_quota", { p_key: key, p_limit: limit });
    if (!error) return data === null ? { success: false, remaining: 0, reset } : { success: true, remaining: Math.max(0, limit - data), reset };
    console.error("AI quota check failed, counting in memory:", error.message);
  }
  return fromMemory(key, limit);
}

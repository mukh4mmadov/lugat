import { createClient } from "@supabase/supabase-js";
import { extendPremium } from "./_lib/premium.js";

// Premium days learners earn themselves. A 7-day streak gives 1 day of
// Premium, at most once every 30 days. The streak is read from the learner's
// synced progress, not from the request.
//
//   GET  /api/rewards                       what can be claimed now
//   POST /api/rewards { kind: "streak7" }   claim it
//   Authorization: Bearer <session>

const DAY = 24 * 60 * 60 * 1000;
const STREAK_DAYS = 7;
const STREAK_REWARD_DAYS = 1;
const STREAK_COOLDOWN_DAYS = 30;
const ALLOWED_ORIGINS = ["https://lugat-six.vercel.app", "http://localhost:5173", "http://localhost:3000"];

function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const originAllowed = (origin) => Boolean(origin) && (ALLOWED_ORIGINS.includes(origin) || /^https:\/\/lugat-[a-z0-9-]+\.vercel\.app$/.test(origin));

// The learner's study dates are local; accept anything from the last two
// calendar days so every time zone counts a streak that is still alive.
export function streakIsAlive(lastStudyDate, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(lastStudyDate || ""))) return false;
  const age = now - Date.parse(`${lastStudyDate}T00:00:00Z`);
  return age >= -DAY && age < 3 * DAY;
}

async function streakStatus(db, userId) {
  const [{ data: progress }, { data: claims }] = await Promise.all([
    db.from("user_progress").select("data").eq("user_id", userId).maybeSingle(),
    db.from("reward_claims").select("claimed_at").eq("user_id", userId).eq("kind", "streak7").order("claimed_at", { ascending: false }).limit(1),
  ]);
  const stats = progress?.data?.stats || {};
  const streak = streakIsAlive(stats.lastStudyDate) ? Number(stats.streak) || 0 : 0;
  const last = claims?.[0]?.claimed_at ? Date.parse(claims[0].claimed_at) : null;
  const nextAt = last ? last + STREAK_COOLDOWN_DAYS * DAY : null;
  const cooling = nextAt !== null && nextAt > Date.now();
  return {
    streak,
    required: STREAK_DAYS,
    days: STREAK_REWARD_DAYS,
    available: streak >= STREAK_DAYS && !cooling,
    nextAt: cooling ? new Date(nextAt).toISOString() : null,
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (req.method === "POST" && !originAllowed(req.headers.origin)) return res.status(403).json({ error: "Forbidden: origin not allowed." });
  const db = serviceClient();
  if (!db) return res.status(503).json({ error: "Rewards are not configured." });
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const { data: auth } = token ? await db.auth.getUser(token) : { data: null };
  const user = auth?.user;
  if (!user) return res.status(401).json({ error: "Sign in first." });

  try {
    const status = await streakStatus(db, user.id);
    if (req.method === "GET") return res.status(200).json({ streak7: status });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    if (body.kind !== "streak7") return res.status(400).json({ error: "Unknown reward" });
    if (status.nextAt) return res.status(409).json({ error: "Already claimed this month.", streak7: status });
    if (!status.available) return res.status(409).json({ error: "Keep your streak for 7 days first.", streak7: status });
    const premiumUntil = await extendPremium(db, user.id, STREAK_REWARD_DAYS);
    await db.from("reward_claims").insert({ user_id: user.id, kind: "streak7", days: STREAK_REWARD_DAYS });
    return res.status(200).json({ premiumUntil, streak7: await streakStatus(db, user.id) });
  } catch (error) {
    console.error("Rewards error:", error);
    return res.status(error.status || 500).json({ error: "Something went wrong. Please try again." });
  }
}

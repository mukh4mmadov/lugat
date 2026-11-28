import { createClient } from "@supabase/supabase-js";
import { extendPremium, isPremium } from "./_lib/premium.js";
import { FULL_STORIES, isPremiumStoryId } from "../src/data/stories/full.js";
import { originAllowed } from "./_lib/origins.js";
import { takeQuota } from "./_lib/aiQuota.js";
import { canOpenPrivatePapers, privatePaper, privatePaperFiles } from "./_lib/topikPrivate.js";
import { getTopikExam } from "../src/data/topik/exams.js";
import { DEFAULT_PROMO_CODES, PROMO_CODE, normalizePromoCode } from "../src/data/promo.js";


const DAY = 24 * 60 * 60 * 1000;
const STREAK_DAYS = 7;
const STREAK_REWARD_DAYS = 1;
const STREAK_COOLDOWN_DAYS = 30;
export const INVITE_TIERS = [
  [2, 1],
  [5, 7],
  [10, 30],
  [20, 90],
];

function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}


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
  const streak = streakIsAlive(stats.lastStudyDate) && typeof stats.streak === "number" ? Math.floor(stats.streak) : 0;
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

async function inviteStatus(db, userId) {
  const [{ count }, { data: claims }] = await Promise.all([
    db.from("referrals").select("referred", { count: "exact", head: true }).eq("referrer", userId).eq("revoked", false).not("qualified_at", "is", null),
    db.from("reward_claims").select("kind").eq("user_id", userId).like("kind", "invite%"),
  ]);
  const claimed = new Set((claims || []).map((claim) => claim.kind));
  const qualified = count || 0;
  const tiers = INVITE_TIERS.map(([friends, days]) => ({ friends, days, claimed: claimed.has(`invite${friends}`), reached: qualified >= friends }));
  return { qualified, tiers, available: tiers.filter((tier) => tier.reached && !tier.claimed).reduce((sum, tier) => sum + tier.days, 0) };
}

async function redeemPromo(db, userId, raw) {
  const code = normalizePromoCode(raw);
  if (!PROMO_CODE.test(code)) return [400, { error: "Unknown code.", reason: "invalid" }];
  const { data: saved } = await db.from("app_settings").select("value").eq("key", "promo_codes").maybeSingle();
  const codes = Array.isArray(saved?.value) ? saved.value : DEFAULT_PROMO_CODES;
  const promo = codes.find((item) => normalizePromoCode(item.code) === code);
  if (!promo?.active) return [404, { error: "Unknown code.", reason: "invalid" }];
  if (promo.until && Date.parse(promo.until) < Date.now()) return [410, { error: "This code has ended.", reason: "expired" }];
  const kind = `promo:${code}`;
  const { data: claim, error } = await db.from("reward_claims").insert({ user_id: userId, kind, days: promo.days }).select("id").single();
  if (error) throw error;
  const { data: first } = await db.from("reward_claims").select("id").eq("user_id", userId).eq("kind", kind).order("id").limit(1);
  if (first?.[0]?.id !== claim.id) {
    await db.from("reward_claims").delete().eq("id", claim.id);
    return [409, { error: "You have already used this code.", reason: "used" }];
  }
  try {
    return [200, { premiumUntil: await extendPremium(db, userId, promo.days), days: promo.days }];
  } catch (failure) {
    await db.from("reward_claims").delete().eq("id", claim.id);
    throw failure;
  }
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
    if (req.method === "GET" && req.query?.story) {
      const story = FULL_STORIES.find((item) => item.id === String(req.query.story) && isPremiumStoryId(item.id));
      if (!story) return res.status(404).json({ error: "Story not found." });
      const { data: admin } = isPremium(user) ? { data: true } : await db.from("feedback_admins").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!admin) return res.status(403).json({ error: "Premium needed." });
      return res.status(200).json({ lines: story.lines, questions: story.questions });
    }
    if (req.method === "GET" && req.query?.topik) {
      const exam = getTopikExam(String(req.query.topik));
      if (!exam?.private) return res.status(404).json({ error: "Paper not found." });
      if (!(await canOpenPrivatePapers(db, user, isPremium))) return res.status(403).json({ error: "Premium needed.", code: "premium_required" });
      if (!(await takeQuota(`topik-paper:${user.id}`, 200)).success) return res.status(429).json({ error: "Too many papers opened today." });
      const [paper, files] = await Promise.all([privatePaper(db, exam.id), privatePaperFiles(db, exam.id)]);
      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json({ ...paper, ...files });
    }
    const body = req.method === "POST" ? (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}) : {};
    if (body.kind === "promo") {
      const [code, payload] = await redeemPromo(db, user.id, body.code);
      return res.status(code).json(payload);
    }
    const status = await streakStatus(db, user.id);
    if (req.method === "GET") return res.status(200).json({ streak7: status, invite: await inviteStatus(db, user.id) });
    if (body.kind === "invite") {
      const invite = await inviteStatus(db, user.id);
      const due = invite.tiers.filter((tier) => tier.reached && !tier.claimed);
      if (!due.length) return res.status(409).json({ error: "Nothing to claim yet.", invite });
      const { error } = await db.from("reward_claims").insert(due.map((tier) => ({ user_id: user.id, kind: `invite${tier.friends}`, days: tier.days })));
      if (error) throw error;
      const premiumUntil = await extendPremium(db, user.id, due.reduce((sum, tier) => sum + tier.days, 0));
      return res.status(200).json({ premiumUntil, invite: await inviteStatus(db, user.id) });
    }
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

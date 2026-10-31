import { createClient } from "@supabase/supabase-js";
import { pushConfigured, sendReminder } from "./_lib/push.js";

// Web push reminders the learner turned on.
//
//   GET  /api/push                                       { publicKey } (null when push isn't set up)
//   POST /api/push { action: "subscribe", subscription, language }
//   POST /api/push { action: "unsubscribe", endpoint }
//   POST /api/push { action: "partnerWaiting" }   the caller is waiting for a live call partner:
//        tell a few learners at the same level who aren't searching (at most 2 pushes a day each)
//   Authorization: Bearer <session> (POST)

const ALLOWED_ORIGINS = ["https://lugat-six.vercel.app", "http://localhost:5173", "http://localhost:3000"];
const originAllowed = (origin) => Boolean(origin) && (ALLOWED_ORIGINS.includes(origin) || /^https:\/\/lugat-[a-z0-9-]+\.vercel\.app$/.test(origin));
const PARTNER_PUSHES = 5;

function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function partnerWaiting(db, user) {
  const { data: me } = await db.from("speaking_queue").select("level").eq("user_id", user.id).maybeSingle();
  if (!me) return 0;
  // Only once per waiting learner every 10 minutes.
  const { data: recent } = await db.from("push_log").select("id").eq("user_id", user.id).eq("kind", "partner-asked").gte("sent_at", new Date(Date.now() - 600000).toISOString()).limit(1);
  if (recent?.length) return 0;
  await db.from("push_log").insert({ user_id: user.id, kind: "partner-asked" });

  const [{ data: subscribers }, { data: queue }] = await Promise.all([
    db.from("push_subscriptions").select("user_id"),
    db.from("speaking_queue").select("user_id"),
  ]);
  const searching = new Set((queue || []).map((row) => row.user_id));
  const candidates = [...new Set((subscribers || []).map((row) => row.user_id))].filter((id) => id !== user.id && !searching.has(id));
  if (!candidates.length) return 0;
  const { data: sameLevel } = await db.from("profiles").select("id").in("id", candidates).eq("korean_level", me.level);
  const picked = (sameLevel || []).map((row) => row.id).sort(() => Math.random() - 0.5).slice(0, PARTNER_PUSHES);
  return sendReminder(db, picked, "partner", { gapHours: 6 });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ publicKey: pushConfigured() ? process.env.VAPID_PUBLIC_KEY : null });
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!originAllowed(req.headers.origin)) return res.status(403).json({ error: "Forbidden: origin not allowed." });
  const db = serviceClient();
  if (!db) return res.status(503).json({ error: "Not configured" });
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const { data: auth } = token ? await db.auth.getUser(token) : { data: null };
  const user = auth?.user;
  if (!user) return res.status(401).json({ error: "Sign in first." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    if (body.action === "subscribe") {
      const sub = body.subscription || {};
      if (!/^https:\/\//.test(String(sub.endpoint || "")) || !sub.keys?.p256dh || !sub.keys?.auth) return res.status(400).json({ error: "Invalid subscription" });
      const { error } = await db.from("push_subscriptions").upsert({
        endpoint: sub.endpoint,
        user_id: user.id,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        language: ["uz", "en", "ru"].includes(body.language) ? body.language : "uz",
      });
      if (error) throw error;
      return res.status(200).json({ subscribed: true });
    }
    if (body.action === "unsubscribe") {
      await db.from("push_subscriptions").delete().eq("endpoint", String(body.endpoint || "")).eq("user_id", user.id);
      return res.status(200).json({ subscribed: false });
    }
    if (body.action === "partnerWaiting") return res.status(200).json({ notified: await partnerWaiting(db, user) });
    return res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    console.error("Push API error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

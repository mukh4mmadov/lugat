import { createClient } from "@supabase/supabase-js";
import { chunks, sendReminder } from "./_lib/push.js";

// Daily at 20:00 Tashkent (vercel.json crons): a "keep your streak" push for
// learners with a streak who haven't studied today, and a "Premium ends in
// 3 days" push, for learners who turned reminders on.
// Vercel calls it with Authorization: Bearer $CRON_SECRET.

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "Unauthorized" });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({ error: "Not configured" });
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const subscribers = [];
    for (let from = 0; from < 100000; from += 1000) {
      const { data } = await db.from("push_subscriptions").select("user_id").range(from, from + 999);
      subscribers.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    const ids = [...new Set(subscribers.map((row) => row.user_id))];
    if (!ids.length) return res.status(200).json({ reminded: 0 });
    // Only the small streak fields, in batches.
    const progress = [];
    for (const batch of chunks(ids)) {
      const { data } = await db.from("leaderboard_stats").select("user_id, streak, last_study_date").in("user_id", batch);
      progress.push(...(data || []));
    }
    // Study dates are the learner's local dates; in Uzbekistan that's UTC+5.
    const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() + 5 * 3600000 - 86400000).toISOString().slice(0, 10);
    const due = (progress || [])
      .filter((row) => row.streak > 0 && row.last_study_date === yesterday && row.last_study_date !== today)
      .map((row) => row.user_id);
    const reminded = await sendReminder(db, due, "streak", { gapHours: 20 });

    // Premium ending in about three days: one reminder (payments don't renew).
    const subscribed = new Set(ids);
    const expiring = [];
    for (let page = 1; page <= 50; page += 1) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) break;
      for (const user of data.users) {
        const left = Date.parse(user.app_metadata?.premium_until || "") - Date.now();
        if (subscribed.has(user.id) && left > 2 * 86400000 && left <= 3 * 86400000) expiring.push(user.id);
      }
      if (data.users.length < 1000) break;
    }
    const expiryReminded = await sendReminder(db, expiring, "expiry", { gapHours: 72 });
    return res.status(200).json({ due: due.length, reminded, expiring: expiring.length, expiryReminded });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return res.status(500).json({ error: "Reminder run failed" });
  }
}

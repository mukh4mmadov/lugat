import { createClient } from "@supabase/supabase-js";
import { sendReminder } from "./_lib/push.js";

// Daily at 20:00 Tashkent (vercel.json crons): a "keep your streak" push for
// learners with a streak who haven't studied today and turned reminders on.
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
    const { data: subscribers } = await db.from("push_subscriptions").select("user_id");
    const ids = [...new Set((subscribers || []).map((row) => row.user_id))];
    if (!ids.length) return res.status(200).json({ reminded: 0 });
    const { data: progress } = await db.from("user_progress").select("user_id, data").in("user_id", ids);
    // Study dates are the learner's local dates; in Uzbekistan that's UTC+5.
    const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() + 5 * 3600000 - 86400000).toISOString().slice(0, 10);
    const due = (progress || [])
      .filter((row) => (row.data?.stats?.streak || 0) > 0 && row.data?.stats?.lastStudyDate === yesterday && row.data?.stats?.lastStudyDate !== today)
      .map((row) => row.user_id);
    const reminded = await sendReminder(db, due, "streak", { gapHours: 20 });
    return res.status(200).json({ due: due.length, reminded });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return res.status(500).json({ error: "Reminder run failed" });
  }
}

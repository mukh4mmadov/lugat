import { createClient } from "@supabase/supabase-js";
import { sendDigest } from "./_lib/digest.js";
import { chunks, pushAdminNotifications, sendReminder } from "./_lib/push.js";
import { notifiedSince, notify } from "./_lib/notify.js";


const LAST_MORNING_HOUR_UTC = 9;
const DAY = 86400000;

async function bellReminders(db) {
  const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() + 5 * 3600000 - DAY).toISOString().slice(0, 10);
  const atRisk = [];
  for (let from = 0; from < 100000; from += 1000) {
    const { data } = await db.from("leaderboard_stats").select("user_id, streak").gt("streak", 0).eq("last_study_date", yesterday).range(from, from + 999);
    atRisk.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  const streakDone = await notifiedSince(db, atRisk.map((row) => row.user_id), "streak", `${today}T00:00:00+05:00`);
  let streak = 0;
  for (const row of atRisk.filter((item) => !streakDone.has(item.user_id))) {
    streak += await notify(db, [row.user_id], "streak", { link: "/review", data: { streak: row.streak } });
  }

  const expiring = [];
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) break;
    for (const user of data.users) {
      const left = Date.parse(user.app_metadata?.premium_until || "") - Date.now();
      if (left > 2 * DAY && left <= 3 * DAY) expiring.push(user);
    }
    if (data.users.length < 1000) break;
  }
  const expiryDone = await notifiedSince(db, expiring.map((user) => user.id), "premium_expiring", new Date(Date.now() - 5 * DAY).toISOString());
  let premium = 0;
  for (const user of expiring.filter((item) => !expiryDone.has(item.id))) {
    premium += await notify(db, [user.id], "premium_expiring", { link: "/premium", data: { until: user.app_metadata.premium_until } });
  }
  return { streak, premium };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "Unauthorized" });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({ error: "Not configured" });
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    if (new Date().getUTCHours() <= LAST_MORNING_HOUR_UTC) return res.status(200).json(await sendDigest(db));

    const bell = await bellReminders(db);

    const subscribers = [];
    for (let from = 0; from < 100000; from += 1000) {
      const { data } = await db.from("push_subscriptions").select("user_id").range(from, from + 999);
      subscribers.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    const ids = [...new Set(subscribers.map((row) => row.user_id))];
    if (!ids.length) return res.status(200).json({ reminded: 0, bell });
    const progress = [];
    for (const batch of chunks(ids)) {
      const { data } = await db.from("leaderboard_stats").select("user_id, streak, last_study_date").in("user_id", batch);
      progress.push(...(data || []));
    }
    const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() + 5 * 3600000 - 86400000).toISOString().slice(0, 10);
    const due = (progress || [])
      .filter((row) => row.streak > 0 && row.last_study_date === yesterday && row.last_study_date !== today)
      .map((row) => row.user_id);
    const reminded = await sendReminder(db, due, "streak", { gapHours: 20 });

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
    const adminPushes = await pushAdminNotifications(db);
    return res.status(200).json({ due: due.length, reminded, expiring: expiring.length, expiryReminded, adminPushes, bell });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return res.status(500).json({ error: "Reminder run failed" });
  }
}

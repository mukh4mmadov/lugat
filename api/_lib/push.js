import webpush from "web-push";

// Web push helpers shared by api/push.js and api/cron-reminders.js. Needs
// VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in the environment.

export const MAX_PER_DAY = 2;

const MESSAGES = {
  partner: {
    uz: { title: "Sizni sherik kutyapti 🎙", body: "Hozir kimdir koreyscha gaplashish uchun sherik qidiryapti. Qo'shiling!" },
    en: { title: "A partner is waiting 🎙", body: "Someone is looking for a Korean speaking partner right now. Join in!" },
    ru: { title: "Вас ждёт собеседник 🎙", body: "Кто-то прямо сейчас ищет собеседника для корейского. Присоединяйтесь!" },
  },
  streak: {
    uz: { title: "Streak yo'qolmasin 🔥", body: "Bugun hali mashq qilmadingiz. 5 daqiqa yetarli!" },
    en: { title: "Keep your streak 🔥", body: "You haven't practised today yet. Five minutes is enough!" },
    ru: { title: "Не потеряйте серию 🔥", body: "Сегодня вы ещё не занимались. Хватит пяти минут!" },
  },
};
const URLS = { partner: "/speaking", streak: "/" };

export function pushConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails("https://lugat-six.vercel.app", publicKey, privateKey);
  return true;
}

// Users (of those given) who already got MAX_PER_DAY pushes in 24 hours, or
// this kind within `gapHours`.
async function cappedUsers(db, userIds, kind, gapHours) {
  if (!userIds.length) return new Set();
  const since = new Date(Date.now() - 24 * 3600000).toISOString();
  const { data } = await db.from("push_log").select("user_id, kind, sent_at").in("user_id", userIds).gte("sent_at", since);
  const counts = new Map();
  const capped = new Set();
  for (const row of data || []) {
    if (row.kind === "partner-asked") continue;
    counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
    if (row.kind === kind && Date.now() - Date.parse(row.sent_at) < gapHours * 3600000) capped.add(row.user_id);
  }
  counts.forEach((count, userId) => count >= MAX_PER_DAY && capped.add(userId));
  return capped;
}

// Sends one kind of reminder to each user's subscribed browsers, respecting
// the daily cap. Returns how many users were reached.
export async function sendReminder(db, userIds, kind, { gapHours = 12 } = {}) {
  if (!pushConfigured() || !userIds.length) return 0;
  const capped = await cappedUsers(db, userIds, kind, gapHours);
  const targets = userIds.filter((id) => !capped.has(id));
  if (!targets.length) return 0;
  const { data: subscriptions } = await db.from("push_subscriptions").select("*").in("user_id", targets);
  const reached = new Set();
  await Promise.all(
    (subscriptions || []).map(async (row) => {
      const text = MESSAGES[kind][row.language] || MESSAGES[kind].uz;
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify({ ...text, url: URLS[kind], tag: kind }),
          { TTL: kind === "partner" ? 120 : 6 * 3600 },
        );
        reached.add(row.user_id);
      } catch (error) {
        // The browser dropped the subscription: forget it.
        if (error.statusCode === 404 || error.statusCode === 410) await db.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
        else console.error("Push failed:", error.statusCode || error.message);
      }
    }),
  );
  if (reached.size) await db.from("push_log").insert([...reached].map((userId) => ({ user_id: userId, kind })));
  return reached.size;
}

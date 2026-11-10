import webpush from "web-push";

// Web push helpers shared by api/push.js and api/cron-reminders.js. Needs
// VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in the environment.

export const MAX_PER_DAY = 2;

// Long id lists go to the database in batches (URL length and the 1000-row cap).
export function chunks(list, size = 200) {
  const out = [];
  for (let index = 0; index < list.length; index += size) out.push(list.slice(index, index + size));
  return out;
}

const MESSAGES = {
  partner: {
    uz: { title: "Sizni sherik kutyapti 🎙", body: "Hozir kimdir koreyscha gaplashish uchun sherik qidiryapti. Qo'shiling!" },
    en: { title: "A partner is waiting 🎙", body: "Someone is looking for a Korean speaking partner right now. Join in!" },
    ru: { title: "Вас ждёт собеседник 🎙", body: "Кто-то прямо сейчас ищет собеседника для корейского. Присоединяйтесь!" },
  },
  expiry: {
    uz: { title: "Premium tez orada tugaydi ⭐", body: "Premium 3 kundan keyin tugaydi. Uzaytirib, Friday bilan gaplashishni davom ettiring." },
    en: { title: "Premium ends soon ⭐", body: "Your Premium ends in 3 days. Extend it to keep speaking with Friday." },
    ru: { title: "Premium скоро закончится ⭐", body: "Premium закончится через 3 дня. Продлите, чтобы и дальше говорить с Фрайдей." },
  },
  streak: {
    uz: { title: "Streak yo'qolmasin 🔥", body: "Bugun hali mashq qilmadingiz. 5 daqiqa yetarli!" },
    en: { title: "Keep your streak 🔥", body: "You haven't practised today yet. Five minutes is enough!" },
    ru: { title: "Не потеряйте серию 🔥", body: "Сегодня вы ещё не занимались. Хватит пяти минут!" },
  },
};
const URLS = { partner: "/speaking", streak: "/", expiry: "/premium" };

export function pushConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails("https://www.ktalim.uz", publicKey, privateKey);
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
export async function sendReminder(db, userIds, kind, options = {}) {
  if (!pushConfigured() || !userIds.length) return 0;
  let reached = 0;
  for (const batch of chunks(userIds)) reached += await sendBatch(db, batch, kind, options);
  return reached;
}

async function sendBatch(db, userIds, kind, { gapHours = 12 } = {}) {
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

const REPORT_REASONS = { rude: "qo'pollik", sexual: "uyatsiz gap", spam: "spam", silent: "jim turdi", underage: "yoshi kichik", other: "boshqa" };
const ADMIN_TEXT = {
  digest: (data) => ({ title: "☀️ K-TALIM: oxirgi 24 soat", body: data.text || "" }),
  health: (data) => ({ title: "⚠️ AI xatolari ko'paydi", body: `So'nggi 15 daqiqada ${data.count || ""} marta o'quvchi AI'dan javob ololmadi.` }),
  deletion: (data) => ({ title: "🗑 Akkauntni o'chirish arizasi", body: `${data.email || ""}: ${data.reason || ""}` }),
  ticket: (data) => ({ title: "✉️ Yangi murojaat", body: data.text || "" }),
  ticketReply: (data) => ({ title: "💬 Murojaatga javob yozildi", body: data.text || "" }),
  report: (data) => ({ title: "⚠️ Suhbat haqida shikoyat", body: [REPORT_REASONS[data.reason] || data.reason, data.note].filter(Boolean).join(" — ") }),
  signup: (data) => ({ title: "👋 Yangi o'quvchi", body: data.name || "Ro'yxatdan o'tdi" }),
  aiAnswer: (data) => ({ title: "🤖 AI savolingizga javob", body: `${data.email || ""}: ${data.declined ? "javob berishni xohlamadi" : data.answer || ""}` }),
};

// A message from an admin to one learner. Returns how many devices got it.
export async function pushToUser(db, userId, { title, body }) {
  if (!pushConfigured()) return 0;
  const { data: subscriptions } = await db.from("push_subscriptions").select("*").eq("user_id", userId);
  let sent = 0;
  await Promise.all(
    (subscriptions || []).map(async (row) => {
      try {
        await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, JSON.stringify({ title, body, url: "/", tag: "admin-message" }), { TTL: 24 * 3600 });
        sent += 1;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) await db.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
        else console.error("Push failed:", error.statusCode || error.message);
      }
    }),
  );
  return sent;
}

// Sends admins a push for each new admin notification (see the
// admin_notifications migration) that has not been pushed yet. Several at
// once become one summary. Admins get these whatever the daily cap.
export async function pushAdminNotifications(db) {
  if (!pushConfigured()) return 0;
  const since = new Date(Date.now() - 24 * 3600000).toISOString();
  const { data: pending } = await db.from("admin_notifications").select("id").is("pushed_at", null).gte("created_at", since).limit(50);
  if (!pending?.length) return 0;
  // Claiming the rows first means two calls at once never push the same one.
  const { data: claimed } = await db
    .from("admin_notifications")
    .update({ pushed_at: new Date().toISOString() })
    .in("id", pending.map((row) => row.id))
    .is("pushed_at", null)
    .select("id, kind, data, link");
  if (!claimed?.length) return 0;
  const { data: admins } = await db.from("feedback_admins").select("user_id");
  const adminIds = (admins || []).map((row) => row.user_id);
  if (!adminIds.length) return 0;
  const { data: subscriptions } = await db.from("push_subscriptions").select("*").in("user_id", adminIds);
  if (!subscriptions?.length) return 0;
  const messages =
    claimed.length > 3
      ? [{ title: `🔔 ${claimed.length} ta yangi bildirishnoma`, body: claimed.map((row) => ADMIN_TEXT[row.kind]?.(row.data || {}).title).join(", "), url: "/admin/notifications", tag: "admin-summary" }]
      : claimed.map((row) => ({ ...(ADMIN_TEXT[row.kind]?.(row.data || {}) || { title: "🔔 K-TALIM", body: "" }), url: row.link, tag: `admin-${row.id}` }));
  let sent = 0;
  await Promise.all(
    subscriptions.flatMap((row) =>
      messages.map(async (message) => {
        try {
          await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, JSON.stringify({ ...message, body: message.body.slice(0, 200) }), { TTL: 24 * 3600 });
          sent += 1;
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) await db.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
          else console.error("Admin push failed:", error.statusCode || error.message);
        }
      }),
    ),
  );
  return sent;
}

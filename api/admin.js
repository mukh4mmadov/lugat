import { createClient } from "@supabase/supabase-js";

// Admin dashboard data and user management. Every request must carry the
// session of a user listed in public.feedback_admins; the work itself runs with
// the service role so it can read all users and change their accounts.
//
//   GET  /api/admin?action=overview
//   GET  /api/admin?action=users
//   GET  /api/admin?action=user&id=<uuid>
//   POST /api/admin { action: "premium", userId, days }   (days 0 = remove)
//   POST /api/admin { action: "admin", userId, value }
//   POST /api/admin { action: "ban", userId, value }
//   POST /api/admin { action: "delete", userId }

const DAY = 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function listAllUsers(db) {
  const users = [];
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return users;
}

async function selectAll(db, table, columns) {
  const rows = [];
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await db.from(table).select(columns).range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

const premiumUntil = (user) => user.app_metadata?.premium_until || null;
const isPremium = (user) => Boolean(premiumUntil(user)) && new Date(premiumUntil(user)).getTime() > Date.now();
const isBanned = (user) => Boolean(user.banned_until) && new Date(user.banned_until).getTime() > Date.now();

// A compact summary of one learner's saved progress (the Redux progress state).
function progressSummary(data) {
  const words = Object.values(data?.words || {});
  const stats = data?.stats || {};
  return {
    wordsStarted: words.length,
    wordsKnown: words.filter((record) => (record.knownCount || 0) >= 3).length,
    correct: stats.correct || 0,
    wrong: stats.wrong || 0,
    studyMinutes: stats.studyMinutes || 0,
    streak: stats.streak || 0,
    lastStudyDate: stats.lastStudyDate || null,
    favorites: Object.values(data?.favorites || {}).filter(Boolean).length,
  };
}

function userRow(user, profile, progress, admins) {
  return {
    id: user.id,
    email: user.email || null,
    name: profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") : "",
    birthYear: profile?.birth_year || null,
    provider: user.app_metadata?.provider || "email",
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
    confirmed: Boolean(user.email_confirmed_at || user.confirmed_at),
    lastActiveAt: progress?.updated_at || user.last_sign_in_at || null,
    premiumUntil: premiumUntil(user),
    premium: isPremium(user),
    banned: isBanned(user),
    admin: admins.has(user.id),
    progress: progressSummary(progress?.data),
  };
}

async function countSince(db, table, column, since, extra) {
  let query = db.from(table).select("*", { count: "exact", head: true }).gte(column, since);
  if (extra) query = extra(query);
  const { count, error } = await query;
  return error ? null : count;
}

async function overview(db) {
  const now = Date.now();
  const [users, profiles, progress, admins, tickets] = await Promise.all([
    listAllUsers(db),
    selectAll(db, "profiles", "id"),
    selectAll(db, "user_progress", "user_id, data, updated_at"),
    selectAll(db, "feedback_admins", "user_id"),
    selectAll(db, "feedback_tickets", "status, created_at"),
  ]);
  const weekAgo = new Date(now - 7 * DAY).toISOString();
  const dayAgo = new Date(now - DAY).toISOString();
  const [aiMessagesWeek, aiMessagesDay, aiSessionsWeek] = await Promise.all([
    countSince(db, "ai_chat_messages", "created_at", weekAgo, (query) => query.eq("role", "user")),
    countSince(db, "ai_chat_messages", "created_at", dayAgo, (query) => query.eq("role", "user")),
    countSince(db, "ai_chat_sessions", "updated_at", weekAgo),
  ]);

  // Sign-ups per day for the last 30 days, oldest first.
  const signups = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now - (29 - index) * DAY).toISOString().slice(0, 10);
    return { date, count: 0 };
  });
  const byDate = new Map(signups.map((day) => [day.date, day]));
  users.forEach((user) => {
    const day = byDate.get(String(user.created_at).slice(0, 10));
    if (day) day.count += 1;
  });

  const activeWithin = (days) =>
    progress.filter((row) => row.updated_at && now - new Date(row.updated_at).getTime() <= days * DAY).length;

  // Words that cost learners the most mistakes, and how far learners got per lesson.
  const wordMistakes = new Map();
  const lessons = new Map();
  let totalMinutes = 0;
  let totalKnown = 0;
  progress.forEach((row) => {
    totalMinutes += row.data?.stats?.studyMinutes || 0;
    const lessonsSeen = new Set();
    Object.entries(row.data?.words || {}).forEach(([key, record]) => {
      if ((record.wrongCount || 0) > 0) {
        const entry = wordMistakes.get(key) || { key, wrong: 0, learners: 0 };
        entry.wrong += record.wrongCount;
        entry.learners += 1;
        wordMistakes.set(key, entry);
      }
      const lesson = Number(key.split("-")[0]);
      if (!Number.isFinite(lesson)) return;
      const entry = lessons.get(lesson) || { lesson, learners: 0, known: 0 };
      if (!lessonsSeen.has(lesson)) {
        entry.learners += 1;
        lessonsSeen.add(lesson);
      }
      if ((record.knownCount || 0) >= 3) {
        entry.known += 1;
        totalKnown += 1;
      }
      lessons.set(lesson, entry);
    });
  });

  const adminIds = new Set(admins.map((row) => row.user_id));
  const progressById = new Map(progress.map((row) => [row.user_id, row]));
  const profileIds = new Set(profiles.map((row) => row.id));
  const topLearners = users
    .map((user) => ({ user, summary: progressSummary(progressById.get(user.id)?.data) }))
    .filter((entry) => entry.summary.wordsKnown > 0)
    .sort((a, b) => b.summary.wordsKnown - a.summary.wordsKnown)
    .slice(0, 8)
    .map(({ user, summary }) => ({ id: user.id, email: user.email, wordsKnown: summary.wordsKnown, streak: summary.streak, studyMinutes: summary.studyMinutes }));

  const ticketCounts = tickets.reduce((counts, ticket) => ({ ...counts, [ticket.status]: (counts[ticket.status] || 0) + 1 }), {});

  return {
    generatedAt: new Date(now).toISOString(),
    users: {
      total: users.length,
      new7: users.filter((user) => now - new Date(user.created_at).getTime() <= 7 * DAY).length,
      new30: users.filter((user) => now - new Date(user.created_at).getTime() <= 30 * DAY).length,
      signedIn7: users.filter((user) => user.last_sign_in_at && now - new Date(user.last_sign_in_at).getTime() <= 7 * DAY).length,
      unconfirmed: users.filter((user) => !(user.email_confirmed_at || user.confirmed_at)).length,
      withoutProfile: users.filter((user) => !profileIds.has(user.id)).length,
      premium: users.filter(isPremium).length,
      banned: users.filter(isBanned).length,
      admins: adminIds.size,
      providers: users.reduce((counts, user) => {
        const provider = user.app_metadata?.provider || "email";
        return { ...counts, [provider]: (counts[provider] || 0) + 1 };
      }, {}),
    },
    learning: {
      learners: progress.length,
      active1: activeWithin(1),
      active7: activeWithin(7),
      active30: activeWithin(30),
      totalMinutes,
      totalKnown,
      lessons: [...lessons.values()].sort((a, b) => a.lesson - b.lesson),
      hardestWords: [...wordMistakes.values()].sort((a, b) => b.wrong - a.wrong).slice(0, 12),
      topLearners,
    },
    ai: { messagesDay: aiMessagesDay, messagesWeek: aiMessagesWeek, sessionsWeek: aiSessionsWeek },
    feedback: { total: tickets.length, ...ticketCounts },
    signups,
  };
}

async function userList(db) {
  const [users, profiles, progress, admins] = await Promise.all([
    listAllUsers(db),
    selectAll(db, "profiles", "id, first_name, last_name, birth_year"),
    selectAll(db, "user_progress", "user_id, data, updated_at"),
    selectAll(db, "feedback_admins", "user_id"),
  ]);
  const profileById = new Map(profiles.map((row) => [row.id, row]));
  const progressById = new Map(progress.map((row) => [row.user_id, row]));
  const adminIds = new Set(admins.map((row) => row.user_id));
  return {
    users: users
      .map((user) => userRow(user, profileById.get(user.id), progressById.get(user.id), adminIds))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  };
}

async function userDetail(db, id) {
  const { data, error } = await db.auth.admin.getUserById(id);
  if (error || !data.user) return null;
  const [profile, progress, admin, sessions, tickets] = await Promise.all([
    db.from("profiles").select("id, first_name, last_name, birth_year").eq("id", id).maybeSingle(),
    db.from("user_progress").select("user_id, data, updated_at").eq("user_id", id).maybeSingle(),
    db.from("feedback_admins").select("user_id").eq("user_id", id).maybeSingle(),
    db.from("ai_chat_sessions").select("id, title, updated_at").eq("user_id", id).order("updated_at", { ascending: false }).limit(20),
    db.from("feedback_tickets").select("id, category, message, status, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  const row = userRow(data.user, profile.data, progress.data, new Set(admin.data ? [id] : []));
  const words = progress.data?.data?.words || {};
  const lessons = new Map();
  Object.entries(words).forEach(([key, record]) => {
    const lesson = Number(key.split("-")[0]);
    if (!Number.isFinite(lesson)) return;
    const entry = lessons.get(lesson) || { lesson, started: 0, known: 0 };
    entry.started += 1;
    if ((record.knownCount || 0) >= 3) entry.known += 1;
    lessons.set(lesson, entry);
  });
  return {
    ...row,
    lessons: [...lessons.values()].sort((a, b) => a.lesson - b.lesson),
    weakWords: Object.entries(words)
      .filter(([, record]) => (record.wrongCount || 0) > 0)
      .sort((a, b) => b[1].wrongCount - a[1].wrongCount)
      .slice(0, 10)
      .map(([key, record]) => ({ key, wrong: record.wrongCount, known: record.knownCount || 0 })),
    activity: (progress.data?.data?.stats?.activity || []).slice(-10).reverse(),
    aiSessions: sessions.data || [],
    tickets: tickets.data || [],
  };
}

async function act(db, actor, body) {
  const { action, userId } = body || {};
  if (!UUID.test(String(userId || ""))) return [400, { error: "Invalid user" }];
  const selfChange = userId === actor.id;

  if (action === "premium") {
    const days = Number(body.days);
    if (!Number.isFinite(days) || days < 0 || days > 3660) return [400, { error: "Invalid duration" }];
    const { data, error } = await db.auth.admin.getUserById(userId);
    if (error || !data.user) return [404, { error: "User not found" }];
    // Extending starts from the current expiry when premium is still active.
    const base = isPremium(data.user) ? new Date(premiumUntil(data.user)).getTime() : Date.now();
    const until = days === 0 ? null : new Date(base + days * DAY).toISOString();
    const { error: updateError } = await db.auth.admin.updateUserById(userId, {
      app_metadata: { ...data.user.app_metadata, premium_until: until },
    });
    if (updateError) return [500, { error: "Update failed" }];
    return [200, { premiumUntil: until }];
  }

  if (action === "admin") {
    if (selfChange && !body.value) return [400, { error: "You cannot remove your own admin access" }];
    const { error } = body.value
      ? await db.from("feedback_admins").upsert({ user_id: userId })
      : await db.from("feedback_admins").delete().eq("user_id", userId);
    if (error) return [500, { error: "Update failed" }];
    return [200, { admin: Boolean(body.value) }];
  }

  if (action === "ban") {
    if (selfChange) return [400, { error: "You cannot block yourself" }];
    const { error } = await db.auth.admin.updateUserById(userId, { ban_duration: body.value ? "876000h" : "none" });
    if (error) return [500, { error: "Update failed" }];
    return [200, { banned: Boolean(body.value) }];
  }

  if (action === "delete") {
    if (selfChange) return [400, { error: "You cannot delete yourself here" }];
    const { error } = await db.auth.admin.deleteUser(userId);
    if (error) return [500, { error: "Delete failed" }];
    return [200, { deleted: true }];
  }

  return [400, { error: "Unknown action" }];
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const db = serviceClient();
  if (!db) return res.status(503).json({ error: "Admin API is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)" });

  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return res.status(401).json({ error: "Invalid session" });
  const { data: adminRow, error: adminError } = await db.from("feedback_admins").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (adminError) return res.status(500).json({ error: "Admin check failed" });
  if (!adminRow) return res.status(403).json({ error: "Admin access required" });

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
      const [status, payload] = await act(db, auth.user, body);
      return res.status(status).json(payload);
    }
    const action = req.query?.action;
    if (action === "overview") return res.status(200).json(await overview(db));
    if (action === "users") return res.status(200).json(await userList(db));
    if (action === "user") {
      if (!UUID.test(String(req.query.id || ""))) return res.status(400).json({ error: "Invalid user" });
      const detail = await userDetail(db, req.query.id);
      return detail ? res.status(200).json(detail) : res.status(404).json({ error: "User not found" });
    }
    return res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    console.error("Admin API error:", error);
    return res.status(500).json({ error: "Admin request failed" });
  }
}

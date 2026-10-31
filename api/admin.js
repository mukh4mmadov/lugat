import { createClient } from "@supabase/supabase-js";
import { extendPremium, isPremium, premiumUntil } from "./_lib/premium.js";
import { levelForXp } from "../src/lib/gamification.js";

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
//   GET  /api/admin?action=messages&sessionId=<uuid>   an AI tutor conversation
//   GET  /api/admin?action=settings | journal   (journal: audit log, premium sales)
//   POST /api/admin { action: "setting", key, value }
//   POST /api/admin { action: "content", kind, itemId, data, hidden } | { ..., revert: true }
//   GET  /api/admin?action=speaking   live calls: queue, active and recent calls, reports, bans
//   POST /api/admin { action: "speakingBan", userId, hours }   (hours 0 = lift the ban)
//   POST /api/admin { action: "reportStatus", reportId, status } | { action: "endCall", callId }
//   POST /api/admin { action: "profile", userId, firstName, lastName, birthYear, gender, koreanLevel }
//   POST /api/admin { action: "confirmEmail" | "resetPassword" | "resetSpeaking", userId }
//   POST /api/admin { action: "progress", userId, xpDelta?, streak?, badge?, badgeValue?, reset? }
//   Every successful POST is written to admin_audit.

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
    xp: data?.xp || 0,
    level: levelForXp(data?.xp || 0),
    badges: Object.keys(data?.badges || {}).length,
    grammarDone: Object.values(data?.grammar || {}).filter((item) => item?.done).length,
    storiesRead: Object.values(data?.stories || {}).filter((item) => item?.read).length,
    speakingMinutes: Math.round((stats.speakingSeconds || 0) / 60),
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
    selectAll(db, "feedback_tickets", "status, created_at, last_message_by"),
  ]);
  const weekAgo = new Date(now - 7 * DAY).toISOString();
  const dayAgo = new Date(now - DAY).toISOString();
  const [aiMessagesWeek, aiMessagesDay, aiSessionsWeek, sales, speakingDays] = await Promise.all([
    countSince(db, "ai_chat_messages", "created_at", weekAgo, (query) => query.eq("role", "user")),
    countSince(db, "ai_chat_messages", "created_at", dayAgo, (query) => query.eq("role", "user")),
    countSince(db, "ai_chat_sessions", "updated_at", weekAgo),
    // Missing tables (migrations not run yet) just leave these empty.
    selectAll(db, "premium_log", "amount, created_at").catch(() => []),
    db.from("speaking_usage").select("day, seconds").gte("day", new Date(now - 6 * DAY + 5 * 60 * 60 * 1000).toISOString().slice(0, 10)).then(({ data }) => data || []),
  ]);
  const today = tashkentDay();
  const revenueSince = (days) => sales.filter((sale) => now - new Date(sale.created_at).getTime() <= days * DAY).reduce((sum, sale) => sum + sale.amount, 0);

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
    revenue: {
      month: revenueSince(30),
      week: revenueSince(7),
      total: sales.reduce((sum, sale) => sum + sale.amount, 0),
      sales30: sales.filter((sale) => now - new Date(sale.created_at).getTime() <= 30 * DAY).length,
    },
    speaking: {
      minutesToday: Math.round(speakingDays.filter((row) => row.day === today).reduce((sum, row) => sum + row.seconds, 0) / 60),
      minutesWeek: Math.round(speakingDays.reduce((sum, row) => sum + row.seconds, 0) / 60),
      speakersToday: speakingDays.filter((row) => row.day === today && row.seconds > 0).length,
    },
    feedback: {
      total: tickets.length,
      ...ticketCounts,
      needsReply: tickets.filter((ticket) => ["open", "in_progress"].includes(ticket.status) && ticket.last_message_by !== "admin").length,
    },
    signups,
  };
}

async function userList(db) {
  const [users, profiles, progress, admins] = await Promise.all([
    listAllUsers(db),
    selectAll(db, "profiles", "id, first_name, last_name, birth_year, gender, korean_level"),
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
  const [profile, progress, admin, sessions, tickets, speaking, rewards, premiumLog] = await Promise.all([
    db.from("profiles").select("id, first_name, last_name, birth_year, gender, korean_level").eq("id", id).maybeSingle(),
    db.from("user_progress").select("user_id, data, updated_at").eq("user_id", id).maybeSingle(),
    db.from("feedback_admins").select("user_id").eq("user_id", id).maybeSingle(),
    db.from("ai_chat_sessions").select("id, title, updated_at").eq("user_id", id).order("updated_at", { ascending: false }).limit(20),
    db.from("feedback_tickets").select("id, category, subject, message, status, rating, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    db.from("speaking_sessions").select("id, kind, topic_id, level, started_at, seconds, turns").eq("user_id", id).order("started_at", { ascending: false }).limit(20),
    db.from("reward_claims").select("kind, days, claimed_at").eq("user_id", id).order("claimed_at", { ascending: false }).limit(20),
    db.from("premium_log").select("days, amount, note, premium_until, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  const [ban, reportsAgainst] = await Promise.all([
    db.from("speaking_bans").select("until, reason").eq("user_id", id).gt("until", new Date().toISOString()).maybeSingle(),
    db.from("speaking_reports").select("reason, note, status, created_at").eq("reported", id).order("created_at", { ascending: false }).limit(20),
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
    speakingSessions: speaking.data || [],
    rewards: rewards.data || [],
    premiumLog: premiumLog.data || [],
    speakingBan: ban.data || null,
    reportsAgainst: reportsAgainst.data || [],
    profile: {
      firstName: profile.data?.first_name || "",
      lastName: profile.data?.last_name || "",
      birthYear: profile.data?.birth_year || null,
      gender: profile.data?.gender || null,
      koreanLevel: profile.data?.korean_level || null,
    },
    badgeIds: Object.keys(progress.data?.data?.badges || {}),
  };
}

// Live calls for the admin "Speaking" tab.
async function speakingOverview(db) {
  const since = new Date(Date.now() - DAY).toISOString();
  const [queue, active, recent, reports, bans, users] = await Promise.all([
    db.from("speaking_queue").select("user_id, level, want, age_group, seen_at, call_id").gt("seen_at", new Date(Date.now() - 15000).toISOString()),
    db.from("speaking_calls").select("*").is("ended_at", null).gt("created_at", new Date(Date.now() - 2 * 3600000).toISOString()).order("created_at", { ascending: false }),
    db.from("speaking_calls").select("*").not("ended_at", "is", null).order("created_at", { ascending: false }).limit(50),
    db.from("speaking_reports").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("speaking_bans").select("*").gt("until", new Date().toISOString()).order("until", { ascending: false }),
    listAllUsers(db),
  ]);
  const emails = Object.fromEntries(users.map((user) => [user.id, user.email || user.id]));
  const today = (recent.data || []).filter((call) => call.created_at >= since);
  return {
    queue: queue.data || [],
    active: active.data || [],
    recent: recent.data || [],
    reports: reports.data || [],
    bans: bans.data || [],
    stats: { callsToday: today.length, minutesToday: Math.round(today.reduce((sum, call) => sum + call.seconds, 0) / 60), openReports: (reports.data || []).filter((report) => report.status === "open").length },
    emails,
  };
}

// Settings admins may change, with how each value is checked.
const SETTINGS = {
  ai_chat_enabled: (value) => typeof value === "boolean",
  speaking_enabled: (value) => typeof value === "boolean",
  live_speaking_enabled: (value) => typeof value === "boolean",
  feedback_ai_enabled: (value) => typeof value === "boolean",
  speaking_free_seconds: (value) => Number.isInteger(value) && value >= 0 && value <= 86400,
  speaking_premium_seconds: (value) => Number.isInteger(value) && value >= 0 && value <= 86400,
  ai_free_daily: (value) => Number.isInteger(value) && value >= 0 && value <= 1000,
  ai_premium_daily: (value) => Number.isInteger(value) && value >= 0 && value <= 5000,
  grammar_free_daily: (value) => Number.isInteger(value) && value >= 0 && value <= 1000,
  announcement: (value) =>
    Boolean(value) && typeof value === "object" && typeof value.text === "string" && value.text.length <= 300 && (!value.link || /^(https:\/\/|\/)/.test(value.link)),
};

// Content fields admins may override, with the JSON type each must have.
// Mirrors EDITABLE_FIELDS in src/lib/contentOverrides.js.
const CONTENT_FIELDS = {
  story: { emoji: "string", title: "object", words: "array", lines: "array", questions: "array" },
  grammar: { pattern: "string", title: "object", explain: "object", rules: "array", examples: "array", mistakes: "array", quiz: "array" },
  topic: { emoji: "string", ko: "string", uz: "string", en: "string", ru: "string", questions: "array", words: "array" },
};
const typeOf = (value) => (Array.isArray(value) ? "array" : value === null ? "null" : typeof value);

function cleanContent(kind, data) {
  const fields = CONTENT_FIELDS[kind];
  if (!data || typeOf(data) !== "object" || JSON.stringify(data).length > 60000) return null;
  for (const [field, value] of Object.entries(data)) {
    if (!fields[field] || typeOf(value) !== fields[field]) return null;
    if (fields[field] === "string" && value.length > 300) return null;
  }
  return data;
}

const tashkentDay = () => new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 10);

// A fresh progress object for "reset progress"; the learner's settings stay.
function emptyProgress(settings) {
  return {
    theme: "dark",
    favorites: {},
    words: {},
    lessonDecks: {},
    studied: {},
    stats: { studiedWords: 0, correct: 0, wrong: 0, studyMinutes: 0, streak: 0, lastStudyDate: "", activity: [] },
    settings: settings || { speechRate: 0.82, autoSpeak: true, dailyGoal: 20 },
    lastPlace: null,
    shareMilestones: {},
    xp: 0,
    badges: {},
    grammar: {},
    stories: {},
    xpSeeded: true,
  };
}

// Edits the learner's synced progress. An open tab may later upload its own
// copy over it, so tell the learner to reload after big changes.
async function updateProgress(db, userId, change) {
  const { data, error } = await db.from("user_progress").select("data").eq("user_id", userId).maybeSingle();
  if (error) return [500, { error: "Load failed" }];
  const next = change(data?.data ? structuredClone(data.data) : emptyProgress());
  const { error: saveError } = await db.from("user_progress").upsert({ user_id: userId, data: next, updated_at: new Date().toISOString() });
  if (saveError) return [500, { error: "Save failed" }];
  return [200, { xp: next.xp || 0, streak: next.stats?.streak || 0, badges: Object.keys(next.badges || {}) }];
}

async function act(db, actor, body) {
  const { action, userId } = body || {};
  if (action === "setting") {
    const check = SETTINGS[body.key];
    if (!check || !check(body.value)) return [400, { error: "Invalid setting" }];
    const { error } = await db.from("app_settings").upsert({ key: body.key, value: body.value, updated_at: new Date().toISOString() });
    if (error) return [500, { error: "Update failed" }];
    return [200, { key: body.key, value: body.value }];
  }
  if (action === "content") {
    if (!CONTENT_FIELDS[body.kind] || !/^[a-z0-9-]{1,60}$/i.test(String(body.itemId || ""))) return [400, { error: "Invalid item" }];
    if (body.revert) {
      const { error } = await db.from("content_overrides").delete().eq("kind", body.kind).eq("item_id", body.itemId);
      if (error) return [500, { error: "Update failed" }];
      return [200, { reverted: true }];
    }
    const data = cleanContent(body.kind, body.data || {});
    if (!data) return [400, { error: "Invalid content" }];
    const { error } = await db.from("content_overrides").upsert({
      kind: body.kind,
      item_id: body.itemId,
      data,
      hidden: Boolean(body.hidden),
      updated_by: actor.id,
      updated_at: new Date().toISOString(),
    });
    if (error) return [500, { error: "Update failed" }];
    return [200, { saved: true }];
  }
  if (action === "reportStatus") {
    if (!["open", "resolved", "dismissed"].includes(body.status)) return [400, { error: "Invalid status" }];
    const { error } = await db.from("speaking_reports").update({ status: body.status }).eq("id", Number(body.reportId));
    if (error) return [500, { error: "Update failed" }];
    return [200, { status: body.status }];
  }
  if (action === "endCall") {
    if (!UUID.test(String(body.callId || ""))) return [400, { error: "Invalid call" }];
    const { error } = await db.rpc("finish_speaking_call", { p_call: body.callId, p_by: actor.id });
    if (error) return [500, { error: "Update failed" }];
    return [200, { ended: true }];
  }
  if (!UUID.test(String(userId || ""))) return [400, { error: "Invalid user" }];
  const selfChange = userId === actor.id;

  if (action === "premium") {
    const days = Number(body.days);
    if (!Number.isFinite(days) || days < 0 || days > 3660) return [400, { error: "Invalid duration" }];
    const amount = Math.max(0, Math.round(Number(body.amount) || 0));
    try {
      const until = await extendPremium(db, userId, days);
      await db.from("premium_log").insert({ user_id: userId, admin_id: actor.id, days, amount, note: String(body.note || "").slice(0, 200), premium_until: until });
      return [200, { premiumUntil: until }];
    } catch (error) {
      return [error.status || 500, { error: error.message }];
    }
  }

  if (action === "profile") {
    const patch = {};
    if (typeof body.firstName === "string") patch.first_name = body.firstName.trim().slice(0, 50);
    if (typeof body.lastName === "string") patch.last_name = body.lastName.trim().slice(0, 50);
    if (body.birthYear !== undefined && body.birthYear !== null && body.birthYear !== "") {
      const year = Number(body.birthYear);
      if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) return [400, { error: "Invalid birth year" }];
      patch.birth_year = year;
    }
    if (body.gender !== undefined) {
      if (![null, "male", "female"].includes(body.gender)) return [400, { error: "Invalid gender" }];
      patch.gender = body.gender;
    }
    if (body.koreanLevel !== undefined) {
      if (![null, "beginner", "intermediate", "advanced"].includes(body.koreanLevel)) return [400, { error: "Invalid level" }];
      patch.korean_level = body.koreanLevel;
    }
    const { error } = await db.from("profiles").upsert({ id: userId, ...patch });
    if (error) return [500, { error: "Update failed" }];
    return [200, { saved: true }];
  }

  if (action === "confirmEmail") {
    const { error } = await db.auth.admin.updateUserById(userId, { email_confirm: true });
    if (error) return [500, { error: "Update failed" }];
    return [200, { confirmed: true }];
  }

  if (action === "resetPassword") {
    const { data, error } = await db.auth.admin.getUserById(userId);
    if (error || !data.user?.email) return [404, { error: "User not found" }];
    const site = process.env.SITE_URL || "https://lugat-six.vercel.app";
    const { error: sendError } = await db.auth.resetPasswordForEmail(data.user.email, { redirectTo: site + "/reset-password" });
    if (sendError) return [500, { error: "Could not send the email" }];
    return [200, { sent: true }];
  }

  if (action === "speakingBan") {
    const hours = Number(body.hours);
    if (!Number.isFinite(hours) || hours < 0 || hours > 24 * 3650) return [400, { error: "Invalid duration" }];
    const { error } = hours
      ? await db.from("speaking_bans").upsert({ user_id: userId, until: new Date(Date.now() + hours * 3600000).toISOString(), reason: String(body.reason || "admin").slice(0, 200) })
      : await db.from("speaking_bans").delete().eq("user_id", userId);
    if (error) return [500, { error: "Update failed" }];
    return [200, { hours }];
  }

  if (action === "resetSpeaking") {
    const { error } = await db.from("speaking_usage").delete().eq("user_id", userId).eq("day", tashkentDay());
    if (error) return [500, { error: "Update failed" }];
    return [200, { reset: true }];
  }

  if (action === "progress") {
    return updateProgress(db, userId, (data) => {
      if (body.reset) return emptyProgress(data.settings);
      if (Number.isFinite(Number(body.xpDelta))) data.xp = Math.max(0, (data.xp || 0) + Math.round(Number(body.xpDelta)));
      if (body.streak !== undefined && Number.isInteger(Number(body.streak)) && Number(body.streak) >= 0) {
        data.stats = { ...(data.stats || {}), streak: Number(body.streak), lastStudyDate: new Date().toISOString().slice(0, 10) };
      }
      if (typeof body.badge === "string" && /^[a-zA-Z0-9]{2,30}$/.test(body.badge)) {
        data.badges = { ...(data.badges || {}) };
        if (body.badgeValue === false) delete data.badges[body.badge];
        else data.badges[body.badge] = Date.now();
      }
      return data;
    });
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
  if (adminError) {
    // Usually missing grants: see supabase/migrations/202610280001_admin_service_role.sql.
    console.error("Admin check failed:", adminError);
    return res.status(500).json({ error: "Admin check failed" });
  }
  if (!adminRow) return res.status(403).json({ error: "Admin access required" });

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
      const [status, payload] = await act(db, auth.user, body);
      if (status < 400) {
        const details = { ...body };
        delete details.action;
        delete details.userId;
        // Content edits can be long; the log keeps which fields changed.
        if (details.data) details.data = Object.keys(details.data);
        await db.from("admin_audit").insert({
          admin_id: auth.user.id,
          action: String(body.action || ""),
          target_user: UUID.test(String(body.userId || "")) ? body.userId : null,
          details,
        });
      }
      return res.status(status).json(payload);
    }
    const action = req.query?.action;
    if (action === "overview") return res.status(200).json(await overview(db));
    if (action === "users") return res.status(200).json(await userList(db));
    if (action === "messages") {
      if (!UUID.test(String(req.query.sessionId || ""))) return res.status(400).json({ error: "Invalid session" });
      const { data: messages } = await db.from("ai_chat_messages").select("role, content, created_at").eq("session_id", req.query.sessionId).order("created_at").limit(200);
      return res.status(200).json({ messages: messages || [] });
    }
    if (action === "settings") {
      const { data: settings } = await db.from("app_settings").select("key, value");
      return res.status(200).json({ settings: Object.fromEntries((settings || []).map((row) => [row.key, row.value])) });
    }
    if (action === "speaking") return res.status(200).json(await speakingOverview(db));
    if (action === "journal") {
      const [{ data: entries }, { data: sales }, users] = await Promise.all([
        db.from("admin_audit").select("*").order("created_at", { ascending: false }).limit(300),
        db.from("premium_log").select("*").order("created_at", { ascending: false }).limit(300),
        listAllUsers(db),
      ]);
      const emails = Object.fromEntries(users.map((user) => [user.id, user.email || user.id]));
      return res.status(200).json({ entries: entries || [], sales: sales || [], emails });
    }
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

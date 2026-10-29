import { createClient } from "@supabase/supabase-js";

// Public leaderboard built from saved learner progress.
//
//   GET /api/leaderboard              top learners (names shortened to "Ali V.")
//   Authorization: Bearer <session>   also returns the caller's own rank
//
// "week" ranks answers in the last 7 days: the per-day counts when the learner
// has them, otherwise the timestamps of each word's recent answers (older
// saves). "all" ranks words mastered (answered right 3+ times). Learners who
// turned on settings.hideFromLeaderboard are left out.

const DAY = 24 * 60 * 60 * 1000;
const LIMIT = 50;

function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
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

const dayKey = (time) => new Date(time).toISOString().slice(0, 10);

function weeklyAnswers(data, now) {
  const since = now - 7 * DAY;
  // Day keys are local dates; allow one extra day so no time zone loses a day.
  const firstDay = dayKey(since - DAY);
  const fromDaily = Object.entries(data?.stats?.daily || {})
    .filter(([day]) => day >= firstDay)
    .reduce((sum, [, count]) => sum + (Number(count) || 0), 0);
  let fromWords = 0;
  Object.values(data?.words || {}).forEach((record) => {
    (record.recentAnswers || []).forEach((answer) => {
      if (answer.timestamp >= since) fromWords += 1;
    });
  });
  return Math.max(fromDaily, fromWords);
}

const wordsMastered = (data) => Object.values(data?.words || {}).filter((record) => (record.knownCount || 0) >= 3).length;

function shortName(profile) {
  const first = (profile?.first_name || "").trim();
  const last = (profile?.last_name || "").trim();
  if (!first) return null;
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const db = serviceClient();
  if (!db) return res.status(503).json({ error: "Leaderboard is not configured" });

  let viewerId = null;
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (token) {
    const { data } = await db.auth.getUser(token);
    viewerId = data?.user?.id || null;
  }

  try {
    const now = Date.now();
    const [progress, profiles] = await Promise.all([
      selectAll(db, "user_progress", "user_id, data"),
      selectAll(db, "profiles", "id, first_name, last_name"),
    ]);
    const profileById = new Map(profiles.map((row) => [row.id, row]));
    const entries = progress
      .filter((row) => !row.data?.settings?.hideFromLeaderboard)
      .map((row) => ({
        id: row.user_id,
        name: shortName(profileById.get(row.user_id)),
        week: weeklyAnswers(row.data, now),
        all: wordsMastered(row.data),
        streak: row.data?.stats?.streak || 0,
      }))
      .filter((entry) => entry.name);

    const board = (key) => {
      const ranked = entries.filter((entry) => entry[key] > 0).sort((a, b) => b[key] - a[key] || b.streak - a.streak);
      const rows = ranked.slice(0, LIMIT).map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        score: entry[key],
        streak: entry.streak,
        me: entry.id === viewerId,
      }));
      const myIndex = viewerId ? ranked.findIndex((entry) => entry.id === viewerId) : -1;
      const me = myIndex >= 0 ? { rank: myIndex + 1, score: ranked[myIndex][key], of: ranked.length } : null;
      return { rows, me, total: ranked.length };
    };

    res.setHeader("Cache-Control", viewerId ? "private, no-store" : "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ generatedAt: new Date(now).toISOString(), week: board("week"), all: board("all") });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ error: "Leaderboard failed" });
  }
}

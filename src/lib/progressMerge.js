// Merges the progress on this device with the copy saved on the server, so
// neither side's learning is lost: answers made offline, in the last seconds
// before a tab closed, or as a guest before signing in.
//
// Counters only grow, so the larger value wins. Each word keeps the record
// with the most recent activity (with the larger answer counts). Badges,
// grammar and stories are combined. Settings and other single values come
// from whichever copy changed last.

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

function lastActivity(record = {}) {
  return Math.max(record.lastReviewedAt || 0, record.reviewed || 0, ...(record.recentAnswers || []).map((answer) => answer.timestamp || 0));
}

function mergeWords(local = {}, server = {}) {
  const words = { ...server };
  for (const [key, mine] of Object.entries(local)) {
    const theirs = words[key];
    if (!theirs) {
      words[key] = mine;
      continue;
    }
    const newer = lastActivity(mine) >= lastActivity(theirs) ? mine : theirs;
    words[key] = {
      ...newer,
      knownCount: Math.max(mine.knownCount || 0, theirs.knownCount || 0),
      wrongCount: Math.max(mine.wrongCount || 0, theirs.wrongCount || 0),
      manualDifficult: newer.manualDifficult,
    };
  }
  return words;
}

function maxByKey(a = {}, b = {}) {
  const result = { ...b };
  for (const [key, value] of Object.entries(a)) result[key] = isNumber(value) && isNumber(result[key]) ? Math.max(value, result[key]) : value ?? result[key];
  return result;
}

function mergeStats(local = {}, server = {}, localNewer) {
  const stats = {};
  for (const key of new Set([...Object.keys(local), ...Object.keys(server)])) {
    const mine = local[key];
    const theirs = server[key];
    if (isNumber(mine) && isNumber(theirs)) stats[key] = Math.max(mine, theirs);
    else stats[key] = (localNewer ? mine ?? theirs : theirs ?? mine);
  }
  // The streak belongs with its date: take the copy that studied last.
  const localDate = local.lastStudyDate || "";
  const serverDate = server.lastStudyDate || "";
  const streakFrom = localDate > serverDate ? local : serverDate > localDate ? server : (local.streak || 0) >= (server.streak || 0) ? local : server;
  stats.streak = streakFrom.streak || 0;
  stats.lastStudyDate = streakFrom.lastStudyDate || "";
  stats.daily = maxByKey(local.daily, server.daily);
  stats.typeCorrect = maxByKey(local.typeCorrect, server.typeCorrect);
  stats.activity = (localNewer ? local.activity : server.activity) || local.activity || server.activity || [];
  return stats;
}

function mergeDone(local = {}, server = {}, flag) {
  const result = { ...server };
  for (const [id, mine] of Object.entries(local)) {
    const theirs = result[id];
    result[id] = theirs
      ? { ...theirs, ...mine, [flag]: Boolean(mine?.[flag] || theirs?.[flag]), best: Math.max(mine?.best || 0, theirs?.best || 0), at: Math.max(mine?.at || 0, theirs?.at || 0) }
      : mine;
  }
  return result;
}

function mergeBadges(local = {}, server = {}) {
  const result = { ...server };
  for (const [id, at] of Object.entries(local)) result[id] = result[id] ? Math.min(result[id], at) : at;
  return result;
}

// Each lesson's unfinished Study session: the one saved last.
function mergeSessions(local = {}, server = {}) {
  const result = { ...server };
  for (const [lesson, mine] of Object.entries(local)) {
    if (!result[lesson] || (mine?.savedAt || 0) >= (result[lesson].savedAt || 0)) result[lesson] = mine;
  }
  return result;
}

export function hasProgress(progress) {
  return Boolean(
    progress &&
      (Object.keys(progress.words || {}).length ||
        (progress.stats?.studiedWords || 0) > 0 ||
        Object.values(progress.favorites || {}).some(Boolean) ||
        (progress.xp || 0) > 0 ||
        Object.keys(progress.grammar || {}).length ||
        Object.keys(progress.stories || {}).length),
  );
}

export function mergeProgress(local, server, localUpdatedAt = 0) {
  if (!server) return local;
  if (!hasProgress(local)) return server;
  const localNewer = localUpdatedAt >= (server.updatedAt || 0);
  const newer = localNewer ? local : server;
  return {
    ...server,
    ...newer,
    words: mergeWords(local.words, server.words),
    favorites: localNewer ? { ...server.favorites, ...local.favorites } : { ...local.favorites, ...server.favorites },
    studied: { ...server.studied, ...local.studied },
    stats: mergeStats(local.stats, server.stats, localNewer),
    xp: Math.max(local.xp || 0, server.xp || 0),
    badges: mergeBadges(local.badges, server.badges),
    grammar: mergeDone(local.grammar, server.grammar, "done"),
    stories: mergeDone(local.stories, server.stories, "read"),
    shareMilestones: { ...server.shareMilestones, ...local.shareMilestones },
    settings: { ...(localNewer ? server.settings : local.settings), ...newer.settings },
    lessonDecks: { ...server.lessonDecks, ...local.lessonDecks },
    studySessions: mergeSessions(local.studySessions, server.studySessions),
    xpSeeded: Boolean(local.xpSeeded || server.xpSeeded),
    updatedAt: Math.max(localUpdatedAt, server.updatedAt || 0),
  };
}

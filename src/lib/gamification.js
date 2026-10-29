// XP, levels and badges. Everything here works on the progress state inside a
// reducer, so rewards are given in the same place the answer is recorded.
import { dailyKey } from "./dayKey.js";

export const XP = {
  correct: 10,
  wrong: 2,
  dictation: 15,
  session: 20,
  goal: 25,
  topik: 100,
  grammar: 40,
  story: 30,
  speakingMinute: 5,
};

export const MAX_LEVEL = 30;

// Level n → n+1 costs 100 XP more than the step before: 100, 150, 200, ...
export function xpForLevel(level) {
  const steps = Math.max(0, Math.min(level, MAX_LEVEL) - 1);
  return steps * 100 + 25 * steps * (steps - 1);
}

export function levelForXp(xp) {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level += 1;
  return level;
}

export function levelProgress(xp = 0) {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) return { level, current: 0, needed: 0, percent: 100 };
  const start = xpForLevel(level);
  const needed = xpForLevel(level + 1) - start;
  const current = xp - start;
  return { level, current, needed, percent: Math.round((current / needed) * 100) };
}

// Titles every few levels, shown in Korean with a translation.
export const LEVEL_TITLES = [
  { from: 1, id: "sprout", ko: "새싹", icon: "🌱" },
  { from: 5, id: "student", ko: "학생", icon: "📘" },
  { from: 10, id: "senior", ko: "선배", icon: "🎒" },
  { from: 15, id: "expert", ko: "전문가", icon: "🎓" },
  { from: 20, id: "adept", ko: "달인", icon: "🥋" },
  { from: 25, id: "guru", ko: "고수", icon: "🐉" },
  { from: 30, id: "master", ko: "마스터", icon: "👑" },
];

export function levelTitle(level) {
  return [...LEVEL_TITLES].reverse().find((title) => level >= title.from);
}

const learnedWords = (state) => Object.values(state.words || {}).filter((record) => (record.knownCount || 0) >= 3).length;
const favoritesCount = (state) => Object.values(state.favorites || {}).filter(Boolean).length;
const level = (state) => levelForXp(state.xp || 0);
const grammarDone = (state) => Object.values(state.grammar || {}).filter((item) => item?.done).length;
const storiesRead = (state) => Object.values(state.stories || {}).filter((item) => item?.read).length;

// Each badge: id (translation key badge.<id>), icon and when it is earned.
export const BADGES = [
  { id: "firstAnswer", icon: "👣", check: (s) => s.stats.correct >= 1 },
  { id: "words10", icon: "🔟", check: (s) => learnedWords(s) >= 10 },
  { id: "words50", icon: "📗", check: (s) => learnedWords(s) >= 50 },
  { id: "words100", icon: "💯", check: (s) => learnedWords(s) >= 100 },
  { id: "words300", icon: "📚", check: (s) => learnedWords(s) >= 300 },
  { id: "words500", icon: "🏛️", check: (s) => learnedWords(s) >= 500 },
  { id: "wordsAll", icon: "🌟", check: (s) => learnedWords(s) >= 800 },
  { id: "streak3", icon: "🔥", check: (s) => s.stats.streak >= 3 },
  { id: "streak7", icon: "🗓️", check: (s) => s.stats.streak >= 7 },
  { id: "streak30", icon: "🌙", check: (s) => s.stats.streak >= 30 },
  { id: "streak100", icon: "☄️", check: (s) => s.stats.streak >= 100 },
  { id: "answers100", icon: "✅", check: (s) => s.stats.correct >= 100 },
  { id: "answers1000", icon: "🎯", check: (s) => s.stats.correct >= 1000 },
  { id: "answers5000", icon: "🏹", check: (s) => s.stats.correct >= 5000 },
  { id: "goalFirst", icon: "🥅", check: (s) => (s.stats.goalDays || 0) >= 1 },
  { id: "goal7", icon: "🏅", check: (s) => (s.stats.goalDays || 0) >= 7 },
  { id: "dictation50", icon: "✍️", check: (s) => (s.stats.typeCorrect?.dictation || 0) >= 50 },
  { id: "topikFirst", icon: "📝", check: (s) => (s.stats.topikAttempts || 0) >= 1 },
  { id: "topik140", icon: "🎖️", check: (s) => (s.stats.topikBest || 0) >= 140 },
  { id: "topik180", icon: "🏆", check: (s) => (s.stats.topikBest || 0) >= 180 },
  { id: "speakFirst", icon: "🎙️", check: (s) => (s.stats.speakingSessions || 0) >= 1 },
  { id: "speak60", icon: "🗣️", check: (s) => (s.stats.speakingSeconds || 0) >= 3600 },
  { id: "speak10", icon: "💬", check: (s) => (s.stats.speakingSessions || 0) >= 10 },
  { id: "grammarFirst", icon: "📐", check: (s) => grammarDone(s) >= 1 },
  { id: "grammar10", icon: "📏", check: (s) => grammarDone(s) >= 10 },
  { id: "grammarHalf", icon: "🧩", check: (s) => grammarDone(s) >= 28 },
  { id: "grammarAll", icon: "🏛️", check: (s) => grammarDone(s) >= 56 },
  { id: "storyFirst", icon: "📖", check: (s) => storiesRead(s) >= 1 },
  { id: "stories10", icon: "📚", check: (s) => storiesRead(s) >= 10 },
  { id: "storiesAll", icon: "🏯", check: (s) => storiesRead(s) >= 56 },
  { id: "favorites20", icon: "⭐", check: (s) => favoritesCount(s) >= 20 },
  { id: "nightOwl", icon: "🦉", check: (s) => Boolean(s.stats.nightOwl) },
  { id: "earlyBird", icon: "🐦", check: (s) => Boolean(s.stats.earlyBird) },
  { id: "level5", icon: "5️⃣", check: (s) => level(s) >= 5 },
  { id: "level10", icon: "🔷", check: (s) => level(s) >= 10 },
  { id: "level20", icon: "💎", check: (s) => level(s) >= 20 },
  { id: "level30", icon: "👑", check: (s) => level(s) >= 30 },
];

// Short-lived UI events (XP toasts, level-up, new badges). Not synced.
function fx(state) {
  if (!state.fx) state.fx = { gain: 0, at: 0, levelUp: null, badges: [] };
  return state.fx;
}

export function grantXp(state, amount) {
  if (!amount) return;
  const before = levelForXp(state.xp || 0);
  state.xp = (state.xp || 0) + amount;
  const today = dailyKey();
  state.xpToday = state.xpToday?.day === today ? { day: today, amount: state.xpToday.amount + amount } : { day: today, amount };
  const after = levelForXp(state.xp);
  const events = fx(state);
  events.gain = (Date.now() - events.at < 1500 ? events.gain : 0) + amount;
  events.at = Date.now();
  if (after > before) events.levelUp = after;
}

export function refreshBadges(state) {
  state.badges = state.badges || {};
  for (const badge of BADGES) {
    if (!state.badges[badge.id] && badge.check(state)) {
      state.badges[badge.id] = Date.now();
      fx(state).badges.push(badge.id);
    }
  }
}

// Learners who studied before XP existed get XP for their past answers and
// the badges they already deserve, quietly, the first time this runs.
export function seedGamification(state) {
  if (state.xpSeeded) return state;
  const stats = state.stats || {};
  state.xp = Math.max(state.xp || 0, (stats.correct || 0) * XP.correct + (stats.wrong || 0) * XP.wrong);
  state.xpSeeded = true;
  refreshBadges(state);
  delete state.fx;
  return state;
}

// Time-of-day badges.
export function noteAnswerTime(stats, now = new Date()) {
  const hour = now.getHours();
  if (hour >= 0 && hour < 4) stats.nightOwl = true;
  if (hour >= 5 && hour < 7) stats.earlyBird = true;
}

export const FREEZES_PER_MONTH = 2;

// Premium keeps a streak alive over one missed day, twice a month.
export function canFreeze(state, now = new Date()) {
  const premium = state.premiumUntil && new Date(state.premiumUntil).getTime() > now.getTime();
  if (!premium) return false;
  const month = dailyKey(now).slice(0, 7);
  const used = state.streakFreezes?.month === month ? state.streakFreezes.used : 0;
  return used < FREEZES_PER_MONTH;
}

export function spendFreeze(state, now = new Date()) {
  const month = dailyKey(now).slice(0, 7);
  const used = state.streakFreezes?.month === month ? state.streakFreezes.used : 0;
  state.streakFreezes = { month, used: used + 1 };
}

import { configureStore, createSelector, createSlice } from "@reduxjs/toolkit";
import { allWords, getWordKey, lessonInfo } from "./data";
import { getCurrentSyncUserId, saveServerProgress } from "./lib/progressSync";
import { migrateProgress, WORD_KEYS_VERSION } from "./lib/progressMigrate";
import { dailyKey } from "./lib/study";
import { getSRSRecord } from "./lib/srs";
import { RATING, STATE, ankiSettings, unpackCard } from "./lib/fsrs";
import { buildPool, dueCardCount, remainingCounts } from "./lib/anki";
import { enabledDeckWords } from "./lib/decks";
import { getWordMastery, getMasteryOverview } from "./lib/mastery";
import {
  STUDY_SESSION_REWARDS_PER_DAY,
  XP,
  canFreeze,
  capFlashcardXp,
  claimAnswerReward,
  claimBonus,
  grantXp,
  noteAnswerTime,
  refreshBadges,
  seedGamification,
  spendFreeze,
} from "./lib/gamification";

const STORAGE_KEY = "ktalim-progress-v2";
// Read once when there is no v2 copy yet; its word keys are migrated.
const OLD_STORAGE_KEY = "ktalim-1a-progress-v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(OLD_STORAGE_KEY);
    return raw ? migrateProgress(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

const defaultState = {
  theme: "dark",
  favorites: {},
  words: {},
  lessonDecks: {},
  studied: {},
  stats: {
    studiedWords: 0,
    correct: 0,
    wrong: 0,
    studyMinutes: 0,
    streak: 0,
    lastStudyDate: "",
    activity: [],
  },
  settings: {
    speechRate: 0.82,
    autoSpeak: true,
    dailyGoal: 20,
  },
  lastPlace: null,
  shareMilestones: {},
  xp: 0,
  badges: {},
  grammar: {},
  stories: {},
  // Anki-style cards (src/lib/fsrs.js packCard) and per-day review counts.
  cards: {},
  ankiDays: {},
  // Word keys are "<deck>-<id>" (see src/lib/progressMigrate.js).
  wordKeys: WORD_KEYS_VERSION,
};

const ANKI_HISTORY_DAYS = 120;

function blankWordRecord() {
  return { knownCount: 0, wrongCount: 0, difficulty: 0, reviewed: 0, recentAnswers: [] };
}

const DAILY_HISTORY_DAYS = 60;
export const DAILY_GOALS = [10, 20, 40, 60];

// Counts one answer towards today's goal and keeps the last 60 days.
// Reaching the goal gives a one-off bonus for the day.
function countAnswer(state, amount = 1) {
  const { stats } = state;
  const today = dailyKey();
  const daily = { ...(stats.daily || {}) };
  const before = daily[today] || 0;
  daily[today] = before + amount;
  const keep = Object.keys(daily).sort().slice(-DAILY_HISTORY_DAYS);
  stats.daily = Object.fromEntries(keep.map((day) => [day, daily[day]]));
  const goal = state.settings.dailyGoal || 20;
  if (before < goal && daily[today] >= goal) {
    stats.goalDays = (stats.goalDays || 0) + 1;
    grantXp(state, XP.goal);
  }
}

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dailyKey(date);
};

// `amount` is how many answers an activity counts as towards the daily goal.
function updateStreak(state, amount = 1) {
  const { stats } = state;
  countAnswer(state, amount);
  const today = dailyKey();
  if (stats.lastStudyDate === today) return;
  if (stats.lastStudyDate === daysAgo(1)) {
    stats.streak += 1;
  } else if (stats.streak > 0 && stats.lastStudyDate === daysAgo(2) && canFreeze(state)) {
    // One missed day is forgiven with a premium streak freeze.
    spendFreeze(state);
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  stats.lastStudyDate = today;
}

// Everything an answer earns: streak, daily count, XP and badges.
function recordAnswer(state, correct, exerciseType, xp = correct ? (exerciseType === "dictation" ? XP.dictation : XP.correct) : XP.wrong) {
  updateStreak(state);
  noteAnswerTime(state.stats);
  if (correct && exerciseType) {
    state.stats.typeCorrect = { ...(state.stats.typeCorrect || {}) };
    state.stats.typeCorrect[exerciseType] = (state.stats.typeCorrect[exerciseType] || 0) + 1;
  }
  grantXp(state, xp);
  refreshBadges(state);
}

// UI events are not saved: a reload must not replay a level-up.
function withoutFx(progress) {
  const rest = { ...progress };
  delete rest.fx;
  return rest;
}

const savedState = loadState();
const initialState = seedGamification(
  savedState
    ? { ...defaultState, ...withoutFx(savedState), studied: savedState.studied || {} }
    : { ...defaultState, xpSeeded: true },
);

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleFavorite(state, action) {
      const key = action.payload;
      state.favorites[key] = !state.favorites[key];
    },
    setLessonDeck(state, action) {
      const { lesson, mode, queue, cursor } = action.payload;
      state.lessonDecks[`${lesson}-${mode}`] = { queue, cursor };
    },
    advanceDeck(state, action) {
      const { lesson, mode, cursor } = action.payload;
      const key = `${lesson}-${mode}`;
      state.lessonDecks[key] = { ...(state.lessonDecks[key] || {}), cursor };
    },
    markKnown(state, action) {
      const payload =
        typeof action.payload === "string"
          ? { key: action.payload }
          : action.payload;
      const { key, exerciseType } = payload;
      const record = state.words[key] || {
        knownCount: 0,
        wrongCount: 0,
        difficulty: 0,
        reviewed: 0,
        recentAnswers: [],
      };
      const earns = claimAnswerReward(state, key, exerciseType);
      if (earns) record.knownCount += 1;
      record.difficulty = Math.max(0, record.difficulty - 1);
      record.reviewed = Date.now();
      if (exerciseType) {
        record.recentAnswers = [
          ...(record.recentAnswers || []).slice(-4),
          { correct: true, exerciseType, timestamp: Date.now() },
        ];
      }
      state.words[key] = record;
      if (!earns) return;
      state.stats.correct += 1;
      state.stats.studiedWords += 1;
      recordAnswer(state, true, exerciseType);
    },
    markDifficult(state, action) {
      const payload =
        typeof action.payload === "string"
          ? { key: action.payload }
          : action.payload;
      const { key, exerciseType } = payload;
      const record = state.words[key] || {
        knownCount: 0,
        wrongCount: 0,
        difficulty: 0,
        reviewed: 0,
        recentAnswers: [],
      };
      const earns = claimAnswerReward(state, key, exerciseType);
      if (earns) record.wrongCount += 1;
      record.difficulty += 2;
      record.reviewed = Date.now();
      if (exerciseType) {
        record.recentAnswers = [
          ...(record.recentAnswers || []).slice(-4),
          { correct: false, exerciseType, timestamp: Date.now() },
        ];
      }
      state.words[key] = record;
      if (!earns) return;
      state.stats.wrong += 1;
      state.stats.studiedWords += 1;
      recordAnswer(state, false, exerciseType);
    },
    addStudyMinutes(state, action) {
      state.stats.studyMinutes += action.payload;
    },
    setSpeechRate(state, action) {
      state.settings.speechRate = Math.min(1.5, Math.max(0.5, action.payload));
    },
    setDailyGoal(state, action) {
      state.settings.dailyGoal = action.payload;
    },
    // Where the learner was, for "Continue where you left off".
    setLastPlace(state, action) {
      state.lastPlace = action.payload;
    },
    setAutoSpeak(state, action) {
      state.settings.autoSpeak = action.payload;
    },
    setHideFromLeaderboard(state, action) {
      state.settings.hideFromLeaderboard = action.payload;
    },
    // Small choices kept with the account: interface language, exam theme, ...
    setPreference(state, action) {
      const { key, value } = action.payload;
      state.settings[key] = value;
    },
    // The unfinished Study session of a lesson, so it continues on any device.
    // Only the three most recent are kept.
    saveStudySession(state, action) {
      const { lesson, session } = action.payload;
      const sessions = { ...(state.studySessions || {}), [lesson]: { ...session, savedAt: Date.now() } };
      const keep = Object.entries(sessions).sort((a, b) => (b[1].savedAt || 0) - (a[1].savedAt || 0)).slice(0, 3);
      state.studySessions = Object.fromEntries(keep);
    },
    markWordStudied(state, action) {
      state.studied[action.payload] = true;
    },
    // Suspended words leave every Anki session until the learner brings them back.
    toggleSuspended(state, action) {
      state.suspended = state.suspended || {};
      if (state.suspended[action.payload]) delete state.suspended[action.payload];
      else state.suspended[action.payload] = true;
    },
    clearSuspended(state) {
      state.suspended = {};
    },
    toggleManualDifficult(state, action) {
      const key = action.payload;
      const record = state.words[key] || {
        knownCount: 0,
        wrongCount: 0,
        difficulty: 0,
        reviewed: 0,
        manualDifficult: false,
      };
      record.manualDifficult = !record.manualDifficult;
      state.words[key] = record;
    },
    // "Remove from Difficult": clears both the automatic and the manual mark.
    clearDifficult(state, action) {
      const record = state.words[action.payload];
      if (!record) return;
      record.difficulty = 0;
      record.manualDifficult = false;
    },
    // One answer in the Anki-style reviewer. The component schedules the card
    // (src/lib/fsrs.js schedule) and passes it packed, with the Anki day.
    answerCard(state, action) {
      const { id, wordKey, rating, packed, day, quick, ms = 0, leechThreshold = 8 } = action.payload;
      state.cards = state.cards || {};
      state.ankiDays = state.ankiDays || {};
      // The card's state before the answer; the component also knows cards
      // that still live only in the old SM-2 fields.
      const prevState = action.payload.prevState ?? (state.cards[id] ? unpackCard(state.cards[id]).state : STATE.new);
      const kind = prevState === STATE.new ? "new" : prevState === STATE.review ? "review" : "learn";
      state.cards[id] = packed;
      const counts = { ...(state.ankiDays[day] || {}) };
      counts[kind] = (counts[kind] || 0) + 1;
      if (rating === RATING.again) counts.again = (counts.again || 0) + 1;
      counts.ms = (counts.ms || 0) + Math.min(ms, 60000);
      state.ankiDays[day] = counts;
      const days = Object.keys(state.ankiDays).sort();
      if (days.length > ANKI_HISTORY_DAYS) days.slice(0, days.length - ANKI_HISTORY_DAYS).forEach((old) => delete state.ankiDays[old]);

      // The word's practice record moves too, so lesson progress and mastery follow.
      const record = state.words[wordKey] || blankWordRecord();
      const recalled = rating !== RATING.again;
      const earns = !quick && claimAnswerReward(state, wordKey, "flashcard");
      if (recalled) {
        if (earns) record.knownCount = (record.knownCount || 0) + 1;
        record.difficulty = Math.max(0, (record.difficulty || 0) - 1);
      } else {
        if (earns) record.wrongCount = (record.wrongCount || 0) + 1;
        record.difficulty = (record.difficulty || 0) + 2;
      }
      // Anki's leech: a card forgotten again and again is flagged as difficult.
      if (!recalled && (unpackCard(packed)?.lapses || 0) >= leechThreshold) record.manualDifficult = true;
      record.reviewed = Date.now();
      record.recentAnswers = [...(record.recentAnswers || []).slice(-4), { correct: recalled, exerciseType: "flashcard", timestamp: Date.now() }];
      state.words[wordKey] = record;
      if (!earns) return;
      if (recalled) state.stats.correct += 1;
      else state.stats.wrong += 1;
      state.stats.studiedWords += 1;
      recordAnswer(state, recalled, "flashcard", capFlashcardXp(state, recalled ? XP.flashcard : XP.wrong));
    },
    // Undo: puts a card and the day's counts back as they were.
    restoreCard(state, action) {
      const { id, packed, day, counts } = action.payload;
      state.cards = state.cards || {};
      state.ankiDays = state.ankiDays || {};
      if (packed) state.cards[id] = packed;
      else delete state.cards[id];
      if (counts) state.ankiDays[day] = counts;
      else delete state.ankiDays[day];
    },
    // A word learned in a lesson's Study session joins the reviews as a
    // learned card: its exercises were the learning steps.
    introduceCard(state, action) {
      const { id, packed, day } = action.payload;
      state.cards = state.cards || {};
      state.ankiDays = state.ankiDays || {};
      const existing = state.cards[id] ? unpackCard(state.cards[id]) : null;
      if (existing && existing.state !== STATE.new) return;
      state.cards[id] = packed;
      const counts = { ...(state.ankiDays[day] || {}) };
      counts.new = (counts.new || 0) + 1;
      state.ankiDays[day] = counts;
    },
    // One answer in TOPIK question-type practice. The last result of each
    // question is kept (questions are "<exam>-<number>"), and a correct answer
    // earns a little XP once a day per question.
    recordTopikPractice(state, action) {
      const { qid, correct } = action.payload;
      state.topikPractice = { ...(state.topikPractice || {}) };
      state.topikPractice[qid] = correct ? 1 : 0;
      updateStreak(state);
      if (correct && claimBonus(state, `tq:${qid}`)) grantXp(state, XP.correct);
      refreshBadges(state);
    },
    // Anki's "increase today's new card limit".
    extendNewToday(state, action) {
      const { day, amount } = action.payload;
      state.ankiDays = state.ankiDays || {};
      const counts = { ...(state.ankiDays[day] || {}) };
      counts.newExtra = (counts.newExtra || 0) + amount;
      state.ankiDays[day] = counts;
    },
    setAnkiSettings(state, action) {
      state.settings.anki = { ...(state.settings.anki || {}), ...action.payload };
    },
    addActivity(state, action) {
      state.stats.activity = [action.payload, ...state.stats.activity].slice(
        0,
        12,
      );
    },
    resetProgress(state) {
      return {
        ...defaultState,
        stats: { ...defaultState.stats },
        settings: { ...defaultState.settings },
        theme: state.theme,
      };
    },
    // XP for things other than single answers (finished study session, ...).
    awardXp(state, action) {
      grantXp(state, action.payload);
      refreshBadges(state);
    },
    recordStudySession(state) {
      state.stats.sessionsDone = (state.stats.sessionsDone || 0) + 1;
      if (claimBonus(state, "studySession", STUDY_SESSION_REWARDS_PER_DAY)) grantXp(state, XP.session);
      refreshBadges(state);
    },
    // Rewarded once a day per paper and mode, and only when at least half
    // the questions were answered, so submitting an empty paper earns nothing.
    recordTopik(state, action) {
      const { variantId = "", answered = 0, total = 0 } = action.payload || {};
      const score = Number(action.payload?.score) || 0;
      state.stats.topikAttempts = (state.stats.topikAttempts || 0) + 1;
      state.stats.topikBest = Math.max(state.stats.topikBest || 0, score);
      const serious = total > 0 && answered * 2 >= total;
      if (serious) {
        updateStreak(state, 10);
        if (claimBonus(state, `topik:${variantId}`)) grantXp(state, XP.topik + Math.round(score / 2));
      }
      refreshBadges(state);
    },
    recordSpeaking(state, action) {
      const seconds = Math.max(0, Number(action.payload?.seconds) || 0);
      state.stats.speakingSeconds = (state.stats.speakingSeconds || 0) + seconds;
      state.stats.speakingSessions = (state.stats.speakingSessions || 0) + 1;
      updateStreak(state, Math.max(1, Math.round(seconds / 60)));
      grantXp(state, Math.max(1, Math.round(seconds / 60)) * XP.speakingMinute);
      refreshBadges(state);
    },
    // A grammar point's practice passed. Full XP the first time, a little after.
    completeGrammar(state, action) {
      const { id, score } = action.payload;
      state.grammar = state.grammar || {};
      const before = state.grammar[id];
      state.grammar[id] = { done: true, best: Math.max(before?.best || 0, score), at: Date.now() };
      // Repeats pay a little, once a day per grammar point.
      if (!before?.done || claimBonus(state, `grammar:${id}`)) {
        updateStreak(state, 5);
        grantXp(state, before?.done ? 5 : XP.grammar);
      }
      refreshBadges(state);
    },
    // A story read to the end with its questions answered.
    completeStory(state, action) {
      const { id, score } = action.payload;
      state.stories = state.stories || {};
      const before = state.stories[id];
      const passed = score >= 50;
      state.stories[id] = { read: Boolean(before?.read || passed), best: Math.max(before?.best || 0, score), at: Date.now() };
      const firstPass = passed && !before?.read;
      // Repeats and failed tries pay a little, once a day per story.
      if (firstPass || claimBonus(state, `story:${id}`)) {
        updateStreak(state, 5);
        grantXp(state, firstPass ? XP.story : 5);
      }
      refreshBadges(state);
    },
    clearFx(state) {
      delete state.fx;
    },
    // Mirrors app_metadata.premium_until so reducers can apply premium perks.
    setPremiumUntil(state, action) {
      state.premiumUntil = action.payload || null;
    },
    markShareMilestoneShown(state, action) {
      const milestone = action.payload;
      state.shareMilestones[milestone] = true;
    },
    hydrateProgress(state, action) {
      const serverData = migrateProgress(action.payload);
      // Merge settings: preserve local settings if server doesn't have them
      const mergedSettings = {
        ...state.settings,
        ...(serverData.settings || {}),
      };
      return seedGamification({
        ...defaultState,
        ...withoutFx(serverData),
        lessonDecks: serverData.lessonDecks || state.lessonDecks || {},
        stats: { ...defaultState.stats, ...(serverData.stats || {}) },
        settings: mergedSettings,
        premiumUntil: state.premiumUntil,
      });
    },
  },
});

export const {
  setTheme,
  toggleFavorite,
  setLessonDeck,
  advanceDeck,
  markKnown,
  markDifficult,
  addStudyMinutes,
  addActivity,
  resetProgress,
  markWordStudied,
  toggleManualDifficult,
  toggleSuspended,
  clearSuspended,
  clearDifficult,
  answerCard,
  restoreCard,
  introduceCard,
  setAnkiSettings,
  extendNewToday,
  recordTopikPractice,
  markShareMilestoneShown,
  hydrateProgress,
  setSpeechRate,
  setAutoSpeak,
  setDailyGoal,
  setLastPlace,
  setHideFromLeaderboard,
  setPreference,
  saveStudySession,
  awardXp,
  recordStudySession,
  recordTopik,
  recordSpeaking,
  clearFx,
  setPremiumUntil,
  completeGrammar,
  completeStory,
} = progressSlice.actions;

// Content that loads after start (the TOPIK vocabulary decks); selectors that
// read it recompute when the counter moves.
const contentSlice = createSlice({
  name: "content",
  initialState: { vocab: 0 },
  reducers: {
    vocabLoaded(state) {
      state.vocab += 1;
    },
  },
});

export const { vocabLoaded } = contentSlice.actions;

export const store = configureStore({
  reducer: {
    progress: progressSlice.reducer,
    content: contentSlice.reducer,
  },
});

// Who the progress on this device belongs to (null = a guest) and when it
// last changed, so signing in merges it with the server copy correctly.
export const PROGRESS_OWNER_KEY = "ktalim-progress-owner";
export const PROGRESS_UPDATED_KEY = "ktalim-progress-updated-at";

let saveTimer = null;
let localTimer = null;
let lastProgress = store.getState().progress;
let changedAt = Number(localStorage.getItem(PROGRESS_UPDATED_KEY)) || 0;

export const progressUpdatedAt = () => changedAt;

// The device keeps a cache of the signed-in account's progress (the account
// is the real copy). A guest's learning is never stored: only the theme is.
function writeLocal() {
  localTimer = null;
  try {
    const progress = withoutFx(store.getState().progress);
    if (!getCurrentSyncUserId() && !localStorage.getItem(PROGRESS_OWNER_KEY)) {
      const saved = loadState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved ? { ...saved, theme: progress.theme } : { theme: progress.theme }));
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    localStorage.removeItem(OLD_STORAGE_KEY);
    localStorage.setItem(PROGRESS_UPDATED_KEY, String(changedAt));
  } catch {
    // Storage full or blocked: the server copy still saves.
  }
}

// What goes to the server: everything but UI events.
function serverCopy(progress) {
  const data = withoutFx(progress);
  data.updatedAt = changedAt || Date.now();
  return data;
}

export async function saveProgressNow() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  const userId = getCurrentSyncUserId();
  if (!userId) return;
  const { error } = await saveServerProgress(userId, serverCopy(store.getState().progress));
  if (!error) {
    try {
      localStorage.setItem(PROGRESS_OWNER_KEY, userId);
    } catch {
      // Ignore storage errors.
    }
  }
}

store.subscribe(() => {
  const progress = store.getState().progress;
  if (progress === lastProgress) return;
  const onlyFx = withoutFx(progress).xp === lastProgress.xp && progress.words === lastProgress.words && progress.stats === lastProgress.stats && progress.fx !== lastProgress.fx;
  lastProgress = progress;
  if (onlyFx) return;
  changedAt = Date.now();
  if (!localTimer) localTimer = setTimeout(writeLocal, 1000);
  if (!getCurrentSyncUserId()) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProgressNow, 3000);
});

function flushProgress() {
  if (localTimer) {
    clearTimeout(localTimer);
    writeLocal();
  }
  if (saveTimer) saveProgressNow();
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushProgress);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushProgress();
  });
}

const selectWords = (state) => state.progress.words;
const selectStats = (state) => state.progress.stats;

export const selectFavoriteWords = createSelector([(state) => state.progress.favorites], (favorites) =>
  allWords.filter((word) => favorites[getWordKey(word)]),
);

export const selectDifficultWords = createSelector([selectWords], (words) =>
  allWords.filter((word) => {
    const record = words[getWordKey(word)];
    return (record?.difficulty || 0) > 0 || record?.manualDifficult;
  }),
);

export function selectStudyProgress(state, lesson) {
  return selectLessonProgress(state, lesson);
}

export const selectAnkiOptions = createSelector([(state) => state.progress.settings], (settings) => ankiSettings(settings));

// Today's Anki counts over the decks turned on in the settings:
// { new, learning, review } still to do today. Recomputed when the TOPIK
// vocabulary finishes loading (content.vocab).
export const selectAnkiDue = createSelector(
  [(state) => state.progress, selectAnkiOptions, (state) => state.content.vocab],
  (progress, options) => {
    const words = enabledDeckWords(options);
    return remainingCounts(buildPool(progress, words, options), progress, options);
  },
);

// Cards waiting for review today in any lesson or unit, as shown on badges.
export const selectReviewCount = createSelector([(state) => state.progress, selectAnkiOptions], (progress, options) => dueCardCount(progress, options));

// The streak as it stands today: it lapses after a missed day (two with a freeze).
export function selectCurrentStreak(state) {
  const { streak, lastStudyDate } = state.progress.stats;
  if (!streak || !lastStudyDate) return 0;
  const today = dailyKey();
  if (lastStudyDate === today || lastStudyDate === daysAgo(1)) return streak;
  if (lastStudyDate === daysAgo(2) && canFreeze(state.progress)) return streak;
  return 0;
}

export const selectWeakWords = createSelector([selectWords], (wordsState) => {
  const records = Object.entries(wordsState);
  const practiced = records.filter(
    ([, record]) =>
      (record.knownCount || 0) > 0 || (record.wrongCount || 0) > 0,
  );
  if (!practiced.length) return [];

  const scored = practiced.map(([key, record]) => {
    const mastery = getWordMastery(key, wordsState);
    const srs = getSRSRecord(record);

    let weakness = 0;
    weakness += (100 - mastery.score) * 2;
    weakness += (record.wrongCount || 0) * 5;
    weakness -= (record.knownCount || 0) * 1;

    const recentAnswers = record.recentAnswers || [];
    const recentWrong = recentAnswers.filter((a) => !a.correct).length;
    weakness += recentWrong * 4;

    weakness += Math.max(0, 5 - (record.repetitions || 0)) * 3;
    weakness += Math.max(0, 2.5 - (srs.easinessFactor || 2.5)) * 5;

    if (mastery.recentAccuracy < 50) weakness += 30;
    else if (mastery.recentAccuracy < 70) weakness += 15;

    weakness += mastery.recentWrongStreak * 5;

    return { key, weakness };
  });

  scored.sort((a, b) => b.weakness - a.weakness);

  // Weakest first.
  const byKey = new Map(allWords.map((word) => [getWordKey(word), word]));
  return [...new Set(scored.slice(0, 10).map((item) => item.key))].map((key) => byKey.get(key)).filter(Boolean);
});

// Centralized progress selectors - single source of truth for all progress calculations
export const selectProgressSummary = createSelector([selectWords, selectStats, selectCurrentStreak], (words, stats, streak) => {
  const studiedWords = Object.values(words).filter(
    (w) => (w.knownCount || 0) > 0 || (w.wrongCount || 0) > 0
  ).length;
  
  const totalReviews = stats.correct + stats.wrong;
  const accuracy = totalReviews > 0 
    ? Math.round((stats.correct / totalReviews) * 100) 
    : 0;
    
  const masteryOverview = getMasteryOverview(words);
  
  return {
    studiedWords,           // Unique words with any practice
    totalReviews: stats.studiedWords,  // Total review attempts (legacy)
    correctReviews: stats.correct,
    wrongReviews: stats.wrong,
    accuracy,
    streak,
    studyMinutes: stats.studyMinutes,
    lastStudyDate: stats.lastStudyDate,
    ...masteryOverview,     // mastered, practiced, learning, new, overallPercent
  };
});

export function selectLessonProgress(state, lesson) {
  const words = lessonInfo.find((item) => item.lesson === lesson)?.words || [];
  if (!words.length) return 0;
  
  const records = state.progress.words;
  const learned = words.filter(
    (word) => (records[getWordKey(word)]?.knownCount || 0) > 0,
  ).length;
  return Math.round((learned / words.length) * 100);
}

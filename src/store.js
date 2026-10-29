import { configureStore, createSlice } from "@reduxjs/toolkit";
import { allWords, getWordKey, lessonInfo } from "./data";
import { getCurrentSyncUserId, saveServerProgress } from "./lib/progressSync";
import { dailyKey } from "./lib/study";
import {
  calculateNextReview,
  getDueWords,
  getReviewCount,
  getSRSRecord,
  SRS_RATINGS,
} from "./lib/srs";
import { getWordMastery, getMasteryOverview } from "./lib/mastery";
import { XP, canFreeze, grantXp, noteAnswerTime, refreshBadges, seedGamification, spendFreeze } from "./lib/gamification";

const STORAGE_KEY = "ktalim-1a-progress-v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
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
};

const DAILY_HISTORY_DAYS = 60;
export const DAILY_GOALS = [10, 20, 40, 60];

// Counts one answer towards today's goal and keeps the last 60 days.
// Reaching the goal gives a one-off bonus for the day.
function countAnswer(state) {
  const { stats } = state;
  const today = dailyKey();
  const daily = { ...(stats.daily || {}) };
  daily[today] = (daily[today] || 0) + 1;
  const keep = Object.keys(daily).sort().slice(-DAILY_HISTORY_DAYS);
  stats.daily = Object.fromEntries(keep.map((day) => [day, daily[day]]));
  if (daily[today] === (state.settings.dailyGoal || 20)) {
    stats.goalDays = (stats.goalDays || 0) + 1;
    grantXp(state, XP.goal);
  }
}

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dailyKey(date);
};

function updateStreak(state) {
  const { stats } = state;
  countAnswer(state);
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
function recordAnswer(state, correct, exerciseType) {
  updateStreak(state);
  noteAnswerTime(state.stats);
  if (correct && exerciseType) {
    state.stats.typeCorrect = { ...(state.stats.typeCorrect || {}) };
    state.stats.typeCorrect[exerciseType] = (state.stats.typeCorrect[exerciseType] || 0) + 1;
  }
  grantXp(state, correct ? (exerciseType === "dictation" ? XP.dictation : XP.correct) : XP.wrong);
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
      record.knownCount += 1;
      record.difficulty = Math.max(0, record.difficulty - 1);
      record.reviewed = Date.now();
      if (!record.nextReviewAt) {
        const srs = getSRSRecord(record);
        const next = calculateNextReview(srs, SRS_RATINGS.GOOD);
        record.interval = next.interval;
        record.repetitions = next.repetitions;
        record.easinessFactor = next.easinessFactor;
        record.nextReviewAt = next.nextReviewAt;
        record.lastReviewedAt = next.lastReviewedAt;
      }
      if (exerciseType) {
        record.recentAnswers = [
          ...(record.recentAnswers || []).slice(-9),
          { correct: true, exerciseType, timestamp: Date.now() },
        ];
      }
      state.words[key] = record;
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
      record.wrongCount += 1;
      record.difficulty += 2;
      record.reviewed = Date.now();
      if (!record.nextReviewAt) {
        const srs = getSRSRecord(record);
        const next = calculateNextReview(srs, SRS_RATINGS.AGAIN);
        record.interval = next.interval;
        record.repetitions = next.repetitions;
        record.easinessFactor = next.easinessFactor;
        record.nextReviewAt = next.nextReviewAt;
        record.lastReviewedAt = next.lastReviewedAt;
      }
      if (exerciseType) {
        record.recentAnswers = [
          ...(record.recentAnswers || []).slice(-9),
          { correct: false, exerciseType, timestamp: Date.now() },
        ];
      }
      state.words[key] = record;
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
    markWordStudied(state, action) {
      state.studied[action.payload] = true;
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
    rateFlashcard(state, action) {
      const { key, rating } = action.payload;
      const record = state.words[key] || {
        knownCount: 0,
        wrongCount: 0,
        difficulty: 0,
        reviewed: 0,
        recentAnswers: [],
      };
      const srs = getSRSRecord(record);
      const next = calculateNextReview(srs, rating);
      record.interval = next.interval;
      record.repetitions = next.repetitions;
      record.easinessFactor = next.easinessFactor;
      record.nextReviewAt = next.nextReviewAt;
      record.lastReviewedAt = next.lastReviewedAt;
      // A flashcard rating is also an answer: "again" counts as a miss,
      // anything else as recalled, so lesson progress and mastery move.
      const recalled = rating !== SRS_RATINGS.AGAIN;
      if (recalled) {
        record.knownCount = (record.knownCount || 0) + 1;
        record.difficulty = Math.max(0, (record.difficulty || 0) - 1);
        state.stats.correct += 1;
      } else {
        record.wrongCount = (record.wrongCount || 0) + 1;
        record.difficulty = (record.difficulty || 0) + 2;
        state.stats.wrong += 1;
      }
      record.reviewed = Date.now();
      record.recentAnswers = [
        ...(record.recentAnswers || []).slice(-9),
        { correct: recalled, exerciseType: "flashcard", timestamp: Date.now() },
      ];
      state.words[key] = record;
      state.stats.studiedWords += 1;
      recordAnswer(state, recalled, "flashcard");
    },
    updateSRSFromExercise(state, action) {
      const { key, correct } = action.payload;
      const record = state.words[key] || {
        knownCount: 0,
        wrongCount: 0,
        difficulty: 0,
        reviewed: 0,
        recentAnswers: [],
      };
      const srs = getSRSRecord(record);
      const rating = correct ? SRS_RATINGS.GOOD : SRS_RATINGS.AGAIN;
      const next = calculateNextReview(srs, rating);
      record.interval = next.interval;
      record.repetitions = next.repetitions;
      record.easinessFactor = next.easinessFactor;
      record.nextReviewAt = next.nextReviewAt;
      record.lastReviewedAt = next.lastReviewedAt;
      state.words[key] = record;
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
      grantXp(state, XP.session);
      refreshBadges(state);
    },
    recordTopik(state, action) {
      const score = Number(action.payload?.score) || 0;
      state.stats.topikAttempts = (state.stats.topikAttempts || 0) + 1;
      state.stats.topikBest = Math.max(state.stats.topikBest || 0, score);
      grantXp(state, XP.topik + Math.round(score / 2));
      refreshBadges(state);
    },
    recordSpeaking(state, action) {
      const seconds = Math.max(0, Number(action.payload?.seconds) || 0);
      state.stats.speakingSeconds = (state.stats.speakingSeconds || 0) + seconds;
      state.stats.speakingSessions = (state.stats.speakingSessions || 0) + 1;
      grantXp(state, Math.max(1, Math.round(seconds / 60)) * XP.speakingMinute);
      refreshBadges(state);
    },
    // A grammar point's practice passed. Full XP the first time, a little after.
    completeGrammar(state, action) {
      const { id, score } = action.payload;
      state.grammar = state.grammar || {};
      const before = state.grammar[id];
      state.grammar[id] = { done: true, best: Math.max(before?.best || 0, score), at: Date.now() };
      grantXp(state, before?.done ? 5 : XP.grammar);
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
      const serverData = action.payload;
      // Merge settings: preserve local settings if server doesn't have them
      const mergedSettings = {
        ...state.settings,
        ...(serverData.settings || {}),
      };
      return seedGamification({
        ...withoutFx(serverData),
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
  rateFlashcard,
  updateSRSFromExercise,
  markShareMilestoneShown,
  hydrateProgress,
  setSpeechRate,
  setAutoSpeak,
  setDailyGoal,
  setLastPlace,
  setHideFromLeaderboard,
  awardXp,
  recordStudySession,
  recordTopik,
  recordSpeaking,
  clearFx,
  setPremiumUntil,
  completeGrammar,
} = progressSlice.actions;

export const store = configureStore({
  reducer: {
    progress: progressSlice.reducer,
  },
});

let saveTimer = null;

store.subscribe(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutFx(store.getState().progress)));

  const userId = getCurrentSyncUserId();
  if (!userId) return;

  if (saveTimer) clearTimeout(saveTimer);
  const capturedUserId = userId;
  saveTimer = setTimeout(async () => {
    const currentUserId = getCurrentSyncUserId();
    if (currentUserId !== capturedUserId) return;
    const progressData = withoutFx(store.getState().progress);
    await saveServerProgress(capturedUserId, progressData);
    saveTimer = null;
  }, 3000);
});

export function selectFavoriteWords(state) {
  return allWords.filter((word) => state.progress.favorites[getWordKey(word)]);
}

export function selectDifficultWords(state) {
  return allWords.filter((word) => {
    const record = state.progress.words[getWordKey(word)];
    return (record?.difficulty || 0) > 0 || record?.manualDifficult;
  });
}

export function selectStudyProgress(state, lesson) {
  return selectLessonProgress(state, lesson);
}

export function selectReviewCount(state) {
  return getReviewCount(state.progress.words);
}

export function selectDueWords(state) {
  return getDueWords(allWords, state.progress.words);
}

export function selectWeakWords(state) {
  const records = Object.entries(state.progress.words);
  const practiced = records.filter(
    ([, record]) =>
      (record.knownCount || 0) > 0 || (record.wrongCount || 0) > 0,
  );
  if (!practiced.length) return [];

  const scored = practiced.map(([key, record]) => {
    const mastery = getWordMastery(key, state.progress.words);
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

  const topKeys = [...new Set(scored.slice(0, 10).map((item) => item.key))];
  return allWords.filter((word) => topKeys.includes(getWordKey(word)));
}

// Centralized progress selectors - single source of truth for all progress calculations
export function selectProgressSummary(state) {
  const { words, stats } = state.progress;
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
    streak: stats.streak,
    studyMinutes: stats.studyMinutes,
    lastStudyDate: stats.lastStudyDate,
    ...masteryOverview,     // mastered, practiced, learning, new, overallPercent
  };
}

export function selectLessonProgress(state, lesson) {
  const words = lessonInfo.find((item) => item.lesson === lesson)?.words || [];
  if (!words.length) return 0;
  
  const records = state.progress.words;
  const learned = words.filter(
    (word) => (records[getWordKey(word)]?.knownCount || 0) > 0,
  ).length;
  return Math.round((learned / words.length) * 100);
}

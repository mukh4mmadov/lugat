import { configureStore, createSlice } from "@reduxjs/toolkit";
import { allWords, getWordKey, lessonInfo } from "./data";
import { dailyKey } from "./lib/study";

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
  },
};

function updateStreak(stats) {
  const today = dailyKey();
  if (stats.lastStudyDate === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  stats.streak = stats.lastStudyDate === dailyKey(yesterday) ? stats.streak + 1 : 1;
  stats.lastStudyDate = today;
}

const savedState = loadState();
// Merge with defaultState so older saved progress (from before the Study page existed)
// safely gains the new `studied` field instead of crashing on undefined access.
const initialState = savedState ? { ...defaultState, ...savedState, studied: savedState.studied || {} } : defaultState;

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
      const key = action.payload;
      const record = state.words[key] || { knownCount: 0, wrongCount: 0, difficulty: 0, reviewed: 0 };
      record.knownCount += 1;
      record.difficulty = Math.max(0, record.difficulty - 1);
      record.reviewed = Date.now();
      state.words[key] = record;
      state.stats.correct += 1;
      state.stats.studiedWords += 1;
      updateStreak(state.stats);
    },
    markDifficult(state, action) {
      const key = action.payload;
      const record = state.words[key] || { knownCount: 0, wrongCount: 0, difficulty: 0, reviewed: 0 };
      record.wrongCount += 1;
      record.difficulty += 2;
      record.reviewed = Date.now();
      state.words[key] = record;
      state.stats.wrong += 1;
      state.stats.studiedWords += 1;
      updateStreak(state.stats);
    },
    addStudyMinutes(state, action) {
      state.stats.studyMinutes += action.payload;
    },
    // Study page only: marks a word as seen during a memorization session.
    // Does not touch knownCount/wrongCount/difficulty so it never affects
    // Practice scoring or the Practice deck weighting.
    markWordStudied(state, action) {
      state.studied[action.payload] = true;
    },
    // Study page only: a manual bookmark toggle (on/off), independent from
    // the auto-tracked Practice "difficulty" counter used by Don't Know.
    toggleManualDifficult(state, action) {
      const key = action.payload;
      const record = state.words[key] || { knownCount: 0, wrongCount: 0, difficulty: 0, reviewed: 0, manualDifficult: false };
      record.manualDifficult = !record.manualDifficult;
      state.words[key] = record;
    },
    addActivity(state, action) {
      state.stats.activity = [action.payload, ...state.stats.activity].slice(0, 12);
    },
    resetProgress(state) {
      return {
        ...defaultState,
        stats: { ...defaultState.stats },
        settings: { ...defaultState.settings },
        theme: state.theme,
      };
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
} = progressSlice.actions;

export const store = configureStore({
  reducer: {
    progress: progressSlice.reducer,
  },
});

store.subscribe(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().progress));
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

export function selectLessonProgress(state, lesson) {
  const words = lessonInfo.find((item) => item.lesson === lesson)?.words || [];
  const learned = words.filter((word) => (state.progress.words[getWordKey(word)]?.knownCount || 0) > 0).length;
  return words.length ? Math.round((learned / words.length) * 100) : 0;
}

// Study page only: percentage of a lesson's words the user has viewed in Study Mode.
export function selectStudyProgress(state, lesson) {
  const words = lessonInfo.find((item) => item.lesson === lesson)?.words || [];
  const studied = words.filter((word) => state.progress.studied[getWordKey(word)]).length;
  return words.length ? Math.round((studied / words.length) * 100) : 0;
}

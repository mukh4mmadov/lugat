// TOPIK vocabulary decks (data/topik1/vocab-NN.json, built from NIKL's official
// learner vocabulary lists). They are large, so they load only when a page
// needs them. A word that is also a K-TALIM lesson word shares that word's
// card (lessonKey), so it is never learned twice.
import { allWords, getWordKey } from "./index";

const FILES = {
  topik1: import.meta.glob("../../data/topik1/vocab-*.json", { import: "default" }),
  topik2: import.meta.glob("../../data/topik2/vocab-*.json", { import: "default" }),
};

const loaded = {};
const loading = {};
const listeners = new Set();

export function topikDeckSize(level) {
  return loaded[level]?.length ?? null;
}

export function hasTopikDeck(level) {
  return Object.keys(FILES[level] || {}).length > 0;
}

// The deck's words: lesson words where linked, TOPIK entries otherwise.
export function topikDeckWords(level) {
  return loaded[level] || [];
}

// Every TOPIK entry, including ones linked to a lesson word (for word lists).
export function topikEntries(level) {
  return loaded[`${level}:entries`] || [];
}

export function onTopikVocab(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadTopikVocab(level = "topik1") {
  if (loaded[level]) return Promise.resolve(loaded[level]);
  if (loading[level]) return loading[level];
  const files = FILES[level] || {};
  const paths = Object.keys(files).sort();
  loading[level] = Promise.all(paths.map((path) => files[path]())).then((parts) => {
    const byLessonKey = new Map(allWords.map((word) => [getWordKey(word), word]));
    const entries = parts.flat().map((entry) => ({ ...entry, lesson: level === "topik1" ? "t1" : "t2", deck: level }));
    loaded[`${level}:entries`] = entries;
    const seen = new Set();
    loaded[level] = entries
      .map((entry) => (entry.lessonKey && byLessonKey.get(entry.lessonKey)) || entry)
      .filter((word) => {
        const key = getWordKey(word);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    listeners.forEach((listener) => listener(level));
    return loaded[level];
  });
  return loading[level];
}

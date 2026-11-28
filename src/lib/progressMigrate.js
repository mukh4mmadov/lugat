import { LEGACY_KEYS, legacyHash } from "../data/legacyKeys";
import { RECALL_SUFFIX } from "./anki";

export const WORD_KEYS_VERSION = 2;

const newKey = (key) => LEGACY_KEYS[legacyHash(key)] || key;

function newCardId(id) {
  const recall = id.endsWith(RECALL_SUFFIX);
  return `${newKey(recall ? id.slice(0, -RECALL_SUFFIX.length) : id)}${recall ? RECALL_SUFFIX : ""}`;
}

const weight = (value) => (value && typeof value === "object" ? (value.reviewed || 0) + (value.knownCount || 0) + (value.wrongCount || 0) : 0);

function moveKeys(map, rename, prefer = () => false) {
  const out = {};
  for (const [key, value] of Object.entries(map || {})) {
    const target = rename(key);
    if (!target) continue;
    if (!(target in out) || prefer(value, out[target])) out[target] = value;
  }
  return out;
}

const OLD_LESSON_PATH = /^\/(lesson|study)\/\d+/;

export function migrateProgress(progress) {
  if (!progress || typeof progress !== "object" || progress.wordKeys >= WORD_KEYS_VERSION) return progress;
  const migrated = {
    ...progress,
    words: moveKeys(progress.words, newKey, (a, b) => weight(a) > weight(b)),
    favorites: moveKeys(progress.favorites, newKey),
    studied: moveKeys(progress.studied, newKey),
    cards: moveKeys(progress.cards, newCardId),
    lessonDecks: {},
    studySessions: {},
    wordKeys: WORD_KEYS_VERSION,
  };
  if (migrated.lastPlace?.path && OLD_LESSON_PATH.test(migrated.lastPlace.path)) migrated.lastPlace = null;
  return migrated;
}

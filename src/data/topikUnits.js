// The TOPIK I list split into short study units of about 20 words on one theme
// (data/topik1/units.json, built by scripts/topik-units.mjs).
import UNITS from "../../data/topik1/units.json";
import { allWords, getWordKey } from "./index";
import { topikEntries } from "./topikVocab";

export const TOPIK1_UNITS = UNITS;

export const getTopikUnit = (n) => UNITS.find((unit) => unit.n === Number(n)) || null;

export function topikUnitTitle(unit, language = "uz") {
  if (!unit) return "";
  const name = unit.title[String(language).slice(0, 2)] || unit.title.uz;
  return unit.parts > 1 ? `${name} ${unit.part}` : name;
}

// The unit's words, once the TOPIK list has loaded. A word that is also a
// lesson word is that lesson word, so it keeps one card.
export function topikUnitWords(unit) {
  if (!unit) return [];
  const entries = new Map(topikEntries("topik1").map((entry) => [entry.id, entry]));
  const lessonByKey = new Map(allWords.map((word) => [getWordKey(word), word]));
  const seen = new Set();
  return unit.ids
    .map((id) => entries.get(id))
    .filter(Boolean)
    .map((entry) => (entry.lessonKey && lessonByKey.get(entry.lessonKey)) || entry)
    .filter((word) => {
      const key = getWordKey(word);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

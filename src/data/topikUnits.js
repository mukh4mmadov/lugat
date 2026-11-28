import T1 from "../../data/topik1/units.json";
import T2 from "../../data/topik2/units.json";
import { allWords, getWordKey } from "./index";
import { topikEntries } from "./topikVocab";

export const TOPIK_LEVELS_WITH_UNITS = ["topik1", "topik2"];

export const TOPIK_UNITS = {
  topik1: T1.map((unit) => ({ ...unit, level: "topik1" })),
  topik2: T2.map((unit) => ({ ...unit, level: "topik2" })),
};

export const getTopikUnit = (n, level = "topik1") => (TOPIK_UNITS[level] || []).find((unit) => unit.n === Number(n)) || null;

export function topikUnitTitle(unit, language = "uz") {
  if (!unit) return "";
  const name = unit.title[String(language).slice(0, 2)] || unit.title.uz;
  return unit.parts > 1 ? `${name} ${unit.part}` : name;
}

export function topikUnitWords(unit) {
  if (!unit) return [];
  const entries = new Map(topikEntries(unit.level).map((entry) => [entry.id, entry]));
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

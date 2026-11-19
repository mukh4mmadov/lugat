// Word sets a learner studies one at a time: the 28 lessons and the TOPIK I
// units. Each set has its own page (study, cards, word list) and its own
// numbers, all read from the word cards in the learner's progress, so they
// follow the account across devices without extra storage.
import { getLessonWords, getWordKey, lessonInfo } from "../data";
import { TOPIK1_UNITS, getTopikUnit, topikUnitTitle, topikUnitWords } from "../data/topikUnits";
import { cardIdsFor, readCard } from "./anki";
export { dueCardCount } from "./anki";
import { STATE, dayCutoff } from "./fsrs";

export function lessonSet(n) {
  const info = lessonInfo.find((lesson) => lesson.lesson === Number(n));
  if (!info) return null;
  return {
    kind: "lesson",
    n: info.lesson,
    key: `l${info.lesson}`,
    size: info.count,
    category: info.category,
    home: `/lesson/${info.lesson}`,
    study: `/study/${info.lesson}`,
    cards: `/lesson/${info.lesson}/flashcards`,
    words: () => getLessonWords(info.lesson),
  };
}

export function unitSet(n) {
  const unit = getTopikUnit(n);
  if (!unit) return null;
  return {
    kind: "unit",
    n: unit.n,
    key: `t1u${unit.n}`,
    size: unit.ids.length,
    unit,
    home: `/units/topik1/${unit.n}`,
    study: `/units/topik1/${unit.n}/study`,
    cards: `/units/topik1/${unit.n}/cards`,
    words: () => topikUnitWords(unit),
  };
}

export const allLessonSets = () => lessonInfo.map((lesson) => lessonSet(lesson.lesson)).filter(Boolean);
export const allUnitSets = () => TOPIK1_UNITS.map((unit) => unitSet(unit.n));

// "Lesson 3" / "Unit 12 · Family".
export function setTitle(set, t, language) {
  if (!set) return "";
  if (set.kind === "lesson") return t("card.lesson", { lesson: set.n });
  return `${t("units.unit", { n: set.n })} · ${topikUnitTitle(set.unit, language)}`;
}

export function setSubtitle(set, t, language) {
  if (!set) return "";
  if (set.kind === "lesson") return t(set.category);
  return topikUnitTitle(set.unit, language);
}

// How far the learner is in a set. `loaded` is false while a TOPIK unit's
// words are still downloading.
export function setStats(progress, set, options, now = Date.now()) {
  const words = set.words();
  const stats = { loaded: words.length > 0, total: words.length || set.size, learned: 0, learning: 0, fresh: 0, due: 0, last: 0, right: 0, wrong: 0 };
  if (!words.length) {
    stats.fresh = stats.total;
    return stats;
  }
  const cutoff = dayCutoff(now, options.dayStartsAt);
  const recognitionOnly = { ...options, recognition: true, recall: false };
  for (const word of words) {
    const key = getWordKey(word);
    const record = progress.words?.[key];
    if (record) {
      stats.right += record.knownCount || 0;
      stats.wrong += record.wrongCount || 0;
    }
    // A word counts as learned once its main card has graduated.
    const card = readCard(progress, key);
    if (!card || card.state === STATE.new) stats.fresh += 1;
    else if (card.state === STATE.review) stats.learned += 1;
    else stats.learning += 1;
  }
  for (const id of cardIdsFor(words, options.recall ? options : recognitionOnly)) {
    const card = readCard(progress, id);
    if (!card || card.state === STATE.new) continue;
    if (card.due < cutoff) stats.due += 1;
    if (card.last > stats.last) stats.last = card.last;
  }
  const answers = stats.right + stats.wrong;
  stats.accuracy = answers >= 5 ? Math.round((stats.right / answers) * 100) : null;
  stats.percent = Math.round((stats.learned / Math.max(1, stats.total)) * 100);
  return stats;
}

// Lessons and units that have cards to review today, most first.
export function setsWithDue(progress, options, now = Date.now()) {
  return [...allLessonSets(), ...allUnitSets()]
    .map((set) => ({ set, stats: setStats(progress, set, options, now) }))
    .filter((row) => row.stats.due > 0)
    .sort((a, b) => b.stats.due - a.stats.due);
}

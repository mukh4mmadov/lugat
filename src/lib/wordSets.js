import { deckName, getLessonWords, getWordKey, lessonInfo } from "../data";
import { TOPIK_LEVELS_WITH_UNITS, TOPIK_UNITS, getTopikUnit, topikUnitTitle, topikUnitWords } from "../data/topikUnits";
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
    info,
    home: `/topic/${info.lesson}`,
    list: "/study?level=basic",
    study: `/topic/${info.lesson}/study`,
    cards: `/topic/${info.lesson}/flashcards`,
    words: () => getLessonWords(info.lesson),
  };
}

export function unitSet(n, level = "topik1") {
  const unit = getTopikUnit(n, level);
  if (!unit) return null;
  const base = `/units/${level}/${unit.n}`;
  return {
    kind: "unit",
    level,
    n: unit.n,
    key: `${level === "topik2" ? "t2u" : "t1u"}${unit.n}`,
    size: unit.ids.length,
    unit,
    home: base,
    study: `${base}/study`,
    cards: `${base}/cards`,
    list: `/study?level=${unit.band}`,
    words: () => topikUnitWords(unit),
  };
}

export const allLessonSets = () => lessonInfo.map((lesson) => lessonSet(lesson.lesson)).filter(Boolean);
export const allUnitSets = (level = "topik1") => (TOPIK_UNITS[level] || []).map((unit) => unitSet(unit.n, level));
export const everyUnitSet = () => TOPIK_LEVELS_WITH_UNITS.flatMap((level) => allUnitSets(level));

export function setTitle(set, t, language) {
  if (!set) return "";
  if (set.kind === "lesson") return t("card.lesson", { lesson: set.n });
  return `${t("units.unit", { n: set.n })} · ${topikUnitTitle(set.unit, language)}`;
}

export function setSubtitle(set, t, language) {
  if (!set) return "";
  if (set.kind === "lesson") return deckName(set.info, t);
  return topikUnitTitle(set.unit, language);
}

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

export function setsWithDue(progress, options, now = Date.now()) {
  return [...allLessonSets(), ...everyUnitSet()]
    .map((set) => ({ set, stats: setStats(progress, set, options, now) }))
    .filter((row) => row.stats.due > 0)
    .sort((a, b) => b.stats.due - a.stats.due);
}

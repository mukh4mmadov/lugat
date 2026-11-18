import { setGrammarTotal } from "../../lib/gamification.js";
import course1A from "./course1A.js";
import course1B from "./course1B.js";
import topik1, { TOPIK1_GROUPS, TOPIK1_TEXT } from "./topik1.js";

// Every grammar point: the lesson course (1A is lessons 1–14, 1B is 15–28)
// in lesson order, then the TOPIK I points that the lessons don't cover.
export const GRAMMAR = [...course1A, ...course1B, ...topik1];
setGrammarTotal(GRAMMAR.length);

// Lesson courses have no `level`; the TOPIK I list has level "topik1" and
// is grouped by `group` instead of by lesson.
export const GRAMMAR_COURSES = [
  { id: "1A", points: course1A },
  { id: "1B", points: course1B },
  { id: "topik1", level: "topik1", points: topik1 },
];

export { TOPIK1_GROUPS, TOPIK1_TEXT };

export const isTopikPoint = (point) => point?.level === "topik1";

export function getGrammarPoint(id) {
  return GRAMMAR.find((point) => point.id === id) || null;
}

export function grammarForLesson(lesson) {
  return GRAMMAR.filter((point) => point.lesson === Number(lesson));
}

// A { uz, en, ru } text in the interface language.
export function tr(text, language) {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[language] || text.uz || "";
}

// Rows are [korean, uz, en, ru]; returns the translation for the language.
export function rowText(row, language) {
  const index = { uz: 1, en: 2, ru: 3 }[language] || 1;
  return row[index] || row[1] || "";
}

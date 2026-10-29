import course1A from "./course1A.js";
import course1B from "./course1B.js";

// Every grammar point in lesson order: 1A is lessons 1–14, 1B is 15–28.
export const GRAMMAR = [...course1A, ...course1B];

export const GRAMMAR_COURSES = [
  { id: "1A", points: course1A },
  { id: "1B", points: course1B },
];

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

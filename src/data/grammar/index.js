import { setGrammarTotal } from "../../lib/gamification.js";
import core1 from "./core1.js";
import core2 from "./core2.js";
import topik1, { TOPIK1_GROUPS, TOPIK1_TEXT } from "./topik1.js";
import topik2, { TOPIK2_TEXT } from "./topik2.js";

const CORE_GROUP = {
  topic: "particles", object: "particles", subject: "particles", destination: "particles", "location-eseo": "particles",
  "and-with": "particles", "by-means": "particles", time: "particles", dates: "particles", comparison: "particles",
  copula: "endings", present: "endings", past: "endings", future: "endings", "honorific-request": "endings",
  "honorific-si": "endings", "honorific-words": "endings", progressive: "endings", suggest: "endings",
  "will-promise": "endings", "exclaim-neyo": "endings", seems: "endings", dont: "endings",
  "and-then": "connectors", but: "connectors", "sequence-aseo": "connectors", if: "connectors", "because-nikka": "connectors",
  when: "connectors", "before-after": "connectors", "because-ttaemune": "connectors", "background-neunde": "connectors",
  "negation-an": "modifiers", "cannot-mot": "modifiers", "modifier-present": "modifiers", "modifier-adjective": "modifiers",
  "nominal-hobby": "modifiers",
  exist: "expressions", demonstratives: "expressions", position: "expressions", "native-numbers": "expressions",
  want: "expressions", "purpose-go": "expressions", can: "expressions", "like-dislike": "expressions", must: "expressions",
  try: "expressions", "please-for-me": "expressions", "enough-doeda": "expressions", may: "expressions",
  "must-not": "expressions", experience: "expressions", "come-to": "expressions",
  "b-irregular": "irregular", "reu-irregular": "irregular", "d-irregular": "irregular",
};
const core = [...core1, ...core2].map((point) => ({ ...point, lesson: null, level: "topik1", group: CORE_GROUP[point.id] || "expressions" }));
const groupOrder = (point) => (point.level === "topik2" ? 100 : 0) + TOPIK1_GROUPS.findIndex((group) => group.id === point.group);

export const GRAMMAR = [...core, ...topik1, ...topik2].sort((a, b) => groupOrder(a) - groupOrder(b));
setGrammarTotal(GRAMMAR.length);

export const GRAMMAR_COURSES = ["topik1", "topik2"].map((level) => ({ id: level, level, points: GRAMMAR.filter((point) => point.level === level) }));

export { TOPIK1_GROUPS, TOPIK1_TEXT, TOPIK2_TEXT };
export const TOPIK_LEVELS = [
  { level: "topik1", label: "TOPIK I", text: TOPIK1_TEXT },
  { level: "topik2", label: "TOPIK II", text: TOPIK2_TEXT },
];

export const isTopikPoint = (point) => point?.level === "topik1" || point?.level === "topik2";

export function getGrammarPoint(id) {
  return GRAMMAR.find((point) => point.id === id) || null;
}


export function tr(text, language) {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[language] || text.uz || "";
}

export function rowText(row, language) {
  const index = { uz: 1, en: 2, ru: 3 }[language] || 1;
  return row[index] || row[1] || "";
}

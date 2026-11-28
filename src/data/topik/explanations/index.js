import { TOPIK_EXAMS, explanationKey, loadExamContent } from "../exams";
import "../../../lib/topikPremium";

const FILES = import.meta.glob("./paper*.js", { import: "default" });

const cache = new Map();

export function hasExplanations(examNumber) {
  return Boolean(FILES[`./paper${examNumber}.js`]) || TOPIK_EXAMS.some((exam) => exam.private && exam.level === "TOPIK I" && explanationKey(exam) === examNumber);
}

function premiumExplanations(examNumber) {
  const exam = TOPIK_EXAMS.find((item) => item.private && explanationKey(item) === examNumber);
  if (!exam) return Promise.resolve(null);
  return loadExamContent(exam).then((loaded) => loaded?.explanations || null, () => null);
}

export function loadExplanations(examNumber) {
  const loader = FILES[`./paper${examNumber}.js`];
  if (!loader) return premiumExplanations(examNumber);
  if (!cache.has(examNumber)) cache.set(examNumber, loader().catch(() => null));
  return cache.get(examNumber);
}

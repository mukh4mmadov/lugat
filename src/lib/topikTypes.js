import { TOPIK1_QUESTION_TYPES, TOPIK_EXAMS, isFreeExam } from "../data/topik/exams";

// Question types shown on the TOPIK page: blocks of the same kind in one
// section are one type ("paired" reading sets appear twice on the paper).
export function topikTypeKeys() {
  const seen = new Map();
  for (const type of TOPIK1_QUESTION_TYPES) {
    const key = `${type.section}-${type.id}`;
    if (!seen.has(key)) seen.set(key, { key, id: type.id, section: type.section, ko: type.ko, ranges: [] });
    seen.get(key).ranges.push([type.from, type.to]);
  }
  return [...seen.values()];
}

// Every question of one type across all TOPIK I papers, as { exam, question }.
// `premium`: false leaves out questions from Premium papers.
export function questionsOfType(typeKey, premium = true) {
  const type = topikTypeKeys().find((item) => item.key === typeKey);
  if (!type) return [];
  return TOPIK_EXAMS.filter((exam) => exam.level === "TOPIK I" && (premium || isFreeExam(exam))).flatMap((exam) =>
    exam.questions
      .filter((question) => question.section === type.section && type.ranges.some(([from, to]) => question.number >= from && question.number <= to))
      .map((question) => ({ exam, question, qid: `${exam.id}-${question.number}` })),
  );
}

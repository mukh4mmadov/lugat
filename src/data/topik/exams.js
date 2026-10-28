// TOPIK paper data shared by the web app and the /api/ai-chat function.
// Rows: [question number, section, points, original paper page, correct option].
// Keep this file free of browser/Vite-only imports so the API can import it too.

import { PAPER_35_AUDIO } from "./paper35Audio.js";
import { PAPER_35_CONTENT } from "./paper35Content.js";

const PAPER_35 = [
  [1, "listening", 4, 3, 3],
  [2, "listening", 4, 3, 2],
  [3, "listening", 3, 3, 1],
  [4, "listening", 3, 3, 2],
  [5, "listening", 4, 4, 1],
  [6, "listening", 3, 4, 2],
  [7, "listening", 3, 4, 2],
  [8, "listening", 3, 4, 4],
  [9, "listening", 3, 5, 3],
  [10, "listening", 4, 5, 4],
  [11, "listening", 3, 5, 1],
  [12, "listening", 3, 5, 4],
  [13, "listening", 4, 5, 3],
  [14, "listening", 3, 5, 4],
  [15, "listening", 4, 6, 1],
  [16, "listening", 4, 6, 3],
  [17, "listening", 3, 7, 3],
  [18, "listening", 3, 7, 4],
  [19, "listening", 3, 7, 3],
  [20, "listening", 3, 8, 2],
  [21, "listening", 3, 8, 2],
  [22, "listening", 3, 8, 2],
  [23, "listening", 3, 8, 1],
  [24, "listening", 3, 8, 1],
  [25, "listening", 3, 9, 4],
  [26, "listening", 4, 9, 4],
  [27, "listening", 3, 9, 1],
  [28, "listening", 4, 9, 3],
  [29, "listening", 3, 10, 1],
  [30, "listening", 4, 10, 2],
  [31, "reading", 2, 11, 3],
  [32, "reading", 2, 11, 4],
  [33, "reading", 2, 11, 1],
  [34, "reading", 2, 12, 4],
  [35, "reading", 2, 12, 1],
  [36, "reading", 2, 12, 3],
  [37, "reading", 3, 12, 3],
  [38, "reading", 3, 13, 1],
  [39, "reading", 2, 13, 1],
  [40, "reading", 3, 13, 3],
  [41, "reading", 3, 14, 2],
  [42, "reading", 3, 14, 4],
  [43, "reading", 3, 15, 1],
  [44, "reading", 2, 15, 2],
  [45, "reading", 3, 15, 2],
  [46, "reading", 3, 16, 4],
  [47, "reading", 3, 16, 3],
  [48, "reading", 2, 16, 3],
  [49, "reading", 3, 17, 2],
  [50, "reading", 2, 17, 4],
  [51, "reading", 3, 18, 1],
  [52, "reading", 2, 18, 2],
  [53, "reading", 2, 19, 4],
  [54, "reading", 3, 19, 3],
  [55, "reading", 2, 20, 3],
  [56, "reading", 3, 20, 2],
  [57, "reading", 2, 21, 4],
  [58, "reading", 3, 21, 2],
  [59, "reading", 2, 22, 2],
  [60, "reading", 3, 22, 3],
  [61, "reading", 2, 23, 1],
  [62, "reading", 2, 23, 1],
  [63, "reading", 2, 24, 4],
  [64, "reading", 3, 24, 4],
  [65, "reading", 2, 25, 2],
  [66, "reading", 3, 25, 3],
  [67, "reading", 3, 26, 1],
  [68, "reading", 3, 26, 3],
  [69, "reading", 3, 27, 4],
  [70, "reading", 3, 27, 1],
];

function buildQuestions(rows) {
  return rows.map(([number, section, points, page, answer]) => ({
    number,
    section,
    points,
    page,
    answer: String(answer),
  }));
}

export const TOPIK_EXAMS = [
  {
    id: "35th",
    number: 35,
    level: "TOPIK I",
    form: "B",
    title: "The 35th Test of Proficiency in Korean I",
    pdf: "/topik/35th/paper.pdf",
    audio: "/topik/35th/listening.mp3",
    level1Min: 80,
    level2Min: 140,
    listeningMinutes: 40,
    readingMinutes: 60,
    questions: buildQuestions(PAPER_35),
    content: PAPER_35_CONTENT,
    audioTimeline: PAPER_35_AUDIO,
  },
];

// Each exam is offered as a full timed mock plus untimed section practice.
export const TOPIK_VARIANTS = TOPIK_EXAMS.flatMap((exam) => [
  { id: `${exam.id}mock`, examId: exam.id, mode: "mock", section: null, durationSeconds: (exam.listeningMinutes + exam.readingMinutes) * 60 },
  { id: `${exam.id}listening`, examId: exam.id, mode: "listening", section: "listening", durationSeconds: null },
  { id: `${exam.id}reading`, examId: exam.id, mode: "reading", section: "reading", durationSeconds: null },
]);

// The standard TOPIK I question blocks (the same layout on every paper since the
// 35th exam), used to show learners which kinds of questions cost them points.
export const TOPIK1_QUESTION_TYPES = [
  { id: "response", section: "listening", from: 1, to: 4, ko: "알맞은 대답 고르기" },
  { id: "nextLine", section: "listening", from: 5, to: 6, ko: "이어지는 말 고르기" },
  { id: "place", section: "listening", from: 7, to: 10, ko: "장소 고르기" },
  { id: "topic", section: "listening", from: 11, to: 14, ko: "화제 고르기" },
  { id: "picture", section: "listening", from: 15, to: 16, ko: "알맞은 그림 고르기" },
  { id: "detail", section: "listening", from: 17, to: 21, ko: "내용 일치" },
  { id: "mainIdea", section: "listening", from: 22, to: 24, ko: "중심 생각" },
  { id: "paired", section: "listening", from: 25, to: 30, ko: "두 문제 세트" },
  { id: "topic", section: "reading", from: 31, to: 33, ko: "화제 고르기" },
  { id: "blank", section: "reading", from: 34, to: 39, ko: "빈칸 채우기" },
  { id: "notTrue", section: "reading", from: 40, to: 42, ko: "내용 불일치" },
  { id: "detail", section: "reading", from: 43, to: 45, ko: "내용 일치" },
  { id: "mainIdea", section: "reading", from: 46, to: 48, ko: "중심 생각" },
  { id: "paired", section: "reading", from: 49, to: 56, ko: "두 문제 세트" },
  { id: "order", section: "reading", from: 57, to: 58, ko: "순서 배열" },
  { id: "paired", section: "reading", from: 59, to: 70, ko: "두 문제 세트" },
];

export function getQuestionType(number) {
  return TOPIK1_QUESTION_TYPES.find((type) => number >= type.from && number <= type.to) || null;
}

// Correct answers and points lost per question type, merging the blocks that
// share a type within a section (e.g. both reading "paired" blocks).
export function questionTypeBreakdown(questions, answers) {
  const groups = new Map();
  questions.forEach((question) => {
    const type = getQuestionType(question.number);
    if (!type) return;
    const key = `${type.section}:${type.id}`;
    const group = groups.get(key) || { key, id: type.id, section: type.section, ko: type.ko, ranges: [], total: 0, correct: 0, lost: 0, max: 0 };
    const range = `${type.from}–${type.to}`;
    if (!group.ranges.includes(range)) group.ranges.push(range);
    group.total += 1;
    group.max += question.points;
    if (answers[question.number] === question.answer) group.correct += 1;
    else group.lost += question.points;
    groups.set(key, group);
  });
  return [...groups.values()];
}

export function getTopikExam(examId) {
  return TOPIK_EXAMS.find((exam) => exam.id === examId) || null;
}

export function getTopikVariant(variantId) {
  return TOPIK_VARIANTS.find((variant) => variant.id === variantId) || null;
}

export function getVariantQuestions(variant) {
  const exam = variant && getTopikExam(variant.examId);
  if (!exam) return [];
  return exam.questions.filter((question) => !variant.section || question.section === variant.section);
}

// TOPIK I sections are scored out of 100 each. The 35th reading key's printed
// weights add to 101, so a section is normalized to 100 when its weights differ.
function sectionScore(questions, answers, section) {
  const sectionQuestions = questions.filter((question) => question.section === section);
  if (!sectionQuestions.length) return null;
  const max = sectionQuestions.reduce((sum, question) => sum + question.points, 0);
  const earned = sectionQuestions.reduce(
    (sum, question) => sum + (answers[question.number] === question.answer ? question.points : 0),
    0,
  );
  return {
    score: Math.round((earned * 100) / max),
    correct: sectionQuestions.filter((question) => answers[question.number] === question.answer).length,
    answered: sectionQuestions.filter((question) => answers[question.number]).length,
    total: sectionQuestions.length,
  };
}

export function scoreTopikAttempt(variant, answers) {
  const exam = getTopikExam(variant.examId);
  const questions = getVariantQuestions(variant);
  const listening = sectionScore(questions, answers, "listening");
  const reading = sectionScore(questions, answers, "reading");
  const total = (listening?.score || 0) + (reading?.score || 0);
  let level = null;
  if (variant.mode === "mock") {
    if (total >= exam.level2Min) level = 2;
    else if (total >= exam.level1Min) level = 1;
  }
  return { listening, reading, total, maxTotal: (listening ? 100 : 0) + (reading ? 100 : 0), level };
}

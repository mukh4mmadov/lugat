// TOPIK paper data shared by the web app and the /api/ai-chat function.
// Rows: [question number, section, points, original paper page, correct option].
// Keep this file free of browser/Vite-only imports so the API can import it too.

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
  },
];

// Each exam is offered as a full timed mock plus untimed section practice.
export const TOPIK_VARIANTS = TOPIK_EXAMS.flatMap((exam) => [
  { id: `${exam.id}mock`, examId: exam.id, mode: "mock", section: null, durationSeconds: (exam.listeningMinutes + exam.readingMinutes) * 60 },
  { id: `${exam.id}listening`, examId: exam.id, mode: "listening", section: "listening", durationSeconds: null },
  { id: `${exam.id}reading`, examId: exam.id, mode: "reading", section: "reading", durationSeconds: null },
]);

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

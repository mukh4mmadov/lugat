import lessonMetadata from "../../data/vocab/decks.json";
import i18n from "../lib/i18n";



export const lessons = [];
const DEFAULT_COURSE = "basics";

export const lessonInfo = lessonMetadata.map((lesson) => ({ ...lesson, words: [] }));
export const allWords = [];

export const dataReady = import("./lessonsData.js").then(({ default: loaded }) => {
  loaded.forEach((words, index) => {
    lessons[index] = words;
  });
  lessonInfo.forEach((lesson) => {
    lesson.words = lessons[lesson.lesson - 1] || [];
  });
  allWords.push(
    ...lessons.flat().map((word) => ({
      ...word,
      globalId: `${word.lesson}-${word.id}`,
      course: lessonInfo.find((info) => info.lesson === word.lesson)?.course || DEFAULT_COURSE,
    })),
  );
});

export function deckName(info, t) {
  if (!info) return "";
  const name = t(info.category);
  return info.parts > 1 ? `${name} ${info.part}` : name;
}

export function getLessonWords(lessonId) {
  return lessons[Number(lessonId) - 1] || [];
}

export function getWordKey(word) {
  return `${word.lesson}-${word.id}`;
}

export function getCourses() {
  const map = new Map();
  lessonInfo.forEach(lesson => {
    const id = lesson.course || DEFAULT_COURSE;
    if (!map.has(id)) {
      map.set(id, {
        id,
        lessons: lessonInfo.filter(l => (l.course || DEFAULT_COURSE) === id)
      });
    }
  });
  return Array.from(map.values());
}

export function getCourseLessons(courseId) {
  return lessonInfo.filter(lesson => (lesson.course || DEFAULT_COURSE) === courseId);
}

export function getCourseWords(courseId) {
  return allWords.filter(word => (word.course || DEFAULT_COURSE) === courseId);
}

export function getWordCourse(word) {
  return word.course || DEFAULT_COURSE;
}


const MEANING_FIELD = { uz: "uzbek", en: "english", ru: "russian" };

export function meaning(word, language = i18n.language) {
  if (!word) return "";
  const field = MEANING_FIELD[String(language || "uz").slice(0, 2)] || "uzbek";
  return word[field] || word.uzbek;
}

export function acceptedMeanings(word) {
  const local = meaning(word);
  return local === word.uzbek ? local : `${local} / ${word.uzbek}`;
}

export function exampleTranslation(example, language = i18n.language) {
  if (!example) return "";
  return example[String(language || "uz").slice(0, 2)] || example.uz;
}

const dropCustom = (list) => {
  for (let index = list.length - 1; index >= 0; index -= 1) if (list[index].custom) list.splice(index, 1);
};

export function applyCustomContent(rows = [], drafts = false) {
  dropCustom(lessonInfo);
  lessons.length = lessonInfo.length;
  lessons.forEach(dropCustom);
  dropCustom(allWords);
  lessonInfo.forEach((lesson) => {
    lesson.baseCount ??= lesson.count;
    lesson.count = lesson.baseCount;
  });
  const shown = rows.filter((row) => drafts || !row.hidden);
  const newLessons = shown.filter((row) => row.kind === "lesson").sort((a, b) => a.data.lesson - b.data.lesson);
  const numbers = new Map();
  for (const { data } of newLessons) {
    const number = lessonInfo.length + 1;
    numbers.set(data.lesson, number);
    lessons[number - 1] = [];
    lessonInfo.push({ lesson: number, title: `${number}`, category: `lesson.${data.lesson}.category`, count: 0, course: data.course || "everyday", words: lessons[number - 1], custom: true });
  }
  const general = lessonInfo.find((info) => info.topic === "general");
  const builtIn = lessonInfo.filter((info) => !info.custom).length;
  for (const row of shown) {
    if (row.kind !== "word") continue;
    const saved = Number(row.data.lesson);
    const current = row.data.wordKeys === 2 || saved > builtIn;
    const number = numbers.get(saved) || (current ? saved : general?.lesson);
    const info = lessonInfo[number - 1];
    if (!info) continue;
    const word = { ...row.data, lesson: info.lesson, id: row.item_id, audio: "speechSynthesis:ko-KR", needsReview: false, custom: true };
    lessons[info.lesson - 1].push(word);
    allWords.push({ ...word, globalId: `${word.lesson}-${word.id}`, course: info.course });
    info.count += 1;
  }
}

const OVERRIDE_FIELDS = ["uzbek", "english", "russian", "romanization", "example"];
const originals = new Map();

export function applyWordOverrides(rows = []) {
  const byKey = new Map(rows.map((row) => [row.word_key, row]));
  const targets = [...lessons.flat(), ...allWords];
  targets.forEach((word) => {
    const key = getWordKey(word);
    if (!originals.has(key)) {
      originals.set(key, Object.fromEntries([...OVERRIDE_FIELDS, "needsReview"].map((field) => [field, word[field]])));
    }
    const original = originals.get(key);
    const row = byKey.get(key);
    OVERRIDE_FIELDS.forEach((field) => {
      word[field] = row && row[field] != null && row[field] !== "" ? row[field] : original[field];
    });
    word.needsReview = row && row.needs_review != null ? row.needs_review : original.needsReview;
  });
}

export function originalWord(key) {
  return originals.get(key) || null;
}

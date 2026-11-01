import lessonMetadata from "../../data/lessons.json";
import i18n from "../lib/i18n";



// Filled in place once lessonsData.js has loaded; main.jsx waits for
// dataReady before rendering, so pages always see the full lists.
export const lessons = [];
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
      course: lessonInfo.find((info) => info.lesson === word.lesson)?.course || "1A",
    })),
  );
});

export function getLessonWords(lessonId) {
  return lessons[Number(lessonId) - 1] || [];
}

export function getWordKey(word) {
  return `${word.lesson}-${word.id}`;
}

export function getCourses() {
  const map = new Map();
  lessonInfo.forEach(lesson => {
    const id = lesson.course || '1A';
    if (!map.has(id)) {
      map.set(id, {
        id,
        lessons: lessonInfo.filter(l => (l.course || '1A') === id)
      });
    }
  });
  return Array.from(map.values());
}

export function getCourseLessons(courseId) {
  return lessonInfo.filter(lesson => (lesson.course || '1A') === courseId);
}

export function getCourseWords(courseId) {
  return allWords.filter(word => (word.course || '1A') === courseId);
}

export function getWordCourse(word) {
  return word.course || '1A';
}


const MEANING_FIELD = { uz: "uzbek", en: "english", ru: "russian" };

// The word's meaning in the interface language, falling back to Uzbek.
// Components re-render on a language change through useTranslation().
export function meaning(word, language = i18n.language) {
  if (!word) return "";
  const field = MEANING_FIELD[String(language || "uz").slice(0, 2)] || "uzbek";
  return word[field] || word.uzbek;
}

// Typed answers accept the meaning in the interface language or in Uzbek.
export function acceptedMeanings(word) {
  const local = meaning(word);
  return local === word.uzbek ? local : `${local} / ${word.uzbek}`;
}

// An example sentence's translation in the interface language.
export function exampleTranslation(example, language = i18n.language) {
  if (!example) return "";
  return example[String(language || "uz").slice(0, 2)] || example.uz;
}

// Admin corrections (public.word_overrides) applied over the built-in words.
// Both the lesson arrays and allWords hold their own copies, so both change.
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

import lessonMetadata from "../../data/vocab/decks.json";
import i18n from "../lib/i18n";



// Filled in place once lessonsData.js has loaded; main.jsx waits for
// dataReady before rendering, so pages always see the full lists.
export const lessons = [];
// Word decks grouped by topic (data/vocab, built by scripts/vocab/build.mjs).
// Inside the app a deck is still called a "lesson": lessonInfo, lesson numbers
// in word keys ("<deck>-<id>") and the /topic/N pages.
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

// A deck's name: its topic, with the part number when the topic is split
// ("Verbs 2"). Panel-added decks keep their own category text.
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

// Lessons and words added in the admin panel (content_overrides). Lessons must
// run on from the built-in ones, so a draft in the row stops the ones after it.
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
  // Panel decks follow the built-in ones in the order of their saved number;
  // `numbers` maps a saved number to the deck's place now (decks saved
  // before the regrouping had numbers that built-in decks use today).
  const newLessons = shown.filter((row) => row.kind === "lesson").sort((a, b) => a.data.lesson - b.data.lesson);
  const numbers = new Map();
  for (const { data } of newLessons) {
    const number = lessonInfo.length + 1;
    numbers.set(data.lesson, number);
    lessons[number - 1] = [];
    lessonInfo.push({ lesson: number, title: `${number}`, category: `lesson.${data.lesson}.category`, count: 0, course: data.course || "everyday", words: lessons[number - 1], custom: true });
  }
  // A panel word saved for a built-in lesson before the regrouping (no
  // wordKeys mark) goes to the "General" deck.
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

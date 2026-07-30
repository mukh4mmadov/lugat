import lesson1 from "../../data/lesson1.json";
import lesson2 from "../../data/lesson2.json";
import lesson3 from "../../data/lesson3.json";
import lesson4 from "../../data/lesson4.json";
import lesson5 from "../../data/lesson5.json";
import lesson6 from "../../data/lesson6.json";
import lesson7 from "../../data/lesson7.json";
import lesson8 from "../../data/lesson8.json";
import lesson9 from "../../data/lesson9.json";
import lesson10 from "../../data/lesson10.json";
import lesson11 from "../../data/lesson11.json";
import lesson12 from "../../data/lesson12.json";
import lesson13 from "../../data/lesson13.json";
import lesson14 from "../../data/lesson14.json";
import lessonMetadata from "../../data/lessons.json";

export const lessons = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
  lesson8,
  lesson9,
  lesson10,
  lesson11,
  lesson12,
  lesson13,
  lesson14,
];

export const lessonInfo = lessonMetadata.map((lesson) => ({
  ...lesson,
  words: lessons[lesson.lesson - 1],
}));

export const allWords = lessons.flat().map((word) => ({
  ...word,
  globalId: `${word.lesson}-${word.id}`,
}));

export function getLessonWords(lessonId) {
  return lessons[Number(lessonId) - 1] || [];
}

export function getWordKey(word) {
  return `${word.lesson}-${word.id}`;
}

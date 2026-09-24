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
import lesson15 from "../../data/lesson15.json";
import lesson16 from "../../data/lesson16.json";
import lesson17 from "../../data/lesson17.json";
import lesson18 from "../../data/lesson18.json";
import lesson19 from "../../data/lesson19.json";
import lesson20 from "../../data/lesson20.json";
import lesson21 from "../../data/lesson21.json";
import lesson22 from "../../data/lesson22.json";
import lesson23 from "../../data/lesson23.json";
import lesson24 from "../../data/lesson24.json";
import lesson25 from "../../data/lesson25.json";
import lesson26 from "../../data/lesson26.json";
import lesson27 from "../../data/lesson27.json";
import lesson28 from "../../data/lesson28.json";
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
  lesson15,
  lesson16,
  lesson17,
  lesson18,
  lesson19,
  lesson20,
  lesson21,
  lesson22,
  lesson23,
  lesson24,
  lesson25,
  lesson26,
  lesson27,
  lesson28,
];

export const lessonInfo = lessonMetadata.map((lesson) => ({
  ...lesson,
  words: lessons[lesson.lesson - 1],
}));

export const allWords = lessons.flat().map((word) => ({
  ...word,
  globalId: `${word.lesson}-${word.id}`,
  course: lessonInfo.find(l => l.lesson === word.lesson)?.course || "1A",
}));

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


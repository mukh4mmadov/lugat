import { getWordKey } from "../data";
import { pickDistractors, shuffle } from "./study";

// Study mode introduces a lesson a few words at a time and drills them until
// each is mastered: answered correctly MASTERY_CORRECT times, including at
// least once from memory (typing, missing syllable or sentence). A wrong answer
// costs one step and brings the word back after a couple of other exercises.
// Every random choice is made once here, so an exercise never changes while
// the learner is looking at it.

export const BATCH_SIZE = 3;
export const MASTERY_CORRECT = 3;
const REVIEW_GAP = 2;
const SESSION_VERSION = 2;

export const RECALL_TYPES = ["typingChallenge", "missingSyllable", "sentenceContext"];

const STAGE_TYPES = [
  ["koreanToUzbek", "uzbekToKorean", "listeningToKorean"],
  ["listeningToMeaning", "trueFalse", "uzbekToKorean", "koreanToUzbek"],
  ["typingChallenge", "missingSyllable", "sentenceContext"],
];


const isHangul = (char) => /[가-힣]/.test(char);

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// The fill-in-the-blank exercise only works when the example contains the
// word exactly as listed (verbs are usually conjugated, so they skip it).
function blankSentence(word) {
  const example = word.example;
  if (!example || !example.ko.includes(word.korean)) return null;
  return { ...example, ko: example.ko.replace(word.korean, "＿＿＿") };
}

function availableTypes(stage, word, otherSyllables) {
  return STAGE_TYPES[stage].filter((type) => {
    if (type === "missingSyllable") {
      return [...word.korean].filter(isHangul).length >= 2 && otherSyllables.length >= 3;
    }
    if (type === "sentenceContext") return Boolean(blankSentence(word));
    return true;
  });
}

function makeExercise(session, key, words) {
  const byKey = Object.fromEntries(words.map((item) => [getWordKey(item), item]));
  const word = byKey[key];
  const state = session.mastery[key] || { correct: 0, recall: false };
  let stage = Math.min(state.correct, 2);
  if (state.correct >= 2 && state.recall) stage = pick([1, 2]);

  // Options are stored as keys of this lesson's words, so distractors stay in the lesson.
  const distractors = pickDistractors(word, words, words, 3);
  const wordSyllables = new Set([...word.korean].filter(isHangul));
  const otherSyllables = [...new Set(words.flatMap((item) => [...item.korean].filter(isHangul)))].filter(
    (syllable) => !wordSyllables.has(syllable),
  );

  let types = availableTypes(stage, word, otherSyllables);
  if (types.length > 1) types = types.filter((type) => type !== session.lastType);
  const type = pick(types);

  const exercise = { id: `${session.counter}-${key}`, type, key };
  if (type === "trueFalse") {
    const shown = Math.random() < 0.5 || !distractors.length ? word : distractors[0];
    exercise.shownKey = getWordKey(shown);
  } else if (type === "missingSyllable") {
    const positions = [...word.korean].map((char, index) => (isHangul(char) ? index : -1)).filter((index) => index >= 0);
    const blankIndex = pick(positions);
    const answer = word.korean[blankIndex];
    exercise.blankIndex = blankIndex;
    exercise.choices = shuffle([answer, ...shuffle(otherSyllables).slice(0, 3)]);
  } else if (type !== "typingChallenge") {
    exercise.optionKeys = shuffle([key, ...distractors.slice(0, 3).map(getWordKey)]);
  }
  return exercise;
}

export function newSession(words) {
  return {
    version: SESSION_VERSION,
    order: shuffle(words).map(getWordKey),
    batchStart: 0,
    introduced: Math.min(BATCH_SIZE, words.length),
    phase: "learn",
    learnCursor: 0,
    mastery: {},
    exercise: null,
    result: null,
    lastKey: null,
    lastType: null,
    reviews: [],
    counter: 0,
    stats: { correct: 0, incorrect: 0 },
    startedAt: Date.now(),
    finishedAt: null,
  };
}

export function isSessionValid(session, words) {
  if (!session || session.version !== SESSION_VERSION || !Array.isArray(session.order)) return false;
  const keys = new Set(words.map(getWordKey));
  return session.order.length === keys.size && session.order.every((key) => keys.has(key));
}

export function isMastered(state) {
  return Boolean(state && state.correct >= MASTERY_CORRECT && state.recall);
}

export function masteredCount(session) {
  return session.order.filter((key) => isMastered(session.mastery[key])).length;
}

export function currentLearnKey(session) {
  return session.order[session.batchStart + session.learnCursor];
}

// Picks what comes next: a due review, the weakest unmastered word, a new
// batch once everything introduced is mastered, or the end of the lesson.
export function advance(session, words) {
  const introducedKeys = session.order.slice(0, session.introduced);
  const unmastered = introducedKeys.filter((key) => !isMastered(session.mastery[key]));

  if (!unmastered.length) {
    if (session.introduced < session.order.length) {
      return {
        ...session,
        batchStart: session.introduced,
        introduced: Math.min(session.order.length, session.introduced + BATCH_SIZE),
        phase: "learn",
        learnCursor: 0,
        exercise: null,
        result: null,
      };
    }
    return { ...session, phase: "done", exercise: null, result: null, finishedAt: session.finishedAt || Date.now() };
  }

  const due = session.reviews.find((review) => review.at <= session.counter && review.key !== session.lastKey && unmastered.includes(review.key));
  let key = due?.key;
  if (!key) {
    const fresh = unmastered.filter((candidate) => candidate !== session.lastKey);
    const pool = fresh.length ? fresh : unmastered;
    const lowest = Math.min(...pool.map((candidate) => session.mastery[candidate]?.correct || 0));
    key = pick(pool.filter((candidate) => (session.mastery[candidate]?.correct || 0) === lowest));
  }
  const exercise = makeExercise(session, key, words);
  return {
    ...session,
    phase: "exercise",
    exercise,
    result: null,
    reviews: session.reviews.filter((review) => review.key !== key),
  };
}

export function finishLearnCard(session, words) {
  const nextCursor = session.learnCursor + 1;
  if (session.batchStart + nextCursor < session.introduced) {
    return { ...session, learnCursor: nextCursor };
  }
  return advance({ ...session, learnCursor: nextCursor }, words);
}

export function answerExercise(session, correct, given) {
  const { exercise } = session;
  const previous = session.mastery[exercise.key] || { correct: 0, recall: false };
  const next = correct
    ? { correct: previous.correct + 1, recall: previous.recall || RECALL_TYPES.includes(exercise.type) }
    : { correct: Math.max(0, previous.correct - 1), recall: previous.recall };
  return {
    ...session,
    phase: "feedback",
    result: { correct, given },
    mastery: { ...session.mastery, [exercise.key]: next },
    lastKey: exercise.key,
    lastType: exercise.type,
    counter: session.counter + 1,
    reviews: correct ? session.reviews : [...session.reviews, { key: exercise.key, at: session.counter + 1 + REVIEW_GAP }],
    stats: {
      correct: session.stats.correct + (correct ? 1 : 0),
      incorrect: session.stats.incorrect + (correct ? 0 : 1),
    },
  };
}

export function continueAfterFeedback(session, words) {
  if (!session.result?.correct) return { ...session, phase: "reinforce" };
  return advance(session, words);
}

export function wordExample(word) {
  return word.example || null;
}

export function exerciseBlank(word) {
  return blankSentence(word);
}

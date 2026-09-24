import { allWords, getLessonWords, getWordKey, lessonInfo } from "../data";

export const MASTERY_LEVELS = {
  NEW: "new",
  LEARNING: "learning",
  PRACTICED: "practiced",
  MASTERED: "mastered",
};

export const RECOGNITION_TYPES = [
  "flashcard",
  "koreanToUzbek",
  "uzbekToKorean",
  "listeningToKorean",
  "trueFalse",
  "quiz",
];

export const ACTIVE_RECALL_TYPES = [
  "typingChallenge",
  "missingSyllable",
  "listeningToMeaning",
  "sentenceContext",
  "listening",
  "writing",
];

export function getWordMastery(wordKey, wordsState = {}) {
  const record = wordsState[wordKey] || {};
  const knownCount = record.knownCount || 0;
  const wrongCount = record.wrongCount || 0;
  const recentAnswers = record.recentAnswers || [];

  const totalAttempts = knownCount + wrongCount;
  const overallAccuracy = totalAttempts > 0 ? knownCount / totalAttempts : 0;

  const recentCorrect = recentAnswers.filter((a) => a.correct).length;
  const recentTotal = recentAnswers.length;
  const recentAccuracy = recentTotal > 0 ? recentCorrect / recentTotal : overallAccuracy;

  let recentWrongStreak = 0;
  for (let i = recentAnswers.length - 1; i >= 0; i--) {
    if (!recentAnswers[i].correct) recentWrongStreak++;
    else break;
  }

  const exerciseTypeSet = new Set(recentAnswers.map((a) => a.exerciseType));
  const exerciseTypeCount = exerciseTypeSet.size;

  const activeRecallAnswers = recentAnswers.filter((a) =>
    ACTIVE_RECALL_TYPES.includes(a.exerciseType)
  );
  const activeRecallCorrect = activeRecallAnswers.filter((a) => a.correct).length;
  const activeRecallCount = activeRecallAnswers.length;

  let level = MASTERY_LEVELS.NEW;

  if (totalAttempts === 0) {
    level = MASTERY_LEVELS.NEW;
  } else if (
    knownCount >= 8 &&
    activeRecallCount >= 2 &&
    activeRecallCorrect >= 2 &&
    exerciseTypeCount >= 2 &&
    recentAccuracy >= 0.8 &&
    recentWrongStreak <= 1
  ) {
    level = MASTERY_LEVELS.MASTERED;
  } else if (
    knownCount >= 5 &&
    exerciseTypeCount >= 2 &&
    recentAccuracy >= 0.6 &&
    recentWrongStreak <= 2
  ) {
    level = MASTERY_LEVELS.PRACTICED;
  } else if (knownCount >= 2 || (knownCount >= 1 && wrongCount <= 2)) {
    level = MASTERY_LEVELS.LEARNING;
  } else {
    level = MASTERY_LEVELS.NEW;
  }

  let score = 0;
  switch (level) {
    case MASTERY_LEVELS.MASTERED:
      score = 90 + Math.min(10, activeRecallCount * 2 + Math.round(recentAccuracy / 10));
      break;
    case MASTERY_LEVELS.PRACTICED:
      score = Math.min(
        89,
        60 + knownCount * 2 + exerciseTypeCount * 3 + Math.round(recentAccuracy / 5)
      );
      break;
    case MASTERY_LEVELS.LEARNING:
      score = Math.min(59, 20 + knownCount * 5 + exerciseTypeCount * 2);
      break;
    case MASTERY_LEVELS.NEW:
      score = Math.max(0, Math.min(19, knownCount * 10 - wrongCount * 3));
      break;
  }

  score = Math.min(100, Math.max(0, Math.round(score)));

  const progressToNextLevel = computeProgressToNext(level, {
    knownCount,
    wrongCount,
    exerciseTypeCount,
    recentAccuracy,
    activeRecallCount,
    activeRecallCorrect,
  });

  return {
    level,
    score,
    knownCount,
    wrongCount,
    totalAttempts,
    overallAccuracy: Math.round(overallAccuracy * 100),
    recentAccuracy: Math.round(recentAccuracy * 100),
    activeRecallAccuracy:
      activeRecallCount > 0
        ? Math.round((activeRecallCorrect / activeRecallCount) * 100)
        : null,
    exerciseTypeCount,
    activeRecallCount,
    recentWrongStreak,
    progressToNextLevel,
  };
}

function computeProgressToNext(level, stats) {
  const { knownCount, exerciseTypeCount, recentAccuracy, activeRecallCount, activeRecallCorrect } = stats;

  if (level === MASTERY_LEVELS.MASTERED) {
    return { current: 100, target: 100, percent: 100 };
  }

  if (level === MASTERY_LEVELS.NEW) {
    const current = Math.max(0, knownCount * 10 - (stats.wrongCount || 0) * 3);
    const target = 20;
    return { current: Math.min(current, 19), target, percent: Math.min(100, Math.round((current / target) * 100)) };
  }

  if (level === MASTERY_LEVELS.LEARNING) {
    const current = 20 + knownCount * 5 + exerciseTypeCount * 2;
    const target = 60;
    return { current: Math.min(current, 59), target, percent: Math.min(100, Math.round((current / target) * 100)) };
  }

  if (level === MASTERY_LEVELS.PRACTICED) {
    const needsActiveRecall = activeRecallCount < 2 || activeRecallCorrect < 2;
    const needsRecentPerformance = recentAccuracy < 0.8;
    const needsConsistency = stats.recentWrongStreak > 1;
    const needsCount = knownCount < 8;

    let blockers = 0;
    if (needsActiveRecall) blockers++;
    if (needsRecentPerformance) blockers++;
    if (needsConsistency) blockers++;
    if (needsCount) blockers++;

    const current = 60 + knownCount * 2 + exerciseTypeCount * 3 + Math.round(recentAccuracy / 5);
    const target = 90;
    const percent = blockers === 0 ? Math.min(100, Math.round((current / target) * 100)) : Math.max(0, 100 - blockers * 15);

    return { current: Math.min(current, 89), target, percent, blockers };
  }

  return { current: 0, target: 100, percent: 0 };
}

export function getLessonMastery(lessonId, wordsState) {
  const words = getLessonWords(lessonId);
  if (!words.length) return { mastered: 0, total: 0, percent: 0, breakdown: {} };

  const breakdown = {};
  let mastered = 0;

  words.forEach((word) => {
    const key = getWordKey(word);
    const mastery = getWordMastery(key, wordsState);
    breakdown[key] = mastery;
    if (mastery.level === MASTERY_LEVELS.MASTERED) mastered++;
  });

  return {
    mastered,
    total: words.length,
    percent: Math.round((mastered / words.length) * 100),
    breakdown,
  };
}

export function getCourseMastery(courseId, wordsState) {
  const courseLessons = lessonInfo.filter((l) => l.course === courseId);
  if (!courseLessons.length) return { mastered: 0, total: 0, percent: 0 };

  let mastered = 0;
  let total = 0;

  courseLessons.forEach((lesson) => {
    total += lesson.words.length;
    lesson.words.forEach((word) => {
      const mastery = getWordMastery(getWordKey(word), wordsState);
      if (mastery.level === MASTERY_LEVELS.MASTERED) mastered++;
    });
  });

  return { mastered, total, percent: Math.round((mastered / total) * 100) };
}

export function getMasteryOverview(wordsState) {
  const breakdown = { [MASTERY_LEVELS.NEW]: 0, [MASTERY_LEVELS.LEARNING]: 0, [MASTERY_LEVELS.PRACTICED]: 0, [MASTERY_LEVELS.MASTERED]: 0 };

  allWords.forEach((word) => {
    const mastery = getWordMastery(getWordKey(word), wordsState);
    breakdown[mastery.level]++;
  });

  const total = allWords.length;
  const mastered = breakdown[MASTERY_LEVELS.MASTERED];
  const overallPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return { ...breakdown, total, mastered, overallPercent };
}

export function selectWordMastery(state, wordKey) {
  return getWordMastery(wordKey, state.progress.words);
}

export function selectLessonMastery(state, lessonId) {
  return getLessonMastery(lessonId, state.progress.words);
}

export function selectCourseMastery(state, courseId) {
  return getCourseMastery(courseId, state.progress.words);
}

export function selectMasteryOverview(state) {
  return getMasteryOverview(state.progress.words);
}

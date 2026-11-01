export const SRS_RATINGS = {
  AGAIN: "again",
  HARD: "hard",
  GOOD: "good",
  EASY: "easy",
};

const DEFAULT_SRS = {
  interval: 0,
  repetitions: 0,
  easinessFactor: 2.5,
  nextReviewAt: Date.now(),
  lastReviewedAt: null,
};

export function getSRSRecord(wordState = {}) {
  return {
    interval: wordState.interval ?? DEFAULT_SRS.interval,
    repetitions: wordState.repetitions ?? DEFAULT_SRS.repetitions,
    easinessFactor: wordState.easinessFactor ?? DEFAULT_SRS.easinessFactor,
    nextReviewAt: wordState.nextReviewAt ?? DEFAULT_SRS.nextReviewAt,
    lastReviewedAt: wordState.lastReviewedAt ?? DEFAULT_SRS.lastReviewedAt,
  };
}

export function calculateNextReview(record, rating) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let { interval, repetitions, easinessFactor } = record;

  if (rating === SRS_RATINGS.AGAIN) {
    repetitions = 0;
    interval = 1;
    easinessFactor = Math.max(1.3, easinessFactor - 0.2);
  } else if (rating === SRS_RATINGS.HARD) {
    repetitions += 1;
    interval = Math.max(1, Math.round(interval * 1.2));
    easinessFactor = Math.max(1.3, easinessFactor - 0.15);
  } else if (rating === SRS_RATINGS.GOOD) {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
  } else if (rating === SRS_RATINGS.EASY) {
    repetitions += 1;
    interval = Math.round(interval * easinessFactor * 1.3);
    interval = Math.max(interval, 1);
    easinessFactor = Math.min(3.0, easinessFactor + 0.15);
  }

  interval = Math.min(interval, 365);

  const nextReviewAt = now + interval * dayMs;

  return {
    interval,
    repetitions,
    easinessFactor,
    nextReviewAt,
    lastReviewedAt: now,
  };
}

export function isDue(wordState = {}) {
  const srs = getSRSRecord(wordState);
  return srs.nextReviewAt <= Date.now();
}

// Words due for review, most overdue first. `limit` caps one session.
export function getDueWords(allWords, wordsState = {}, limit = Infinity) {
  return allWords
    .filter((word) => {
      const record = wordsState[`${word.lesson}-${word.id}`];
      return record ? isDue(record) : false;
    })
    .sort((a, b) => getSRSRecord(wordsState[`${a.lesson}-${a.id}`]).nextReviewAt - getSRSRecord(wordsState[`${b.lesson}-${b.id}`]).nextReviewAt)
    .slice(0, limit);
}

// How many known words are due (records for words no longer in the course are ignored).
export function getReviewCount(wordsState = {}, allWords = null) {
  if (allWords) return getDueWords(allWords, wordsState).length;
  return Object.values(wordsState).filter((record) => isDue(record)).length;
}

// Moves a word through the schedule after a practice answer. A miss always
// brings it back tomorrow; a correct answer only advances it when it was new
// or due, so answering a word several times in one session doesn't jump it
// days ahead.
export function applyPracticeAnswer(record, correct, now = Date.now()) {
  if (correct && record.nextReviewAt && record.nextReviewAt > now) return record;
  const next = calculateNextReview(getSRSRecord(record), correct ? SRS_RATINGS.GOOD : SRS_RATINGS.AGAIN);
  return { ...record, ...next };
}

export function getNextReviewLabel(wordState = {}) {
  const srs = getSRSRecord(wordState);
  if (srs.nextReviewAt <= Date.now()) return null;
  const diffMs = srs.nextReviewAt - Date.now();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 1) return "1 day";
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} weeks`;
  return `${Math.round(diffDays / 30)} months`;
}

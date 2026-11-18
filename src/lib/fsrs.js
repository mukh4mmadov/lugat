// FSRS-5, the scheduler Anki uses (Free Spaced Repetition Scheduler), with
// Anki's learning and relearning steps around it.
//
// A card's memory has a stability S (days until recall drops to 90%) and a
// difficulty D (1-10). Each answer updates both; the next interval is the time
// at which recall is predicted to fall to the learner's desired retention.
// Parameters are FSRS-5's published defaults.

export const RATING = { again: 1, hard: 2, good: 3, easy: 4 };
export const STATE = { new: 0, learning: 1, review: 2, relearning: 3 };

const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
const DECAY = -0.5;
const FACTOR = 19 / 81;
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round2 = (value) => Math.round(value * 100) / 100;

// Probability of recalling a card `elapsedDays` after its last review.
export function retrievability(elapsedDays, stability) {
  if (!stability) return 0;
  return (1 + (FACTOR * Math.max(0, elapsedDays)) / stability) ** DECAY;
}

function initStability(rating) {
  return Math.max(W[rating - 1], 0.1);
}

function initDifficulty(rating) {
  return clamp(W[4] - Math.exp(W[5] * (rating - 1)) + 1, 1, 10);
}

function nextDifficulty(difficulty, rating) {
  const delta = -W[6] * (rating - 3);
  const damped = difficulty + (delta * (10 - difficulty)) / 9;
  return clamp(W[7] * initDifficulty(RATING.easy) + (1 - W[7]) * damped, 1, 10);
}

function recallStability(difficulty, stability, recall, rating) {
  const hardPenalty = rating === RATING.hard ? W[15] : 1;
  const easyBonus = rating === RATING.easy ? W[16] : 1;
  return stability * (1 + Math.exp(W[8]) * (11 - difficulty) * stability ** -W[9] * (Math.exp(W[10] * (1 - recall)) - 1) * hardPenalty * easyBonus);
}

function forgetStability(difficulty, stability, recall) {
  const next = W[11] * difficulty ** -W[12] * ((stability + 1) ** W[13] - 1) * Math.exp(W[14] * (1 - recall));
  return Math.min(next, stability / Math.exp(W[17] * W[18]));
}

// A review on the same day (a learning step) changes stability only a little.
function shortTermStability(stability, rating) {
  return stability * Math.exp(W[17] * (rating - 3 + W[18]));
}

// Days until recall falls to `retention`.
export function intervalFor(stability, retention, maxInterval) {
  const days = (stability / FACTOR) * (retention ** (1 / DECAY) - 1);
  return clamp(Math.round(days), 1, maxInterval);
}

// The new memory state after an answer, given the time since the last one.
function nextMemory(card, rating, now) {
  if (!card.stability) return { stability: initStability(rating), difficulty: initDifficulty(rating) };
  const elapsed = card.last ? (now - card.last) / DAY : 0;
  const recall = retrievability(elapsed, card.stability);
  const difficulty = nextDifficulty(card.difficulty, rating);
  let stability;
  if (elapsed < 1) stability = shortTermStability(card.stability, rating);
  else if (rating === RATING.again) stability = forgetStability(card.difficulty, card.stability, recall);
  else stability = recallStability(card.difficulty, card.stability, recall, rating);
  return { stability: Math.max(0.1, stability), difficulty };
}

// Anki's small random spread on longer intervals, so cards learned together
// don't stay bunched on the same days.
function fuzz(days, random) {
  if (days < 2.5) return days;
  const spread = days < 7 ? 0.15 * days : days < 20 ? 1 + 0.1 * (days - 7) : 2.3 + 0.05 * (days - 20);
  return Math.max(2, Math.round(days - spread + random() * spread * 2));
}

export const DEFAULT_ANKI_SETTINGS = {
  newPerDay: 20,
  reviewsPerDay: 200,
  learningSteps: [1, 10],
  relearningSteps: [10],
  desiredRetention: 0.9,
  maximumInterval: 36500,
  leechThreshold: 8,
  newOrder: "sequential",
  mix: "mixed",
  recognition: true,
  recall: false,
  burySiblings: true,
  dayStartsAt: 4,
  showRomanization: true,
  showExample: true,
  decks: { lessons: true, topik1: false },
};

export function ankiSettings(settings = {}) {
  const saved = settings.anki || {};
  return { ...DEFAULT_ANKI_SETTINGS, ...saved, decks: { ...DEFAULT_ANKI_SETTINGS.decks, ...(saved.decks || {}) } };
}

// The result of answering `card` with `rating` at `now`: the new card and the
// interval to show. Cards are plain objects:
//   { state, due, stability, difficulty, reps, lapses, step, last }
export function schedule(card, rating, options, now = Date.now(), random = Math.random) {
  const current = card || { state: STATE.new, reps: 0, lapses: 0, step: 0 };
  const memory = nextMemory(current, rating, now);
  const next = { ...current, ...memory, reps: (current.reps || 0) + 1, last: now };
  const learning = options.learningSteps.filter((step) => step > 0);
  const relearning = options.relearningSteps.filter((step) => step > 0);
  const toReview = (days) => {
    next.state = STATE.review;
    next.step = 0;
    next.interval = days;
    next.due = now + days * DAY;
  };
  const toStep = (state, minutes, step) => {
    next.state = state;
    next.step = step;
    next.interval = 0;
    next.due = now + minutes * MINUTE;
  };
  const interval = (stability) => intervalFor(stability, options.desiredRetention, options.maximumInterval);

  if (current.state === STATE.new || current.state === STATE.learning || current.state === STATE.relearning) {
    const relearn = current.state === STATE.relearning;
    const steps = relearn ? relearning : learning;
    const state = relearn ? STATE.relearning : STATE.learning;
    const step = current.state === STATE.new ? 0 : current.step || 0;
    if (!steps.length || rating === RATING.easy) {
      // Easy always graduates, at least a day past what Good would give.
      const good = interval(nextMemory(current, RATING.good, now).stability);
      toReview(rating === RATING.easy ? Math.max(interval(next.stability), good + 1) : interval(next.stability));
    } else if (rating === RATING.again) {
      toStep(state, steps[0], 0);
    } else if (rating === RATING.hard) {
      // Anki: the first step's Hard waits between the first and second step.
      const wait = step === 0 && steps.length > 1 ? (steps[0] + steps[1]) / 2 : step === 0 ? Math.min(steps[0] * 1.5, steps[0] + 1440) : steps[step];
      toStep(state, wait, step);
    } else if (step + 1 < steps.length) {
      toStep(state, steps[step + 1], step + 1);
    } else {
      toReview(interval(next.stability));
    }
  } else if (rating === RATING.again) {
    next.lapses = (current.lapses || 0) + 1;
    if (relearning.length) toStep(STATE.relearning, relearning[0], 0);
    else toReview(interval(next.stability));
  } else {
    // A review: Hard < Good < Easy, each at least a day apart.
    const hard = interval(nextMemory(current, RATING.hard, now).stability);
    const good = Math.max(interval(nextMemory(current, RATING.good, now).stability), hard + 1);
    const easy = Math.max(interval(nextMemory(current, RATING.easy, now).stability), good + 1);
    const days = rating === RATING.hard ? hard : rating === RATING.good ? good : easy;
    toReview(Math.min(options.maximumInterval, fuzz(days, random)));
  }
  next.stability = round2(next.stability);
  next.difficulty = round2(next.difficulty);
  return next;
}

// What each button would do, for the labels under them.
export function previewIntervals(card, options, now = Date.now()) {
  const steady = () => 0.5;
  return Object.fromEntries(
    Object.entries(RATING).map(([name, rating]) => {
      const next = schedule(card, rating, options, now, steady);
      return [name, next.due - now];
    }),
  );
}

// "45s", "10m", "3h", "4d", "2.1mo", "1.3y" — Anki's style.
export function formatInterval(ms, t) {
  const minutes = ms / MINUTE;
  if (minutes < 1) return t("anki.unit.lessMinute");
  if (minutes < 60) return t("anki.unit.minutes", { count: Math.round(minutes) });
  const hours = minutes / 60;
  if (hours < 24) return t("anki.unit.hours", { count: Math.round(hours) });
  const days = hours / 24;
  if (days < 30) return t("anki.unit.days", { count: Math.round(days) });
  if (days < 365) return t("anki.unit.months", { count: Math.round((days / 30) * 10) / 10 });
  return t("anki.unit.years", { count: Math.round((days / 365) * 10) / 10 });
}

// Cards are saved compactly in the account's progress:
//   [state, due (minutes since epoch), stability, difficulty, reps, lapses, step, last (minutes)]
export function packCard(card) {
  return [card.state, Math.round(card.due / MINUTE), card.stability || 0, card.difficulty || 0, card.reps || 0, card.lapses || 0, card.step || 0, card.last ? Math.round(card.last / MINUTE) : 0];
}

export function unpackCard(packed) {
  if (!Array.isArray(packed)) return null;
  const [state, due, stability, difficulty, reps, lapses, step, last] = packed;
  return { state, due: due * MINUTE, stability, difficulty, reps, lapses, step, last: last ? last * MINUTE : 0 };
}

// A word scheduled by the old SM-2 system becomes a review card with a
// comparable memory, so nobody's review history is lost.
export function cardFromLegacy(record) {
  if (!record || !record.nextReviewAt || !(record.repetitions || record.lastReviewedAt)) return null;
  const interval = Math.max(1, record.interval || 1);
  const ease = record.easinessFactor || 2.5;
  return {
    state: STATE.review,
    due: record.nextReviewAt,
    stability: interval,
    difficulty: round2(clamp(11 - ((ease - 1.3) / 1.7) * 9, 1, 10)),
    reps: record.repetitions || 1,
    lapses: 0,
    step: 0,
    last: record.lastReviewedAt || record.nextReviewAt - interval * DAY,
  };
}

// Anki's day rolls over at a set hour (4 AM by default), not at midnight.
export function ankiDay(now = Date.now(), startsAt = 4) {
  const date = new Date(now - startsAt * 60 * MINUTE);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// The end of the current Anki day: learning cards due before it count as today.
export function dayCutoff(now = Date.now(), startsAt = 4) {
  const date = new Date(now - startsAt * 60 * MINUTE);
  date.setHours(24, 0, 0, 0);
  return date.getTime() + startsAt * 60 * MINUTE;
}

// "1m 10m 1h 2d" ⇄ minutes.
const UNITS = { s: 1 / 60, m: 1, h: 60, d: 1440 };

export function parseSteps(text) {
  const steps = [];
  for (const part of String(text).trim().split(/[\s,]+/).filter(Boolean)) {
    const match = part.match(/^(\d+(?:\.\d+)?)([smhd]?)$/i);
    if (!match) return null;
    const minutes = Number(match[1]) * UNITS[(match[2] || "m").toLowerCase()];
    if (!(minutes > 0) || minutes > 1440 * 30) return null;
    steps.push(Math.round(minutes * 100) / 100);
  }
  return steps;
}

export function formatSteps(steps) {
  return steps
    .map((minutes) => {
      if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440}d`;
      if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}h`;
      if (minutes < 1) return `${Math.round(minutes * 60)}s`;
      return `${minutes}m`;
    })
    .join(" ");
}

export { DAY, MINUTE };


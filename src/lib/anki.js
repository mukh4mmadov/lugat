import { getWordKey } from "../data";
import { STATE, ankiDay, cardFromLegacy, dayCutoff, unpackCard } from "./fsrs";

export const RECALL_SUFFIX = "~r";
const LEARN_AHEAD_MS = 20 * 60 * 1000;

export const wordKeyOf = (cardId) => (cardId.endsWith(RECALL_SUFFIX) ? cardId.slice(0, -RECALL_SUFFIX.length) : cardId);
export const isRecallCard = (cardId) => cardId.endsWith(RECALL_SUFFIX);

export function readCard(progress, cardId) {
  const packed = progress.cards?.[cardId];
  if (packed) return unpackCard(packed);
  if (isRecallCard(cardId)) return null;
  return cardFromLegacy(progress.words?.[cardId]);
}

export function cardIdsFor(words, options) {
  const ids = [];
  for (const word of words) {
    const key = getWordKey(word);
    if (options.recognition || !options.recall) ids.push(key);
    if (options.recall) ids.push(key + RECALL_SUFFIX);
  }
  return ids;
}

export function todayCounts(progress, options, now = Date.now()) {
  const day = ankiDay(now, options.dayStartsAt);
  return { day, ...(progress.ankiDays?.[day] || {}) };
}

export function buildPool(progress, words, options, { now = Date.now(), cram = false } = {}) {
  const cutoff = dayCutoff(now, options.dayStartsAt);
  const day = ankiDay(now, options.dayStartsAt);
  const answeredToday = (card) => card?.last && ankiDay(card.last, options.dayStartsAt) === day;
  const learning = [];
  const review = [];
  const fresh = [];
  const seen = new Set();
  const ids = cardIdsFor(words, options);
  const wordsWithActivity = new Set();
  for (const id of ids) {
    const card = readCard(progress, id);
    if (card && answeredToday(card)) wordsWithActivity.add(wordKeyOf(id));
  }
  for (const id of ids) {
    if (seen.has(id) || progress.suspended?.[wordKeyOf(id)]) continue;
    seen.add(id);
    const card = readCard(progress, id);
    if (!card || card.state === STATE.new) {
      if (options.burySiblings && wordsWithActivity.has(wordKeyOf(id))) continue;
      fresh.push(id);
    } else if (card.state === STATE.learning || card.state === STATE.relearning) {
      if (card.due < cutoff || cram) learning.push({ id, due: card.due });
    } else if (cram || card.due < cutoff) {
      if (options.burySiblings && !cram && !answeredToday(card) && wordsWithActivity.has(wordKeyOf(id))) continue;
      review.push({ id, due: card.due });
    }
  }
  learning.sort((a, b) => a.due - b.due);
  review.sort((a, b) => a.due - b.due);
  if (options.newOrder === "random") {
    for (let index = fresh.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [fresh[index], fresh[swap]] = [fresh[swap], fresh[index]];
    }
  }
  return { learning, review: review.map((item) => item.id), fresh };
}

export function remainingCounts(pool, progress, options, { now = Date.now(), unlimitedNew = false, cram = false } = {}) {
  const today = todayCounts(progress, options, now);
  const newLeft = unlimitedNew || cram ? pool.fresh.length : Math.max(0, Math.min(pool.fresh.length, options.newPerDay + (today.newExtra || 0) - (today.new || 0)));
  const reviewLeft = cram ? pool.review.length : Math.max(0, Math.min(pool.review.length, options.reviewsPerDay - (today.review || 0)));
  return { new: newLeft, learning: pool.learning.length, review: reviewLeft };
}

export function pickNext(pool, counts, options, { now = Date.now(), lastId = null, answeredInSession = 0 } = {}) {
  const dueLearning = pool.learning.filter((item) => item.due <= now && item.id !== lastId);
  if (dueLearning.length) return { id: dueLearning[0].id };
  const reviewReady = counts.review > 0 ? pool.review.find((id) => id !== lastId) : null;
  const newReady = counts.new > 0 ? pool.fresh.find((id) => id !== lastId) : null;
  if (reviewReady || newReady) {
    if (!newReady) return { id: reviewReady };
    if (!reviewReady) return { id: newReady };
    if (options.mix === "reviewsFirst") return { id: reviewReady };
    if (options.mix === "newFirst") return { id: newReady };
    const total = counts.review + counts.new;
    const step = answeredInSession % total;
    const showNew = Math.floor(((step + 1) * counts.new) / total) > Math.floor((step * counts.new) / total);
    return { id: showNew ? newReady : reviewReady };
  }
  const soon = pool.learning.filter((item) => item.due <= now + LEARN_AHEAD_MS);
  if (soon.length) return { id: (soon.find((item) => item.id !== lastId) || soon[0]).id };
  if (pool.learning.length) return { id: null, waitUntil: pool.learning[0].due };
  return { id: null };
}

export function forecast(progress, words, options, days = 7, now = Date.now()) {
  const counts = Array.from({ length: days }, () => 0);
  const start = dayCutoff(now, options.dayStartsAt) - 24 * 60 * 60 * 1000;
  for (const id of cardIdsFor(words, options)) {
    const card = readCard(progress, id);
    if (!card || card.state === STATE.new) continue;
    const index = Math.max(0, Math.floor((card.due - start) / (24 * 60 * 60 * 1000)));
    if (index < days) counts[index] += 1;
  }
  return counts;
}

export function deckBreakdown(progress, words, options) {
  const result = { total: 0, new: 0, learning: 0, young: 0, mature: 0 };
  for (const id of cardIdsFor(words, options)) {
    const card = readCard(progress, id);
    result.total += 1;
    if (!card || card.state === STATE.new) result.new += 1;
    else if (card.state === STATE.learning || card.state === STATE.relearning) result.learning += 1;
    else if ((card.stability || 0) >= 21) result.mature += 1;
    else result.young += 1;
  }
  return result;
}

export function dueCardCount(progress, options, now = Date.now()) {
  const cutoff = dayCutoff(now, options.dayStartsAt);
  let count = 0;
  const seen = new Set();
  for (const id of Object.keys(progress.cards || {})) {
    seen.add(id);
    const card = readCard(progress, id);
    if (card && card.state !== STATE.new && card.due < cutoff) count += 1;
  }
  for (const key of Object.keys(progress.words || {})) {
    if (seen.has(key)) continue;
    const card = readCard(progress, key);
    if (card && card.state !== STATE.new && card.due < cutoff) count += 1;
  }
  return count;
}

export const INTERVAL_BANDS = [1, 7, 21, 90, Infinity];
export function cardStats(progress, options, days = 7, now = Date.now()) {
  const due = Array.from({ length: days }, () => 0);
  const bands = INTERVAL_BANDS.map(() => 0);
  const start = dayCutoff(now, options.dayStartsAt) - 24 * 60 * 60 * 1000;
  let total = 0;
  for (const id of Object.keys(progress.cards || {})) {
    const card = readCard(progress, id);
    if (!card || card.state === STATE.new) continue;
    total += 1;
    const index = Math.max(0, Math.floor((card.due - start) / (24 * 60 * 60 * 1000)));
    if (index < days) due[index] += 1;
    bands[INTERVAL_BANDS.findIndex((limit) => (card.stability || 0) < limit)] += 1;
  }
  return { total, due, bands };
}

import { getTopikVariant, scoreTopikAttempt } from "../data/topik/exams";

// TOPIK attempts live on this device so tests work without an account or backend.
const STORAGE_KEY = "k-talim:topik-attempts:v1";
const MAX_SUBMITTED = 50;

function readAll() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((attempt) => attempt && attempt.id && getTopikVariant(attempt.variantId)) : [];
  } catch {
    return [];
  }
}

function writeAll(attempts) {
  const inProgress = attempts.filter((attempt) => attempt.status === "in_progress");
  const submitted = attempts
    .filter((attempt) => attempt.status === "submitted")
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, MAX_SUBMITTED);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...inProgress, ...submitted]));
    window.dispatchEvent(new Event("topik-attempts-changed"));
    return true;
  } catch {
    return false;
  }
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function listTopikAttempts() {
  return readAll().sort((a, b) => (b.submittedAt || b.startedAt) - (a.submittedAt || a.startedAt));
}

export function getTopikAttempt(attemptId) {
  return readAll().find((attempt) => attempt.id === attemptId) || null;
}

export function findActiveAttempt(variantId) {
  return readAll().find((attempt) => attempt.variantId === variantId && attempt.status === "in_progress") || null;
}

export function createTopikAttempt(variantId) {
  const existing = findActiveAttempt(variantId);
  if (existing) return existing;
  const attempt = {
    id: makeId(),
    variantId,
    status: "in_progress",
    startedAt: Date.now(),
    submittedAt: null,
    elapsedSeconds: 0,
    answers: {},
    flagged: {},
    cursor: 0,
    audioTime: 0,
    result: null,
  };
  writeAll([...readAll(), attempt]);
  return attempt;
}

export function updateTopikAttempt(attemptId, patch) {
  const attempts = readAll();
  const index = attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index === -1 || attempts[index].status !== "in_progress") return null;
  attempts[index] = { ...attempts[index], ...patch };
  return writeAll(attempts) ? attempts[index] : null;
}

export function submitTopikAttempt(attemptId) {
  const attempts = readAll();
  const index = attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index === -1) return null;
  const attempt = attempts[index];
  if (attempt.status === "submitted") return attempt;
  const variant = getTopikVariant(attempt.variantId);
  const submittedAt = Date.now();
  const elapsed = Math.floor((submittedAt - attempt.startedAt) / 1000);
  attempts[index] = {
    ...attempt,
    status: "submitted",
    submittedAt,
    elapsedSeconds: variant.durationSeconds ? Math.min(elapsed, variant.durationSeconds) : elapsed,
    result: scoreTopikAttempt(variant, attempt.answers),
  };
  writeAll(attempts);
  return attempts[index];
}

export function deleteTopikAttempt(attemptId) {
  writeAll(readAll().filter((attempt) => attempt.id !== attemptId));
}

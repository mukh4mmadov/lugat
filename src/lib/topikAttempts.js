import { getTopikVariant, scoreTopikAttempt } from "../data/topik/exams";
import { supabase, timeoutSignal } from "./supabase";

// TOPIK attempts are kept in the account (user_topik_attempts), so they are
// on every device and can always be found later. This device keeps a copy so
// the exam works offline and without an account; changes go up a few seconds
// later. A guest's attempts move into the account on sign-in.
const STORAGE_KEY = "k-talim:topik-attempts:v1";
const OWNER_KEY = "k-talim:topik-attempts-owner";
const MAX_LOCAL_SUBMITTED = 50;
const UPLOAD_DELAY = 3000;

let syncUserId = null;
const pending = new Set();
let uploadTimer = null;

function readAll() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((attempt) => attempt && attempt.id && getTopikVariant(attempt.variantId)) : [];
  } catch {
    return [];
  }
}

function writeAll(attempts, changedIds = []) {
  const inProgress = attempts.filter((attempt) => attempt.status === "in_progress");
  const submitted = attempts
    .filter((attempt) => attempt.status === "submitted")
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, MAX_LOCAL_SUBMITTED);
  changedIds.forEach((id) => pending.add(id));
  if (changedIds.length) scheduleUpload();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...inProgress, ...submitted]));
    window.dispatchEvent(new Event("topik-attempts-changed"));
    return true;
  } catch {
    return false;
  }
}

function toRow(attempt, userId) {
  const { id, variantId, status, startedAt, submittedAt, elapsedSeconds, answers, result, aiReview, hidden, ...state } = attempt;
  return {
    id,
    user_id: userId,
    variant_id: variantId,
    status,
    started_at: startedAt || null,
    submitted_at: submittedAt || null,
    elapsed_seconds: elapsedSeconds ?? null,
    answers: answers || {},
    result: result || null,
    review: aiReview || null,
    state,
    hidden: Boolean(hidden),
  };
}

function fromRow(row) {
  return {
    ...(row.state || {}),
    id: row.id,
    variantId: row.variant_id,
    status: row.status,
    startedAt: Number(row.started_at) || 0,
    submittedAt: row.submitted_at ? Number(row.submitted_at) : null,
    elapsedSeconds: row.elapsed_seconds ?? 0,
    answers: row.answers || {},
    result: row.result || null,
    aiReview: row.review || undefined,
    hidden: Boolean(row.hidden),
  };
}

function scheduleUpload() {
  if (!syncUserId) return;
  if (uploadTimer) clearTimeout(uploadTimer);
  uploadTimer = setTimeout(flushTopikAttempts, UPLOAD_DELAY);
}

export async function flushTopikAttempts() {
  if (uploadTimer) clearTimeout(uploadTimer);
  uploadTimer = null;
  const userId = syncUserId;
  if (!userId || !pending.size) return;
  const ids = [...pending];
  pending.clear();
  const byId = new Map(readAll().map((attempt) => [attempt.id, attempt]));
  const rows = ids.map((id) => byId.get(id)).filter(Boolean).map((attempt) => toRow(attempt, userId));
  if (!rows.length) return;
  const { error } = await supabase.from("user_topik_attempts").upsert(rows);
  if (error) {
    // Offline or the request failed: try again with the next change or sign-in.
    ids.forEach((id) => pending.add(id));
    console.error("Error saving TOPIK attempts:", error);
  }
}

function progressScore(attempt) {
  return (attempt.elapsedSeconds || 0) + Object.keys(attempt.answers || {}).length + Object.keys(attempt.timeSpent || {}).length;
}

// Which copy of one attempt to keep when this device and the account differ.
function pickNewer(mine, theirs) {
  if (theirs.status === "submitted" && mine.status !== "submitted") return theirs;
  if (mine.status === "submitted" && theirs.status !== "submitted") return mine;
  const base = mine.status === "in_progress" && progressScore(mine) > progressScore(theirs) ? mine : theirs;
  return {
    ...base,
    hidden: Boolean(mine.hidden || theirs.hidden),
    aiReview: { ...(theirs.aiReview || {}), ...(mine.aiReview || {}) },
  };
}

// Called on sign-in: brings the account's attempts to this device and sends up
// the ones made here (as a guest, offline, or before the last upload).
export async function syncTopikAttempts(userId) {
  syncUserId = userId;
  const { data, error } = await supabase
    .from("user_topik_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(200)
    .abortSignal(timeoutSignal());
  if (error) {
    console.error("Error loading TOPIK attempts:", error);
    return;
  }
  const owner = window.localStorage.getItem(OWNER_KEY);
  // Attempts left on this device by another account are never mixed in.
  const local = !owner || owner === userId ? readAll() : [];
  const merged = new Map(data.map((row) => [row.id, fromRow(row)]));
  const upload = [];
  for (const mine of local) {
    const theirs = merged.get(mine.id);
    const kept = theirs ? pickNewer(mine, theirs) : mine;
    if (!theirs || JSON.stringify(kept) !== JSON.stringify(theirs)) upload.push(mine.id);
    merged.set(mine.id, kept);
  }
  window.localStorage.setItem(OWNER_KEY, userId);
  writeAll([...merged.values()], upload);
  await flushTopikAttempts();
}

// Called on sign-out: the next person on this device starts with none.
export async function stopTopikSync() {
  await flushTopikAttempts();
  syncUserId = null;
  pending.clear();
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(OWNER_KEY);
    window.dispatchEvent(new Event("topik-attempts-changed"));
  } catch {
    // Ignore storage errors.
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => flushTopikAttempts());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushTopikAttempts();
  });
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function visible() {
  return readAll().filter((attempt) => !attempt.hidden);
}

export function listTopikAttempts() {
  return visible().sort((a, b) => (b.submittedAt || b.startedAt) - (a.submittedAt || a.startedAt));
}

export function getTopikAttempt(attemptId) {
  return visible().find((attempt) => attempt.id === attemptId) || null;
}

export function findActiveAttempt(variantId) {
  return visible().find((attempt) => attempt.variantId === variantId && attempt.status === "in_progress") || null;
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
    timeSpent: {},
    result: null,
  };
  writeAll([...readAll(), attempt], [attempt.id]);
  return attempt;
}

export function updateTopikAttempt(attemptId, patch) {
  const attempts = readAll();
  const index = attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index === -1 || attempts[index].status !== "in_progress") return null;
  attempts[index] = { ...attempts[index], ...patch };
  return writeAll(attempts, [attemptId]) ? attempts[index] : null;
}

// Answers are locked once submitted; only AI explanations are added later.
export function saveTopikReview(attemptId, explanations) {
  const attempts = readAll();
  const index = attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index === -1 || attempts[index].status !== "submitted") return null;
  attempts[index] = { ...attempts[index], aiReview: { ...(attempts[index].aiReview || {}), ...explanations } };
  return writeAll(attempts, [attemptId]) ? attempts[index] : null;
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
  writeAll(attempts, [attemptId]);
  // A finished exam goes up straight away.
  flushTopikAttempts();
  return attempts[index];
}

// Deleting only hides the attempt from the learner; the account keeps it.
export function deleteTopikAttempt(attemptId) {
  const attempts = readAll().map((attempt) => (attempt.id === attemptId ? { ...attempt, hidden: true } : attempt));
  writeAll(attempts, [attemptId]);
}

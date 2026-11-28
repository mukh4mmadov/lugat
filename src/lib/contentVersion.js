import { useSyncExternalStore } from "react";

const listeners = new Set();
let version = 0;

export function contentChanged() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function watch(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useContentVersion() {
  return useSyncExternalStore(watch, () => version);
}

let lessonsKnown = false;

export const addedLessonsKnown = () => lessonsKnown;

export function markAddedLessonsKnown() {
  if (lessonsKnown) return;
  lessonsKnown = true;
  contentChanged();
}

const DRAFT_KEY = "k-talim:show-drafts";

export function showDrafts() {
  try {
    if (new URLSearchParams(window.location.search).has("draft")) window.sessionStorage.setItem(DRAFT_KEY, "1");
    return window.sessionStorage.getItem(DRAFT_KEY) === "1";
  } catch {
    return false;
  }
}

export const isNewItem = (id) => String(id).startsWith("x-");

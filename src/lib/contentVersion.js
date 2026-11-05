import { useSyncExternalStore } from "react";

// Content added in the admin panel arrives after the first render. App watches
// this, so pages redraw with it, and links to new items work on a first visit.
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

// A tab opened from the studio with ?draft=1 also shows unpublished items.
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

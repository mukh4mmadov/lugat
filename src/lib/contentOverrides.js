import { GRAMMAR, GRAMMAR_COURSES } from "../data/grammar";
import { SPEAKING_TOPICS } from "../data/speakingTopics";
import { STORIES } from "../data/stories";
import { contentChanged, isNewItem, showDrafts } from "./contentVersion";
import { supabase } from "./supabase";

const CACHE_KEY = "k-talim:content-overrides";

// Fields an admin may change for each kind; ids and lessons stay fixed.
export const EDITABLE_FIELDS = {
  story: ["emoji", "title", "words", "lines", "questions"],
  grammar: ["pattern", "title", "explain", "rules", "examples", "mistakes", "quiz"],
  topic: ["emoji", "ko", "uz", "en", "ru", "questions", "words"],
  university: ["en", "site", "region", "tuition", "entranceFee"],
};

// The lists pages read, and a full copy of each so hidden items can return.
const LISTS = {
  story: [STORIES],
  grammar: [GRAMMAR, ...GRAMMAR_COURSES.map((course) => course.points)],
  topic: [SPEAKING_TOPICS],
};
const FULL = Object.fromEntries(Object.entries(LISTS).map(([kind, lists]) => [kind, lists.map((list) => [...list])]));
const originals = new Map();
let current = [];

const keyOf = (kind, id) => `${kind}:${id}`;
const LAST_1A_LESSON = 14;

// Lays admin edits over the built-in content, in place, so every page that
// imported the lists sees them.
export function applyContentOverrides(rows = []) {
  current = rows;
  const byKey = new Map(rows.map((row) => [keyOf(row.kind, row.item_id), row]));
  Object.entries(FULL).forEach(([kind, copies]) => {
    copies[0].forEach((item) => {
      const key = keyOf(kind, item.id);
      if (!originals.has(key)) originals.set(key, structuredClone(item));
      const original = originals.get(key);
      const data = byKey.get(key)?.data || {};
      EDITABLE_FIELDS[kind].forEach((field) => {
        item[field] = data[field] !== undefined ? structuredClone(data[field]) : structuredClone(original[field]);
      });
    });
    // Items added in the panel have ids starting with "x-" and full data of their own.
    const added = rows.filter((row) => row.kind === kind && isNewItem(row.item_id)).map((row) => ({ ...structuredClone(row.data), id: row.item_id }));
    const drafts = showDrafts();
    copies.forEach((copy, index) => {
      // Grammar has one list for everything, then one for each course.
      const extra = kind === "grammar" && index > 0 ? added.filter((item) => (item.lesson <= LAST_1A_LESSON ? index === 1 : index === 2)) : added;
      const visible = [...copy, ...extra].filter((item) => !byKey.get(keyOf(kind, item.id))?.hidden || (drafts && isNewItem(item.id)));
      if (added.length && kind !== "topic") visible.sort((a, b) => (a.lesson || 0) - (b.lesson || 0));
      LISTS[kind][index].splice(0, LISTS[kind][index].length, ...visible);
    });
  });
  contentChanged();
}

// Large lists (the university catalog) join only on the pages that use them.
export function registerContent(kind, list) {
  if (LISTS[kind]) return;
  LISTS[kind] = [list];
  FULL[kind] = [[...list]];
  applyContentOverrides(current);
}

// Every item of a kind, hidden ones included, for the admin editor.
export const allContent = (kind) => FULL[kind][0];
export const originalContent = (kind, id) => originals.get(keyOf(kind, id)) || null;
export const contentOverride = (kind, id) => current.find((row) => row.kind === kind && row.item_id === id) || null;

export async function refreshContentOverrides() {
  const { data, error } = await supabase.from("content_overrides").select("kind, item_id, data, hidden");
  if (error || !data) return null;
  applyContentOverrides(data);
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: the edits still apply for this visit.
  }
  return data;
}

// Pages that show this content import this module, so the last known edits
// apply before their first render; fresh ones load in the background.
try {
  applyContentOverrides(JSON.parse(window.localStorage.getItem(CACHE_KEY) || "[]"));
} catch {
  applyContentOverrides([]);
}
refreshContentOverrides();

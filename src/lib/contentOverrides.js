import { GRAMMAR, GRAMMAR_COURSES } from "../data/grammar";
import { SPEAKING_TOPICS } from "../data/speakingTopics";
import { STORIES } from "../data/stories";
import { supabase } from "./supabase";

const CACHE_KEY = "k-talim:content-overrides";

// Fields an admin may change for each kind; ids and lessons stay fixed.
export const EDITABLE_FIELDS = {
  story: ["emoji", "title", "words", "lines", "questions"],
  grammar: ["pattern", "title", "explain", "rules", "examples", "mistakes", "quiz"],
  topic: ["emoji", "ko", "uz", "en", "ru", "questions", "words"],
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
    copies.forEach((copy, index) => {
      const visible = copy.filter((item) => !byKey.get(keyOf(kind, item.id))?.hidden);
      LISTS[kind][index].splice(0, LISTS[kind][index].length, ...visible);
    });
  });
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

import { applyCustomContent, applyWordOverrides } from "../data";
import { contentChanged, markAddedLessonsKnown, showDrafts } from "./contentVersion";
import { supabase } from "./supabase";

const CACHE_KEY = "k-talim:word-overrides";
const CUSTOM_KEY = "k-talim:custom-words";

const LESSONS_WAIT_MS = 8000;

const FIELDS = "word_key, uzbek, english, russian, romanization, example, needs_review, updated_at";

export const WORDS_REGROUPED_AT = Date.parse("2026-11-21T16:30:00Z");
export const isCurrentOverride = (row) => Date.parse(row?.updated_at || 0) >= WORDS_REGROUPED_AT;

function apply(custom, overrides) {
  applyCustomContent(custom, showDrafts());
  applyWordOverrides(overrides.filter(isCurrentOverride));
  contentChanged();
}

export function initWordOverrides() {
  try {
    const custom = JSON.parse(window.localStorage.getItem(CUSTOM_KEY) || "[]");
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "[]");
    if (custom.length || cached.length) apply(custom, cached);
  } catch {
  }
  window.setTimeout(markAddedLessonsKnown, LESSONS_WAIT_MS);
  refreshWordOverrides().finally(markAddedLessonsKnown);
}

export async function refreshWordOverrides() {
  const [{ data, error }, { data: custom, error: customError }] = await Promise.all([
    supabase.from("word_overrides").select(FIELDS),
    supabase.from("content_overrides").select("kind, item_id, data, hidden").in("kind", ["word", "lesson"]),
  ]);
  if (error || customError || !data || !custom) return null;
  apply(custom, data);
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
  } catch {
  }
  return data;
}

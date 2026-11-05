import { applyCustomContent, applyWordOverrides } from "../data";
import { contentChanged, showDrafts } from "./contentVersion";
import { supabase } from "./supabase";

const CACHE_KEY = "k-talim:word-overrides";
const CUSTOM_KEY = "k-talim:custom-words";

const FIELDS = "word_key, uzbek, english, russian, romanization, example, needs_review";

function apply(custom, overrides) {
  applyCustomContent(custom, showDrafts());
  applyWordOverrides(overrides);
  contentChanged();
}

// Apply the last known corrections right away, then refresh them in the
// background so fixes reach learners on their next screen.
export function initWordOverrides() {
  try {
    const custom = JSON.parse(window.localStorage.getItem(CUSTOM_KEY) || "[]");
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "[]");
    if (custom.length || cached.length) apply(custom, cached);
  } catch {
    // A bad cache only means we wait for the network.
  }
  refreshWordOverrides();
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
    // Storage full or blocked: corrections still apply for this visit.
  }
  return data;
}

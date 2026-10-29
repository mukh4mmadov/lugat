import { applyWordOverrides } from "../data";
import { supabase } from "./supabase";

const CACHE_KEY = "k-talim:word-overrides";

// Apply the last known corrections right away, then refresh them in the
// background so fixes reach learners on their next screen.
export function initWordOverrides() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "[]");
    if (cached.length) applyWordOverrides(cached);
  } catch {
    // A bad cache only means we wait for the network.
  }
  refreshWordOverrides();
}

export async function refreshWordOverrides() {
  const { data, error } = await supabase.from("word_overrides").select("word_key, uzbek, english, russian, romanization, example, needs_review");
  if (error || !data) return null;
  applyWordOverrides(data);
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: corrections still apply for this visit.
  }
  return data;
}

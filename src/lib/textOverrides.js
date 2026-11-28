import { supabase } from "./supabase";
import i18n, { setTextOverrides } from "./i18n";

const CACHE_KEY = "k-talim:text-overrides:v1";

function group(rows) {
  const byLanguage = {};
  for (const row of rows) (byLanguage[row.language] ||= {})[row.key] = row.value;
  return byLanguage;
}

export async function loadTextOverrides() {
  const { data, error } = await supabase.from("text_overrides").select("language, key, value").limit(5000);
  if (error || !data) return;
  const overrides = group(data);
  const fresh = JSON.stringify(overrides);
  let saved = null;
  try {
    saved = localStorage.getItem(CACHE_KEY);
    localStorage.setItem(CACHE_KEY, fresh);
  } catch {
  }
  if (fresh === (saved ?? "{}")) return;
  setTextOverrides(overrides);
  i18n.changeLanguage(i18n.language);
}

export function applyCachedTextOverrides() {
  try {
    setTextOverrides(JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"));
  } catch {
  }
}

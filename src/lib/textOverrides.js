import { supabase } from "./supabase";
import i18n, { setTextOverrides } from "./i18n";

// Interface text changed in the admin panel. The last copy is kept on the
// device, so changed text shows at once; a fresh copy loads after the page.
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
    // The text still applies for this visit.
  }
  if (fresh === (saved ?? "{}")) return;
  setTextOverrides(overrides);
  i18n.changeLanguage(i18n.language);
}

export function applyCachedTextOverrides() {
  try {
    setTextOverrides(JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"));
  } catch {
    // A broken copy is replaced by the next load.
  }
}

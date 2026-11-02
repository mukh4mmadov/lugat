import { supabase } from "./supabase";

// Pronunciations kept in Supabase (word_audio): recordings made on the
// recording page ("human") and checked AI voices ("ai"). The list is cached on
// the device for a few hours, so words play at once without waiting for it.
const CACHE_KEY = "k-talim:voice-map:v1";
const MAX_AGE = 6 * 60 * 60 * 1000;
export const VOICE_MAP_CHANGED = "k-talim:voice-map-changed";

function readCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return saved && typeof saved.map === "object" ? saved : { at: 0, map: {} };
  } catch {
    return { at: 0, map: {} };
  }
}

let cache = typeof localStorage === "undefined" ? { at: 0, map: {} } : readCache();
let loading = null;

export function voiceFor(word) {
  return cache.map[word] || null;
}

export function loadVoiceMap(force = false) {
  if (!force && Date.now() - cache.at < MAX_AGE) return Promise.resolve(cache.map);
  if (loading) return loading;
  loading = supabase
    .from("word_audio")
    .select("word, source, path")
    .range(0, 9999)
    .then(({ data, error }) => {
      loading = null;
      if (error || !data) return cache.map;
      const map = {};
      for (const row of data) map[row.word] = { source: row.source, url: supabase.storage.from("word-audio").getPublicUrl(row.path).data.publicUrl };
      cache = { at: Date.now(), map };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {
        // The list still works for this visit.
      }
      window.dispatchEvent(new Event(VOICE_MAP_CHANGED));
      return map;
    });
  return loading;
}

import { allWords, meaning } from "../data";
import WORD_AUDIO from "../data/wordAudio";
import { supabase } from "./supabase";

// The lesson words that can have a pronunciation, once each.
export function lessonVoiceWords() {
  const seen = new Map();
  for (const word of allWords) {
    const korean = String(word.korean || "").trim();
    if (korean && !seen.has(korean)) seen.set(korean, { korean, meaning: meaning(word) });
  }
  return [...seen.values()];
}

// Stored voices: { word: { source, speaker } }.
export async function storedVoices() {
  const { data } = await supabase.from("word_audio").select("word, source, speaker, path").range(0, 9999);
  return Object.fromEntries((data || []).map((row) => [row.word, row]));
}

// "human" (recorded here), "commons" (Wikimedia), "ai" or "none".
export function voiceStatus(korean, stored) {
  if (stored[korean]?.source === "human") return "human";
  if (WORD_AUDIO[korean]) return "commons";
  if (stored[korean]?.source === "ai") return "ai";
  return "none";
}

// Listening lessons ("audio darslar", beta): MP3s built by
// scripts/lesson-audio/build.mjs and kept in the public topik-assets bucket as
// <id>-<language>-<short|full>.mp3. The teacher speaks the language named
// here; the Korean is the same in every version. Lengths are in seconds.
const BASE = "https://chwnukigxuiggnhvzsuo.supabase.co/storage/v1/object/public/topik-assets/audio-lessons";

// Keyed by topic deck number. Empty since the words were regrouped by topic:
// the earlier recordings followed the old lesson lists.
const LESSON_AUDIO = {};

export const AUDIO_LANGUAGES = ["uz", "en"];

// { [language]: { short?, full? } } with { url, seconds } each, or null.
export function lessonAudio(lesson) {
  const entry = LESSON_AUDIO[Number(lesson)];
  if (!entry) return null;
  const languages = {};
  AUDIO_LANGUAGES.forEach((language) => {
    const versions = {};
    ["short", "full"].forEach((kind) => {
      if (entry[language]?.[kind]) versions[kind] = { url: `${BASE}/${entry.id}-${language}-${kind}.mp3`, seconds: entry[language][kind] };
    });
    if (Object.keys(versions).length) languages[language] = versions;
  });
  return Object.keys(languages).length ? languages : null;
}

// Listening lessons ("audio darslar", beta): MP3s built by
// scripts/lesson-audio/build.mjs and kept in the public topik-assets bucket.
// Only lessons listed here show the player; a version without a length is not
// built yet. Lengths are in seconds.
const BASE = "https://chwnukigxuiggnhvzsuo.supabase.co/storage/v1/object/public/topik-assets/audio-lessons";

const LESSON_AUDIO = {
  1: { id: "l01", short: 356, full: 879 },
};

// { short?, full? } with { url, seconds } each, or null.
export function lessonAudio(lesson) {
  const entry = LESSON_AUDIO[Number(lesson)];
  if (!entry) return null;
  const versions = {};
  ["short", "full"].forEach((kind) => {
    if (entry[kind]) versions[kind] = { url: `${BASE}/${entry.id}-${kind}.mp3`, seconds: entry[kind] };
  });
  return Object.keys(versions).length ? versions : null;
}

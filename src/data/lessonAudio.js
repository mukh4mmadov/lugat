const BASE = "https://chwnukigxuiggnhvzsuo.supabase.co/storage/v1/object/public/topik-assets/audio-lessons";

const LESSON_AUDIO = {
  1: { id: "t01", uz: { full: 1180 }, en: { full: 912 } },
};

export const AUDIO_LANGUAGES = ["uz", "en"];

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

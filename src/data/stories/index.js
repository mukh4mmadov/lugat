import PUBLIC_STORIES from "./public.js";

export const STORIES = PUBLIC_STORIES;

export const getStory = (id) => STORIES.find((story) => story.id === id) || null;
export const storiesForLesson = (lesson) => STORIES.filter((story) => story.lesson === Number(lesson));

export const isPremiumStory = (story) => story.id.endsWith("-b");

export function lineText(line, language) {
  const index = { uz: 1, en: 2, ru: 3 }[language] || 1;
  return line[index] || line[1];
}

const PARTICLES = ["에서는", "에게서", "에서", "에게", "한테", "까지", "부터", "보다", "하고", "으로", "처럼", "이에요", "예요", "은", "는", "이", "가", "을", "를", "에", "도", "와", "과", "로", "의", "만", "요"];

export function wordCandidates(token) {
  const clean = token.replace(/[.,!?“”"'…~]/g, "");
  const candidates = [clean];
  for (const particle of PARTICLES) {
    if (clean.length > particle.length && clean.endsWith(particle)) candidates.push(clean.slice(0, -particle.length));
  }
  return [...new Set(candidates)];
}

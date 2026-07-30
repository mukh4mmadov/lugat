export const cardModes = [
  { value: "korean", label: "Korean → Uzbek" },
  { value: "uzbek", label: "Uzbek → Korean" },
  { value: "random", label: "Random" },
];

export function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function buildStudyDeck(words, progressByWord = {}) {
  const base = shuffle(words);
  const weightedReview = words.flatMap((word) => {
    const state = progressByWord[`${word.lesson}-${word.id}`];
    if (!state) return [];
    if (state.difficulty >= 3) return [word, word];
    if (state.difficulty > state.knownCount) return [word];
    return [];
  });
  return [...base, ...shuffle(weightedReview)];
}

export function pickRandomCardMode() {
  return Math.random() > 0.5 ? "korean" : "uzbek";
}

export function getPrompt(word, mode) {
  return mode === "uzbek" ? word.uzbek : word.korean;
}

export function getAnswer(word, prompt, mode) {
  if (mode === "random") return prompt === word.korean ? word.uzbek : word.korean;
  return mode === "uzbek" ? word.korean : word.uzbek;
}

export function makeHint(answer) {
  const cleaned = answer.trim();
  if (cleaned.length <= 2) return cleaned.slice(0, 1);
  const visible = Math.max(1, Math.ceil(cleaned.length * 0.34));
  return `${cleaned.slice(0, visible)}${"•".repeat(Math.min(8, cleaned.length - visible))}`;
}

export function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .replace(/[’ʻ']/g, "'")
    .replace(/[^\p{L}\p{N}' ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAnswerCorrect(input, expected) {
  const normalizedInput = normalizeAnswer(input);
  const candidates = expected.split("/").map((part) => normalizeAnswer(part));
  return candidates.some((candidate) => candidate && (normalizedInput === candidate || candidate.includes(normalizedInput) || normalizedInput.includes(candidate)));
}

export function dailyKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function minutesBetween(start, end = Date.now()) {
  return Math.max(1, Math.round((end - start) / 60000));
}

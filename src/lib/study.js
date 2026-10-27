export const cardModes = [
  { value: "korean", label: "mode.korean" },
  { value: "uzbek", label: "mode.uzbek" },
  { value: "random", label: "mode.random" },
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

function editDistance(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[b.length];
}

// Accepted forms of an answer such as "AQSh (Amerika)" or "Nima / Nimani":
// the whole text, each "/" alternative, and the text with and without brackets.
export function answerCandidates(expected) {
  const forms = new Set();
  expected.split(/[/;,]/).forEach((part) => {
    const withoutBrackets = part.replace(/\([^)]*\)/g, " ");
    forms.add(part);
    forms.add(withoutBrackets);
    for (const match of part.matchAll(/\(([^)]*)\)/g)) forms.add(match[1]);
  });
  forms.add(expected);
  return [...forms].map(normalizeAnswer).filter(Boolean);
}

// Exact match on any accepted form, allowing one typo in longer Latin answers.
// Korean answers must match exactly, since one jamo changes the word.
export function isAnswerCorrect(input, expected) {
  const normalizedInput = normalizeAnswer(input);
  if (!normalizedInput) return false;
  const isKorean = /[ㄱ-힝]/.test(expected);
  return answerCandidates(expected).some((candidate) => {
    if (normalizedInput === candidate) return true;
    if (isKorean || candidate.length < 5) return false;
    return editDistance(normalizedInput, candidate) <= (candidate.length >= 10 ? 2 : 1);
  });
}

export function dailyKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function minutesBetween(start, end = Date.now()) {
  return Math.max(1, Math.round((end - start) / 60000));
}

import { meaning } from "../data";

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
  return mode === "uzbek" ? meaning(word) : word.korean;
}

export function getAnswer(word, prompt, mode) {
  if (mode === "random") return prompt === word.korean ? meaning(word) : word.korean;
  return mode === "uzbek" ? word.korean : meaning(word);
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

// YYYY-MM-DD in the learner's own time zone, so a study day ends at local midnight.
export function dailyKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function minutesBetween(start, end = Date.now()) {
  return Math.max(1, Math.round((end - start) / 60000));
}

const KIND_PATTERNS = [
  ["counter", /\bcounter\b/i],
  ["number", /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)\b|\(\d+\)/i],
  ["country", /^(germany|usa|england|japan|china|australia|korea|uzbekistan|pakistan|france|asia|europe)\b/i],
  ["time", /\b(today|tomorrow|yesterday|week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|evening|night|noon|dawn|weekend|spring|summer|autumn|winter|a\.m\.|o'clock|minute)\b/i],
  ["place", /\b(store|shop|station|office|school|bank|park|market|room|hospital|library|restaurant|cinema|gym|pool|court|field|stadium|embassy|pharmacy|bakery|house|home|company|museum|palace|island|river|sea|forest|clinic|factory|tower|beach|cafe|coffee shop|tea house|laundromat|ocean|waterfall)\b/i],
];

// A rough word kind so quiz distractors look alike: verbs with verbs, places
// with places. Lesson categories are per lesson, so they can't do this.
export function wordKind(word) {
  if (/[?？]/.test(word.korean) || /[?]/.test(word.english || "")) return "phrase";
  if (/다$/.test(word.korean.trim())) return "verb";
  const english = word.english || "";
  const match = KIND_PATTERNS.find(([, pattern]) => pattern.test(english));
  return match ? match[0] : "noun";
}

// Up to `count` wrong options for `word`: same kind from the same lesson first,
// then the same kind from nearby lessons, then anything from the lesson.
// Meanings and Korean never repeat, so exactly one option is right.
export function pickDistractors(word, lessonWords, allWords, count = 3, meaningOf = meaning) {
  const kind = wordKind(word);
  const near = allWords.filter((item) => Math.abs(item.lesson - word.lesson) <= 4 && item.lesson !== word.lesson);
  const tiers = [
    lessonWords.filter((item) => wordKind(item) === kind),
    near.filter((item) => wordKind(item) === kind),
    lessonWords,
  ];
  const seenMeanings = new Set([meaningOf(word)]);
  const seenKorean = new Set([word.korean]);
  const picked = [];
  for (const tier of tiers) {
    for (const item of shuffle(tier)) {
      if (picked.length >= count) return picked;
      if (seenMeanings.has(meaningOf(item)) || seenKorean.has(item.korean)) continue;
      seenMeanings.add(meaningOf(item));
      seenKorean.add(item.korean);
      picked.push(item);
    }
  }
  return picked;
}

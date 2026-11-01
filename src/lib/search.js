import { normalizeAnswer } from "./study";

// Romanization is spelled many ways ("hakgyo", "hakkyo", "hak kyo"), so both
// sides are folded to a rough sound key before comparing.
export function foldRomanization(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/eo/g, "o")
    .replace(/eu/g, "u")
    .replace(/ae/g, "e")
    .replace(/oe|we/g, "e")
    .replace(/ch|j/g, "c")
    .replace(/g/g, "k")
    .replace(/b/g, "p")
    .replace(/d/g, "t")
    .replace(/r/g, "l")
    .replace(/(.)\1+/g, "$1");
}

function withinOneEdit(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

// Lower is better; null means no match.
function scoreText(text, query) {
  const value = normalizeAnswer(text);
  if (!value) return null;
  if (value === query) return 0;
  if (value.startsWith(query)) return 1;
  const words = value.split(" ");
  if (words.some((word) => word === query)) return 1;
  if (words.some((word) => word.startsWith(query))) return 2;
  if (value.includes(query)) return 3;
  // One typo in a longer word: "techer" → "teacher".
  if (query.length >= 5 && words.some((word) => word.length >= 5 && withinOneEdit(word, query))) return 5;
  return null;
}

export function scoreWord(word, query, meaningText) {
  const fields = [word.korean, meaningText, word.uzbek, word.english, word.russian, word.romanization];
  let best = null;
  fields.forEach((field) => {
    const score = scoreText(field, query);
    if (score !== null && (best === null || score < best)) best = score;
  });
  const folded = foldRomanization(query);
  if (folded.length >= 2 && /^[a-z\s'-]+$/i.test(query)) {
    const roman = foldRomanization(word.romanization);
    const romanScore =
      roman === folded ? 4 : roman.startsWith(folded) ? 4.5 : folded.length >= 4 && withinOneEdit(roman, folded) ? 6 : null;
    if (romanScore !== null && (best === null || romanScore < best)) best = romanScore;
  }
  return best;
}

// Words matching `query`, best matches first.
export function searchWords(words, query, meaningOf) {
  const normalized = normalizeAnswer(query);
  if (!normalized) return words;
  return words
    .map((word, index) => ({ word, index, score: scoreWord(word, normalized, meaningOf(word)) }))
    .filter((entry) => entry.score !== null)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.word);
}

// Revised Romanization of Korean following pronunciation: liaison,
// palatalization, ㅎ + ㄱ/ㄷ/ㅈ aspiration, nasalization and ㄹ assimilation.
// Like the book's own romanizations, ㄱ/ㄷ/ㅂ + ㅎ keep the h ("sijakhada")
// and tensing is not written.
//
//   node scripts/romanize.mjs            fill missing romanizations in data/lesson*.json
//   node scripts/romanize.mjs --check    compare with the hand-written ones

import fs from "node:fs";

const INITIALS = [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
const VOWELS = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const FINALS = ["", "ㄱ", "ㄲ", "ㄱㅅ", "ㄴ", "ㄴㅈ", "ㄴㅎ", "ㄷ", "ㄹ", "ㄹㄱ", "ㄹㅁ", "ㄹㅂ", "ㄹㅅ", "ㄹㅌ", "ㄹㅍ", "ㄹㅎ", "ㅁ", "ㅂ", "ㅂㅅ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const INITIAL_SOUND = { ㄱ: "g", ㄲ: "kk", ㄴ: "n", ㄷ: "d", ㄸ: "tt", ㄹ: "r", ㅁ: "m", ㅂ: "b", ㅃ: "pp", ㅅ: "s", ㅆ: "ss", ㅇ: "", ㅈ: "j", ㅉ: "jj", ㅊ: "ch", ㅋ: "k", ㅌ: "t", ㅍ: "p", ㅎ: "h" };
const ASPIRATED = { ㄱ: "ㅋ", ㄷ: "ㅌ", ㅂ: "ㅍ", ㅈ: "ㅊ" };
const I_VOWEL = 20;

// The sound a final consonant (or cluster) makes before a consonant.
function finalSound(final) {
  const key = final.join("");
  if (["ㄱ", "ㄲ", "ㅋ", "ㄱㅅ", "ㄹㄱ"].includes(key)) return "k";
  if (["ㄴ", "ㄴㅈ", "ㄴㅎ"].includes(key)) return "n";
  if (["ㄷ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㅌ", "ㅎ"].includes(key)) return "t";
  if (["ㄹ", "ㄹㅂ", "ㄹㅅ", "ㄹㅌ", "ㄹㅎ"].includes(key)) return "l";
  if (["ㅁ", "ㄹㅁ"].includes(key)) return "m";
  if (["ㅂ", "ㅍ", "ㅂㅅ", "ㄹㅍ"].includes(key)) return "p";
  if (key === "ㅇ") return "ng";
  return "";
}

function decompose(word) {
  return [...word].map((char) => {
    const code = char.charCodeAt(0) - 0xac00;
    if (code < 0 || code > 11171) return { char };
    return { initial: INITIALS[Math.floor(code / 588)], vowel: Math.floor((code % 588) / 28), final: [...FINALS[code % 28]] };
  });
}

function applyBoundary(current, next) {
  const { final } = current;
  if (!final.length) return;
  const last = final.at(-1);

  if (next.initial === "ㅇ" && final.join("") !== "ㅇ") {
    // Liaison: the (last part of the) final moves to the next syllable.
    if (last === "ㅎ") {
      final.pop();
      if (final.length) next.initial = final.pop();
      return;
    }
    let moved = final.pop();
    if (next.vowel === I_VOWEL && (moved === "ㄷ" || moved === "ㅌ")) moved = moved === "ㄷ" ? "ㅈ" : "ㅊ";
    next.initial = moved;
    return;
  }
  if (last === "ㅎ" && ASPIRATED[next.initial]) {
    next.initial = ASPIRATED[next.initial];
    final.pop();
    return;
  }

  const sound = finalSound(final);
  if (next.initial === "ㄹ") {
    if (sound === "n" || sound === "l") {
      current.final = ["ㄹ"];
      next.liquid = true;
      return;
    }
    next.initial = "ㄴ";
  }
  if (next.initial === "ㄴ" && sound === "l") {
    next.initial = "ㄹ";
    next.liquid = true;
    return;
  }
  if (next.initial === "ㄴ" || next.initial === "ㅁ") {
    const nasal = { k: "ㅇ", t: "ㄴ", p: "ㅁ" }[sound];
    if (nasal) current.final = [nasal];
  }
}

function romanizeWord(word) {
  const syllables = decompose(word);
  for (let index = 0; index < syllables.length - 1; index += 1) {
    if (syllables[index].char === undefined && syllables[index + 1].char === undefined) {
      applyBoundary(syllables[index], syllables[index + 1]);
    }
  }
  return syllables
    .map((syllable) => {
      if (syllable.char !== undefined) return syllable.char;
      const initial = syllable.initial === "ㄹ" && syllable.liquid ? "l" : INITIAL_SOUND[syllable.initial];
      return initial + VOWELS[syllable.vowel] + finalSound(syllable.final);
    })
    .join("");
}

export function romanize(text) {
  return text
    .split(/([^가-힣]+)/)
    .map((part) => (/[가-힣]/.test(part) ? romanizeWord(part) : part))
    .join("")
    .replace(/\s*\/\s*/g, " / ")
    .trim();
}

if (process.argv[1]?.endsWith("romanize.mjs")) {
  const files = fs.readdirSync("data").filter((name) => /^lesson\d+\.json$/.test(name));
  const readWords = (file) => JSON.parse(fs.readFileSync(`data/${file}`, "utf8"));
  if (process.argv.includes("--check")) {
    let same = 0;
    let total = 0;
    const diffs = [];
    for (const file of files) {
      for (const word of readWords(file)) {
        if (!word.romanization) continue;
        total += 1;
        const ours = romanize(word.korean);
        if (ours === word.romanization.toLowerCase()) same += 1;
        else diffs.push(`${word.korean} | book: ${word.romanization} | ours: ${ours}`);
      }
    }
    console.log(`${same}/${total} identical`);
    console.log(diffs.join("\n"));
  } else {
    let filled = 0;
    for (const file of files) {
      const path = `data/${file}`;
      const raw = fs.readFileSync(path, "utf8");
      const words = JSON.parse(raw);
      const missing = words.filter((word) => !word.romanization);
      if (!missing.length) continue;
      missing.forEach((word) => {
        word.romanization = romanize(word.korean);
      });
      filled += missing.length;
      const eol = raw.includes("\r\n") ? "\r\n" : "\n";
      fs.writeFileSync(path, JSON.stringify(words, null, 2).replace(/\n/g, eol) + (/\r?\n$/.test(raw) ? eol : ""));
    }
    console.log(`Filled ${filled} romanizations`);
  }
}

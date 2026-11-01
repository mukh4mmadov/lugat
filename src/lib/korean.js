// Hangul arithmetic and conjugation for grammar drills. Covers the regular
// patterns plus the irregular verbs a beginner meets (ㅂ, ㄷ, 르, ㅅ, ㅡ,
// ㄹ-dropping, 하다).

const BASE = 0xac00;
const VOWELS = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
const FINALS = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

const isSyllable = (char) => {
  const code = char?.charCodeAt(0);
  return code >= BASE && code <= 0xd7a3;
};

export function decompose(char) {
  if (!isSyllable(char)) return null;
  const offset = char.charCodeAt(0) - BASE;
  return { initial: Math.floor(offset / 588), vowel: VOWELS[Math.floor((offset % 588) / 28)], final: FINALS[offset % 28] };
}

export function compose(initial, vowel, final = "") {
  return String.fromCharCode(BASE + initial * 588 + VOWELS.indexOf(vowel) * 28 + FINALS.indexOf(final));
}

const lastChar = (word) => [...String(word).trim()].pop();

export function hasBatchim(word) {
  const parts = decompose(lastChar(word));
  return Boolean(parts?.final);
}

function setFinal(char, final) {
  const parts = decompose(char);
  return compose(parts.initial, parts.vowel, final);
}

function setVowel(char, vowel) {
  const parts = decompose(char);
  return compose(parts.initial, vowel, parts.final);
}

// --- Particles ------------------------------------------------------------

const PARTICLES = {
  topic: ["은", "는"],
  subject: ["이", "가"],
  object: ["을", "를"],
  and: ["과", "와"],
  copula: ["이에요", "예요"],
};

// 으로/로: plain 로 after a vowel or ㄹ.
export function particle(noun, kind) {
  if (kind === "direction") {
    const final = decompose(lastChar(noun))?.final;
    return `${noun}${!final || final === "ㄹ" ? "로" : "으로"}`;
  }
  const [withFinal, withoutFinal] = PARTICLES[kind];
  return `${noun}${hasBatchim(noun) ? withFinal : withoutFinal}`;
}

// --- Verbs ----------------------------------------------------------------

const B_IRREGULAR = new Set(["덥다", "춥다", "쉽다", "어렵다", "가깝다", "무겁다", "가볍다", "맵다", "귀엽다", "아름답다", "반갑다", "고맙다", "즐겁다", "돕다", "곱다", "눕다", "굽다", "더럽다", "부럽다", "시끄럽다", "싱겁다", "뜨겁다", "차갑다", "두껍다", "부드럽다", "어둡다", "밉다", "아깝다", "무섭다"]);
const D_IRREGULAR = new Set(["듣다", "걷다", "묻다", "싣다", "깨닫다"]);
const S_IRREGULAR = new Set(["낫다", "짓다", "붓다", "잇다", "젓다"]);
const REU_IRREGULAR_EXCEPTIONS = new Set(["따르다", "치르다", "들르다"]);
// ㅎ-stems that drop ㅎ (colours, 그렇다 ...); 좋다/놓다/넣다/낳다 are regular.
const H_REGULAR = new Set(["좋다", "놓다", "넣다", "낳다", "닿다", "쌓다"]);
const isHIrregular = (verb) => decompose([...stemOf(verb)].pop())?.final === "ㅎ" && !H_REGULAR.has(verb);

export const stemOf = (verb) => String(verb).replace(/다$/, "");

function isReuIrregular(verb) {
  return verb.endsWith("르다") && !REU_IRREGULAR_EXCEPTIONS.has(verb) && verb.length >= 3;
}

// The stem before an ending that starts with 아/어 (aeo), or with 으 (eu),
// after irregular changes.
function irregularStem(verb, before) {
  const stem = stemOf(verb);
  const chars = [...stem];
  const last = chars[chars.length - 1];
  if (B_IRREGULAR.has(verb)) {
    chars[chars.length - 1] = setFinal(last, "");
    // 돕다/곱다 take 와; the rest take 워 (before 아/어) or 우 (before 으).
    return { stem: chars.join(""), add: before === "aeo" ? (verb === "돕다" || verb === "곱다" ? "와" : "워") : "우" };
  }
  if (D_IRREGULAR.has(verb)) {
    chars[chars.length - 1] = setFinal(last, "ㄹ");
    return { stem: chars.join("") };
  }
  if (S_IRREGULAR.has(verb)) {
    chars[chars.length - 1] = setFinal(last, "");
    return { stem: chars.join(""), keepVowelSyllable: true };
  }
  return { stem };
}

// Present polite: 가다 → 가요, 먹다 → 먹어요, 하다 → 해요, 듣다 → 들어요 ...
export function presentPolite(verb) {
  if (verb === "이다") return "이에요";
  if (verb === "아니다") return "아니에요";
  return withAeo(verb, "요");
}

export function pastPolite(verb) {
  if (verb === "이다") return "이었어요";
  return withAeo(verb, "ㅆ어요");
}

// Joins 아/어 to the stem and then `rest` ("요", or "ㅆ어요" for the past).
export function withAeo(verb, rest) {
  const stem = stemOf(verb);
  if (stem.endsWith("하")) return attach(`${stem.slice(0, -1)}해`, rest);
  if (isHIrregular(verb)) {
    // 빨갛다 → 빨개, 하얗다 → 하얘, 어떻다 → 어때
    const chars = [...stem];
    const parts = decompose(chars[chars.length - 1]);
    chars[chars.length - 1] = compose(parts.initial, parts.vowel === "ㅑ" ? "ㅒ" : "ㅐ");
    return attach(chars.join(""), rest);
  }
  const irregular = irregularStem(verb, "aeo");
  if (irregular.add) return attach(`${irregular.stem}${irregular.add}`, rest);
  const chars = [...irregular.stem];
  const last = chars[chars.length - 1];
  const parts = decompose(last);
  const bright = ["ㅏ", "ㅗ"].includes(parts.vowel) || (irregular.keepVowelSyllable && ["ㅏ", "ㅗ"].includes(parts.vowel));
  if (isReuIrregular(verb)) {
    // 모르다 → 몰라: the syllable before 르 takes ㄹ, 르 becomes 라/러.
    const before = chars[chars.length - 2];
    const beforeParts = decompose(before);
    chars[chars.length - 2] = setFinal(before, "ㄹ");
    chars[chars.length - 1] = ["ㅏ", "ㅗ"].includes(beforeParts.vowel) ? "라" : "러";
    return attach(chars.join(""), rest);
  }
  if (parts.final || irregular.keepVowelSyllable) {
    return attach(`${chars.join("")}${bright ? "아" : "어"}`, rest);
  }
  // Vowel stems contract.
  const contracted = {
    ㅏ: "ㅏ", ㅓ: "ㅓ", ㅕ: "ㅕ", ㅐ: "ㅐ", ㅔ: "ㅔ",
    ㅗ: "ㅘ", ㅜ: "ㅝ", ㅣ: "ㅕ", ㅚ: "ㅙ", ㅡ: null,
  }[parts.vowel];
  if (parts.vowel === "ㅡ") {
    // 쓰다 → 써, 바쁘다 → 바빠 (vowel of the previous syllable decides).
    const previous = chars.length > 1 ? decompose(chars[chars.length - 2]) : null;
    chars[chars.length - 1] = setVowel(last, previous && ["ㅏ", "ㅗ"].includes(previous.vowel) ? "ㅏ" : "ㅓ");
    return attach(chars.join(""), rest);
  }
  if (contracted) {
    chars[chars.length - 1] = setVowel(last, contracted);
    return attach(chars.join(""), rest);
  }
  return attach(`${chars.join("")}${bright ? "아" : "어"}`, rest);
}

// "요" is appended; "ㅆ어요" puts ㅆ under the last syllable.
function attach(base, rest) {
  if (rest.startsWith("ㅆ")) {
    const chars = [...base];
    chars[chars.length - 1] = setFinal(chars[chars.length - 1], "ㅆ");
    return chars.join("") + rest.slice(1);
  }
  return base + rest;
}

// Endings that start with 으 when the stem ends in a consonant:
// -(으)세요, -(으)ㄹ 거예요, -(으)면, -(으)니까, -(으)러 ...
export function withEu(verb, ending) {
  const stem = stemOf(verb);
  const chars = [...stem];
  const last = chars[chars.length - 1];
  const parts = decompose(last);
  const startsWithFinal = ["ㄹ", "ㄴ"].includes(ending[0]);
  const body = startsWithFinal ? ending.slice(1) : ending;
  if (B_IRREGULAR.has(verb)) {
    chars[chars.length - 1] = setFinal(last, "");
    return joinEu(`${chars.join("")}우`, ending);
  }
  if (D_IRREGULAR.has(verb)) {
    chars[chars.length - 1] = setFinal(last, "ㄹ");
    return `${chars.join("")}${euSyllable(ending)}`;
  }
  if (S_IRREGULAR.has(verb)) {
    chars[chars.length - 1] = setFinal(last, "");
    return `${chars.join("")}${euSyllable(ending)}`;
  }
  if (isHIrregular(verb)) {
    chars[chars.length - 1] = setFinal(last, "");
    return joinEu(chars.join(""), ending);
  }
  if (parts.final === "ㄹ") {
    // ㄹ-stems: 살다 → 사세요, 살 거예요, 살면.
    if (startsWithFinal) {
      chars[chars.length - 1] = setFinal(last, ending[0]);
      return chars.join("") + body;
    }
    if (/^[세시니습]/.test(body)) chars[chars.length - 1] = setFinal(last, "");
    return chars.join("") + body;
  }
  if (parts.final) return `${stem}${euSyllable(ending)}`;
  return joinEu(stem, ending);
}

// 으 plus the ending: "ㄹ 거예요" → "을 거예요", "세요" → "으세요".
function euSyllable(ending) {
  if (ending[0] === "ㄹ") return `을${ending.slice(1)}`;
  if (ending[0] === "ㄴ") return `은${ending.slice(1)}`;
  return `으${ending}`;
}

// Vowel stems take the ending directly; ㄹ/ㄴ go under the last syllable.
function joinEu(stem, ending) {
  if (["ㄹ", "ㄴ"].includes(ending[0])) {
    const chars = [...stem];
    chars[chars.length - 1] = setFinal(chars[chars.length - 1], ending[0]);
    return chars.join("") + ending.slice(1);
  }
  return stem + ending;
}

export const honorificPolite = (verb) => withEu(verb, "세요");
export const future = (verb) => withEu(verb, "ㄹ 거예요");
export const wantTo = (verb) => `${stemOf(verb)}고 싶어요`;
export const negativeLong = (verb) => `${stemOf(verb)}지 않아요`;

export const FORMS = {
  present: presentPolite,
  past: pastPolite,
  honorific: honorificPolite,
  future,
  want: wantTo,
  negative: negativeLong,
};

// Lesson entries that end in 다 but are not verbs or adjectives.
const NOT_PREDICATES = new Set(["바다", "마다", "생각보다", "알겠습니다"]);

// The verb or adjective a drill can conjugate: the last word of a lesson
// entry such as "밥을 먹다" (→ 먹다), or null when it isn't one.
export function drillPredicate(korean) {
  const text = String(korean || "").trim();
  if (!/다$/.test(text) || text.includes("/") || NOT_PREDICATES.has(text)) return null;
  const last = text.split(" ").filter(Boolean).pop();
  if ([...last].length < 2 || /(이다|습니다|니다)$/.test(last)) return null;
  return /^[가-힣]+다$/.test(last) ? last : null;
}

// Which irregular group a verb belongs to, or null for regular verbs.
export function irregularType(verb) {
  if (B_IRREGULAR.has(verb)) return "ㅂ";
  if (D_IRREGULAR.has(verb)) return "ㄷ";
  if (S_IRREGULAR.has(verb)) return "ㅅ";
  if (isReuIrregular(verb)) return "르";
  if (isHIrregular(verb)) return "ㅎ";
  return null;
}

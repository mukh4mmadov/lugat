// Builds the practice set for one grammar point: its hand-written questions,
// questions generated from the words of the lessons learned so far, and
// sentences to put in order.
import { drillPredicate, FORMS, irregularType, particle, stemOf, withAeo } from "./korean.js";

const PARTICLE_OPTIONS = {
  topic: ["은", "는"],
  subject: ["이", "가"],
  object: ["을", "를"],
  and: ["과", "와"],
  copula: ["이에요", "예요"],
  direction: ["으로", "로"],
};

function shuffle(list, random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const unique = (list) => [...new Set(list)];

// Plain nouns usable with particles: one Hangul word, not a verb.
function lessonNouns(words) {
  return unique(
    words
      .map((word) => String(word.korean || "").trim())
      .filter((korean) => /^[가-힣]{1,5}$/.test(korean) && !korean.endsWith("다")),
  );
}

// Verbs and adjectives from lesson entries, with a rough verb/adjective
// split from the English meaning ("to go" vs "to be big" / "big").
function lessonPredicates(words) {
  const seen = new Map();
  for (const word of words) {
    const verb = drillPredicate(word.korean);
    if (!verb || seen.has(verb)) continue;
    const english = String(word.english || "").toLowerCase();
    const adjective = !english.startsWith("to ") || english.startsWith("to be ");
    seen.set(verb, { verb, adjective });
  }
  return [...seen.values()];
}

// Wrong but plausible forms: the un-contracted or wrong-vowel versions.
function distractors(verb, form, correct) {
  const stem = stemOf(verb);
  const wrong = {
    present: [`${stem}어요`, `${stem}아요`, `${stem}요`],
    past: [`${stem}었어요`, `${stem}았어요`, `${stem}었요`],
    honorific: [`${stem}세요`, `${stem}으세요`, `${stem}어세요`],
    future: [`${stem}을 거예요`, `${stem} 거예요`, `${stem}ㄹ 거예요`],
    want: [`${FORMS.present(verb).replace(/요$/, "")} 싶어요`, `${stem}서 싶어요`, `${stem}지 싶어요`],
  }[form];
  return unique(wrong.filter((option) => option !== correct)).slice(0, 2);
}

function particleQuestions(point, words, random, count) {
  const options = PARTICLE_OPTIONS[point.drill.type];
  return shuffle(lessonNouns(words), random)
    .slice(0, count)
    .map((noun) => {
      const right = particle(noun, point.drill.type).slice(noun.length);
      return { type: "choice", prompt: `${noun} + ___`, options: shuffle(options, random), answer: right, generated: true };
    });
}

function formQuestions(point, words, random, count) {
  const { form, verbsOnly, adjectives, irregular } = point.drill;
  let pool = lessonPredicates(words);
  if (irregular) pool = pool.filter((item) => irregularType(item.verb) === irregular);
  else if (verbsOnly) pool = pool.filter((item) => !item.adjective);
  else if (adjectives) pool = pool.filter((item) => item.adjective);
  return shuffle(pool, random)
    .slice(0, count)
    .map(({ verb }) => {
      const right = FORMS[form](verb);
      return { type: "choice", prompt: `${verb} → ___`, form, options: shuffle([right, ...distractors(verb, form, right)], random), answer: right, generated: true };
    });
}

function aeoQuestions(point, words, random, count) {
  const { rest } = point.drill;
  return shuffle(lessonPredicates(words).filter((item) => !item.adjective), random)
    .slice(0, count)
    .map(({ verb }) => {
      const right = withAeo(verb, rest);
      const stem = stemOf(verb);
      const wrong = unique([`${stem}어${rest}`, `${stem}아${rest}`, `${stem}${rest}`]).filter((option) => option !== right).slice(0, 2);
      return { type: "choice", prompt: `${verb} → ___`, options: shuffle([right, ...wrong], random), answer: right, generated: true };
    });
}

// `words` are the vocabulary of lessons up to the point's lesson.
export function buildPractice(point, words, random = Math.random) {
  const questions = (point.quiz || []).map(([prompt, options, answerIndex, hint]) => ({
    type: "choice",
    prompt,
    options: shuffle(options, random),
    answer: options[answerIndex],
    hint,
  }));
  const drill = point.drill;
  if (drill?.kind === "particle") questions.push(...particleQuestions(point, words, random, 4));
  if (drill?.kind === "form") questions.push(...formQuestions(point, words, random, 4));
  if (drill?.kind === "aeoForm") questions.push(...aeoQuestions(point, words, random, 3));
  const ordering = shuffle(point.examples.filter(([korean]) => korean.split(" ").length >= 3 && korean.split(" ").length <= 6), random)
    .slice(0, 2)
    .map((example) => {
      const tokens = example[0].split(" ");
      let shuffled = shuffle(tokens, random);
      if (shuffled.join(" ") === tokens.join(" ")) shuffled = [...tokens].reverse();
      return { type: "order", tokens: shuffled, answer: tokens.join(" "), example };
    });
  return [...shuffle(questions, random), ...ordering];
}

import { compose, decompose, drillPredicate, FORMS, honorificPolite, irregularType, particle, stemOf, withAeo, withEu } from "./korean.js";

const PARTICLE_OPTIONS = {
  topic: ["은", "는"],
  subject: ["이", "가"],
  object: ["을", "를"],
  and: ["과", "와"],
  copula: ["이에요", "예요"],
  direction: ["으로", "로"],
};

const LABELLED_FORMS = new Set(["present", "past", "honorific", "future", "want"]);

const lastSyllable = (stem) => [...stem].pop();

function withFinal(syllable, final) {
  const parts = decompose(syllable);
  return compose(parts.initial, parts.vowel, final);
}

function formalPolite(verb) {
  const stem = stemOf(verb);
  const chars = [...stem];
  const last = decompose(chars[chars.length - 1]);
  if (last.final && last.final !== "ㄹ") return `${stem}습니다`;
  chars[chars.length - 1] = withFinal(chars[chars.length - 1], "ㅂ");
  return `${chars.join("")}니다`;
}

const formalCommand = (verb) => honorificPolite(verb).replace(/세요$/, "십시오");

const modifierPast = (verb) => withEu(verb, "ㄴ");

const DRILL_FORMS = { ...FORMS, formal: formalPolite, formalCommand, modPast: modifierPast };

function irregularGroup(verb) {
  const known = irregularType(verb);
  if (known) return known;
  const last = decompose(lastSyllable(stemOf(verb)));
  if (!last) return null;
  if (last.final === "ㄹ") return "ㄹ";
  if (!last.final && last.vowel === "ㅡ") return "ㅡ";
  return null;
}

function shuffle(list, random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const unique = (list) => [...new Set(list)];

function lessonNouns(words) {
  return unique(
    words
      .map((word) => String(word.korean || "").trim())
      .filter((korean) => /^[가-힣]{1,5}$/.test(korean) && !korean.endsWith("다")),
  );
}

function lessonPredicates(words) {
  const seen = new Map();
  for (const word of words) {
    const verb = drillPredicate(word.korean);
    if (!verb || seen.has(verb)) continue;
    const english = String(word.english || "").toLowerCase();
    const adjective = !english.startsWith("to ") || english.startsWith("to be ");
    seen.set(verb, { verb, adjective, english });
  }
  return [...seen.values()];
}

const NOT_CHOSEN = new Set(["끝나다", "걸리다", "나다", "생기다", "막히다", "흐르다", "잃어버리다", "지다", "흘리다", "졸리다", "피다", "불다"]);
const chosenVerb = (item) => !item.adjective && !NOT_CHOSEN.has(item.verb) && !/(되다|있다|없다)$/.test(item.verb);

const NOT_DESCRIBING = new Set(["지내다", "기뻐하다", "조심하다", "들다", "미안하다", "죄송하다", "필요하다"]);
const describing = (item) => item.english.startsWith("to be ") && !NOT_DESCRIBING.has(item.verb) && !/[있없]다$/.test(item.verb);

function distractors(verb, form, correct) {
  const stem = stemOf(verb);
  const wrong = {
    present: [`${stem}어요`, `${stem}아요`, `${stem}요`],
    past: [`${stem}었어요`, `${stem}았어요`, `${stem}었요`],
    honorific: [`${stem}세요`, `${stem}으세요`, `${stem}어세요`],
    future: [`${stem}을 거예요`, `${stem} 거예요`, `${stem}ㄹ 거예요`],
    want: [`${FORMS.present(verb).replace(/요$/, "")} 싶어요`, `${stem}서 싶어요`, `${stem}지 싶어요`],
    negative: [`${stem}지 안아요`, `${stem}지 않어요`, `${stem}고 않아요`],
    formal: [`${stem}습니다`, `${stem}읍니다`, `${stem}니다`],
    formalCommand: [`${stem}십시오`, `${stem}으십시오`, `${stem}습시오`],
    modPast: [`${stem}는`, `${stem}은`, withEu(verb, "ㄹ")],
  }[form];
  return unique(wrong.filter((option) => option !== correct)).slice(0, 2);
}

function formHint(point, form) {
  if (form && LABELLED_FORMS.has(form) && !point.drill.label) return { form };
  return { hint: point.drill.label || point.pattern };
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
  const { form, verbsOnly, adjectives, irregular, chosen } = point.drill;
  let pool = lessonPredicates(words);
  if (irregular) pool = pool.filter((item) => irregularGroup(item.verb) === irregular);
  if (chosen) pool = pool.filter(chosenVerb);
  else if (verbsOnly) pool = pool.filter((item) => !item.adjective);
  else if (adjectives) pool = pool.filter((item) => item.adjective);
  return shuffle(pool, random)
    .slice(0, count)
    .map(({ verb }) => {
      const right = DRILL_FORMS[form](verb);
      return { type: "choice", prompt: `${verb} → ___`, ...formHint(point, form), options: shuffle([right, ...distractors(verb, form, right)], random), answer: right, generated: true };
    });
}

function aeoQuestions(point, words, random, count) {
  const { rest, adjectives, any } = point.drill;
  let pool = lessonPredicates(words);
  if (adjectives) pool = pool.filter(describing);
  else if (!any) pool = pool.filter((item) => !item.adjective);
  return shuffle(pool, random)
    .slice(0, count)
    .map(({ verb }) => {
      const right = withAeo(verb, rest);
      const stem = stemOf(verb);
      const wrong = unique([`${stem}어${rest}`, `${stem}아${rest}`, `${stem}${rest}`]).filter((option) => option !== right).slice(0, 2);
      const hint = point.drill.label ? { hint: point.drill.label } : {};
      return { type: "choice", prompt: `${verb} → ___`, ...hint, options: shuffle([right, ...wrong], random), answer: right, generated: true };
    });
}

function euQuestions(point, words, random, count) {
  const { ending } = point.drill;
  const jamo = ["ㄹ", "ㄴ"].includes(ending[0]);
  const body = jamo ? ending.slice(1) : ending;
  return shuffle(lessonPredicates(words).filter(chosenVerb), random)
    .slice(0, count)
    .map(({ verb }) => {
      const right = withEu(verb, ending);
      const stem = stemOf(verb);
      const withExtra = jamo ? `${stem}${ending[0] === "ㄹ" ? "을" : "은"}${body}` : `${stem}으${ending}`;
      const wrong = unique([withExtra, `${stem}${body}`]).filter((option) => option !== right).slice(0, 2);
      return { type: "choice", prompt: `${verb} → ___`, hint: point.drill.label || point.pattern, options: shuffle([right, ...wrong], random), answer: right, generated: true };
    });
}

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
  if (drill?.kind === "euForm") questions.push(...euQuestions(point, words, random, 3));
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

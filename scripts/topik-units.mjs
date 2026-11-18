// Splits the TOPIK I word list into short study units (about 20 words, one
// theme each) and writes data/topik1/units.json:
//   node scripts/topik-units.mjs
// Units keep their word ids, so the list stays stable when it is rebuilt; run
// it again only after words are added to data/topik1/vocab-*.json.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const DIR = "data/topik1";
const words = readdirSync(DIR)
  .filter((name) => /^vocab-\d+\.json$/.test(name))
  .sort()
  .flatMap((name) => JSON.parse(readFileSync(`${DIR}/${name}`, "utf8")));

// Easiest themes first; small themes share a unit with a related one.
const GROUPS = [
  { id: "numbers", topics: ["numbers"], title: { uz: "Sonlar", en: "Numbers", ru: "Числа" } },
  { id: "people", topics: ["people", "family"], title: { uz: "Odamlar va oila", en: "People and family", ru: "Люди и семья" } },
  { id: "world", topics: ["countries", "culture", "society", "work"], title: { uz: "Davlatlar, madaniyat va ish", en: "Countries, culture and work", ru: "Страны, культура и работа" } },
  { id: "time", topics: ["time"], title: { uz: "Vaqt", en: "Time", ru: "Время" } },
  { id: "food", topics: ["food"], title: { uz: "Ovqat", en: "Food", ru: "Еда" } },
  { id: "home", topics: ["home", "daily life"], title: { uz: "Uy va kundalik hayot", en: "Home and daily life", ru: "Дом и быт" } },
  { id: "places", topics: ["places"], title: { uz: "Joylar", en: "Places", ru: "Места" } },
  { id: "school", topics: ["school"], title: { uz: "Maktab va o'qish", en: "School and study", ru: "Учёба" } },
  { id: "actions", topics: ["actions"], title: { uz: "Harakatlar", en: "Actions", ru: "Действия" } },
  { id: "talk", topics: ["communication"], title: { uz: "Muloqot", en: "Communication", ru: "Общение" } },
  { id: "feelings", topics: ["feelings", "descriptions"], title: { uz: "His-tuyg'ular va sifatlar", en: "Feelings and descriptions", ru: "Чувства и описания" } },
  { id: "body", topics: ["body", "health"], title: { uz: "Tana va sog'liq", en: "Body and health", ru: "Тело и здоровье" } },
  { id: "shopping", topics: ["shopping", "money", "clothing"], title: { uz: "Xarid, pul va kiyim", en: "Shopping, money and clothes", ru: "Покупки, деньги и одежда" } },
  { id: "travel", topics: ["transport", "travel"], title: { uz: "Transport va sayohat", en: "Transport and travel", ru: "Транспорт и путешествия" } },
  { id: "nature", topics: ["weather", "nature", "colors", "animals"], title: { uz: "Ob-havo va tabiat", en: "Weather and nature", ru: "Погода и природа" } },
  { id: "hobbies", topics: ["hobbies"], title: { uz: "Qiziqishlar", en: "Hobbies", ru: "Увлечения" } },
  { id: "grammar", topics: ["grammar words"], title: { uz: "Yordamchi so'zlar", en: "Function words", ru: "Служебные слова" } },
];

const grouped = new Set(GROUPS.flatMap((group) => group.topics));
const missing = [...new Set(words.map((word) => word.topic))].filter((topic) => !grouped.has(topic));
if (missing.length) throw new Error(`Topics without a group: ${missing.join(", ")}`);

const units = [];
for (const group of GROUPS) {
  const list = words.filter((word) => group.topics.includes(word.topic)).sort((a, b) => a.id - b.id);
  const count = Math.max(1, Math.round(list.length / 20));
  for (let part = 0; part < count; part += 1) {
    const from = Math.round((part * list.length) / count);
    const to = Math.round(((part + 1) * list.length) / count);
    units.push({ n: units.length + 1, group: group.id, part: part + 1, parts: count, title: group.title, ids: list.slice(from, to).map((word) => word.id) });
  }
}

const covered = units.reduce((sum, unit) => sum + unit.ids.length, 0);
if (covered !== words.length) throw new Error(`Units hold ${covered} of ${words.length} words`);
writeFileSync(`${DIR}/units.json`, `${JSON.stringify(units)}\n`);
console.log(`${units.length} units, ${covered} words, sizes ${Math.min(...units.map((unit) => unit.ids.length))}–${Math.max(...units.map((unit) => unit.ids.length))}`);

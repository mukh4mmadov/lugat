import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const LEVEL = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || "topik1";
const FRESH = process.argv.includes("--fresh");
const STAGE_SIZE = 8;
if (!["topik1", "topik2"].includes(LEVEL)) throw new Error(`Unknown level: ${LEVEL}`);
const DIR = `data/${LEVEL}`;
const words = readdirSync(DIR)
  .filter((name) => /^vocab-\d+\.json$/.test(name))
  .sort()
  .flatMap((name) => JSON.parse(readFileSync(`${DIR}/${name}`, "utf8")));

const GROUPS = [
  { id: "numbers", topics: ["numbers"], title: { uz: "Sonlar", en: "Numbers", ru: "Числа" } },
  { id: "people", topics: ["people", "family"], title: { uz: "Odamlar va oila", en: "People and family", ru: "Люди и семья" } },
  { id: "culture", topics: ["countries", "culture"], title: { uz: "Davlatlar va madaniyat", en: "Countries and culture", ru: "Страны и культура" } },
  { id: "society", topics: ["society"], title: { uz: "Jamiyat", en: "Society", ru: "Общество" } },
  { id: "work", topics: ["work"], title: { uz: "Ish va kasb", en: "Work and jobs", ru: "Работа и профессии" } },
  { id: "time", topics: ["time"], title: { uz: "Vaqt", en: "Time", ru: "Время" } },
  { id: "food", topics: ["food"], title: { uz: "Ovqat", en: "Food", ru: "Еда" } },
  { id: "home", topics: ["home", "daily life"], title: { uz: "Uy va kundalik hayot", en: "Home and daily life", ru: "Дом и быт" } },
  { id: "places", topics: ["places"], title: { uz: "Joylar", en: "Places", ru: "Места" } },
  { id: "school", topics: ["school"], title: { uz: "Maktab va o'qish", en: "School and study", ru: "Учёба" } },
  { id: "actions", topics: ["actions"], title: { uz: "Harakatlar", en: "Actions", ru: "Действия" } },
  { id: "talk", topics: ["communication"], title: { uz: "Muloqot", en: "Communication", ru: "Общение" } },
  { id: "emotions", topics: ["feelings"], title: { uz: "His-tuyg'ular", en: "Feelings", ru: "Чувства" } },
  { id: "qualities", topics: ["descriptions"], title: { uz: "Sifat va tavsif", en: "Qualities and descriptions", ru: "Качества и описания" } },
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

const bandOf = (word) => (LEVEL === "topik1" ? "t1" : word.source === "NIKL-C" ? "t2c" : "t2b");
const BANDS = LEVEL === "topik1" ? ["t1"] : ["t2b", "t2c"];
const byId = new Map(words.map((word) => [word.id, word]));

const kept = FRESH || !existsSync(`${DIR}/units.json`) ? [] : JSON.parse(readFileSync(`${DIR}/units.json`, "utf8"));
const units = kept.map((unit) => ({ group: unit.group, title: unit.title, ids: unit.ids, band: unit.band || bandOf(byId.get(unit.ids[0])) }));
const placed = new Set(units.flatMap((unit) => unit.ids));
for (const band of BANDS) {
  for (const group of GROUPS) {
    const list = words.filter((word) => bandOf(word) === band && group.topics.includes(word.topic) && !placed.has(word.id)).sort((a, b) => a.id - b.id);
    const count = list.length ? Math.max(1, Math.round(list.length / 20)) : 0;
    for (let part = 0; part < count; part += 1) {
      const from = Math.round((part * list.length) / count);
      const to = Math.round(((part + 1) * list.length) / count);
      units.push({ group: group.id, title: group.title, ids: list.slice(from, to).map((word) => word.id), band });
    }
  }
}

const mean = (unit) => unit.ids.reduce((sum, id) => sum + id, 0) / unit.ids.length;
const ordered = [];
for (const band of BANDS) {
  const list = units.filter((unit) => unit.band === band).sort((a, b) => mean(a) - mean(b));
  const stages = Math.max(1, Math.round(list.length / STAGE_SIZE));
  list.forEach((unit, index) => {
    const stage = Math.floor((index * stages) / list.length) + 1;
    const part = ordered.filter((other) => other.band === band && other.group === unit.group).length + 1;
    ordered.push({ n: ordered.length + 1, band, stage, group: unit.group, part, parts: 0, title: unit.title, ids: unit.ids });
  });
}
for (const unit of ordered) unit.parts = ordered.filter((other) => other.band === unit.band && other.group === unit.group).length;

const covered = ordered.reduce((sum, unit) => sum + unit.ids.length, 0);
if (covered !== words.length) throw new Error(`Units hold ${covered} of ${words.length} words`);
writeFileSync(`${DIR}/units.json`, `${JSON.stringify(ordered)}\n`);
for (const band of BANDS) {
  const list = ordered.filter((unit) => unit.band === band);
  console.log(`${band}: ${list.length} units in ${list.at(-1).stage} stages, ${list.reduce((sum, unit) => sum + unit.ids.length, 0)} words, sizes ${Math.min(...list.map((unit) => unit.ids.length))}–${Math.max(...list.map((unit) => unit.ids.length))}`);
}

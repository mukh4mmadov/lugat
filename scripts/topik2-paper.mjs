import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [listeningPath, writingPath, readingPath, outPath, exportName] = process.argv.slice(2);
if (!exportName) {
  console.error("Usage: node scripts/topik2-paper.mjs <listening.js> <writing.json> <reading.js> <out.js> <EXPORT_NAME>");
  process.exit(1);
}

const firstExport = async (file) => Object.values(await import(pathToFileURL(path.resolve(file)).href))[0];
const listening = await firstExport(listeningPath);
const reading = await firstExport(readingPath);
const writing = JSON.parse(fs.readFileSync(writingPath, "utf8"));

const content = {};
for (let number = 1; number <= 50; number += 1) {
  if (!listening[number]) throw new Error(`listening lacks question ${number}`);
  content[number] = listening[number];
}
for (const number of [51, 52, 53, 54]) {
  const item = writing[number];
  if (!item?.writing || !item.model) throw new Error(`writing lacks question ${number} or its model answer`);
  content[number] = {
    group: item.group || [number, number],
    instruction: item.instruction || "",
    shared: null,
    prompt: item.prompt || "",
    stem: item.stem || null,
    options: [],
    sharedText: "",
    stemText: item.stemText || "",
    writing: item.writing,
    model: item.model,
  };
}
for (let number = 101; number <= 150; number += 1) {
  if (!reading[number]) throw new Error(`reading lacks question ${number}`);
  content[number] = reading[number];
}

const banner = `// TOPIK II paper content, joined by scripts/topik2-paper.mjs: listening 1–50
// and reading (stored as 101–150, printed 1–50) from the OCR pass over the
// paper and NIIED's online text; writing 51–54 and its model answers (모범 답안)
// from the paper. Boxes are PDF points in the merged paper (listening, writing,
// reading). Regenerate instead of editing by hand.

`;
const body = Object.entries(content)
  .map(([number, value]) => `  ${number}: ${JSON.stringify(value)},`)
  .join("\n");
fs.writeFileSync(outPath, `${banner}export const ${exportName} = {\n${body}\n};\n`);
console.log(`Wrote ${Object.keys(content).length} questions to ${outPath}`);

// Builds a TOPIK I paper's question content from its PDF so the exam can show
// one question per screen with clickable choices, like the computer test.
//
//   node scripts/topik-extract-paper.mjs <paper.pdf> <out.js> <EXPORT_NAME>
//   node scripts/topik-extract-paper.mjs public/topik/35th/paper.pdf src/data/topik/paper35Content.js PAPER_35_CONTENT
//
// It reads the PDF's text layer: "※ [a～b]" lines start a block, "N." lines
// start a question, and ①–④ start choices. Passages, notices and pictures are
// not transcribed; their page regions are recorded and cropped from the PDF at
// runtime. The script stops if any of questions 1–70 lacks exactly four choices.
import fs from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const [pdfPath, outPath, exportName = "PAPER_CONTENT"] = process.argv.slice(2);
if (!pdfPath || !outPath) {
  console.error("Usage: node scripts/topik-extract-paper.mjs <paper.pdf> <out.js> <EXPORT_NAME>");
  process.exit(1);
}

const GLYPHS = { "①": "1", "②": "2", "③": "3", "④": "4" };
const LEFT = 72;
const RIGHT = 525;
const QUESTION_COUNT = 70;

const pdf = await getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), useSystemFonts: true }).promise;
const pages = [];
for (let number = 1; number <= pdf.numPages; number += 1) {
  const page = await pdf.getPage(number);
  const { height } = page.getViewport({ scale: 1 });
  const { items } = await page.getTextContent();
  pages.push({
    page: number,
    items: items
      .filter((item) => item.str.trim())
      .map((item) => ({ s: item.str, x: Math.round(item.transform[4]), w: item.width, y: Math.round(height - item.transform[5]) })),
  });
}

function linesOf(page) {
  const rows = new Map();
  for (const item of page.items) {
    const key = Math.round(item.y / 4) * 4;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(item);
  }
  return [...rows.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([y, items]) => ({ y, page: page.page, items: items.sort((a, b) => a.x - b.x) }));
}

// Join text runs, adding a space only where the runs are visibly apart.
function joinRuns(items) {
  let out = "";
  let end = null;
  for (const item of items) {
    if (end !== null && item.x - end > 2.5 && !out.endsWith(" ") && !item.s.startsWith(" ")) out += " ";
    out += item.s;
    end = item.x + item.w;
  }
  return out;
}

const tidy = (text) =>
  text
    .replace(/,(?=[^\s\d])/g, ", ")
    .replace(/\?(?=[^\s)])/g, "? ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,?!)])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .replace(/(\S)\s*－\s*/g, "$1 – ")
    .trim();

const questions = [];
let group = null;
let question = null;

function parseOptions(target, line) {
  let current = null;
  const added = [];
  for (const item of line.items) {
    let x = item.x;
    for (const part of item.s.split(/([①②③④])/)) {
      if (!part) continue;
      if (GLYPHS[part]) {
        current = { id: GLYPHS[part], runs: [], x, y: line.y };
        target.options.push(current);
        added.push(current);
      } else if (current) {
        current.runs.push({ s: part, x, w: item.w });
      }
      x += part.length * 6;
    }
  }
  for (const option of added) {
    option.text = tidy(joinRuns(option.runs).replace(/^\./, ""));
    delete option.runs;
  }
  target.lastY = line.y;
}

for (const page of pages.filter((item) => item.page >= 3)) {
  const lines = linesOf(page).filter((line) => line.y > 70 && line.y < 780);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const first = line.items[0];
    if (first.s.startsWith("※")) {
      const match = joinRuns(line.items).match(/\[\s*(\d+)\s*～\s*(\d+)\s*\]\s*(.*)$/);
      let instruction = match ? match[3] : "";
      let endY = line.y;
      const next = lines[index + 1];
      if (next && next.y - line.y <= 26 && next.items[0].x >= 100 && next.items[0].x <= 120) {
        const continued = joinRuns(next.items);
        // A wrap can split "고르|십시오" inside one word.
        instruction += (continued.startsWith("십시오") ? "" : " ") + continued;
        endY = next.y;
        index += 1;
      }
      group = {
        from: match ? Number(match[1]) : null,
        to: match ? Number(match[2]) : null,
        instruction: tidy(instruction.replace(/\(\s*각\s*\d\s*점\s*\)/, "")),
        page: page.page,
        y0: endY + 10,
        y1: null,
      };
      question = null;
      continue;
    }
    const header = first.x <= 90 && /^\d/.test(first.s) ? joinRuns(line.items).match(/^(\d+)\s*\.\s*(.*)$/) : null;
    if (header) {
      if (group && group.y1 === null && group.page === page.page) group.y1 = line.y - 16;
      question = { number: Number(header[1]), page: page.page, options: [], stemY0: line.y + 5, stemY1: null, group, lastY: line.y, headerY: line.y };
      questions.push(question);
      const hasChoices = line.items.some((item) => /[①②③④]/.test(item.s));
      const prompt = hasChoices ? header[2].split(/[①②③④]/)[0] : header[2];
      question.prompt = tidy(prompt.replace(/\(\s*\d\s*점\s*\)/, ""));
      if (hasChoices) {
        question.noStem = true;
        parseOptions(question, line);
      }
      continue;
    }
    if (!question) continue;
    if (line.items.some((item) => /[①②③④]/.test(item.s))) {
      if (question.stemY1 === null && !question.noStem) question.stemY1 = line.y - 16;
      parseOptions(question, line);
    } else if (question.options.length && question.options.length < 4 && line.y - question.lastY < 24 && question.options.at(-1).text) {
      question.options.at(-1).text = tidy(`${question.options.at(-1).text} ${joinRuns(line.items)}`);
    }
  }
}

// Picture choices: crop each picture between its glyph and the next glyph or row.
for (const item of questions) {
  item.picture = item.options.length === 4 && item.options.every((option) => !option.text);
  if (!item.picture) continue;
  // Glyphs of one row can sit a few points apart vertically.
  const rows = [];
  [...item.options].sort((a, b) => a.y - b.y).forEach((option) => {
    if (!rows.length || option.y - rows.at(-1) > 10) rows.push(option.y);
  });
  const rowOf = (option) => rows.findIndex((row) => Math.abs(row - option.y) <= 10);
  const nextQuestion = questions.find((other) => other.number === item.number + 1);
  item.options.forEach((option) => {
    const row = rowOf(option);
    const top = Math.min(...item.options.filter((other) => rowOf(other) === row).map((other) => other.y));
    const bottom = row + 1 < rows.length ? rows[row + 1] - 20 : nextQuestion && nextQuestion.page === item.page ? nextQuestion.headerY - 16 : 770;
    const right = item.options.find((other) => rowOf(other) === row && other.x > option.x)?.x ?? RIGHT;
    option.box = { page: item.page, x0: option.x + 15, x1: right - 8, y0: top - 12, y1: bottom };
  });
}

const content = {};
const problems = [];
for (let number = 1; number <= QUESTION_COUNT; number += 1) {
  const found = questions.filter((item) => item.number === number);
  if (found.length !== 1) {
    problems.push(`question ${number}: found ${found.length} times`);
    continue;
  }
  const [item] = found;
  if (item.options.map((option) => option.id).join("") !== "1234") problems.push(`question ${number}: choices ${item.options.map((option) => option.id).join(",")}`);
  if (!item.picture && item.options.some((option) => !option.text)) problems.push(`question ${number}: empty choice text`);
  const { group: block } = item;
  content[number] = {
    group: [block.from, block.to],
    instruction: block.instruction,
    shared: block.y1 !== null && block.y1 - block.y0 >= 14 ? { page: block.page, x0: LEFT, x1: RIGHT, y0: block.y0, y1: block.y1 } : null,
    prompt: item.prompt || "",
    stem: item.stemY1 !== null && item.stemY1 - item.stemY0 >= 14 ? { page: item.page, x0: LEFT, x1: RIGHT, y0: item.stemY0, y1: item.stemY1 } : null,
    options: item.options.map((option) => (item.picture ? { id: option.id, box: option.box } : { id: option.id, text: option.text })),
  };
}
if (problems.length) {
  console.error("The paper could not be read completely:\n" + problems.join("\n"));
  process.exit(1);
}

const banner = `// Generated by scripts/topik-extract-paper.mjs from ${pdfPath.replace(/\\/g, "/")}:
// each question's instruction, printed prompt, choice text and the paper
// regions (PDF points, page top = 0) holding its shared passage, stem or
// picture choices. Regenerate instead of editing by hand.

`;
const body = Object.entries(content)
  .map(([number, value]) => `  ${number}: ${JSON.stringify(value)},`)
  .join("\n");
fs.writeFileSync(outPath, `${banner}export const ${exportName} = {\n${body}\n};\n`);
console.log(`Wrote ${Object.keys(content).length} questions to ${outPath}`);

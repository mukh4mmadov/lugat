// Builds a TOPIK I paper's question content when the PDF is only page images
// (no text layer), like the papers NIIED published from the 41st exam on.
//
//   node scripts/topik-extract-paper-ocr.mjs <paper.pdf> <listening.js> <reading.js> <out.js> <EXPORT_NAME> <workDir> [fixes.json]
//
// The text (instructions, prompts, choices, passages) comes from NIIED's own
// online version of the same paper on topik.go.kr (asset/exam/exam<N>/
// exam_<N>_1_h.js and _r.js). Those files are read as text, never run.
// The paper regions (shared passages, question material, picture choices)
// are found on the rendered pages: Windows OCR (Windows.Media.Ocr, Korean)
// locates block headers, question numbers and choice lines, and the ink on
// the page sets each region's edges. Windows only.
//
// fixes.json can override what the layout pass finds, per question:
//   { "40": { "stem": { "page": 14, "x0": 90, "x1": 520, "y0": 100, "y1": 240 } },
//     "15": { "options": [box, box, box, box] }, "63": { "sharedText": "..." } }
// workDir keeps the rendered pages, the OCR result and preview crops.
//
// TOPIK II (TOPIK_LEVEL=2): each section is its own PDF with questions printed
// 1–50, so run once per section and pass "-" for the other section's file.
// NUMBER_OFFSET and PAGE_OFFSET shift the output (reading is stored as 101–150
// and its pages follow the listening and writing pages in the merged PDF);
// scripts/topik2-paper.mjs joins the parts.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const require = createRequire(import.meta.url);
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
// A Korean font for the preview labels.
for (const font of ["C:/Windows/Fonts/malgun.ttf", "C:/Windows/Fonts/gulim.ttc"]) if (fs.existsSync(font) && GlobalFonts.registerFromPath(font, "KoreanUI")) break;

const [pdfPath, listeningPath, readingPath, outPath, exportName, workDir, fixesPath] = process.argv.slice(2);
if (!workDir) {
  console.error("Usage: node scripts/topik-extract-paper-ocr.mjs <paper.pdf> <listening.js> <reading.js> <out.js> <EXPORT_NAME> <workDir> [fixes.json]");
  process.exit(1);
}
const LEVEL2 = process.env.TOPIK_LEVEL === "2";
const SECTION_MAX = LEVEL2 ? 50 : 40; // questions in one section's online file
const NUMBER_X_MAX = LEVEL2 ? 120 : 88; // question numbers sit left of this (points)
const NUMBER_OFFSET = Number(process.env.NUMBER_OFFSET || 0);
const PAGE_OFFSET = Number(process.env.PAGE_OFFSET || 0);
const SCALE = 3; // rendered pixels per PDF point (OCR reads small numbers better at 3)
const fixes = fixesPath && fs.existsSync(fixesPath) ? JSON.parse(fs.readFileSync(fixesPath, "utf8")) : {};
fs.mkdirSync(path.join(workDir, `pages${SCALE}`), { recursive: true });

// ---------------------------------------------------------------- official text

// Splits a JS call's argument list into values: string literals joined by "+",
// numbers and identifiers (which become "").
function parseArgs(src, start) {
  const args = [];
  let current = [];
  let i = start;
  for (;;) {
    const ch = src[i];
    if (ch === undefined) throw new Error("unterminated call");
    if (/\s|\+/.test(ch)) {
      i += 1;
    } else if (ch === '"' || ch === "'") {
      let j = i + 1;
      let value = "";
      while (src[j] !== ch) {
        if (src[j] === "\\") {
          value += src[j + 1];
          j += 2;
        } else {
          value += src[j];
          j += 1;
        }
      }
      current.push(value);
      i = j + 1;
    } else if (ch === ",") {
      args.push(current.join(""));
      current = [];
      i += 1;
    } else if (ch === ")") {
      args.push(current.join(""));
      return { args, end: i + 1 };
    } else {
      const match = src.slice(i).match(/^[\w.]+/);
      if (!match) throw new Error(`unexpected "${ch}" at ${i}`);
      current.push(/^\d+$/.test(match[0]) ? match[0] : "");
      i += match[0].length;
    }
  }
}

function stripComments(src) {
  let out = "";
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== ch && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j;
    } else if (ch === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      out += "\n";
    } else if (ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? src.length : end + 1;
    } else {
      out += ch;
    }
  }
  return out;
}

function calls(file) {
  const src = stripComments(fs.readFileSync(file, "utf8"));
  const found = [];
  const pattern = /Display_(Example|Exam)\s*\(/g;
  let match;
  while ((match = pattern.exec(src))) {
    const { args, end } = parseArgs(src, match.index + match[0].length);
    found.push({ kind: match[1], args });
    pattern.lastIndex = end;
  }
  return found;
}

const decode = (text) =>
  text
    .replace(/&nbsp;?/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/，/g, ", ")
    .replace(/．/g, ". ")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/[－–]/g, "-")
    .replace(/\t/g, " ");
const stripTags = (text) => text.replace(/<\/?[a-zA-Z][^>]*>/g, "");
const squash = (text) =>
  text
    .replace(/[  ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/ ([.,?!])/g, "$1")
    .trim();
const points = /\(\s*(각\s*)?\d\s*점\s*\)/g;
// A passage keeps the paper's line breaks only as spaces; a break inside a
// word ("좋습 </br>니다") is joined back.
function passage(html) {
  const parts = decode(html).split(/<\/?br\s*\/?>/i).map((part) => stripTags(part));
  let out = "";
  for (const part of parts) {
    const piece = part.replace(/\s+/g, " ");
    if (!out) out = piece.trimStart();
    else if (/^\s*(니다|니까|다\.|요\.)/.test(piece)) out = out.trimEnd() + piece.trimStart();
    else out = `${out.trimEnd()} ${piece.trimStart()}`;
  }
  return squash(out);
}
// NIIED's online text often drops the space after a sentence and splits a
// word at a line break ("많았 습니다"); the printed paper has neither.
const prose = (text) =>
  text
    .replace(/([.?!])(?=[가-힣(])/g, "$1 ")
    .replace(/([가-힣]) (습니다|니다|습니까|니까)(?=[\s.?!,]|$)/g, "$1$2");
// Blanks as the other papers print them: "(  )" and "( ㉠ )".
const blankParens = (text) =>
  text
    .replace(/\(\s+([^\s)])/g, "($1")
    .replace(/([^\s(])\s+\)/g, "$1)")
    .replace(/\(\s*\)/g, "(  )")
    .replace(/\(([㉠-㉣])\)/g, "( $1 )");

function official(file, offset) {
  const blocks = [];
  const questions = {};
  let block = null;
  for (const { kind, args } of calls(file)) {
    if (kind === "Example") {
      const [type, title, sample, a1, a2, a3, a4, end] = args;
      const head = decode(title).match(/\[\s*(\d+)\s*[～~∼-]\s*(\d+)\s*\]/);
      if (!head) throw new Error(`block title without range: ${title}`);
      const hasImage = /<img/i.test(title) || /<img/i.test(sample);
      const instruction = squash(stripTags(decode(title).replace(/<img[^>]*>/gi, "")))
        .replace(/^※\s*\[[^\]]*\]\s*/, "")
        .replace(points, "")
        .replace(/\(\s*\)/g, "()")
        .replace(/\s*(<보기>)\s*/g, " $1")
        .replace(/^ /, "")
        .replace(/\s+/g, " ")
        .replace(/([?.])(?=\S)/g, "$1 ")
        .trim();
      let sharedText = "";
      const options = [a1, a2, a3, a4].map((option) => squash(stripTags(decode(option))));
      if (Number(end) > 0 && Number(end) < 98) {
        const lines = decode(sample)
          .split(/<\/?br\s*\/?>/i)
          .map((line) =>
            blankParens(squash(stripTags(line)))
              .replace(/\s*:\s*/, ": ")
              .replace(/:\s*_+/, ": _____________________________")
              .replace(/([.?!])(?=[가-힣])/g, "$1 "),
          )
          .filter(Boolean);
        const marks = ["①", "②", "③", "④"];
        const filled = ["❶", "❷", "❸", "❹"];
        const labelled = options.map((option, index) => `${index + 1 === Number(end) ? filled[index] : marks[index]} ${option}`);
        const perLine = Number(type) === 4 ? 4 : Number(type) === 2 ? 2 : 1;
        const rows = [];
        for (let index = 0; index < 4; index += perLine) rows.push(labelled.slice(index, index + perLine).join("  "));
        sharedText = ["<보 기>", ...lines, ...rows].join("\n");
      } else if (sample.trim()) {
        sharedText = passage(sample);
      }
      block = { from: Number(head[1]), to: Number(head[2]), title: squash(stripTags(decode(title))), instruction, sharedText: prose(blankParens(sharedText)), sharedImage: hasImage };
      blocks.push(block);
    } else {
      const [qno, , title, extra, a1, a2, a3, a4, , , , , imgTitle] = args;
      const number = Number(qno);
      if (number < offset + 1 || number > offset + SECTION_MAX) throw new Error(`unexpected question ${qno}`);
      const html = decode(title);
      const stemImage = title.trim() === "img";
      const outline = html.match(/<div class='question_outline'>([\s\S]*?)<\/div>/i);
      const stemText = outline ? prose(blankParens(outline[1].includes("(가)") ? squash(stripTags(outline[1].replace(/<\/?br\s*\/?>/gi, "\n"))) : passage(outline[1]))) : "";
      const prompt = stemImage ? "" : squash(stripTags(html.replace(/<div class='question_outline'>[\s\S]*?<\/div>/i, "").replace(/<\/?br\s*\/?>/gi, " ")).replace(points, ""));
      if (extra && extra.trim()) console.warn(`question ${number}: unused field "${extra}"`);
      const options = [a1, a2, a3, a4].map((option) => squash(stripTags(decode(option))));
      questions[number] = {
        number,
        block,
        prompt,
        stemText,
        stemImage,
        imageNote: stemImage ? imgTitle || "" : "",
        picture: options.every((option) => option === "img"),
        options,
      };
    }
  }
  return { blocks, questions };
}

const none = { blocks: [], questions: {} };
const listening = listeningPath === "-" ? none : official(listeningPath, 0);
const reading = readingPath === "-" ? none : official(readingPath, LEVEL2 ? 0 : 30);
const blocks = [...listening.blocks, ...reading.blocks];
const questions = { ...listening.questions, ...reading.questions };
const expected = blocks.flatMap((block) => Array.from({ length: block.to - block.from + 1 }, (_, i) => block.from + i));
for (const number of expected) if (!questions[number]) throw new Error(`official text lacks question ${number}`);

// ---------------------------------------------------------------- pages and OCR

const pdf = await getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), verbosity: 0 }).promise;
const pages = [];
for (let number = 1; number <= pdf.numPages; number += 1) {
  const page = await pdf.getPage(number);
  const viewport = page.getViewport({ scale: SCALE });
  const file = path.join(workDir, `pages${SCALE}`, `p${String(number).padStart(2, "0")}.png`);
  if (!fs.existsSync(file)) {
    const { canvas, context } = pdf.canvasFactory.create(Math.floor(viewport.width), Math.floor(viewport.height));
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    fs.writeFileSync(file, canvas.toBuffer("image/png"));
  }
  pages.push({ page: number, file, width: viewport.width / SCALE, height: viewport.height / SCALE });
}

const ocrFile = path.join(workDir, `ocr${SCALE}.txt`);
if (!fs.existsSync(ocrFile)) {
  const script = path.join(workDir, "ocr.ps1");
  fs.writeFileSync(
    script,
    `param([string]$Pattern)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Foundation, ContentType = WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' })[0]
function Await($op, [Type]$type) { $task = $asTask.MakeGenericMethod($type).Invoke($null, @($op)); $task.Wait() | Out-Null; $task.Result }
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("ko"))
if ($engine -eq $null) { throw "Korean OCR is not installed (Settings > Language > Korean)." }
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
foreach ($img in (Get-ChildItem -Path $Pattern | Sort-Object Name)) {
  $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($img.FullName)) ([Windows.Storage.StorageFile])
  $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
  Write-Output ("=== " + $img.Name)
  foreach ($line in $result.Lines) {
    $x0 = 1e9; $y0 = 1e9; $x1 = -1; $y1 = -1
    foreach ($word in $line.Words) { $r = $word.BoundingRect; if ($r.X -lt $x0) { $x0 = $r.X }; if ($r.Y -lt $y0) { $y0 = $r.Y }; if ($r.X + $r.Width -gt $x1) { $x1 = $r.X + $r.Width }; if ($r.Y + $r.Height -gt $y1) { $y1 = $r.Y + $r.Height } }
    Write-Output ("{0}\`t{1}\`t{2}\`t{3}\`t{4}" -f [int]$x0, [int]$y0, [int]$x1, [int]$y1, $line.Text)
  }
  $stream.Dispose()
}
`,
  );
  const run = spawnSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script, "-Pattern", path.join(workDir, `pages${SCALE}`, "p*.png")], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (run.status !== 0 || !run.stdout.includes("===")) {
    console.error(run.stderr || "OCR failed");
    process.exit(1);
  }
  fs.writeFileSync(ocrFile, run.stdout);
}
const norm = (text) => text.replace(/[^가-힣0-9a-zA-Z㉠-㉣]/g, "");
{
  let current = null;
  for (const raw of fs.readFileSync(ocrFile, "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
    if (raw.startsWith("=== ")) {
      current = pages.find((page) => path.basename(page.file) === raw.slice(4).trim());
      current.lines = [];
      continue;
    }
    const parts = raw.split("\t");
    if (current && parts.length >= 5) {
      const [x0, y0, x1, y1] = parts.slice(0, 4).map((value) => Number(value) / SCALE);
      const text = parts.slice(4).join("\t").trim();
      current.lines.push({ page: current.page, x0, y0, x1, y1, text, norm: norm(text) });
    }
  }
  for (const page of pages) page.lines = (page.lines || []).sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
}

// Ink (dark pixels) per page for region edges.
for (const page of pages) {
  const image = await loadImage(fs.readFileSync(page.file));
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, image.width, image.height);
  const dark = new Uint8Array(image.width * image.height);
  for (let index = 0; index < dark.length; index += 1) dark[index] = data[index * 4] < 150 || data[index * 4 + 1] < 150 || data[index * 4 + 2] < 150 ? 1 : 0;
  page.ink = { width: image.width, height: image.height, dark };
}
// Number of dark pixels in one row of a region (points in, pixels counted).
function rowInk(page, x0, x1, y) {
  const { width, height, dark } = page.ink;
  const py = Math.round(y * SCALE);
  if (py < 0 || py >= height) return 0;
  let count = 0;
  for (let px = Math.max(0, Math.round(x0 * SCALE)); px < Math.min(width, Math.round(x1 * SCALE)); px += 1) count += dark[py * width + px];
  return count;
}
// Vertical runs of ink within a region, merged across gaps under `gap` points.
function bands(page, x0, x1, y0, y1, gap = 4) {
  const found = [];
  for (let y = y0; y <= y1; y += 0.5) {
    if (rowInk(page, x0, x1, y) >= 2) {
      const last = found.at(-1);
      if (last && y - last.y1 <= gap) last.y1 = y;
      else found.push({ y0: y, y1: y });
    }
  }
  return found;
}
function inkColumns(page, x0, x1, y0, y1) {
  const { width, height, dark } = page.ink;
  let left = null;
  let right = null;
  for (let px = Math.round(x0 * SCALE); px < Math.round(x1 * SCALE); px += 1) {
    let count = 0;
    for (let py = Math.max(0, Math.round(y0 * SCALE)); py < Math.min(height, Math.round(y1 * SCALE)); py += 1) count += dark[py * width + px];
    if (count >= 2) {
      if (left === null) left = px / SCALE;
      right = px / SCALE;
    }
  }
  return left === null ? null : { x0: left, x1: right };
}

// ---------------------------------------------------------------- layout

const problems = [];
const softProblems = []; // reported, but only text questions are affected
const round = (value) => Math.round(value);
const contentEdges = (page) => {
  const head = page.lines.filter((line) => line.y1 < page.height * 0.12 && /한국|TOPIK|T@PIK|회/.test(line.text));
  const foot = page.lines.filter((line) => line.y0 > page.height * 0.88 && /^\d{1,2}$/.test(line.norm));
  return {
    top: head.length ? Math.max(...head.map((line) => line.y1)) + 8 : 48,
    bottom: foot.length ? Math.min(...foot.map((line) => line.y0)) - 6 : page.height * 0.91,
    left: 50,
    right: page.width - 45,
  };
};
// How much of `needle` appears, in order, in `hay` (0..1).
function contained(needle, hay) {
  if (!needle) return 0;
  const m = needle.length;
  const n = hay.length;
  let previous = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i += 1) {
    const row = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j += 1) row[j] = needle[i - 1] === hay[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], row[j - 1]);
    previous = row;
  }
  return previous[n] / m;
}

// Anchors in reading order: block headers and question numbers.
const order = [];
for (const block of blocks) {
  order.push({ kind: "block", block });
  for (let number = block.from; number <= block.to; number += 1) order.push({ kind: "question", number });
}
const fromFix = (fix) => ({ page: fix.page, x0: fix.x0 ?? 72, y0: fix.y0, x1: fix.x1 ?? 90, y1: fix.y1 ?? fix.y0 + 12, text: fix.text ?? "", norm: norm(fix.text ?? ""), fixed: true });
const isAfter = (line, cursor) => line.page > cursor.page || (line.page === cursor.page && line.y0 > cursor.y + 1);
// Searches forward from `cursor` (within a few pages) for a line.
function findLine(cursor, test) {
  for (const page of pages) {
    if (page.page < cursor.page || (cursor.y > 0 && page.page > cursor.page + 4)) continue;
    const line = page.lines.find((candidate) => isAfter(candidate, cursor) && test(candidate));
    if (line) return line;
  }
  return null;
}

// 1. Block headers ("※ [a~b]"); OCR may garble the end of the range ("[40~4기").
{
  let cursor = { page: 1, y: 0 };
  for (const anchor of order.filter((item) => item.kind === "block")) {
    const { from, to } = anchor.block;
    const fix = fixes[`block${from}`]?.header;
    const line = fix
      ? fromFix(fix)
      : findLine(cursor, (candidate) => {
          const text = candidate.text.replace(/\s+/g, "");
          const exact = text.match(/\[?(\d{1,2})[~～∼\-~−〜]+(\d{1,2})\]/);
          if (exact && Number(exact[1]) === from && Number(exact[2]) === to) return true;
          const loose = text.match(/^※?\[(\d{1,2})[~～∼\-~−〜]+(\d?)/);
          if (loose && Number(loose[1]) === from && String(to).startsWith(loose[2])) return true;
          // Badly read ranges ("[5.5~56〕", "[(i3~64〕"): a bracketed line that
          // carries this block's instruction, next in reading order.
          const digits = text.replace(/[^\d~～∼〜]/g, "");
          return /^※?[[(〔{]/.test(text) && contained(norm(anchor.block.instruction).slice(0, 14), candidate.norm) >= 0.75 && (digits.startsWith(String(from)) || digits.includes(String(to)));
        });
    if (!line) continue;
    // The instruction can wrap onto a second line.
    const page = pages[line.page - 1];
    let bottom = line.y1;
    for (const other of page.lines) {
      if (other.y0 > bottom && other.y0 - bottom < 12 && (/^\s*\(\s*각/.test(other.text) || /^\s*\(\S{1,5}\)\s*$/.test(other.text) || (other.norm.length >= 2 && contained(other.norm, norm(anchor.block.title)) >= 0.6))) bottom = other.y1;
    }
    anchor.line = line;
    anchor.bottom = bottom;
    cursor = { page: line.page, y: line.y0 };
  }
}

// 2. Question numbers. OCR misses many of them, so the marks in the number
// column are used: between two block headers there must be exactly as many
// marks as the block has questions. Otherwise numbers OCR did read are used,
// and the gaps are filled with the next unclaimed mark.
const headerLike = (line) => /^\s*※/.test(line.text) || /^\s*\[\s*\d{1,2}\s*[~～∼]/.test(line.text);
const readNumber = (candidate) => candidate.text.match(/^\s*(\d{1,2})(?=\s*[.,·』」”"'’:;]|\s|$)/);
const numberLines = pages.flatMap((page) => page.lines.filter((line) => line.x0 < NUMBER_X_MAX && readNumber(line)));
const columnX = numberLines.length ? numberLines.map((line) => line.x0).sort((a, b) => a - b)[Math.floor(numberLines.length / 2)] : 73;
const blockAnchors = order.filter((item) => item.kind === "block");
function spanMarks(start, end) {
  const marks = [];
  for (let number = start.page; number <= end.page; number += 1) {
    const page = pages[number - 1];
    const edges = contentEdges(page);
    const y0 = number === start.page ? start.y : edges.top;
    const y1 = number === end.page ? Math.min(end.y, edges.bottom) : edges.bottom;
    for (const band of bands(page, columnX - 4, columnX + 17, y0, y1, 2)) {
      if (band.y1 - band.y0 < 5 || band.y1 - band.y0 > 16) continue;
      // A block header's "※" also sits in the number column.
      if (blockAnchors.some((item) => item.line && item.line.page === number && band.y0 < item.bottom + 2 && band.y1 > item.line.y0 - 2)) continue;
      // Block headers repeated at the top of a continuation page too.
      if (page.lines.some((line) => headerLike(line) && band.y0 < line.y1 + 2 && band.y1 > line.y0 - 2)) continue;
      marks.push({ page: number, x0: columnX, y0: band.y0, x1: columnX + 16, y1: band.y1 });
    }
  }
  return marks;
}
blockAnchors.forEach((anchor, index) => {
  if (!anchor.line) return;
  const { from, to } = anchor.block;
  const next = blockAnchors.slice(index + 1).find((item) => item.line);
  const start = { page: anchor.line.page, y: anchor.bottom + 1 };
  const end = next ? { page: next.line.page, y: next.line.y0 - 1 } : { page: pages.length, y: 1e9 };
  const marks = spanMarks(start, end);
  const questionsHere = order.filter((item) => item.kind === "question" && item.number >= from && item.number <= to);
  const textOf = (mark) => pages[mark.page - 1].lines.find((line) => Math.abs(line.y0 - mark.y0) < 6 && line.x0 < columnX + 10)?.text ?? "";
  if (marks.length === questionsHere.length) {
    questionsHere.forEach((item, i) => {
      const fix = fixes[item.number]?.header;
      item.line = fix ? fromFix(fix) : { ...marks[i], text: textOf(marks[i]) || `${item.number}.`, norm: String(item.number) };
    });
    return;
  }
  console.warn(`block ${from}-${to}: ${marks.length} marks in the number column for ${questionsHere.length} questions; using OCR numbers`);
  let cursor = start;
  for (const item of questionsHere) {
    const fix = fixes[item.number]?.header;
    const line = fix ? fromFix(fix) : findLine(cursor, (candidate) => candidate.x0 < NUMBER_X_MAX && Number(readNumber(candidate)?.[1]) === item.number && !isAfter(candidate, end));
    if (line) {
      item.line = line;
      cursor = { page: line.page, y: line.y0 };
    }
  }
  questionsHere.forEach((item, i) => {
    if (item.line) return;
    const before = questionsHere.slice(0, i).reverse().find((other) => other.line);
    const after = questionsHere.slice(i + 1).find((other) => other.line);
    const lower = before ? { page: before.line.page, y: before.line.y1 + 2 } : start;
    const upper = after ? { page: after.line.page, y: after.line.y0 - 2 } : end;
    const mark = spanMarks(lower, upper)[0];
    if (mark) {
      item.line = { ...mark, text: textOf(mark) || `${item.number}.`, norm: String(item.number), guessed: true };
      console.warn(`question ${item.number}: number not read; using the mark at page ${mark.page} y ${Math.round(mark.y0)}`);
    }
  });
});
if (process.env.DEBUG_ANCHORS) for (const a of order) console.warn(a.kind === "block" ? `[${a.block.from}-${a.block.to}]` : `Q${a.number}`, a.line ? `p${a.line.page} y${Math.round(a.line.y0)} ${a.line.text.slice(0, 30)}` : "-");
for (const anchor of order) {
  if (!anchor.line) problems.push(anchor.kind === "block" ? `block ${anchor.block.from}-${anchor.block.to}: header not found` : `question ${anchor.number}: number not found`);
}

const content = {};
const previews = [];
const boxOf = (page, x0, x1, y0, y1) => ({ page, x0: round(x0), x1: round(x1), y0: round(y0), y1: round(y1) });
// The ink in a region, trimmed to its bands. A thin last band near the
// region's bottom (the top border of the next frame) is dropped, and with
// `openBottom` so is a last band that runs into the bottom edge (the next
// question's frame, which starts above its number).
function region(page, x0, x1, y0, y1, minHeight = 8, openBottom = false) {
  if (y1 - y0 < 4) return null;
  const found = bands(page, x0, x1, y0, y1);
  while (found.length > 1 && ((found.at(-1).y1 - found.at(-1).y0 < 4 && y1 - found.at(-1).y1 < 16) || (openBottom && y1 - found.at(-1).y1 < 1.5))) found.pop();
  if (!found.length) return null;
  const top = found[0].y0;
  const bottom = found.at(-1).y1;
  if (bottom - top < minHeight) return null;
  return { y0: Math.max(y0, top - 3), y1: Math.min(y1, bottom + 3) };
}

const anchors = order.filter((anchor) => anchor.line);
const nextTop = (index) => {
  const anchor = anchors[index];
  const following = anchors[index + 1];
  const page = pages[anchor.line.page - 1];
  const edges = contentEdges(page);
  return following && following.line.page === anchor.line.page ? following.line.y0 : edges.bottom;
};

// Picture choices: the four largest ink shapes in the question's area,
// numbered left to right, top to bottom.
function pictureBoxes(page, x0, x1, y0, y1) {
  const cell = 2; // points
  const cols = Math.ceil((x1 - x0) / cell);
  const rows = Math.ceil((y1 - y0) / cell);
  const grid = new Uint8Array(cols * rows);
  const { width, dark } = page.ink;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      let hit = 0;
      for (let py = Math.round((y0 + r * cell) * SCALE); py < Math.round((y0 + (r + 1) * cell) * SCALE) && !hit; py += 1) {
        for (let px = Math.round((x0 + c * cell) * SCALE); px < Math.round((x0 + (c + 1) * cell) * SCALE); px += 1) {
          if (dark[py * width + px]) {
            hit = 1;
            break;
          }
        }
      }
      grid[r * cols + c] = hit;
    }
  }
  const seen = new Uint8Array(cols * rows);
  let shapes = [];
  for (let start = 0; start < grid.length; start += 1) {
    if (!grid[start] || seen[start]) continue;
    const stack = [start];
    seen[start] = 1;
    let minC = cols;
    let maxC = 0;
    let minR = rows;
    let maxR = 0;
    while (stack.length) {
      const index = stack.pop();
      const r = Math.floor(index / cols);
      const c = index % cols;
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          const next = nr * cols + nc;
          if (grid[next] && !seen[next]) {
            seen[next] = 1;
            stack.push(next);
          }
        }
      }
    }
    shapes.push({ x0: x0 + minC * cell, x1: x0 + (maxC + 1) * cell, y0: y0 + minR * cell, y1: y0 + (maxR + 1) * cell });
  }
  // Pictures without a frame break into pieces: merge pieces that nearly touch,
  // leaving the small choice numbers apart.
  const big = (shape) => shape.x1 - shape.x0 >= 20 || shape.y1 - shape.y0 >= 20;
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < shapes.length; i += 1) {
      for (let j = i + 1; j < shapes.length; j += 1) {
        const a = shapes[i];
        const b = shapes[j];
        if (!big(a) && !big(b)) continue;
        if (a.x0 - 3 <= b.x1 && b.x0 - 3 <= a.x1 && a.y0 - 3 <= b.y1 && b.y0 - 3 <= a.y1) {
          shapes[i] = { x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) };
          shapes.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }
  shapes = shapes.filter((shape) => shape.x1 - shape.x0 >= 50 && shape.y1 - shape.y0 >= 35);
  if (shapes.length !== 4) return null;
  shapes.sort((a, b) => a.y0 - b.y0);
  const rowsOf = [];
  for (const shape of shapes) {
    const row = rowsOf.find((items) => Math.abs(items[0].y0 - shape.y0) < 30);
    if (row) row.push(shape);
    else rowsOf.push([shape]);
  }
  return rowsOf.flatMap((row) => row.sort((a, b) => a.x0 - b.x0)).map((shape) => ({ x0: shape.x0 - 1, x1: shape.x1 + 1, y0: shape.y0 - 1, y1: shape.y1 + 1 }));
}

let prevBottom = { page: 0, y: 0 };
const blockShared = new Map();
anchors.forEach((anchor, index) => {
  const { line } = anchor;
  const page = pages[line.page - 1];
  const edges = contentEdges(page);
  // Content starts below the previous element, the running head and any
  // block header repeated above this question on a continuation page.
  const repeated = page.lines.filter((other) => headerLike(other) && other.y1 < line.y0 + 2 && other !== line && anchor.kind === "question");
  const ceiling = Math.max(edges.top, ...repeated.map((other) => other.y1 + 2));
  const floor = (y) => (prevBottom.page === line.page ? Math.max(y, prevBottom.y + 1, ceiling) : Math.max(y, ceiling));
  const limit = nextTop(index);
  if (anchor.kind === "block") {
    // The instruction can wrap onto a second line.
    let bottom = line.y1;
    for (const other of page.lines) {
      if (other.y0 > bottom && other.y0 - bottom < 12 && (/^\s*\(\s*각/.test(other.text) || /^\s*\(\S{1,5}\)\s*$/.test(other.text) || (other.norm.length >= 2 && contained(other.norm, norm(anchor.block.title)) >= 0.6))) bottom = other.y1;
    }
    const first = anchors[index + 1];
    const end = first && first.kind === "question" && first.line.page === line.page ? first.line.y0 - 1 : limit;
    const area = region(page, edges.left, edges.right, bottom + 2, end, 12, true);
    const shared = area ? boxOf(page.page, edges.left, edges.right, area.y0, area.y1) : null;
    blockShared.set(anchor.block, shared);
    prevBottom = { page: line.page, y: shared ? shared.y1 : bottom };
    return;
  }
  const item = questions[anchor.number];
  const fix = fixes[anchor.number] || {};
  const numberRight = line.x0 + 16;
  let stem = null;
  let options;
  let optionTop = limit;
  let optionBottom = limit;
  if (item.picture) {
    const boxes = fix.options || pictureBoxes(page, numberRight - 4, edges.right, floor(line.y0 - 6), limit);
    if (!boxes) problems.push(`question ${anchor.number}: picture choices not found`);
    options = ["1", "2", "3", "4"].map((id, i) => ({ id, box: boxes ? (boxes[i].page ? boxes[i] : boxOf(page.page, boxes[i].x0, boxes[i].x1, boxes[i].y0, boxes[i].y1)) : null }));
    optionBottom = boxes ? Math.max(...boxes.map((box) => box.y1)) : limit;
  } else {
    options = item.options.map((text, i) => ({ id: String(i + 1), text }));
    // Choice lines: OCR lines that hold a choice's text.
    const texts = item.options.map(norm).filter(Boolean);
    const allOptions = texts.join("");
    const optionLines = page.lines.filter((other) => {
      if (other.y0 < line.y0 - 2 || other.y0 >= limit) return false;
      // Most of the line must be choice text, so a passage line that shares
      // words with a choice does not count.
      const body = other.norm.replace(/^\d{1,2}/, "");
      if (body.length >= 4 && contained(body, allOptions) < 0.75) return false;
      // Short choices ("일", "가방") only count on a short line or with another choice.
      return texts.some((text) =>
        text.length <= 2
          ? other.norm.includes(text) && (other.norm.replace(/^\d{1,2}/, "").length <= text.length + 3 || texts.filter((t) => other.norm.includes(t)).length >= 2)
          : contained(text, other.norm) >= 0.7,
      );
    });
    // Choice rows start at the choice indent, just right of the number; text
    // inside a picture or notice that resembles a choice does not.
    const own = optionLines.filter((other) => (other !== line || !item.prompt) && other.x0 <= line.x0 + 60);
    if (fix.optionTop) {
      optionTop = fix.optionTop;
      optionBottom = fix.optionBottom ?? limit;
    } else if (own.length) {
      optionTop = Math.min(...own.map((other) => other.y0));
      optionBottom = Math.max(...own.map((other) => other.y1));
    } else {
      // Choices that OCR cannot read (㉠, short words): they are the last
      // text-height rows of ink before the next question.
      const rows = bands(page, edges.left, edges.right, line.y1 + 2, limit - 3, 3).filter((row) => row.y1 - row.y0 >= 4);
      const trailing = [];
      for (let i = rows.length - 1; i >= 0 && trailing.length < 4; i -= 1) {
        const row = rows[i];
        if (row.y1 - row.y0 > 16) break;
        if (trailing.length && trailing[0].y0 - row.y1 > 14) break;
        trailing.unshift(row);
      }
      if (trailing.length) {
        optionTop = trailing[0].y0;
        optionBottom = trailing.at(-1).y1;
        console.warn(`question ${anchor.number}: choices located by ink (${trailing.length} rows)`);
      } else {
        (item.stemImage ? problems : softProblems).push(`question ${anchor.number}: choices not found on page ${page.page}`);
      }
    }
    // The question's own material sits between its number line and its choices.
    // "(3점)" next to the number (OCR often garbles it: "(27十", "(꽤)").
    const pointsRow = page.lines.some((other) => Math.abs(other.y0 - line.y0) < 8 && other.x0 < line.x0 + 70 && /^\s*(\d{1,2}\s*\S?\s*)?\(\S{1,4}\)?\s*$/.test(other.text));
    const sameRow = !item.prompt && !pointsRow;
    const top = sameRow ? floor(line.y0 - 14) : line.y1 + 2;
    const x0 = sameRow ? numberRight : edges.left;
    const area = region(page, x0, edges.right, top, optionTop - 2);
    if (area) stem = boxOf(page.page, x0, edges.right, area.y0, area.y1);
  }
  if ("stem" in fix) stem = fix.stem;
  const block = item.block;
  const foundShared = "shared" in fix ? fix.shared : blockShared.get(block) ?? null;
  // The exam shows printed text as text; a paper crop is kept only for
  // material that is a picture, notice or table (an image in NIIED's text).
  const sharedText = fix.sharedText ?? block.sharedText;
  const stemText = fix.stemText ?? item.stemText;
  const shared = block.sharedImage || fix.keepShared ? foundShared : null;
  const stemBox = item.stemImage || fix.keepStem ? stem : null;
  content[anchor.number] = {
    group: [block.from, block.to],
    instruction: block.instruction,
    shared,
    prompt: item.prompt,
    stem: stemBox,
    options,
    sharedText: shared && !fix.sharedText ? "" : sharedText,
    stemText: stemBox && !fix.stemText ? "" : stemText,
  };
  // Layout cross-checks: the regions found on the page must agree with
  // NIIED's text about which questions have material.
  const warn = (message, hard) => (hard ? problems : softProblems).push(message);
  if (stem && !item.stemText && !item.stemImage && !("stem" in fix)) warn(`question ${anchor.number}: region found but the official text has no material`, false);
  if (!stem && (item.stemText || item.stemImage) && !("stem" in fix)) warn(`question ${anchor.number}: official text has material but no region was found`, item.stemImage);
  if (block.sharedText && !foundShared && block.from === anchor.number) warn(`block ${block.from}-${block.to}: official text has a passage but no region was found`, false);
  if (block.sharedImage && !foundShared && block.from === anchor.number) warn(`block ${block.from}-${block.to}: picture passage but no region was found`, true);
  prevBottom = { page: line.page, y: Math.max(optionBottom, stem ? stem.y1 : 0) };
  previews.push({ number: anchor.number, shared, stem: stemBox, options, imageNote: item.imageNote });
});

for (const number of expected) {
  const item = content[number];
  if (!item) {
    problems.push(`question ${number}: missing`);
    continue;
  }
  if (item.options.length !== 4) problems.push(`question ${number}: ${item.options.length} choices`);
  if (item.options.some((option) => !option.text && !option.box)) problems.push(`question ${number}: empty choice`);
}

// ---------------------------------------------------------------- preview

const previewDir = path.join(workDir, "preview");
fs.mkdirSync(previewDir, { recursive: true });
const images = new Map();
async function pageImage(number) {
  if (!images.has(number)) images.set(number, await loadImage(fs.readFileSync(pages[number - 1].file)));
  return images.get(number);
}
for (const item of previews) {
  const parts = [];
  if (item.shared && previews.find((other) => other.shared === item.shared) === item) parts.push(["shared", item.shared]);
  if (item.stem) parts.push(["stem", item.stem]);
  item.options.forEach((option) => option.box && parts.push([`option ${option.id}`, option.box]));
  const width = 900;
  const heights = parts.map(([, box]) => Math.min(700, (box.y1 - box.y0) * SCALE) + 26);
  const textLines = item.options.filter((option) => option.text).map((option) => `${option.id}. ${option.text}`);
  const canvas = createCanvas(width, Math.max(60, heights.reduce((a, b) => a + b, 0) + 24 + textLines.length * 22));
  const context = canvas.getContext("2d");
  context.fillStyle = "#e8eef8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#c00";
  context.font = "bold 20px KoreanUI, sans-serif";
  context.fillText(`Q${item.number}${item.imageNote ? ` (${item.imageNote})` : ""}`, 6, 20);
  let y = 24;
  for (const [index, [label, box]] of parts.entries()) {
    context.fillStyle = "#06c";
    context.font = "14px sans-serif";
    context.fillText(`${label}: p${box.page} ${box.x0},${box.y0}-${box.x1},${box.y1}`, 6, y + 16);
    const image = await pageImage(box.page);
    const w = (box.x1 - box.x0) * SCALE;
    const h = (box.y1 - box.y0) * SCALE;
    const scale = Math.min(1, (width - 12) / w, 700 / h);
    context.fillStyle = "#fff";
    context.fillRect(6, y + 22, w * scale, h * scale);
    context.drawImage(image, box.x0 * SCALE, box.y0 * SCALE, w, h, 6, y + 22, w * scale, h * scale);
    y += heights[index];
  }
  context.fillStyle = "#000";
  context.font = "16px KoreanUI, sans-serif";
  textLines.forEach((text, index) => context.fillText(text, 6, y + 18 + index * 22));
  fs.writeFileSync(path.join(previewDir, `q${String(item.number).padStart(2, "0")}.png`), canvas.toBuffer("image/png"));
}

// The PDF page of each question's number, for the answer key rows.
fs.writeFileSync(path.join(workDir, "question-pages.json"), JSON.stringify(Object.fromEntries(order.filter((item) => item.kind === "question" && item.line).map((item) => [item.number + NUMBER_OFFSET, item.line.page + PAGE_OFFSET]))));
if (softProblems.length) console.warn(`Layout notes (text questions, no crop needed):\n${softProblems.join("\n")}`);
if (problems.length) {
  console.error(`The paper could not be read completely:\n${problems.join("\n")}`);
  process.exit(1);
}
const banner = `// Generated by scripts/topik-extract-paper-ocr.mjs from ${path.basename(pdfPath)}
// and NIIED's online text of the same paper: each question's instruction,
// prompt, choices, passage and material as text, and paper regions (PDF
// points, page top = 0) only for pictures, notices and tables. Regenerate
// instead of editing by hand.

`;
// Shifts a section's numbers and pages into the merged paper (TOPIK II).
const shiftBox = (box) => (box && box.page ? { ...box, page: box.page + PAGE_OFFSET } : box);
const shifted = (value) => ({
  ...value,
  group: value.group.map((number) => number + NUMBER_OFFSET),
  shared: shiftBox(value.shared),
  stem: shiftBox(value.stem),
  options: value.options.map((option) => (option.box ? { ...option, box: shiftBox(option.box) } : option)),
});
const body = Object.entries(content)
  .map(([number, value]) => `  ${Number(number) + NUMBER_OFFSET}: ${JSON.stringify(NUMBER_OFFSET || PAGE_OFFSET ? shifted(value) : value)},`)
  .join("\n");
fs.writeFileSync(outPath, `${banner}export const ${exportName} = {\n${body}\n};\n`);
console.log(`Wrote ${Object.keys(content).length} questions to ${outPath}; previews in ${previewDir}`);

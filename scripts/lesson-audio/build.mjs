// Builds the listening lessons ("audio darslar") for one lesson file:
//   node scripts/lesson-audio/build.mjs scripts/lesson-audio/lesson-01.json <outDir>
// An Uzbek teacher voice explains and a Korean voice says the words (VoiceLab,
// VOICELAB_API_KEY). Each spoken line is cached in <outDir>/cache, so a rebuild
// only pays for lines that changed. The result is two WAV files
// (<id>-short.wav, <id>-full.wav); encode.ps1 turns them into MP3.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [file, outDir] = process.argv.slice(2);
if (!file || !outDir || !process.env.VOICELAB_API_KEY) {
  console.error("Usage: VOICELAB_API_KEY=... node build.mjs <lesson.json> <outDir>");
  process.exit(1);
}
const lesson = JSON.parse(readFileSync(file, "utf8"));
const VOICES = {
  uz: process.env.VOICE_UZ || "voice_fa56cecf-9b0b-45ba-9ec3-494efb5b301f",
  ko: process.env.VOICE_KO || "voice_6e5c435c-b133-46f7-9713-665bfd304403",
};
const RATE = 24000;
const cacheDir = path.join(outDir, "cache");
mkdirSync(cacheDir, { recursive: true });

// --- the two scripts -------------------------------------------------------
const uz = (text, pause = 0.6) => ({ lang: "uz", text, pause });
const ko = (text, pause = 0.8, speed = 1) => ({ lang: "ko", text, pause, speed });
const slow = (text, pause = 0.8) => ko(text, pause, 0.8);

// Recall: the Uzbek meaning, time to answer, then the Korean word.
const recall = (words) => words.flatMap((word) => [uz(`${word.uz}.`, 2.6), ko(word.ko, 1.2)]);

function shortVersion() {
  const lines = [uz(lesson.intro, 1)];
  lesson.words.forEach((word) => lines.push(slow(word.ko, 0.5), uz(`${word.uz}.`, 0.5), ko(word.ko, 1.8)));
  lines.push(uz("Endi o'zingizni tekshiring. Men ma'nosini aytaman, siz koreyschasini eslang.", 1), ...recall(lesson.words));
  lines.push(uz(lesson.outro, 1));
  return lines;
}

function fullVersion() {
  const lines = [uz(lesson.intro, 1)];
  lesson.words.forEach((word, index) => {
    lines.push(
      slow(word.ko, 0.7),
      ko(word.ko, 0.6),
      uz(`${word.uz}.`, 0.5),
      uz(word.tip, 0.6),
      uz("Misol.", 0.3),
      ko(word.exKo, 0.5, 0.9),
      uz(word.exUz, 0.8),
      uz("Takrorlang.", 0.3),
      ko(word.ko, 2.2),
    );
    // A short check after every six words keeps the new words alive.
    if ((index + 1) % 6 === 0 && index + 1 < lesson.words.length) {
      lines.push(uz("Qisqa takror. Men ma'nosini aytaman, siz koreyschasini eslang.", 0.8), ...recall(lesson.words.slice(index - 5, index + 1)));
    }
  });
  lines.push(uz("Endi butun darsni takrorlaymiz. Koreyscha so'zni eshiting va ma'nosini eslang.", 1));
  lesson.words.forEach((word) => lines.push(ko(word.ko, 2.6), uz(`${word.uz}.`, 1)));
  lines.push(uz(lesson.outro, 1));
  return lines;
}

// --- speech ------------------------------------------------------------------
async function speak(line) {
  const body = { text: line.text, language: line.lang, voice_id: VOICES[line.lang], model_id: "lison-v2", speed: line.speed || 1 };
  const key = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 24);
  const cached = path.join(cacheDir, `${key}.wav`);
  if (existsSync(cached)) return readFileSync(cached);
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch("https://api.voicelab.uz/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.VOICELAB_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `ktalim-${key}` },
      body: JSON.stringify(body),
    });
    if (response.status === 200) {
      const wav = Buffer.from(await response.arrayBuffer());
      writeFileSync(cached, wav);
      process.stdout.write(".");
      return wav;
    }
    const detail = await response.text().catch(() => "");
    if (![429, 500, 503].includes(response.status)) throw new Error(`VoiceLab ${response.status}: ${detail.slice(0, 200)} — ${line.text}`);
    await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
  }
  throw new Error(`VoiceLab kept failing: ${line.text}`);
}

// 16-bit mono PCM samples of a VoiceLab WAV.
function pcm(wav) {
  for (let offset = 12; offset + 8 <= wav.length; ) {
    const id = wav.toString("latin1", offset, offset + 4);
    const size = wav.readUInt32LE(offset + 4);
    if (id === "fmt ") {
      const channels = wav.readUInt16LE(offset + 10);
      const rate = wav.readUInt32LE(offset + 12);
      const bits = wav.readUInt16LE(offset + 22);
      if (channels !== 1 || rate !== RATE || bits !== 16) throw new Error(`Unexpected WAV: ${channels} ch, ${rate} Hz, ${bits} bit`);
    }
    if (id === "data") return wav.subarray(offset + 8, Math.min(wav.length, offset + 8 + size));
    offset += 8 + size + (size % 2);
  }
  throw new Error("WAV without data");
}

const silence = (seconds) => Buffer.alloc(Math.round(seconds * RATE) * 2);

function wavFile(parts) {
  const data = Buffer.concat(parts);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "latin1");
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8, "latin1");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "latin1");
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const versions = { short: shortVersion(), full: fullVersion() };
const unique = new Map();
Object.values(versions).flat().forEach((line) => unique.set(JSON.stringify([line.lang, line.text, line.speed || 1]), line));
const chars = [...unique.values()].reduce((sum, line) => sum + line.text.length, 0);
console.log(`${lesson.id}: ${unique.size} distinct lines, about ${chars} characters before cache`);
if (process.env.DRY) process.exit(0);

const report = {};
for (const [name, lines] of Object.entries(versions)) {
  const parts = [silence(0.4)];
  for (const line of lines) parts.push(pcm(await speak(line)), silence(line.pause));
  const wav = wavFile(parts);
  const target = path.join(outDir, `${lesson.id}-${name}.wav`);
  writeFileSync(target, wav);
  report[name] = Math.round((wav.length - 44) / 2 / RATE);
}
console.log(`\n${JSON.stringify(report)} seconds`);

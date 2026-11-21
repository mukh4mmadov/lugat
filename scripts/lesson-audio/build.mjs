// Builds the listening lessons ("audio darslar") for one topic deck script:
//   node scripts/lesson-audio/build.mjs scripts/lesson-audio/topic-NN.json <outDir>
// A teacher voice explains and a Korean voice says the words. NARRATION picks
// the teacher's language: "uz" (default, VoiceLab) or "en" (ElevenLabs, with
// the English texts from topic-NN.en.json). Korean is always VoiceLab.
// Keys: VOICELAB_API_KEY, ELEVENLABS_API_KEY. Each spoken line is cached in
// <outDir>/cache, so a rebuild only pays for lines that changed. The result is
// two WAV files (<id>[-en]-short.wav, <id>[-en]-full.wav); encode.ps1 turns
// them into MP3.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [file, outDir] = process.argv.slice(2);
const NARRATION = process.env.NARRATION || "uz";
if (!file || !outDir || !["uz", "en"].includes(NARRATION)) {
  console.error("Usage: [NARRATION=uz|en] node build.mjs <lesson.json> <outDir>");
  process.exit(1);
}
const lesson = JSON.parse(readFileSync(file, "utf8"));
const VOICES = {
  uz: process.env.VOICE_UZ || "voice_fa56cecf-9b0b-45ba-9ec3-494efb5b301f",
  ko: process.env.VOICE_KO || "voice_6e5c435c-b133-46f7-9713-665bfd304403",
  en: process.env.VOICE_EN || "nPczCjzI2devNBz1zQrb",
};
const RATE = 24000;
const cacheDir = path.join(outDir, "cache");
mkdirSync(cacheDir, { recursive: true });

// The teacher's words in the chosen language.
const UZ_PHRASES = {
  check: "Endi o'zingizni tekshiring. Men ma'nosini aytaman, siz koreyschasini eslang.",
  example: "Misol.",
  repeat: "Takrorlang.",
  quick: "Qisqa takror. Men ma'nosini aytaman, siz koreyschasini eslang.",
  review: "Endi butun darsni takrorlaymiz. Koreyscha so'zni eshiting va ma'nosini eslang.",
};
const english = NARRATION === "en" ? JSON.parse(readFileSync(file.replace(/\.json$/, ".en.json"), "utf8")) : null;
if (english && english.words.length !== lesson.words.length) throw new Error("The English file must have the same words");
const teacher = english
  ? { intro: english.intro, outro: english.outro, phrases: english.phrases, words: lesson.words.map((word, index) => ({ ...word, meaning: english.words[index].meaning, tip: english.words[index].tip, ex: english.words[index].ex })) }
  : { intro: lesson.intro, outro: lesson.outro, phrases: UZ_PHRASES, words: lesson.words.map((word) => ({ ...word, meaning: word.uz, ex: word.exUz })) };

// --- the two scripts -------------------------------------------------------
const say = (text, pause = 0.6) => ({ lang: NARRATION, text, pause });
const ko = (text, pause = 0.8, speed = 1) => ({ lang: "ko", text, pause, speed });
const slow = (text, pause = 0.8) => ko(text, pause, 0.8);
const { phrases, words } = teacher;

// Recall: the meaning, time to answer, then the Korean word.
const recall = (list) => list.flatMap((word) => [say(`${word.meaning}.`, 2.6), ko(word.ko, 1.2)]);

function shortVersion() {
  const lines = [say(teacher.intro, 1)];
  words.forEach((word) => lines.push(slow(word.ko, 0.5), say(`${word.meaning}.`, 0.5), ko(word.ko, 1.8)));
  lines.push(say(phrases.check, 1), ...recall(words));
  lines.push(say(teacher.outro, 1));
  return lines;
}

function fullVersion() {
  const lines = [say(teacher.intro, 1)];
  words.forEach((word, index) => {
    lines.push(
      slow(word.ko, 0.7),
      ko(word.ko, 0.6),
      say(`${word.meaning}.`, 0.5),
      say(word.tip, 0.6),
      say(phrases.example, 0.3),
      ko(word.exKo, 0.5, 0.9),
      say(word.ex, 0.8),
      say(phrases.repeat, 0.3),
      ko(word.ko, 2.2),
    );
    // A short check after every six words keeps the new words alive.
    if ((index + 1) % 6 === 0 && index + 1 < words.length) {
      lines.push(say(phrases.quick, 0.8), ...recall(words.slice(index - 5, index + 1)));
    }
  });
  lines.push(say(phrases.review, 1));
  words.forEach((word) => lines.push(ko(word.ko, 2.6), say(`${word.meaning}.`, 1)));
  lines.push(say(teacher.outro, 1));
  return lines;
}

// --- speech ------------------------------------------------------------------
// Returns 16-bit mono PCM at 24 kHz, at one loudness for every line: the two
// services speak about 9 dB apart.
async function speak(line) {
  return level(line.lang === "en" ? await speakEleven(line) : pcm(await speakVoiceLab(line)));
}

const TARGET_RMS = 8000;
const KNEE = 20000;
function level(samples) {
  let sum = 0;
  let count = 0;
  for (let offset = 0; offset + 1 < samples.length; offset += 2) {
    const value = Math.abs(samples.readInt16LE(offset));
    // Only speech counts, not the quiet edges.
    if (value > 500) {
      sum += value * value;
      count += 1;
    }
  }
  if (!count) return samples;
  const gain = Math.min(6, TARGET_RMS / Math.sqrt(sum / count));
  const out = Buffer.alloc(samples.length - (samples.length % 2));
  for (let offset = 0; offset < out.length; offset += 2) {
    const value = samples.readInt16LE(offset) * gain;
    const size = Math.abs(value);
    // Rare loud peaks are softened instead of clipped.
    const shaped = size > KNEE ? Math.min(32000, KNEE + (size - KNEE) * 0.25) : size;
    out.writeInt16LE(Math.round(Math.sign(value) * shaped), offset);
  }
  return out;
}

async function speakEleven(line) {
  const body = { text: line.text, model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2" };
  const key = createHash("sha256").update(JSON.stringify({ ...body, voice: VOICES.en })).digest("hex").slice(0, 24);
  const cached = path.join(cacheDir, `${key}.pcm`);
  if (existsSync(cached)) return readFileSync(cached);
  if (!process.env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is needed for English lines");
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICES.en}?output_format=pcm_24000`, {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.status === 200) {
      const raw = Buffer.from(await response.arrayBuffer());
      writeFileSync(cached, raw);
      process.stdout.write(".");
      return raw;
    }
    const detail = await response.text().catch(() => "");
    if (![429, 500, 503].includes(response.status)) throw new Error(`ElevenLabs ${response.status}: ${detail.slice(0, 200)} — ${line.text}`);
    await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
  }
  throw new Error(`ElevenLabs kept failing: ${line.text}`);
}

async function speakVoiceLab(line) {
  const body = { text: line.text, language: line.lang, voice_id: VOICES[line.lang], model_id: "lison-v2", speed: line.speed || 1 };
  const key = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 24);
  const cached = path.join(cacheDir, `${key}.wav`);
  if (existsSync(cached)) return readFileSync(cached);
  if (!process.env.VOICELAB_API_KEY) throw new Error("VOICELAB_API_KEY is needed for this line");
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
const narratorChars = [...unique.values()].filter((line) => line.lang === NARRATION).reduce((sum, line) => sum + line.text.length, 0);
console.log(`${lesson.id}: ${unique.size} distinct lines, about ${chars} characters before cache (${narratorChars} for the teacher)`);
if (process.env.DRY) process.exit(0);

const report = {};
for (const [name, lines] of Object.entries(versions)) {
  const parts = [silence(0.4)];
  for (const line of lines) parts.push(await speak(line), silence(line.pause));
  const wav = wavFile(parts);
  const target = path.join(outDir, `${lesson.id}${NARRATION === "uz" ? "" : `-${NARRATION}`}-${name}.wav`);
  writeFileSync(target, wav);
  report[name] = Math.round((wav.length - 44) / 2 / RATE);
}
console.log(`\n${JSON.stringify(report)} seconds`);

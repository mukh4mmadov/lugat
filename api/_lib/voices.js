import { createHash, randomBytes } from "crypto";

// Word pronunciations in Supabase (word_audio table + the public "word-audio"
// bucket). AI voices come from Gemini TTS; each one is transcribed back and
// kept only if it says exactly the word. Real people's recordings come from
// the recording page (admins, or anyone holding the recording link).

const BUCKET = "word-audio";
const TTS_MODELS = [process.env.TTS_MODEL, "gemini-2.5-flash-preview-tts", "gemini-2.5-flash-tts", "gemini-2.5-pro-preview-tts"].filter(Boolean);
const CHECK_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const VOICE = process.env.TTS_VOICE || "Kore";
const LINK_KEY = "voice_record_link";
const gemini = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

export const WORD = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9 ~?!.,-]{1,40}$/;
const normalize = (text) => String(text || "").replace(/[\s.,!?~·'"“”()-]/g, "");
const fileName = (word) => createHash("sha1").update(word).digest("hex").slice(0, 16);

// 16-bit mono PCM to a WAV file.
function wav(pcm, rate) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

let workingModel = null;
async function speak(word) {
  // The model that worked last goes first; the others are fallbacks when it
  // answers without audio (the preview models sometimes do).
  const models = workingModel ? [workingModel, ...TTS_MODELS.filter((model) => model !== workingModel)] : TTS_MODELS;
  let lastError = "";
  for (const model of models) {
    const response = await fetch(gemini(model), {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // A bare word is often answered with no audio; a short spoken-style
        // instruction is read as direction, not spoken (checked by hear()).
        contents: [{ parts: [{ text: `Say clearly, at a normal pace, in Korean: ${word}` }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
      }),
    });
    if (!response.ok) {
      lastError = `${model} ${response.status}: ${(await response.text().catch(() => "")).slice(0, 160)}`;
      if (response.status === 404 || response.status === 400) continue;
      throw new Error(lastError);
    }
    const data = await response.json();
    const part = data?.candidates?.[0]?.content?.parts?.find((item) => item.inlineData?.data);
    if (!part) {
      lastError = `${model}: no audio (${data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason || "?"})`;
      continue;
    }
    workingModel = model;
    const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType || "")?.[1]) || 24000;
    const pcm = Buffer.from(part.inlineData.data, "base64");
    return { audio: wav(pcm, rate), seconds: pcm.length / (rate * 2), model };
  }
  throw new Error(`No TTS model worked. ${lastError}`);
}

// What a listener hears in the audio, in Hangul.
async function hear(audio) {
  const response = await fetch(gemini(CHECK_MODEL), {
    method: "POST",
    signal: AbortSignal.timeout(12000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: "audio/wav", data: audio.toString("base64") } }, { text: "Write exactly the Korean word or phrase spoken in this audio, in Hangul. Reply with only that text." }] }],
      generationConfig: { temperature: 0 },
    }),
  });
  if (!response.ok) throw new Error(`check ${response.status}`);
  const data = await response.json();
  return String(data?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
}

async function save(db, word, buffer, mime, source, extra) {
  const extension = { "audio/wav": "wav", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a" }[mime] || "bin";
  const path = `${source}/${fileName(word)}-${Date.now().toString(36)}.${extension}`;
  const { error: uploadError } = await db.storage.from(BUCKET).upload(path, buffer, { contentType: mime, upsert: true, cacheControl: "31536000" });
  if (uploadError) throw new Error(`upload: ${uploadError.message}`);
  const { data: previous } = await db.from("word_audio").select("path").eq("word", word).maybeSingle();
  const { error } = await db.from("word_audio").upsert({ word, source, path, ...extra });
  if (error) throw new Error(`save: ${error.message}`);
  if (previous?.path && previous.path !== path) await db.storage.from(BUCKET).remove([previous.path]);
  return path;
}

// AI voices for up to 5 words that have none yet; never replaces a recording.
// Stops before the function time limit: unfinished words come back as
// { later: true } for the next request.
export async function generateVoices(db, words, actorId) {
  const deadline = Date.now() + 45000;
  const list = [...new Set((Array.isArray(words) ? words : []).map((word) => String(word).trim()))].filter((word) => WORD.test(word)).slice(0, 5);
  const { data: existing } = await db.from("word_audio").select("word, source").in("word", list.length ? list : ["-"]);
  const taken = new Set((existing || []).map((row) => row.word));
  const results = [];
  for (const word of list) {
    if (Date.now() > deadline - 25000) {
      results.push({ word, ok: false, later: true });
      continue;
    }
    if (taken.has(word)) {
      results.push({ word, ok: true, skipped: true });
      continue;
    }
    let heard = "";
    let ok = false;
    let error = "";
    for (let attempt = 0; attempt < 3 && !ok && (attempt === 0 || Date.now() < deadline - 25000); attempt += 1) {
      try {
        const voice = await speak(word);
        if (voice.seconds < 0.25 || voice.seconds > 6) {
          heard = `length ${voice.seconds.toFixed(2)}s`;
          continue;
        }
        heard = await hear(voice.audio);
        if (normalize(heard) === normalize(word)) {
          await save(db, word, voice.audio, "audio/wav", "ai", { speaker: `Gemini (${VOICE})`, model: voice.model, created_by: actorId });
          ok = true;
        }
      } catch (caught) {
        // Try again while there is time; the last reason is reported.
        error = caught.message.slice(0, 200);
      }
    }
    results.push({ word, ok, heard, error });
  }
  return results;
}

export async function saveRecording(db, { word, audio, mime, speaker, actorId }) {
  const text = String(word || "").trim();
  if (!WORD.test(text)) return [400, { error: "Invalid word" }];
  const type = String(mime || "").split(";")[0];
  if (!["audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/mpeg"].includes(type)) return [400, { error: "Unsupported audio" }];
  const buffer = Buffer.from(String(audio || ""), "base64");
  if (buffer.length < 1500 || buffer.length > 1500000) return [400, { error: "Recording is empty or too long" }];
  const path = await save(db, text, buffer, type, "human", { speaker: String(speaker || "").slice(0, 80), model: "", created_by: actorId || null });
  return [200, { saved: true, path }];
}

export async function deleteVoice(db, word) {
  const { data } = await db.from("word_audio").select("path").eq("word", String(word || "")).maybeSingle();
  if (!data) return [404, { error: "Not found" }];
  await db.storage.from(BUCKET).remove([data.path]);
  await db.from("word_audio").delete().eq("word", String(word));
  return [200, { deleted: true }];
}

// The recording link for a native speaker who is not an admin.
export async function createRecordingLink(db, label) {
  const value = { token: randomBytes(18).toString("base64url"), label: String(label || "").trim().slice(0, 60) || "Speaker", createdAt: new Date().toISOString() };
  const { error } = await db.from("app_settings").upsert({ key: LINK_KEY, value });
  if (error) return [500, { error: "Could not create the link" }];
  return [200, value];
}

export async function revokeRecordingLink(db) {
  await db.from("app_settings").delete().eq("key", LINK_KEY);
  return [200, { revoked: true }];
}

export async function recordingLink(db, token = null) {
  const { data } = await db.from("app_settings").select("value").eq("key", LINK_KEY).maybeSingle();
  if (!data?.value?.token) return null;
  if (token !== null && token !== data.value.token) return null;
  return data.value;
}

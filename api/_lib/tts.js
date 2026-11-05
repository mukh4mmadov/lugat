// Korean speech for Friday's replies and word pronunciations, best first:
//  1. Google Cloud Text-to-Speech (Chirp 3 HD) when GOOGLE_TTS_API_KEY is set.
//     Usage is counted per month in app_settings and stops below the free
//     allowance (GOOGLE_TTS_MONTHLY_CHARS, default 950 000).
//  2. Cloudflare Workers AI (MeloTTS) when CLOUDFLARE_ACCOUNT_ID and
//     CLOUDFLARE_AI_TOKEN are set: free daily allowance, and the free plan
//     refuses instead of charging once it is used up.
// Otherwise (or on failure) callers use the browser voice.
//   GOOGLE_TTS_VOICE  optional voice name (default ko-KR-Chirp3-HD-Kore)

const VOICES = [process.env.GOOGLE_TTS_VOICE, "ko-KR-Chirp3-HD-Kore", "ko-KR-Chirp3-HD-Aoede", "ko-KR-Neural2-A"].filter(Boolean);
const MONTHLY_LIMIT = Number(process.env.GOOGLE_TTS_MONTHLY_CHARS) || 950000;

const googleConfigured = () => Boolean(process.env.GOOGLE_TTS_API_KEY);
const cloudflareConfigured = () => Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_AI_TOKEN);
export const ttsConfigured = () => googleConfigured() || cloudflareConfigured();

const usageKey = () => `tts_usage_${new Date().toISOString().slice(0, 7)}`;

async function usedChars(db) {
  const { data } = await db.from("app_settings").select("value").eq("key", usageKey()).maybeSingle();
  return Number(data?.value?.chars) || 0;
}

let workingVoice = null;

// Resolves to { audio: base64, mime, voice } or null (not configured, over the
// limits, or the services failed): callers then use the browser voice.
export async function synthesize(db, text) {
  const input = String(text || "").trim().slice(0, 600);
  if (!input) return null;
  return (googleConfigured() && (await synthesizeGoogle(db, input))) || (cloudflareConfigured() && (await synthesizeCloudflare(input))) || null;
}

const SPEECH_RATE = 16000;

// MeloTTS sends 44.1 kHz WAV, about 90 KB a second. Speech keeps its clarity at
// 16 kHz, a third of the size, which matters on phones. Anything but 16-bit
// mono PCM is returned untouched.
export function shrinkWav(base64) {
  const wav = Buffer.from(base64, "base64");
  if (wav.toString("latin1", 0, 4) !== "RIFF" || wav.toString("latin1", 8, 12) !== "WAVE") return base64;
  let format = null;
  let data = null;
  for (let offset = 12; offset + 8 <= wav.length; ) {
    const id = wav.toString("latin1", offset, offset + 4);
    const size = wav.readUInt32LE(offset + 4);
    if (id === "fmt ") format = offset + 8;
    if (id === "data") {
      data = wav.subarray(offset + 8, Math.min(offset + 8 + size, wav.length));
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (!format || !data) return base64;
  const rate = wav.readUInt32LE(format + 4);
  if (wav.readUInt16LE(format) !== 1 || wav.readUInt16LE(format + 2) !== 1 || wav.readUInt16LE(format + 14) !== 16 || rate <= SPEECH_RATE) return base64;

  const inputSamples = Math.floor(data.length / 2);
  const ratio = rate / SPEECH_RATE;
  const samples = Math.floor(inputSamples / ratio);
  const output = Buffer.alloc(44 + samples * 2);
  output.write("RIFF", 0, "latin1");
  output.writeUInt32LE(36 + samples * 2, 4);
  output.write("WAVEfmt ", 8, "latin1");
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(SPEECH_RATE, 24);
  output.writeUInt32LE(SPEECH_RATE * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write("data", 36, "latin1");
  output.writeUInt32LE(samples * 2, 40);
  // Averaging each span also removes the highs that would otherwise alias.
  for (let index = 0; index < samples; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(inputSamples, Math.max(start + 1, Math.floor((index + 1) * ratio)));
    let sum = 0;
    for (let sample = start; sample < end; sample += 1) sum += data.readInt16LE(sample * 2);
    output.writeInt16LE(Math.round(sum / (end - start)), 44 + index * 2);
  }
  return output.toString("base64");
}

const CLOUDFLARE_TIMEOUT_MS = 5000;
const CLOUDFLARE_PAUSE_MS = 5 * 60 * 1000;
let cloudflarePausedUntil = 0;

async function askCloudflare(input, lang, timeout) {
  const started = Date.now();
  // Values pasted into the host settings often carry a stray space.
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID.trim()}/ai/run/@cf/myshell-ai/melotts`, {
    method: "POST",
    signal: AbortSignal.timeout(timeout),
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_AI_TOKEN.trim()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: input, lang }),
  });
  const type = response.headers.get("content-type") || "";
  if (!response.ok) return { status: response.status, ms: Date.now() - started, detail: (await response.text().catch(() => "")).slice(0, 300) };
  const audio = type.includes("json") ? (await response.json())?.result?.audio : Buffer.from(await response.arrayBuffer()).toString("base64");
  return { status: response.status, ms: Date.now() - started, audio: audio || null };
}

// A reply never waits long for its voice, and a service that is failing is
// left alone for a few minutes instead of slowing every reply.
async function synthesizeCloudflare(input) {
  if (Date.now() < cloudflarePausedUntil) return null;
  try {
    const result = await askCloudflare(input, "kr", CLOUDFLARE_TIMEOUT_MS);
    if (result.audio) return { audio: shrinkWav(result.audio), mime: "audio/wav", voice: "Cloudflare MeloTTS" };
    console.error("Cloudflare TTS failed:", result.status, result.detail);
  } catch (error) {
    console.error("Cloudflare TTS error:", error.message);
  }
  cloudflarePausedUntil = Date.now() + CLOUDFLARE_PAUSE_MS;
  return null;
}

// For the admin: which services are set up and what each one answers.
export async function checkTts() {
  const report = { google: googleConfigured(), cloudflare: cloudflareConfigured(), attempts: [] };
  const fallback = process.env.SPEAKING_FALLBACK_MODEL || "gemini-3.1-flash-lite";
  const answer = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${fallback}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Say OK" }] }] }),
  }).catch(() => null);
  report.fallbackModel = { name: fallback, status: answer?.status ?? "no answer" };
  const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${process.env.GEMINI_API_KEY}`, { signal: AbortSignal.timeout(10000) }).then((response) => response.json()).catch(() => null);
  report.models = (models?.models || []).filter((model) => model.supportedGenerationMethods?.includes("generateContent") && /flash/.test(model.name) && !/tts|image|live|audio/.test(model.name)).map((model) => model.name.replace("models/", ""));
  if (!report.cloudflare) return report;
  try {
    const result = await askCloudflare("안녕하세요, 저는 프라이데이예요.", "kr", 12000);
    report.attempts.push({ status: result.status, ms: result.ms, audioKb: result.audio ? Math.round(shrinkWav(result.audio).length / 1365) : 0, detail: result.detail || "" });
  } catch (error) {
    report.attempts.push({ error: error.message.slice(0, 160) });
  }
  return report;
}

async function synthesizeGoogle(db, input) {
  try {
    const used = await usedChars(db);
    if (used + input.length > MONTHLY_LIMIT) return null;
    const voices = workingVoice ? [workingVoice, ...VOICES.filter((voice) => voice !== workingVoice)] : VOICES;
    for (const name of voices) {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`, {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: { text: input }, voice: { languageCode: "ko-KR", name }, audioConfig: { audioEncoding: "MP3" } }),
      });
      // An unknown voice name: try the next one.
      if (response.status === 400 || response.status === 404) continue;
      if (!response.ok) {
        console.error("TTS failed:", response.status, (await response.text().catch(() => "")).slice(0, 200));
        return null;
      }
      const data = await response.json();
      if (!data.audioContent) return null;
      workingVoice = name;
      await db.from("app_settings").upsert({ key: usageKey(), value: { chars: used + input.length } });
      return { audio: data.audioContent, mime: "audio/mpeg", voice: name };
    }
    return null;
  } catch (error) {
    console.error("TTS error:", error.message);
    return null;
  }
}

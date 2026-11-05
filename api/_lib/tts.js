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

// Resolves to { audio: base64 MP3, voice } or null (not configured, over the
// limits, or the services failed): callers then use the browser voice.
export async function synthesize(db, text) {
  const input = String(text || "").trim().slice(0, 600);
  if (!input) return null;
  return (googleConfigured() && (await synthesizeGoogle(db, input))) || (cloudflareConfigured() && (await synthesizeCloudflare(input))) || null;
}

const CLOUDFLARE_TIMEOUT_MS = 5000;
const CLOUDFLARE_PAUSE_MS = 5 * 60 * 1000;
let cloudflareLang = null;
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
  // MeloTTS names Korean "KR"; try the spellings the API may expect.
  for (const lang of cloudflareLang ? [cloudflareLang] : ["kr", "ko", "KR"]) {
    try {
      const result = await askCloudflare(input, lang, CLOUDFLARE_TIMEOUT_MS);
      if (result.audio) {
        cloudflareLang = lang;
        return { audio: result.audio, voice: `Cloudflare MeloTTS (${lang})` };
      }
      if (result.status === 400) continue;
      console.error("Cloudflare TTS failed:", result.status, result.detail);
      break;
    } catch (error) {
      console.error("Cloudflare TTS error:", error.message);
      break;
    }
  }
  cloudflarePausedUntil = Date.now() + CLOUDFLARE_PAUSE_MS;
  return null;
}

// For the admin: which services are set up and what each one answers.
export async function checkTts() {
  const report = { google: googleConfigured(), cloudflare: cloudflareConfigured(), attempts: [] };
  if (!report.cloudflare) return report;
  for (const lang of ["kr", "ko", "KR", "en"]) {
    try {
      const result = await askCloudflare(lang === "en" ? "Hello" : "안녕하세요, 저는 프라이데이예요.", lang, 12000);
      report.attempts.push({ lang, status: result.status, ms: result.ms, audioKb: result.audio ? Math.round(result.audio.length / 1365) : 0, detail: result.detail || "" });
    } catch (error) {
      report.attempts.push({ lang, error: error.message.slice(0, 160) });
    }
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
      return { audio: data.audioContent, voice: name };
    }
    return null;
  } catch (error) {
    console.error("TTS error:", error.message);
    return null;
  }
}

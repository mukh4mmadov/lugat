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

let cloudflareLang = null;
async function synthesizeCloudflare(input) {
  // MeloTTS names Korean "KR"; try the spellings the API may expect.
  for (const lang of cloudflareLang ? [cloudflareLang] : ["kr", "ko", "KR"]) {
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/myshell-ai/melotts`, {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_AI_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, lang }),
      });
      if (!response.ok) {
        const detail = (await response.text().catch(() => "")).slice(0, 200);
        if (response.status === 400) continue;
        console.error("Cloudflare TTS failed:", response.status, detail);
        return null;
      }
      const type = response.headers.get("content-type") || "";
      const audio = type.includes("json") ? (await response.json())?.result?.audio : Buffer.from(await response.arrayBuffer()).toString("base64");
      if (!audio) continue;
      cloudflareLang = lang;
      return { audio, voice: `Cloudflare MeloTTS (${lang})` };
    } catch (error) {
      console.error("Cloudflare TTS error:", error.message);
      return null;
    }
  }
  return null;
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

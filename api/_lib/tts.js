// Natural Korean speech from Google Cloud Text-to-Speech (Chirp 3 HD voices),
// used for Friday's replies and word pronunciations. Usage is counted per
// month in app_settings and stops below the free allowance, so the site falls
// back to the browser voice instead of running up a bill.
//   GOOGLE_TTS_API_KEY     API key restricted to the Text-to-Speech API
//   GOOGLE_TTS_VOICE       optional voice name (default ko-KR-Chirp3-HD-Kore)
//   GOOGLE_TTS_MONTHLY_CHARS  optional cap (default 950 000 of the 1 000 000 free)

const VOICES = [process.env.GOOGLE_TTS_VOICE, "ko-KR-Chirp3-HD-Kore", "ko-KR-Chirp3-HD-Aoede", "ko-KR-Neural2-A"].filter(Boolean);
const MONTHLY_LIMIT = Number(process.env.GOOGLE_TTS_MONTHLY_CHARS) || 950000;

export const ttsConfigured = () => Boolean(process.env.GOOGLE_TTS_API_KEY);

const usageKey = () => `tts_usage_${new Date().toISOString().slice(0, 7)}`;

async function usedChars(db) {
  const { data } = await db.from("app_settings").select("value").eq("key", usageKey()).maybeSingle();
  return Number(data?.value?.chars) || 0;
}

let workingVoice = null;

// Resolves to { audio: base64 MP3, voice } or null (not configured, over the
// monthly cap, or the service failed): callers then use the browser voice.
export async function synthesize(db, text) {
  const input = String(text || "").trim().slice(0, 600);
  if (!ttsConfigured() || !input) return null;
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

// Korean pronunciation uses the browser's own speech engine. Some devices have
// no Korean voice installed and would stay silent, so we look for one first
// and tell the learner how to install it when it is missing.

export const NO_VOICE_EVENT = "k-talim:no-korean-voice";

// Better-sounding voices first when a device offers several.
const PREFERRED = [/google/i, /yuna/i, /sora/i, /heami/i, /microsoft/i, /samsung/i];

let cachedVoice = null;

function supported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function findKoreanVoice() {
  const voices = window.speechSynthesis.getVoices();
  const korean = voices.filter((voice) => /^ko([-_]|$)/i.test(voice.lang));
  if (!korean.length) return null;
  return PREFERRED.map((pattern) => korean.find((voice) => pattern.test(voice.name))).find(Boolean) || korean[0];
}

// Voices load asynchronously; resolves to "ok", "missing" or "unsupported".
export function koreanVoiceStatus(timeout = 1500) {
  if (!supported()) return Promise.resolve("unsupported");
  if (findKoreanVoice()) return Promise.resolve("ok");
  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", done);
      resolve(findKoreanVoice() ? "ok" : "missing");
    };
    window.speechSynthesis.addEventListener?.("voiceschanged", done);
    setTimeout(done, timeout);
  });
}

export function speakKorean(text, rate = 0.82) {
  if (!supported()) {
    window.dispatchEvent?.(new CustomEvent(NO_VOICE_EVENT, { detail: "unsupported" }));
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  cachedVoice = cachedVoice || findKoreanVoice();
  if (cachedVoice) utterance.voice = cachedVoice;
  utterance.lang = "ko-KR";
  utterance.rate = rate;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  // Some browsers report no voices until the first speak() call.
  if (!cachedVoice) {
    koreanVoiceStatus().then((status) => {
      if (status !== "ok") window.dispatchEvent(new CustomEvent(NO_VOICE_EVENT, { detail: status }));
    });
  }
}

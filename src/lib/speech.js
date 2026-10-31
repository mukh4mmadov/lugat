// Korean pronunciation uses the browser's own speech engine. Some devices have
// no Korean voice installed and would stay silent, so we look for one first
// and tell the learner how to install it when it is missing.

export const NO_VOICE_EVENT = "k-talim:no-korean-voice";

// Better-sounding voices first when a device offers several.
// Female voices are preferred: the AI partner, Friday, speaks with them.
const PREFERRED = [/google/i, /yuna/i, /sora/i, /heami/i, /microsoft/i, /samsung/i];
const MALE = /injoon|minsu|jian|\bmale\b/i;

let cachedVoice = null;

function supported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function findKoreanVoice() {
  const voices = window.speechSynthesis.getVoices();
  const all = voices.filter((voice) => /^ko([-_]|$)/i.test(voice.lang));
  if (!all.length) return null;
  const female = all.filter((voice) => !MALE.test(voice.name));
  const korean = female.length ? female : all;
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

// Resolves when the text has been read (or reading failed), so callers can
// wait for it, e.g. to highlight the next sentence.
export function speakKorean(text, rate = 0.82) {
  if (!supported()) {
    window.dispatchEvent?.(new CustomEvent(NO_VOICE_EVENT, { detail: "unsupported" }));
    return Promise.resolve();
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  cachedVoice = cachedVoice || findKoreanVoice();
  if (cachedVoice) utterance.voice = cachedVoice;
  utterance.lang = "ko-KR";
  utterance.rate = rate;
  utterance.pitch = 1;
  const finished = new Promise((resolve) => {
    utterance.onend = resolve;
    utterance.onerror = resolve;
    // Some engines never fire "end"; give up after a generous estimate.
    setTimeout(resolve, 2000 + (text.length * 400) / rate);
  });
  window.speechSynthesis.speak(utterance);
  // Some browsers report no voices until the first speak() call.
  if (!cachedVoice) {
    koreanVoiceStatus().then((status) => {
      if (status !== "ok") window.dispatchEvent(new CustomEvent(NO_VOICE_EVENT, { detail: status }));
    });
  }
  return finished;
}

export function stopSpeaking() {
  if (supported()) window.speechSynthesis.cancel();
}

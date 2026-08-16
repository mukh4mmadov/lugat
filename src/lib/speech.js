export function speakKorean(text, rate = 0.82) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = rate;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

// One shared AudioContext: browsers cap how many can exist, and a new one per
// answer eventually stops producing sound.
let context = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!context) context = new AudioContextClass();
  if (context.state === "suspended") context.resume().catch(() => {});
  return context;
}

function playNotes(frequencies, spacing, volume, length) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  frequencies.forEach((freq, i) => {
    const start = now + i * spacing;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + length + 0.02);
  });
}

export function playCorrectSound() {
  playNotes([523.25, 659.25], 0.08, 0.08, 0.12);
}

export function playWrongSound() {
  playNotes([329.63, 261.63], 0.1, 0.06, 0.14);
}

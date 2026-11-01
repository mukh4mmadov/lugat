// Records the microphone as 16 kHz mono WAV. Browsers disagree on what
// MediaRecorder produces (webm, mp4, ogg), while WAV works everywhere and is
// what the speaking API expects. A 30-second turn is about 1 MB.

const TARGET_RATE = 16000;

export function microphoneSupported() {
  return Boolean(navigator.mediaDevices?.getUserMedia) && Boolean(window.AudioContext || window.webkitAudioContext);
}

function downsample(samples, fromRate) {
  if (fromRate === TARGET_RATE) return samples;
  const ratio = fromRate / TARGET_RATE;
  const length = Math.floor(samples.length / ratio);
  const result = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    // Average the source samples that fall into this output sample.
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j += 1) sum += samples[j];
    result[i] = sum / Math.max(1, end - start);
  }
  return result;
}

function encodeWav(samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset, value) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, value < 0 ? value * 0x8000 : value * 0x7fff, true);
  }
  return buffer;
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

// start() asks for the microphone; stop() resolves to { base64, seconds }.
// onLevel receives a 0..1 loudness value for a live meter.
export async function startRecording({ onLevel } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const context = new AudioCtx();
  const source = context.createMediaStreamSource(stream);
  // ScriptProcessor is deprecated but, unlike AudioWorklet, works on every
  // browser we support without a separate module file.
  const processor = context.createScriptProcessor(4096, 1, 1);
  const chunks = [];
  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(input));
    if (onLevel) {
      let sum = 0;
      for (let i = 0; i < input.length; i += 64) sum += input[i] * input[i];
      onLevel(Math.min(1, Math.sqrt(sum / (input.length / 64)) * 4));
    }
  };
  source.connect(processor);
  processor.connect(context.destination);

  let stopped = false;
  const release = () => {
    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    context.close().catch(() => {});
  };

  return {
    async stop() {
      if (stopped) return null;
      stopped = true;
      release();
      const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const merged = new Float32Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      const samples = downsample(merged, context.sampleRate);
      return { base64: toBase64(encodeWav(samples)), seconds: samples.length / TARGET_RATE };
    },
    cancel() {
      if (stopped) return;
      stopped = true;
      release();
    },
  };
}

import { supabase } from "./supabase";

const TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

// Records both voices of a live call, mixed into one file. Each side records
// its own copy, so the conversation survives if one learner closes the tab.
// Returns null when the browser can't record.
export function startCallRecording(local, remote) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!window.MediaRecorder || !AudioContext) return null;
  const mimeType = TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  const context = new AudioContext();
  context.resume?.();
  const mix = context.createMediaStreamDestination();
  [local, remote].forEach((stream) => stream?.getAudioTracks().length && context.createMediaStreamSource(stream).connect(mix));
  const recorder = new MediaRecorder(mix.stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 });
  const chunks = [];
  recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
  recorder.start(5000);

  return {
    stop: () =>
      new Promise((resolve) => {
        if (recorder.state === "inactive") {
          resolve(null);
          return;
        }
        recorder.onstop = () => {
          context.close();
          resolve(chunks.length ? new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" }) : null);
        };
        recorder.stop();
      }),
  };
}

// Uploads this learner's copy to the private call-recordings bucket.
export async function uploadCallRecording(callId, blob) {
  if (!blob?.size) return;
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) return;
  const contentType = blob.type.split(";")[0] || "audio/webm";
  const extension = contentType.includes("mp4") ? "m4a" : contentType.includes("ogg") ? "ogg" : "webm";
  const { error } = await supabase.storage.from("call-recordings").upload(`${callId}/${userId}.${extension}`, blob, { contentType });
  if (error) console.error("Call recording upload failed:", error.message);
}

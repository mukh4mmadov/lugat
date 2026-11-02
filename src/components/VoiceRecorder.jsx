import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
const MAX_SECONDS = 5;

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Records one word at a time: record, listen back, save and go to the next.
// `upload(word, base64, mime)` stores the recording (throws on failure).
export default function VoiceRecorder({ words, upload, onSaved }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const word = words[index];

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, []);
  useEffect(() => () => clip && URL.revokeObjectURL(clip.url), [clip]);

  async function start() {
    setMessage(null);
    setClip(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mime = TYPES.find((type) => window.MediaRecorder?.isTypeSupported(type)) || "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks = [];
      recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || mime || "audio/webm" });
        setClip({ blob, url: URL.createObjectURL(blob) });
        setRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      timerRef.current = setTimeout(() => recorder.state === "recording" && recorder.stop(), MAX_SECONDS * 1000);
    } catch {
      setMessage({ ok: false, text: t("voices.micDenied") });
    }
  }

  function stop() {
    clearTimeout(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  async function save() {
    if (!clip || !word) return;
    setBusy(true);
    setMessage(null);
    try {
      await upload(word.korean, await blobToBase64(clip.blob), clip.blob.type.split(";")[0]);
      onSaved?.(word.korean);
      setMessage({ ok: true, text: t("voices.saved", { word: word.korean }) });
      setClip(null);
      setIndex((value) => value + 1);
    } catch (error) {
      setMessage({ ok: false, text: error.message || t("voices.saveFailed") });
    } finally {
      setBusy(false);
    }
  }

  if (!word) return <p className="py-6 text-center font-bold text-emerald-600">✓ {t("voices.allDone")}</p>;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-bold text-slate-500">{t("voices.progress", { current: index + 1, total: words.length })}</p>
      <p className="mt-3 text-5xl font-black tracking-tight">{word.korean}</p>
      {word.meaning && <p className="mt-2 text-sm text-slate-500">{word.meaning}</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {recording ? (
          <button type="button" onClick={stop} className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950">⏹ {t("voices.stop")}</button>
        ) : (
          <button type="button" onClick={start} disabled={busy} className="rounded-2xl bg-rose-600 px-6 py-3 font-black text-white disabled:opacity-50">🔴 {clip ? t("voices.again") : t("voices.record")}</button>
        )}
        {clip && !recording && (
          <button type="button" onClick={save} disabled={busy} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white disabled:opacity-50">✓ {busy ? t("voices.saving") : t("voices.saveNext")}</button>
        )}
        <button type="button" onClick={() => { setClip(null); setIndex((value) => value + 1); }} disabled={recording || busy} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold disabled:opacity-50 dark:border-white/15">{t("voices.skip")} ⏭</button>
      </div>
      {recording && <p className="mt-3 animate-pulse text-sm font-bold text-rose-600">● {t("voices.recording", { seconds: MAX_SECONDS })}</p>}
      {clip && !recording && <audio controls src={clip.url} className="mx-auto mt-4 w-full max-w-xs" />}
      {message && <p role={message.ok ? "status" : "alert"} className={`mt-3 text-sm font-bold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>}
      <p className="mt-4 text-xs text-slate-500">{t("voices.tip")}</p>
    </div>
  );
}

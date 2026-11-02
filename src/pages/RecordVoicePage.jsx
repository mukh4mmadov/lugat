import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import VoiceRecorder from "../components/VoiceRecorder";
import { lessonVoiceWords, storedVoices, voiceStatus } from "../lib/voiceWords";

// Opened from the recording link an admin shares with a native speaker: no
// account needed, it only records the lesson words that have no real voice.
export default function RecordVoicePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("t") || "";
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const check = await fetch(`/api/admin?recordToken=${encodeURIComponent(token)}`).then((response) => response.json().then((data) => ({ ok: response.ok, data }))).catch(() => ({ ok: false, data: {} }));
      if (!check.ok) {
        if (!cancelled) setState({ loading: false, invalid: true });
        return;
      }
      const stored = await storedVoices();
      if (!cancelled) setState({ loading: false, label: check.data.label, stored });
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const words = useMemo(() => (state.stored ? lessonVoiceWords().filter((word) => ["none", "ai"].includes(voiceStatus(word.korean, state.stored))) : []), [state.stored]);

  async function upload(word, audio, mime) {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordToken: token, action: "voiceUpload", word, audio, mime }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || t("voices.saveFailed"));
  }

  return (
    <GlassCard className="mx-auto max-w-xl">
      <h1 className="text-2xl font-black">🎙 {t("voices.pageTitle")}</h1>
      {state.loading && <div className="mt-4 h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />}
      {state.invalid && <p className="mt-4 font-bold text-rose-600">{t("voices.linkInvalid")}</p>}
      {state.stored && (
        <>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("voices.pageText", { name: state.label })}</p>
          <div className="mt-4">
            <VoiceRecorder words={words} upload={upload} />
          </div>
        </>
      )}
    </GlassCard>
  );
}

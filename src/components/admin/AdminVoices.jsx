import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import VoiceRecorder from "../VoiceRecorder";
import { adminRequest } from "../../lib/adminApi";
import { loadVoiceMap } from "../../lib/voiceMap";
import { lessonVoiceWords, storedVoices, voiceStatus } from "../../lib/voiceWords";
import { speakKorean } from "../../lib/speech";
import { Panel, ServerNotice, StatTile } from "../../pages/AdminPage";

const BADGE = { human: "🎙", commons: "🌐", ai: "🤖", none: "—" };

// Pronunciations of the lesson words: who has a real voice, AI voices for the
// rest (each checked by listening back), and recordings by a native speaker.
export default function AdminVoices() {
  const { t } = useTranslation();
  const words = useMemo(() => lessonVoiceWords(), []);
  const [stored, setStored] = useState(null);
  const [error, setError] = useState(null);
  const [link, setLink] = useState(null);
  const [label, setLabel] = useState("");
  const [filter, setFilter] = useState("none");
  const [job, setJob] = useState(null);
  const [recording, setRecording] = useState(false);
  const stopRef = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [voices, current] = await Promise.all([storedVoices(), adminRequest({ action: "voiceLink" })]);
      setStored(voices);
      setLink(current.link);
    } catch (requestError) {
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const status = useMemo(() => (stored ? Object.fromEntries(words.map((word) => [word.korean, voiceStatus(word.korean, stored)])) : {}), [words, stored]);
  const counts = useMemo(() => Object.values(status).reduce((all, value) => ({ ...all, [value]: (all[value] || 0) + 1 }), {}), [status]);
  const missing = useMemo(() => words.filter((word) => status[word.korean] === "none"), [words, status]);
  const needHuman = useMemo(() => words.filter((word) => ["none", "ai"].includes(status[word.korean])), [words, status]);

  async function generate() {
    stopRef.current = false;
    const queue = missing.map((word) => word.korean);
    const failed = [];
    let done = 0;
    setJob({ total: queue.length, done, failed, running: true });
    for (let i = 0; i < queue.length && !stopRef.current; i += 5) {
      try {
        const { results } = await adminRequest({}, { action: "voiceGenerate", words: queue.slice(i, i + 5) });
        for (const result of results) {
          done += 1;
          if (!result.ok) failed.push(result);
        }
      } catch (requestError) {
        failed.push({ word: queue.slice(i, i + 5).join(", "), error: requestError.message });
        done += Math.min(5, queue.length - i);
      }
      setJob({ total: queue.length, done, failed: [...failed], running: true });
    }
    setJob((current) => ({ ...current, running: false }));
    await loadVoiceMap(true);
    load();
  }

  const shareUrl = link ? `${window.location.origin}/record-voice?t=${link.token}` : "";

  return (
    <div className="space-y-4">
      <ServerNotice error={error} onRetry={load} />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatTile tone="emerald" label={`🎙 ${t("voices.status.human")}`} value={counts.human || 0} />
        <StatTile tone="sky" label={`🌐 ${t("voices.status.commons")}`} value={counts.commons || 0} />
        <StatTile tone="violet" label={`🤖 ${t("voices.status.ai")}`} value={counts.ai || 0} />
        <StatTile tone="rose" label={t("voices.status.none")} value={counts.none || 0} hint={t("voices.ofTotal", { total: words.length })} />
      </div>

      <Panel title={`🤖 ${t("voices.aiTitle")}`}>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t("voices.aiText")}</p>
        {job ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${job.total ? (job.done / job.total) * 100 : 100}%` }} />
            </div>
            <p className="mt-2 text-sm font-bold">{t("voices.aiProgress", { done: job.done, total: job.total, failed: job.failed.length })}</p>
            {job.running && <button type="button" onClick={() => (stopRef.current = true)} className="mt-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-black dark:border-white/15">{t("voices.stopJob")}</button>}
            {!job.running && job.failed.length > 0 && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer font-bold text-rose-600">{t("voices.aiFailed", { count: job.failed.length })}</summary>
                <ul className="mt-1 space-y-0.5">{job.failed.map((item) => <li key={item.word}>{item.word}: {item.error || `“${item.heard}”`}</li>)}</ul>
              </details>
            )}
          </div>
        ) : (
          <button type="button" disabled={!stored || !missing.length} onClick={generate} className="mt-3 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">
            {t("voices.aiButton", { count: missing.length })}
          </button>
        )}
      </Panel>

      <Panel title={`🎙 ${t("voices.linkTitle")}`}>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t("voices.linkText")}</p>
        {link ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-bold text-slate-500">{link.label}</p>
            <div className="flex gap-2">
              <input readOnly value={shareUrl} onFocus={(event) => event.target.select()} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-slate-900" />
              <button type="button" onClick={() => navigator.clipboard?.writeText(shareUrl)} className="shrink-0 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950">{t("voices.copy")}</button>
            </div>
            <button type="button" onClick={async () => { await adminRequest({}, { action: "voiceLinkRevoke" }); load(); }} className="text-xs font-bold text-rose-600">{t("voices.revoke")}</button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={t("voices.labelPlaceholder")} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-900" />
            <button type="button" onClick={async () => { await adminRequest({}, { action: "voiceLink", label }); load(); }} className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">{t("voices.createLink")}</button>
          </div>
        )}
        <button type="button" onClick={() => setRecording(!recording)} className="mt-4 rounded-xl border border-slate-300 px-3 py-2 text-xs font-black dark:border-white/15">
          {recording ? t("voices.hideRecorder") : t("voices.recordMyself", { count: needHuman.length })}
        </button>
        {recording && stored && (
          <div className="mt-3">
            <VoiceRecorder words={needHuman} upload={(word, audio, mime) => adminRequest({}, { action: "voiceUpload", word, audio, mime })} onSaved={() => loadVoiceMap(true)} />
          </div>
        )}
      </Panel>

      <Panel title={t("voices.listTitle")}>
        <div className="mb-3 flex flex-wrap gap-2">
          {["none", "ai", "commons", "human", "all"].map((key) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`rounded-xl px-3 py-1.5 text-xs font-black ${filter === key ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 dark:bg-white/10"}`}>
              {key === "all" ? t("voices.all") : `${BADGE[key]} ${t(`voices.status.${key}`)}`} {key !== "all" && `(${counts[key] || 0})`}
            </button>
          ))}
        </div>
        <ul className="max-h-[28rem] divide-y divide-slate-100 overflow-y-auto text-sm dark:divide-white/5">
          {words.filter((word) => filter === "all" || status[word.korean] === filter).map((word) => (
            <li key={word.korean} className="flex items-center gap-3 py-1.5">
              <span className="w-6 text-center">{BADGE[status[word.korean]]}</span>
              <button type="button" onClick={() => speakKorean(word.korean)} className="font-black hover:text-sky-600">{word.korean}</button>
              <span className="min-w-0 flex-1 truncate text-slate-500">{word.meaning}</span>
              {stored?.[word.korean] && <span className="hidden text-xs text-slate-400 sm:inline">{stored[word.korean].speaker}</span>}
              {stored?.[word.korean] && (
                <button type="button" onClick={async () => { await adminRequest({}, { action: "voiceDelete", word: word.korean }); await loadVoiceMap(true); load(); }} className="text-xs font-bold text-rose-600">{t("voices.remove")}</button>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

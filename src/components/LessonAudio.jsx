import { useState } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "./GlassCard";
import { lessonAudio } from "../data/lessonAudio";

// The lesson's listening version (beta): the Korean words with their Uzbek
// meanings, examples and recaps, to play on the go. Plays with the screen off.
export default function LessonAudio({ lesson }) {
  const { t } = useTranslation();
  const audio = lessonAudio(lesson);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState("short");
  if (!audio) return null;
  const kinds = Object.keys(audio);
  const kind = audio[picked] ? picked : kinds[0];
  const current = audio[kind];
  const minutes = (seconds) => Math.max(1, Math.round(seconds / 60));

  const setMetadata = () => {
    if (!("mediaSession" in navigator) || typeof window.MediaMetadata !== "function") return;
    navigator.mediaSession.metadata = new window.MediaMetadata({ title: `${t("card.lesson", { lesson })} · ${t("lessonAudio.title")}`, artist: "K-TALIM" });
  };

  return (
    <GlassCard className="p-4 md:p-5">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">🎧</span>
          <span className="font-black">{t("lessonAudio.title")}</span>
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">{t("lessonAudio.beta")}</span>
        </span>
        <span className="text-sm font-bold text-sky-600 dark:text-sky-300">{open ? "▲" : t("lessonAudio.open")}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("lessonAudio.text")}</p>
          <div className={`grid gap-2 ${kinds.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {kinds.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPicked(value)}
                aria-pressed={kind === value}
                className={`rounded-xl border px-3 py-2 text-sm font-black transition ${kind === value ? "border-sky-400 bg-sky-500/10 text-sky-700 dark:text-sky-200" : "border-slate-200 dark:border-white/10"}`}
              >
                {t(`lessonAudio.${value}`, { min: minutes(audio[value].seconds) })}
              </button>
            ))}
          </div>
          <audio key={current.url} controls preload="none" src={current.url} onPlay={setMetadata} className="w-full">
            <track kind="captions" />
          </audio>
          {/* The file is on another host, so the storage itself is asked to send it as a download. */}
          <a href={`${current.url}?download=K-TALIM-${lesson}-dars-${kind === "full" ? "toliq" : "qisqa"}.mp3`} className="inline-flex text-sm font-bold text-sky-600 dark:text-sky-300">⬇ {t("lessonAudio.download")}</a>
        </div>
      )}
    </GlassCard>
  );
}

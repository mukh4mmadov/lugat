import { useState } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "./GlassCard";
import { lessonAudio } from "../data/lessonAudio";

const chip = (active) =>
  `rounded-xl border px-3 py-2 text-sm font-black transition ${active ? "border-sky-400 bg-sky-500/10 text-sky-700 dark:text-sky-200" : "border-slate-200 dark:border-white/10"}`;

export default function LessonAudio({ lesson }) {
  const { t, i18n } = useTranslation();
  const audio = lessonAudio(lesson);
  const [open, setOpen] = useState(false);
  const [pickedLanguage, setPickedLanguage] = useState(null);
  const [pickedKind, setPickedKind] = useState("short");
  if (!audio) return null;
  const languages = Object.keys(audio);
  const uiLanguage = String(i18n.language || "uz").slice(0, 2);
  const language = audio[pickedLanguage] ? pickedLanguage : audio[uiLanguage] ? uiLanguage : languages[0];
  const versions = audio[language];
  const kinds = Object.keys(versions);
  const kind = versions[pickedKind] ? pickedKind : kinds[0];
  const current = versions[kind];
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
          {languages.length > 1 && (
            <div className="grid grid-cols-2 gap-2" role="group" aria-label={t("lessonAudio.language")}>
              {languages.map((value) => (
                <button key={value} type="button" onClick={() => setPickedLanguage(value)} aria-pressed={language === value} className={chip(language === value)}>
                  {t(`lessonAudio.lang.${value}`)}
                </button>
              ))}
            </div>
          )}
          <div className={`grid gap-2 ${kinds.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {kinds.map((value) => (
              <button key={value} type="button" onClick={() => setPickedKind(value)} aria-pressed={kind === value} className={chip(kind === value)}>
                {t(`lessonAudio.${value}`, { min: minutes(versions[value].seconds) })}
              </button>
            ))}
          </div>
          <audio key={current.url} controls preload="none" src={current.url} onPlay={setMetadata} className="w-full">
            <track kind="captions" />
          </audio>
          <a href={`${current.url}?download=K-TALIM-${lesson}-${language}-${kind}.mp3`} className="inline-flex text-sm font-bold text-sky-600 dark:text-sky-300">⬇ {t("lessonAudio.download")}</a>
        </div>
      )}
    </GlassCard>
  );
}

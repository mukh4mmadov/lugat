import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import credits from "../data/wordAudioCredits.json";
import { speakKorean } from "../lib/speech";

// Who recorded the real-voice pronunciations, under which licence, and where
// each recording comes from (required by CC BY and CC BY-SA).
export default function AudioCreditsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? credits.filter((item) => `${item.word} ${item.author}`.toLowerCase().includes(needle)) : credits;
  }, [query]);

  return (
    <GlassCard className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-black md:text-3xl">🎙 {t("audioCredits.title")}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("audioCredits.text", { count: credits.length })}</p>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("audioCredits.search")}
        aria-label={t("audioCredits.search")}
        className="premium-input mt-4"
      />
      <ul className="mt-4 divide-y divide-slate-100 text-sm dark:divide-white/10">
        {shown.map((item) => (
          <li key={item.word} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
            <button type="button" onClick={() => speakKorean(item.word)} className="font-black hover:text-sky-600" aria-label={t("audioCredits.listen", { word: item.word })}>
              🔊 {item.word}
            </button>
            <span className="text-slate-500">{item.author || "—"}</span>
            <span className="ml-auto flex gap-2 text-xs">
              {item.licenseUrl ? (
                <a href={item.licenseUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-sky-600 dark:text-sky-300">{item.license}</a>
              ) : (
                <span>{item.license}</span>
              )}
              <a href={item.source} target="_blank" rel="noopener noreferrer" className="text-slate-500 underline">{t("audioCredits.source")}</a>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

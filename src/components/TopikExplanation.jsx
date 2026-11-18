import { useTranslation } from "react-i18next";

const LANG_INDEX = { uz: 1, en: 2, ru: 3 };

// K-TALIM's written explanation of one TOPIK question, in the interface
// language, with its key words.
export default function TopikExplanation({ entry, className = "" }) {
  const { t, i18n } = useTranslation();
  if (!entry) return null;
  const lang = String(i18n.language || "uz").slice(0, 2);
  const text = entry[lang] || entry.uz;
  const index = LANG_INDEX[lang] || 1;
  return (
    <div className={`rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm leading-6 dark:border-sky-400/20 dark:bg-sky-500/10 ${className}`}>
      <p className="text-xs font-black uppercase tracking-widest text-sky-700 dark:text-sky-300">💡 {t("topik.explain.title")}</p>
      <p className="mt-1.5 text-slate-800 dark:text-slate-100">{text}</p>
      {entry.words?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.words.map((row) => (
            <span key={row[0]} className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200">
              <span lang="ko">{row[0]}</span> — {row[index] || row[1]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

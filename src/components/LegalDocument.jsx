import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { m as motion } from "framer-motion";
import GlassCard from "./GlassCard";
import LanguageSelector from "./LanguageSelector";

// One block of a section's text: lines starting with "- " form a list, any
// other line is a paragraph. Blocks are separated by a blank line.
function Block({ text }) {
  const lines = text.split("\n").filter((line) => line.trim());
  const items = lines.filter((line) => line.startsWith("- "));
  const lead = lines.filter((line) => !line.startsWith("- "));
  return (
    <>
      {lead.map((line, index) => (
        <p key={`p${index}`} className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">{line}</p>
      ))}
      {items.length > 0 && (
        <ul className="list-disc space-y-1.5 pl-5 text-sm font-medium leading-relaxed text-slate-600 marker:text-slate-400 dark:text-slate-300">
          {items.map((line, index) => <li key={index}>{line.slice(2)}</li>)}
        </ul>
      )}
    </>
  );
}

// The privacy policy and the terms: a title, the date, an introduction and
// numbered sections, all from the locale files under one prefix.
export default function LegalDocument({ prefix, count }) {
  const { t } = useTranslation();
  const sections = Array.from({ length: count }, (_, index) => `s${index + 1}`);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-base font-black text-white">K</div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">K-TALIM</span>
          </Link>
          <LanguageSelector />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <GlassCard className="p-6 md:p-10">
            <header className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">{t(`${prefix}.title`)}</h1>
              <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">{t(`${prefix}.lastUpdated`)}</p>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">{t(`${prefix}.intro`)}</p>
            </header>

            <nav aria-label={t(`${prefix}.title`)} className="mb-8 rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <ol className="grid gap-1 text-sm font-bold sm:grid-cols-2">
                {sections.map((key) => (
                  <li key={key}><a href={`#${prefix}-${key}`} className="text-sky-700 hover:underline dark:text-sky-300">{t(`${prefix}.${key}.title`)}</a></li>
                ))}
              </ol>
            </nav>

            <div className="space-y-8">
              {sections.map((key) => (
                <section key={key} id={`${prefix}-${key}`} className="scroll-mt-24 space-y-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{t(`${prefix}.${key}.title`)}</h2>
                  {t(`${prefix}.${key}`).split("\n\n").map((block, index) => <Block key={index} text={block} />)}
                </section>
              ))}
            </div>

            <div className="mt-10 border-t border-slate-200 pt-6 dark:border-white/10">
              <Link to="/" className="action-btn inline-flex bg-slate-950 text-white dark:bg-white dark:text-slate-950">{t("common.back") || "Back"}</Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

import { Link, Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { GUIDES, getGuide } from "../data/guides";
import { speakKorean } from "../lib/speech";

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;

// A table cell; in the Korean column a tap reads the Korean part aloud.
function Cell({ text, korean, rate, label }) {
  if (!korean || !HANGUL.test(text)) return <td className="px-2 py-2 align-top sm:px-3">{text}</td>;
  const spoken = text.split("→")[0].replace(/[[\]]/g, "").trim();
  return (
    <td className="px-3 py-2 align-top">
      <button type="button" onClick={() => speakKorean(spoken, rate)} aria-label={`${label}: ${spoken}`} className="inline-flex items-center gap-1.5 rounded-lg text-left font-bold text-slate-900 hover:text-sky-700 dark:text-white dark:hover:text-sky-300">
        <span lang="ko" className="text-base">{text}</span>
        <span aria-hidden="true" className="text-xs">🔊</span>
      </button>
    </td>
  );
}

function Block({ block, rate }) {
  const { t } = useTranslation();
  if (block.p) return <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{block.p}</p>;
  if (block.list) {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 marker:text-slate-400 dark:text-slate-200">
        {block.list.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  if (block.links) {
    return (
      <div className="flex flex-wrap gap-2">
        {block.links.map((link) => (
          <Link key={link.to} to={link.to} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-black text-white hover:bg-sky-700">{link.label} →</Link>
        ))}
      </div>
    );
  }
  const { head, rows, ko } = block.table;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
      <table className="w-full border-collapse text-left text-sm [&_td]:[overflow-wrap:anywhere]">
        <thead className="bg-slate-100 text-[11px] font-black text-slate-500 dark:bg-white/5 dark:text-slate-400">
          <tr>{head.map((cell) => <th key={cell} scope="col" className="px-2 py-2 sm:px-3">{cell}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-white/5 dark:text-slate-200">
          {rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => <Cell key={index} text={cell} korean={index === ko} rate={rate} label={t("guides.listen")} />)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// /guides — every guide.
export function GuidesIndexPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="px-1">
        <h1 className="text-3xl font-black">{t("guides.title")}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{t("guides.text")}</p>
      </header>
      <div className="grid gap-3">
        {GUIDES.map((guide) => (
          <Link key={guide.slug} to={`/guides/${guide.slug}`} className="block">
            <GlassCard className="flex items-start gap-4 transition hover:-translate-y-0.5">
              <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-100 text-2xl font-black text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">{guide.emoji}</span>
              <span className="min-w-0">
                <span className="block text-lg font-black text-slate-900 dark:text-white">{guide.title}</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{guide.description}</span>
              </span>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

// /guides/:slug — one guide. Its text is in Uzbek in every interface language.
export function GuidePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const rate = useSelector((state) => state.progress.settings.speechRate);
  const guide = getGuide(slug);
  if (!guide) return <Navigate to="/guides" replace />;
  return (
    <article className="mx-auto max-w-3xl space-y-5" lang="uz">
      <Link to="/guides" className="px-1 text-sm font-bold text-sky-600 dark:text-sky-300">← {t("guides.title")}</Link>
      <GlassCard>
        <h1 className="text-2xl font-black leading-tight md:text-3xl">{guide.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{guide.intro}</p>
        <nav aria-label={guide.title} className="mt-5 rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
          <ol className="grid gap-1 text-sm font-bold sm:grid-cols-2">
            {guide.sections.map((section, index) => (
              <li key={section.heading}><a href={`#section-${index + 1}`} className="text-sky-700 hover:underline dark:text-sky-300">{index + 1}. {section.heading}</a></li>
            ))}
          </ol>
        </nav>
      </GlassCard>
      {guide.sections.map((section, index) => (
        <GlassCard key={section.heading}>
          <section id={`section-${index + 1}`} className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-black">{index + 1}. {section.heading}</h2>
            {section.blocks.map((block, blockIndex) => <Block key={blockIndex} block={block} rate={rate} />)}
          </section>
        </GlassCard>
      ))}
    </article>
  );
}

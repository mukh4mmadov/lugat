import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { getWordKey } from "../data";
import { loadTopikVocab } from "../data/topikVocab";
import { TOPIK1_UNITS, getTopikUnit, topikUnitTitle, topikUnitWords } from "../data/topikUnits";
import { readCard } from "../lib/anki";
import { STATE } from "../lib/fsrs";
import { StudySession } from "./StudyPage";

function useTopikWords() {
  // The list arrives after the first render; the store notes when.
  const vocab = useSelector((state) => state.content.vocab);
  useEffect(() => {
    loadTopikVocab("topik1");
  }, []);
  return vocab;
}

// All TOPIK I units with how far the learner is in each.
export default function TopikUnitsPage() {
  const { t, i18n } = useTranslation();
  const progress = useSelector((state) => state.progress);
  const vocab = useTopikWords();
  const rows = useMemo(
    () =>
      TOPIK1_UNITS.map((unit) => {
        const words = topikUnitWords(unit);
        const learned = words.filter((word) => readCard(progress, getWordKey(word))?.state === STATE.review).length;
        return { unit, total: words.length || unit.ids.length, learned };
      }),
    // vocab: re-read once the TOPIK list has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress, vocab],
  );
  const total = TOPIK1_UNITS.reduce((sum, unit) => sum + unit.ids.length, 0);

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 md:p-6">
        <Link to="/study" className="text-xs font-bold text-sky-600 dark:text-sky-300">← {t("anki.decks")}</Link>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">{t("units.title")}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("units.text", { words: total, units: TOPIK1_UNITS.length })}</p>
      </GlassCard>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ unit, total: count, learned }) => (
          <Link key={unit.n} to={`/units/topik1/${unit.n}`} className="block rounded-3xl border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-sky-300 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-300">{t("units.unit", { n: unit.n })}</p>
                <p className="mt-0.5 font-black">{topikUnitTitle(unit, i18n.language)}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">{t("units.words", { count })}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
              <span className="block h-full bg-emerald-500" style={{ width: `${(learned / Math.max(1, count)) * 100}%` }} />
            </div>
            <p className="mt-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">{t("units.learned", { done: learned, total: count })}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// One unit studied like a lesson.
export function TopikUnitStudyPage() {
  const { t, i18n } = useTranslation();
  const { unitId } = useParams();
  const unit = getTopikUnit(unitId);
  const vocab = useTopikWords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => topikUnitWords(unit), [unit, vocab]);

  if (unit && !words.length) return <GlassCard className="text-center">{t("common.loading")}</GlassCard>;
  return (
    <StudySession
      key={unit ? `${unit.n}-${words.length}` : "none"}
      sessionKey={unit ? `t1u${unit.n}` : "none"}
      words={words}
      title={unit ? `${t("units.unit", { n: unit.n })} · ${topikUnitTitle(unit, i18n.language)}` : ""}
      backTo="/units/topik1"
      backLabel={t("units.open")}
      flashcardsPath={null}
      nextPath={unit && getTopikUnit(unit.n + 1) ? `/units/topik1/${unit.n + 1}` : null}
    />
  );
}

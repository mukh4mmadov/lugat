import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../GlassCard";
import AnkiSettingsPanel from "./AnkiSettingsPanel";
import { lessonInfo } from "../../data";
import { availableDecks } from "../../lib/decks";
import { buildPool, deckBreakdown, forecast, remainingCounts, todayCounts } from "../../lib/anki";
import { ankiDay } from "../../lib/fsrs";
import { selectAnkiDue, selectAnkiOptions, selectLessonProgress, setAnkiSettings } from "../../store";

// The word decks, Anki style: what's due today in each, a 7-day forecast and
// the lessons, which can also be learned with exercises first.
export default function DeckOverview() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  const options = useSelector(selectAnkiOptions);
  const due = useSelector(selectAnkiDue);
  const vocab = useSelector((state) => state.content.vocab);
  const [showSettings, setShowSettings] = useState(false);
  const decks = availableDecks();

  // TOPIK vocabulary is a separate download; fetch it to show its counts.
  useEffect(() => {
    decks.forEach((deck) => deck.ready());
    // Once per visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(
    () =>
      decks.map((deck) => {
        const words = deck.words();
        const pool = buildPool(progress, words, options);
        return { deck, words, counts: remainingCounts(pool, progress, options), breakdown: deckBreakdown(progress, words, options) };
      }),
    // vocab: deck sizes change when a TOPIK deck loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [decks.length, progress, options, vocab],
  );

  const allEnabledWords = useMemo(() => rows.filter((row) => options.decks[row.deck.id]).flatMap((row) => row.words), [rows, options]);
  const coming = useMemo(() => forecast(progress, allEnabledWords, options, 7), [progress, allEnabledWords, options]);
  const today = todayCounts(progress, options);
  const studied = (today.new || 0) + (today.learn || 0) + (today.review || 0);
  const retention = (() => {
    let answers = 0;
    let again = 0;
    for (const [day, counts] of Object.entries(progress.ankiDays || {})) {
      if (day > ankiDay(Date.now() - 30 * 864e5, options.dayStartsAt)) {
        answers += (counts.review || 0);
        again += Math.min(counts.again || 0, counts.review || 0);
      }
    }
    return answers >= 20 ? Math.round(((answers - again) / answers) * 100) : null;
  })();
  const total = due.new + due.learning + due.review;
  const peak = Math.max(1, ...coming);
  const weekday = (offset) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, { weekday: "short" }).format(new Date(Date.now() + offset * 864e5));
    } catch {
      return String(offset);
    }
  };

  return (
    <div className="space-y-5">
      <GlassCard className="relative overflow-hidden p-5 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">어휘 · {t("anki.eyebrow")}</p>
            <h1 className="mt-1 text-3xl font-black md:text-4xl">{t("anki.title")}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("anki.subtitle")}</p>
          </div>
          <button type="button" onClick={() => setShowSettings(true)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-black dark:border-white/10">⚙ {t("anki.settings.title")}</button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link to="/review" className={`rounded-2xl px-6 py-3.5 text-lg font-black text-white shadow-xl transition hover:-translate-y-0.5 ${total ? "bg-sky-500 shadow-sky-500/25" : "bg-slate-400"}`}>
            ▶ {t("anki.studyNow")}
          </Link>
          <DueTriplet counts={due} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center sm:max-w-md">
          <Mini label={t("anki.todayCards")} value={studied} />
          <Mini label={t("anki.todayMinutes")} value={Math.round((today.ms || 0) / 60000)} />
          <Mini label={t("anki.retention30")} value={retention === null ? "—" : `${retention}%`} />
        </div>
      </GlassCard>

      <section className="space-y-3">
        <h2 className="text-lg font-black">{t("anki.decks")}</h2>
        {rows.map(({ deck, words, counts, breakdown }) => (
          <GlassCard key={deck.id} className="p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black">{t(deck.titleKey)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t(deck.textKey)}</p>
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {words.length ? t("anki.breakdown", breakdown) : t("common.loading")}
                </p>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
                  <span className="bg-emerald-600" style={{ width: `${(breakdown.mature / Math.max(1, breakdown.total)) * 100}%` }} />
                  <span className="bg-emerald-400" style={{ width: `${(breakdown.young / Math.max(1, breakdown.total)) * 100}%` }} />
                  <span className="bg-rose-400" style={{ width: `${(breakdown.learning / Math.max(1, breakdown.total)) * 100}%` }} />
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <DueTriplet counts={counts} />
                <div className="flex gap-2">
                  <Link to={`/review?deck=${deck.id}`} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950">{t("anki.study")}</Link>
                  {deck.id === "topik1" && <Link to="/units/topik1" className="rounded-xl border border-sky-300 bg-sky-500/10 px-3 py-2 text-sm font-black text-sky-700 dark:border-sky-400/30 dark:text-sky-200">{t("units.open")}</Link>}
                  <Link to={`/words/${deck.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10">{t("anki.browse")}</Link>
                </div>
              </div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <input type="checkbox" className="accent-sky-500" checked={Boolean(options.decks[deck.id])} onChange={(event) => dispatch(setAnkiSettings({ decks: { ...options.decks, [deck.id]: event.target.checked } }))} />
              {t("anki.includeInStudyNow")}
            </label>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="p-4 md:p-5">
        <h2 className="text-sm font-black">{t("anki.forecast")}</h2>
        <div className="mt-3 flex h-28 items-end gap-2">
          {coming.map((count, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[11px] font-black tabular-nums text-slate-500 dark:text-slate-400">{count}</span>
              <div className="w-full rounded-t-lg bg-emerald-400/80" style={{ height: `${Math.max(3, (count / peak) * 72)}px` }} />
              <span className="text-[10px] font-bold text-slate-400">{index === 0 ? t("anki.today") : weekday(index)}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-black">{t("anki.lessonsTitle")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("anki.lessonsText")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lessonInfo.map((lesson) => {
            const percent = selectLessonProgress({ progress }, lesson.lesson);
            return (
              <div key={lesson.lesson} className="min-w-0 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 font-black text-white">{lesson.lesson}</span>
                  <div className="min-w-0">
                    <p className="font-black">{t("card.lesson", { lesson: lesson.lesson })}</p>
                    <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">{t(lesson.category)} · {t("home.wordCount", { count: lesson.count })}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-black">
                  <Link to={`/study/${lesson.lesson}`} className="rounded-xl bg-sky-500 px-3 py-2 text-center text-white">{t("anki.learnLesson")}</Link>
                  <Link to={`/lesson/${lesson.lesson}/flashcards`} className="rounded-xl border border-slate-200 px-3 py-2 text-center dark:border-white/10">{t("anki.cards")}</Link>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <Link to={`/lesson/${lesson.lesson}/quiz`} className="hover:text-sky-500">{t("practice.quiz")}</Link>
                  <Link to={`/lesson/${lesson.lesson}/listening`} className="hover:text-sky-500">{t("practice.listening")}</Link>
                  <Link to={`/lesson/${lesson.lesson}/writing`} className="hover:text-sky-500">{t("practice.writing")}</Link>
                  <Link to={`/lesson/${lesson.lesson}/dictation`} className="hover:text-sky-500">{t("dictation.title")}</Link>
                  <Link to={`/lesson/${lesson.lesson}/grammar`} className="hover:text-sky-500">{t("nav.grammar")}</Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {showSettings && <AnkiSettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export function DueTriplet({ counts }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-950/5 px-3 py-2 text-sm font-black dark:bg-white/10" title={t("anki.countsHint")}>
      <span className="text-sky-600 dark:text-sky-300">{t("anki.count.new", { count: counts.new })}</span>
      <span className="text-rose-600 dark:text-rose-300">{t("anki.count.learning", { count: counts.learning })}</span>
      <span className="text-emerald-600 dark:text-emerald-300">{t("anki.count.review", { count: counts.review })}</span>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-950/5 p-2 dark:bg-white/10">
      <p className="text-lg font-black tabular-nums">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

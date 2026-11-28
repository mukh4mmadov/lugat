import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../hooks/useAuth";
import { lessonInfo } from "../data";
import { DAILY_GOALS, selectCurrentStreak, selectLessonProgress, selectReviewCount, setDailyGoal } from "../store";
import { dailyKey } from "../lib/study";
import { levelForXp } from "../lib/gamification";

const SECTIONS = [
  { to: "/study", ko: "어휘", key: "vocab", tone: "from-sky-500 to-cyan-500" },
  { to: "/grammar", ko: "문법", key: "grammar", tone: "from-violet-500 to-fuchsia-500" },
  { to: "/topik", ko: "듣기", key: "listening", tone: "from-emerald-500 to-teal-500" },
  { to: "/stories", ko: "읽기", key: "reading", tone: "from-amber-500 to-orange-500" },
  { to: "/speaking", ko: "말하기", key: "speaking", tone: "from-rose-500 to-pink-500" },
  { to: "/topik", ko: "모의고사", key: "exams", tone: "from-indigo-500 to-blue-600" },
];

function useNextContent(progress) {
  const [next, setNext] = useState({ grammar: null, story: null });
  const grammarDone = progress.grammar;
  const storiesRead = progress.stories;
  useEffect(() => {
    let cancelled = false;
    Promise.all([import("../data/grammar"), import("../data/stories")]).then(([grammar, stories]) => {
      if (cancelled || !grammar?.GRAMMAR || !stories?.STORIES) return;
      const point = grammar.GRAMMAR.find((item) => !grammarDone?.[item.id]?.done) || null;
      const story = stories.STORIES.find((item) => !item.id.endsWith("-b") && !storiesRead?.[item.id]?.read) || null;
      setNext({ grammar: point, story, grammarTotal: grammar.GRAMMAR.length, storiesTotal: stories.STORIES.length, tr: grammar.tr });
    });
    return () => {
      cancelled = true;
    };
  }, [grammarDone, storiesRead]);
  return next;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <LearnerHome /> : <GuestHome />;
}

function GuestHome() {
  const { t } = useTranslation();
  const totalWords = lessonInfo.reduce((sum, lesson) => sum + lesson.count, 0);
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-sky-900 p-6 text-white shadow-2xl md:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[10rem] font-black leading-none text-white/5 md:text-[16rem]" aria-hidden="true">한국어</div>
        <p className="relative text-xs font-black uppercase tracking-[0.25em] text-sky-300">K-TALIM · TOPIK 1–6</p>
        <h1 className="relative mt-3 max-w-3xl text-3xl font-black leading-tight md:text-5xl">{t("home.guest.title")}</h1>
        <p className="relative mt-4 max-w-2xl text-sm text-slate-200 md:text-lg">{t("home.subtitle")}</p>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link to="/register" className="rounded-2xl bg-sky-400 px-6 py-3.5 font-black text-slate-950 shadow-xl shadow-sky-500/30 transition hover:-translate-y-0.5">{t("account.signUp")}</Link>
          <Link to="/login" className="rounded-2xl border border-white/30 px-6 py-3.5 font-black transition hover:bg-white/10">{t("account.logIn")}</Link>
        </div>
        <p className="relative mt-4 text-xs text-slate-300">{t("home.guestNote")}</p>
      </section>

      <section>
        <h2 className="text-xl font-black md:text-2xl">{t("home.insideTitle")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <SectionTile key={section.key} section={section} text={t(`home.section.${section.key}.text`, { words: totalWords })} />
          ))}
        </div>
      </section>

      <GlassCard className="p-5 md:p-8">
        <h2 className="text-xl font-black md:text-2xl">{t("home.howTitle")}</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <li key={step} className="rounded-2xl bg-slate-950/5 p-4 dark:bg-white/5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-500 text-sm font-black text-white">{step}</span>
              <p className="mt-3 font-black">{t(`home.how${step}.title`)}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`home.how${step}.text`)}</p>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
          <Link to="/courses" className="rounded-xl border border-slate-200 px-4 py-2 dark:border-white/10">{t("home.browseLessons")}</Link>
          <Link to="/grammar" className="rounded-xl border border-slate-200 px-4 py-2 dark:border-white/10">{t("nav.grammar")}</Link>
          <Link to="/guides" className="rounded-xl border border-slate-200 px-4 py-2 dark:border-white/10">{t("guides.title")}</Link>
        </div>
      </GlassCard>

      <KoreaBanner />
    </div>
  );
}

function LearnerHome() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { profile } = useAuth();
  const progress = useSelector((state) => state.progress);
  const reviews = useSelector(selectReviewCount);
  const streak = useSelector(selectCurrentStreak);
  const next = useNextContent(progress);
  const goal = progress.settings.dailyGoal || 20;
  const doneToday = progress.stats.daily?.[dailyKey()] || 0;
  const level = levelForXp(progress.xp || 0);
  const nextLesson = lessonInfo.find((lesson) => selectLessonProgress({ progress }, lesson.lesson) < 100)?.lesson;
  const topikBest = progress.stats.topikBest || 0;
  const lang = String(i18n.language || "uz").slice(0, 2);

  const plan = [
    {
      key: "review",
      icon: "🔁",
      title: t("home.plan.review"),
      detail: reviews ? t("home.plan.reviewCount", { count: reviews }) : t("home.plan.reviewNone"),
      to: "/review",
      done: !reviews,
    },
    {
      key: "new",
      icon: "✨",
      title: t("home.plan.newWords"),
      detail: nextLesson ? t("home.plan.nextLesson", { lesson: nextLesson }) : t("home.plan.newNone"),
      to: nextLesson ? `/topic/${nextLesson}` : "/study",
      done: !nextLesson,
    },
    next.grammar && {
      key: "grammar",
      icon: "📐",
      title: t("home.plan.grammar"),
      detail: `${next.grammar.pattern} — ${next.tr ? next.tr(next.grammar.title, lang) : ""}`,
      to: `/grammar/${next.grammar.id}`,
    },
    {
      key: "topik",
      icon: "📝",
      title: t("home.plan.topik"),
      detail: progress.stats.topikAttempts ? t("home.plan.topikBest", { score: topikBest }) : t("home.plan.topikFirst"),
      to: "/topik",
    },
    next.story && {
      key: "story",
      icon: "📖",
      title: t("home.plan.story"),
      detail: next.tr ? next.tr(next.story.title, lang) : "",
      to: `/stories/${next.story.id}`,
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <GlassCard className="p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">{t("home.plan.eyebrow")}</p>
              <h1 className="mt-1 text-2xl font-black md:text-3xl">{profile?.first_name ? t("home.plan.hello", { name: profile.first_name }) : t("home.plan.title")}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm font-black">
              <span className="rounded-xl bg-orange-500/10 px-3 py-1.5 text-orange-600 dark:text-orange-300">🔥 {streak}</span>
              <span className="rounded-xl bg-violet-500/10 px-3 py-1.5 text-violet-600 dark:text-violet-300">Lv {level}</span>
            </div>
          </div>

          <ul className="mt-5 space-y-2">
            {plan.map((item) => (
              <li key={item.key}>
                <Link to={item.to} className={`flex items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 md:p-4 ${item.done ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5" : "border-slate-200 bg-white/70 hover:border-sky-300 dark:border-white/10 dark:bg-white/5"}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${item.done ? "bg-emerald-500 text-white" : "bg-slate-950/5 dark:bg-white/10"}`}>{item.done ? "✓" : item.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-black">{item.title}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>
                  </span>
                  <span className="text-slate-400">→</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to={reviews ? "/review" : nextLesson ? `/topic/${nextLesson}` : "/study"} className="rounded-2xl bg-sky-500 px-6 py-3 font-black text-white shadow-xl shadow-sky-500/25 transition hover:-translate-y-0.5">▶ {reviews ? t("sets.reviewNow", { count: reviews }) : t("anki.studyNow")}</Link>
            {nextLesson && <Link to={`/topic/${nextLesson}`} className="rounded-2xl border border-slate-300 px-5 py-3 font-black dark:border-white/15">{t("home.plan.nextLesson", { lesson: nextLesson })}</Link>}
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between gap-4 p-5 md:p-6">
          <div>
            <p className="text-sm font-black">{t("home.goal.title")}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-4xl font-black tabular-nums">{doneToday}<span className="text-lg text-slate-400">/{goal}</span></p>
              <span className="text-3xl">{doneToday >= goal ? "🏆" : "🎯"}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className={`h-full rounded-full transition-all ${doneToday >= goal ? "bg-emerald-500" : "bg-sky-500"}`} style={{ width: `${Math.min(100, (doneToday / goal) * 100)}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {DAILY_GOALS.map((value) => (
                <button key={value} type="button" aria-pressed={goal === value} onClick={() => dispatch(setDailyGoal(value))} className={`rounded-full px-2.5 py-1 text-[11px] font-black ${goal === value ? "bg-sky-600 text-white" : "bg-slate-100 dark:bg-white/10"}`}>
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Stat label={t("home.stat.words")} value={Object.values(progress.words || {}).filter((word) => (word.knownCount || 0) > 0).length} />
            <Stat label={t("home.stat.grammar")} value={Object.values(progress.grammar || {}).filter((item) => item.done).length} />
            <Stat label={t("home.stat.stories")} value={Object.values(progress.stories || {}).filter((item) => item.read).length} />
            <Stat label={t("home.stat.topik")} value={topikBest || "—"} />
          </div>
          <Link to="/stats" className="text-center text-xs font-black text-sky-600 dark:text-sky-300">{t("home.stat.more")} →</Link>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-lg font-black md:text-xl">{t("home.sectionsTitle")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <SectionTile key={section.key} section={section} text={t(`home.section.${section.key}.short`)} />
          ))}
        </div>
      </section>

      <Link to="/guides" className="block rounded-3xl border border-slate-200 bg-white/70 p-5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5">
        <p className="font-black">📚 {t("guides.title")}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("home.guidesText")}</p>
      </Link>

      <KoreaBanner />
    </div>
  );
}

function SectionTile({ section, text }) {
  const { t } = useTranslation();
  return (
    <Link to={section.to} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-xl transition group-hover:opacity-40 ${section.tone}`} />
      <p className={`inline-block bg-gradient-to-r bg-clip-text text-2xl font-black text-transparent ${section.tone}`} lang="ko">{section.ko}</p>
      <p className="mt-1 text-lg font-black">{t(`home.section.${section.key}.title`)}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
    </Link>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-950/5 p-3 dark:bg-white/10">
      <p className="text-xl font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function KoreaBanner() {
  const { t } = useTranslation();
  return (
    <Link to="/korea" className="block overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-rose-500 p-5 text-white shadow-xl transition hover:-translate-y-0.5 md:p-6">
      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">🇰🇷 {t("korea.eyebrow")}</p>
      <p className="mt-1 text-xl font-black md:text-2xl">{t("korea.homeTitle")}</p>
      <p className="mt-1 text-sm opacity-90">{t("korea.homeText")}</p>
      <span className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-black text-indigo-700">{t("korea.homeButton")} →</span>
    </Link>
  );
}

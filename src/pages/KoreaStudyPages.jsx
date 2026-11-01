import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import { ConsultantPanel, DocsPanel, InterviewPanel } from "../components/korea/AiPanels";
import Catalog, { IeqasBadge, SourceNote } from "../components/korea/Catalog";
import { MyPathPanel, ScholarshipsPanel, VisaPanel } from "../components/korea/GuidePanels";
import { INTAKES, OFFICIAL_LINKS, TOPIK_GUIDE } from "../data/korea/guide";
import { SOURCES, UNIVERSITIES } from "../data/korea/universities";
import { registerContent } from "../lib/contentOverrides";
import { formatSom, formatWon, ieqasExplain, regionName, tr, uniName, useWonRate } from "../lib/studyKorea";

registerContent("university", UNIVERSITIES);

const TABS = [
  ["path", "🧭"],
  ["universities", "🏛"],
  ["scholarships", "🎓"],
  ["visa", "🛂"],
  ["consultant", "🤖"],
  ["docs", "✍️"],
  ["interview", "🎤"],
];

function useTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

// "Koreyada o'qish": everything on the way from learning Korean to a Korean university.
export function KoreaHub() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([key]) => key === params.get("tab")) ? params.get("tab") : "universities";
  const open = (key) => {
    setParams(key === "universities" ? {} : { tab: key }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useTitle(`${t("korea.title")} — K-TALIM`);
  const certified = UNIVERSITIES.filter((uni) => uni.ieqas.degree === "certified").length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-rose-500 p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">🇰🇷 {t("korea.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">{t("korea.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 opacity-90 md:text-base">{t("korea.subtitle")}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            [UNIVERSITIES.length, t("korea.stat.universities")],
            [certified, t("korea.stat.certified")],
            [SOURCES.kosaf.date.slice(0, 4), t("korea.stat.dataYear")],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white/15 p-3">
              <p className="text-2xl font-black">{value}</p>
              <p className="text-[11px] font-bold opacity-90">{label}</p>
            </div>
          ))}
        </div>
      </header>

      <nav role="tablist" aria-label={t("korea.title")} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {TABS.map(([key, icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => open(key)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-black transition ${tab === key ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/70 text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}
          >
            {icon} {t(`korea.tab.${key}`)}
            {["docs", "interview"].includes(key) && <span className="ml-1 text-[10px]">⭐</span>}
          </button>
        ))}
      </nav>

      {tab === "path" && <MyPathPanel onOpenTab={open} />}
      {tab === "universities" && <Catalog />}
      {tab === "scholarships" && <ScholarshipsPanel />}
      {tab === "visa" && <VisaPanel />}
      {tab === "consultant" && <ConsultantPanel />}
      {tab === "docs" && <DocsPanel />}
      {tab === "interview" && <InterviewPanel />}

      <p className="text-center text-xs text-slate-500">
        {t("korea.reportError")}{" "}
        <Link to="/feedback" className="font-bold underline">{t("korea.reportLink")}</Link>
      </p>
    </div>
  );
}

function Fact({ label, children, note }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <div className="mt-0.5 font-black">{children}</div>
      {note && <div className="mt-1">{note}</div>}
    </div>
  );
}

export function UniversityPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const rate = useWonRate();
  const uni = UNIVERSITIES.find((item) => item.id === id);
  useTitle(uni ? `${uniName(uni, i18n.language)} (${uni.ko}) — ${t("korea.title")}` : t("korea.title"));

  if (!uni) {
    return (
      <GlassCard className="mx-auto max-w-xl text-center">
        <p className="font-bold">{t("korea.notFound")}</p>
        <Link to="/korea" className="mt-4 inline-block rounded-2xl bg-slate-950 px-5 py-2.5 font-black text-white dark:bg-white dark:text-slate-950">{t("korea.backToList")}</Link>
      </GlassCard>
    );
  }

  const som = formatSom(uni.tuition, rate, t);
  const scrutiny = uni.ieqas.degree === "scrutiny" || uni.ieqas.language === "scrutiny";
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/korea" className="text-sm font-bold text-sky-600 dark:text-sky-300">← {t("korea.backToList")}</Link>
      <GlassCard className="!p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black md:text-3xl">{uniName(uni, i18n.language)}</h1>
            <p className="mt-1 text-sm text-slate-500"><span lang="ko">{uni.ko}</span> · {regionName(uni.region, i18n.language)}</p>
          </div>
          <IeqasBadge uni={uni} />
        </div>
        {scrutiny && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">⚠️ {ieqasExplain(uni, i18n.language)}</p>}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Fact label={t("korea.tuition")} note={<SourceNote sources={uni.sources} field="tuition" />}>
            {formatWon(uni.tuition)} <span className="text-xs font-bold text-slate-500">/ {t("korea.perYear")}</span>
            {som && <span className="block text-sm text-slate-600 dark:text-slate-300">≈ {som}{rate?.date ? ` (${t("korea.cbuRate", { date: rate.date })})` : ""}</span>}
          </Fact>
          <Fact label={t("korea.entranceFee")}>{uni.entranceFee ? formatWon(uni.entranceFee) : uni.tuition ? "₩0" : "—"}</Fact>
          <Fact label={t("korea.type")}>{t(`korea.kind.${uni.kind}`)}{uni.founding ? ` · ${t(`korea.founding.${uni.founding}`)}` : ""}</Fact>
          <Fact label={t("korea.ieqas.degreeLabel")} note={<SourceNote sources={uni.sources} field="ieqas" />}>{t(`korea.ieqasState.${uni.ieqas.degree}`)}</Fact>
          <Fact label={t("korea.languageProgram")}>{t(`korea.ieqasState.${uni.ieqas.language}`)}</Fact>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{ieqasExplain(uni, i18n.language)}</p>
        {uni.site ? (
          <a href={uni.site} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950">🌐 {t("korea.officialSite")}</a>
        ) : (
          <p className="mt-4 text-xs text-slate-500">{t("korea.noSite")}</p>
        )}
      </GlassCard>

      <GlassCard className="!p-5">
        <h2 className="font-black">🎓 {t("korea.topikTitle")}</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {TOPIK_GUIDE.points.map((point, index) => <li key={index}>• {tr(point, i18n.language)}</li>)}
        </ul>
      </GlassCard>

      <GlassCard className="!p-5">
        <h2 className="font-black">📅 {t("korea.intakesTitle")}</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {INTAKES.map((intake) => (
            <div key={intake.id} className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-white/5">
              <p className="font-black">{tr(intake.title, i18n.language)}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{tr(intake.window, i18n.language)}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">{t("korea.checkOfficial")}</p>
      </GlassCard>

      <div className="grid gap-2 sm:grid-cols-3">
        <Link to={`/korea?tab=path&add=${uni.id}`} className="rounded-2xl bg-sky-600 p-4 text-center text-sm font-black text-white">🧭 {t("korea.addToPath")}</Link>
        <Link to="/korea?tab=docs" className="rounded-2xl bg-violet-600 p-4 text-center text-sm font-black text-white">✍️ {t("korea.tab.docs")}</Link>
        <Link to="/korea?tab=interview" className="rounded-2xl bg-rose-500 p-4 text-center text-sm font-black text-white">🎤 {t("korea.tab.interview")}</Link>
      </div>
      <p className="text-center text-xs text-slate-500">
        <a href={OFFICIAL_LINKS.studyInKorea.url} target="_blank" rel="noreferrer" className="underline">Study in Korea</a> · {t("korea.reportError")}{" "}
        <Link to="/feedback" className="font-bold underline">{t("korea.reportLink")}</Link>
      </p>
    </div>
  );
}

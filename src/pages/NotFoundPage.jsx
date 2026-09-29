import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111f] flex items-center justify-center px-4">
      <GlassCard className="mx-auto max-w-xl text-center p-8">
        <h1 className="text-6xl font-black text-slate-900 dark:text-white">404</h1>
        <h2 className="mt-4 text-2xl font-black text-slate-800 dark:text-white">{t("notFound.title")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("notFound.text")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="rounded-2xl bg-slate-950 px-5 py-2.5 font-black text-white dark:bg-white dark:text-slate-950">{t("common.back")}</Link>
          <Link to="/courses" className="rounded-2xl border border-slate-200 bg-white/75 px-5 py-2.5 font-black text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">{t("courses.browseTitle", { defaultValue: "Explore Lessons" })}</Link>
        </div>
      </GlassCard>
    </div>
  );
}
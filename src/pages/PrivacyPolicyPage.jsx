import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import LanguageSelector from "../components/LanguageSelector";

const sections = [
  { key: "section1", titleKey: "privacy.section1.title" },
  { key: "section2", titleKey: "privacy.section2.title" },
  { key: "section3", titleKey: "privacy.section3.title" },
  { key: "section4", titleKey: "privacy.section4.title" },
  { key: "section5", titleKey: "privacy.section5.title" },
  { key: "section6", titleKey: "privacy.section6.title" },
  { key: "section7", titleKey: "privacy.section7.title" },
  { key: "section8", titleKey: "privacy.section8.title" },
];

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-base font-black text-white shadow-lg shadow-sky-500/25">
              K
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">K-TALIM</span>
          </Link>
          <LanguageSelector />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-6 md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {t("privacy.title")}
              </h1>
              <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                {t("privacy.lastUpdated")}
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.key}>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                    {t(section.titleKey)}
                  </h2>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t(`privacy.${section.key}`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10">
              <Link
                to="/"
                className="action-btn inline-flex bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              >
                {t("common.back") || "Back"}
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

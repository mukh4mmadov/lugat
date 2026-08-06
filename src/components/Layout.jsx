import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { setTheme } from "../store";
import LanguageSelector from "./LanguageSelector";

export default function Layout({ onShowIELTSModal }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.progress.theme);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [displayLang, setDisplayLang] = useState(i18n.language);

  const navItems = [
    ["/", t("nav.home")],
    ["/study", t("nav.study")],
    ["/search", t("nav.search")],
    ["/favorites", t("nav.favorites")],
    ["/difficult", t("nav.difficult")],
    ["/stats", t("nav.stats")],
    ["/settings", t("nav.settings")],
  ];

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Update HTML lang attribute and document title based on language
  useEffect(() => {
    const langMap = {
      uz: "uz",
      en: "en",
      ru: "ru",
    };
    document.documentElement.lang = langMap[i18n.language] || "uz";

    const titleMap = {
      uz: "Koreyscha Lug'at Studio",
      en: "Korean Vocabulary Studio",
      ru: "Студия корейского словаря",
    };
    document.title = titleMap[i18n.language] || "Korean Vocabulary Studio";
  }, [i18n.language]);

  // Handle language change transition
  useEffect(() => {
    if (i18n.language !== displayLang) {
      setIsChangingLanguage(true);

      // After transition completes, update display language
      const transitionDuration = prefersReducedMotion ? 200 : 500;
      setTimeout(() => {
        setDisplayLang(i18n.language);
        setIsChangingLanguage(false);
      }, transitionDuration);
    }
  }, [i18n.language, displayLang, prefersReducedMotion]);

  const transitionConfig = prefersReducedMotion
    ? { duration: 0.2, ease: "linear" }
    : {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-[#07111f] dark:text-white">
        <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,.24),transparent_28%),radial-gradient(circle_at_bottom,rgba(34,197,94,.15),transparent_32%)]" />

        <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <NavLink to="/" className="group flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.04 }}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-xl font-black text-white shadow-xl shadow-sky-500/25"
              >
                K
              </motion.div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-500">
                  KOREAN
                </p>
                <h1 className="text-xl font-black tracking-tight">
                  Korean Vocabulary Studio
                </h1>
              </div>
            </NavLink>

            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {navItems.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 transition ${isActive ? "bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950" : "bg-white/65 text-slate-700 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"}`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <LanguageSelector onShowIELTSModal={onShowIELTSModal} />
              <button
                type="button"
                onClick={() => dispatch(setTheme(nextTheme))}
                className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                {theme === "dark" ? t("nav.light") : t("nav.dark")}
              </button>
            </nav>
          </div>
        </header>

        {/* Advertisement Banner */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 h-16 rounded-xl bg-red-500 flex items-center justify-center">
            <p className="text-sm font-semibold text-white">
              {t('advertisement.placeholder')}
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayLang}
              initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              animate={{
                opacity: isChangingLanguage ? 0.6 : 1,
                scale: isChangingLanguage ? 0.99 : 1,
                filter: isChangingLanguage ? "blur(2px)" : "blur(0px)",
              }}
              exit={{
                opacity: 0.6,
                scale: 0.99,
                filter: "blur(2px)",
              }}
              transition={transitionConfig}
              className="min-h-[400px]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="relative z-10 mt-16 border-t border-slate-200/70 bg-white/60 px-4 py-8 text-sm text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {t("footer.vocabularySource")}
              </p>
              <p>Dong Eun Academy</p>
              <p>{t("footer.educationalOnly")}</p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {t("footer.developer")}
              </p>
              <p>Mukh4mmadov</p>
              <p>Telegram @mukh4mmadov</p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {t("footer.contact")}
              </p>
              <p>{t("footer.contactTelegram")}</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

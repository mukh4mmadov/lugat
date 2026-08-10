import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { setTheme } from "../store";
import LanguageSelector from "./LanguageSelector";
import AIChatWidget from "./AIChatWidget";

export default function Layout({ onShowIELTSModal }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.progress.theme);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [displayLang, setDisplayLang] = useState(i18n.language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    ["/", t("nav.home")],
    ["/courses", t("nav.courses")],
    ["/study", t("nav.study")],
    ["/search", t("nav.search")],
    ["/favorites", t("nav.favorites")],
    ["/difficult", t("nav.difficult")],
    ["/weak-words", t("library.weakWords")],
    ["/stats", t("nav.stats")],
    ["/future-updates", t("nav.futureUpdates")],
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

  const location = useLocation();

  const getPageName = (pathname) => {
    const map = {
      "/": "Home",
      "/courses": "Courses",
      "/study": "Study",
      "/search": "Search",
      "/favorites": "Favorites",
      "/difficult": "Difficult Words",
      "/weak-words": "Weak Words",
      "/stats": "Statistics",
      "/future-updates": "Future Updates",
      "/settings": "Settings",
      "/review": "Review Mode",
    };

    if (map[pathname]) return map[pathname];

    if (pathname.startsWith("/lesson/")) {
      const parts = pathname.split("/");
      const lessonId = parts[2];
      const mode = parts[3] || "flashcards";
      const modeNames = {
        flashcards: "Flashcards",
        listening: "Listening",
        quiz: "Quiz",
        writing: "Writing",
      };
      return `${modeNames[mode] || mode} - Lesson ${lessonId}`;
    }

    if (pathname.startsWith("/study/")) {
      const lessonId = pathname.split("/")[2];
      return `Study - Lesson ${lessonId}`;
    }

    return pathname;
  };

  const getShortBrowserInfo = () => {
    if (typeof navigator === "undefined") return "";
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "MacOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return `${browser} · ${os}`;
  };

  const handleReportBug = () => {
    const pageName = getPageName(location.pathname);
    const browserInfo = getShortBrowserInfo();
    const text = encodeURIComponent(
      `Bug report from K-TALIM\nPage: ${pageName}\nBrowser: ${browserInfo}\n\n[Describe the issue here]`
    );
    window.open(`https://t.me/mukh4mmadov?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-[#07111f] dark:text-white">
        <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,.24),transparent_28%),radial-gradient(circle_at_bottom,rgba(34,197,94,.15),transparent_32%)]" />

        <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5">
            <NavLink to="/" className="group flex shrink-0 items-center gap-2">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.04 }}
                className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-base font-black text-white shadow-lg shadow-sky-500/25"
              >
                K
              </motion.div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
                  KOREAN
                </p>
                <h1 className="text-sm font-black tracking-tight">
                  {t("header.brand", { defaultValue: "Korean Vocabulary Studio" })}
                </h1>
              </div>
            </NavLink>

            <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-1.5 text-xs font-semibold lg:text-sm">
              {navItems.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-full px-2.5 py-1.5 transition lg:px-3 lg:py-2 ${isActive ? "bg-slate-950 text-white shadow-md dark:bg-white dark:text-slate-950" : "bg-white/60 text-slate-700 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 md:ml-auto">
              <LanguageSelector onShowIELTSModal={onShowIELTSModal} />
              <button
                type="button"
                onClick={() => dispatch(setTheme(nextTheme))}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10"
                aria-label={theme === "dark" ? t("nav.light") : t("nav.dark")}
                title={theme === "dark" ? t("nav.light") : t("nav.dark")}
              >
                <motion.div
                  initial={false}
                  animate={{
                    rotate: theme === "dark" ? 0 : 180,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: { duration: 0.3, ease: "easeInOut" },
                    scale: { duration: 0.2 }
                  }}
                  className="text-lg"
                >
                  {theme === "dark" ? "🌙" : "☀️"}
                </motion.div>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full border border-slate-200 bg-white/70 p-1.5 font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white md:hidden"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile navigation overlay */}
        <AnimatePresence mode="wait">
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-slate-900/95"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
                  <span className="text-lg font-black text-slate-900 dark:text-white">{t("header.menu", { defaultValue: "Menu" })}</span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-full p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="p-4 space-y-2">
                  {navItems.map(([to, label]) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-2xl px-4 py-3 text-base font-bold transition ${
                          isActive
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <p>{t("footer.vocabularySourceName")}</p>
              <p>{t("footer.educationalOnly")}</p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {t("footer.developer")}
              </p>
              <p>{t("footer.developerName")}</p>
              <p>{t("footer.developerTelegram")}</p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {t("footer.contact")}
              </p>
              <p>{t("footer.contactTelegram")}</p>
            </div>
          </div>
        </footer>

        <AIChatWidget />

        <button
          type="button"
          onClick={handleReportBug}
          aria-label={t("common.reportBug")}
          title={t("common.reportBug")}
          className="fixed bottom-4 left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md transition hover:-translate-y-1 dark:bg-white/10 dark:text-slate-200 md:bottom-6 md:left-6"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </button>
      </main>
    </div>
  );
}

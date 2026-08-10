import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { setTheme } from "../store";
import LanguageSelector from "./LanguageSelector";
import AIChatWidget from "./AIChatWidget";
import { useAuth } from "../hooks/useAuth";

export default function Layout({ onShowIELTSModal }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.progress.theme);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [displayLang, setDisplayLang] = useState(i18n.language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  
  const { user, profile, signOut } = useAuth();

  // Essential nav items (always visible)
  const primaryNavItems = [
    ["/", t("nav.home")],
    ["/courses", t("nav.courses")],
    ["/study", t("nav.study")],
    ["/search", t("nav.search")],
  ];

  // Secondary nav items (grouped in "More" dropdown)
  const secondaryNavItems = [
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };

    if (userMenuOpen || moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, moreMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
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
              {primaryNavItems.map(([to, label]) => (
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
              
              {/* More dropdown for secondary nav items */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white transition lg:px-3 lg:py-2 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                >
                  <span>{t("nav.more")}</span>
                  <motion.span
                    animate={{ rotate: moreMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400"
                  >
                    ▼
                  </motion.span>
                </button>
                
                <AnimatePresence>
                  {moreMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 z-50"
                    >
                      <div className="p-2 space-y-1">
                        {secondaryNavItems.map(([to, label]) => (
                          <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMoreMenuOpen(false)}
                            className={({ isActive }) =>
                              `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                isActive
                                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/25 dark:bg-white dark:text-slate-950'
                                  : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10'
                              }`
                            }
                          >
                            {label}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="flex items-center gap-1.5 md:ml-auto">
              <LanguageSelector onShowIELTSModal={onShowIELTSModal} />
              
              {/* Auth section */}
              {!user ? (
                <NavLink
                  to="/login"
                  className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white lg:px-4 lg:py-2 lg:text-sm"
                >
                  {t("nav.login")}
                </NavLink>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white lg:px-4 lg:py-2 lg:text-sm"
                  >
                    <span>{t("nav.hi")}, {profile?.first_name || 'User'}</span>
                    <motion.span
                      animate={{ rotate: userMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400"
                    >
                      ▼
                    </motion.span>
                  </button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 z-50"
                      >
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10 transition"
                        >
                          {t("nav.logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
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
                  {[...primaryNavItems, ...secondaryNavItems].map(([to, label]) => (
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
                  
                  {/* Auth section in mobile menu */}
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-4">
                    {!user ? (
                      <NavLink
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-2xl px-4 py-3 text-base font-bold bg-sky-500 text-white hover:bg-sky-600 transition"
                      >
                        {t("nav.login")}
                      </NavLink>
                    ) : (
                      <>
                        <div className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {t("nav.hi")}, {profile?.first_name || 'User'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left rounded-2xl px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-white/20 transition"
                        >
                          {t("nav.logout")}
                        </button>
                      </>
                    )}
                  </div>
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
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {t("footer.educationalOnly")}
              </p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {t("footer.developer")}
              </p>
              <p>{t("footer.developerName")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("footer.contact")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("footer.contactTelegram")}
              </p>
            </div>
          </div>
        </footer>
      </main>
      <AIChatWidget />
    </div>
  );
}

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SECTIONS = {
  courses: "nav.courses",
  topik: "nav.topik",
  search: "nav.search",
  study: "nav.study",
  review: "nav.review",
  favorites: "nav.favorites",
  difficult: "nav.difficult",
  "weak-words": "library.weakWords",
  stats: "nav.stats",
  "future-updates": "nav.futureUpdates",
  settings: "nav.settings",
  feedback: "nav.feedback",
  admin: "admin.title",
  login: "nav.login",
  register: "nav.register",
  premium: "Premium",
  leaderboard: "leaderboard.title",
  privacy: "privacy.title",
  terms: "terms.title",
  speaking: "nav.speaking",
  korea: "nav.korea",
  grammar: "grammar.title",
  stories: "stories.title",
  achievements: "nav.achievements",
  "forgot-password": "forgotPassword.title",
  "reset-password": "resetPassword.title",
  "complete-profile": "completeProfile.title",
  credits: "audioCredits.title",
  "record-voice": "voices.pageTitle",
  auth: "nav.login",
};
const MODES = { flashcards: "practice.flashcards", listening: "practice.listening", quiz: "practice.quiz", writing: "practice.writing", dictation: "dictation.title" };

const SITE = "https://www.ktalim.uz";

// Sets the browser tab title from the current route, e.g. "Lesson 3 · Quiz — K-TALIM".
export default function PageTitle() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    const [section, id, mode] = pathname.split("/").filter(Boolean);
    let title = "";
    if (!section) title = t("header.brand");
    else if ((section === "lesson" || section === "study") && id) {
      title = [t("card.lesson", { lesson: id }), mode ? t(MODES[mode] || "") : section === "study" ? t("nav.study") : ""]
        .filter(Boolean)
        .join(" · ");
    } else if (SECTIONS[section]) title = SECTIONS[section].includes(".") ? t(SECTIONS[section]) : SECTIONS[section];
    else title = t("notFound.title");
    // University pages set their own title.
    if (!(section === "korea" && id)) document.title = title ? `${title} — K-TALIM` : "K-TALIM";
    // The shared page shell has no canonical address of its own, so the link
    // is created here when the page did not come with one.
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${SITE}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`);
    document.documentElement.lang = String(i18n.language || "uz").slice(0, 2);
  }, [pathname, t, i18n.language]);

  return null;
}

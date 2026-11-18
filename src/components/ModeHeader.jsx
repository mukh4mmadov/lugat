import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

// A lesson's title and its ways to practise: study, cards, quizzes, grammar, stories.
export default function ModeHeader({ lesson, review = false, weak = false, list = null }) {
  const { t } = useTranslation();
  const modes = list
    ? [[`/${list}/practice`, t(`library.${list}`)]]
    : weak
      ? [["/weak-words", t("library.weakWords")]]
      : review
        ? [["/review", t("home.reviewMode")]]
        : [
            [`/study/${lesson}`, t("nav.study")],
            [`/lesson/${lesson}/flashcards`, t("anki.cards")],
            [`/lesson/${lesson}/listening`, t("practice.listening")],
            [`/lesson/${lesson}/quiz`, t("practice.quiz")],
            [`/lesson/${lesson}/writing`, t("practice.writing")],
            [`/lesson/${lesson}/dictation`, t("dictation.title")],
            [`/lesson/${lesson}/grammar`, `📐 ${t("grammar.tab")}`],
            [`/lesson/${lesson}/stories`, `📖 ${t("stories.tab")}`],
          ];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <Link to="/study" className="text-sm font-black text-sky-600 dark:text-sky-300">
          ← {t("anki.decks")}
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-4xl">
          {weak ? t("library.weakWords") : review ? t("home.reviewMode") : t("card.lesson", { lesson })}
        </h1>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
        {modes.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `shrink-0 rounded-2xl px-3 py-1.5 text-xs font-black transition sm:px-4 sm:py-2 sm:text-sm ${isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/70 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

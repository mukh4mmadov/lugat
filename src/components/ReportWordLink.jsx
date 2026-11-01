import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getWordKey, meaning } from "../data";

// Opens the feedback form already filled in for this word.
export default function ReportWordLink({ word, className = "" }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const prefill = {
    category: "content",
    subject: `${word.korean} — ${meaning(word)}`.slice(0, 120),
    message: t("reportWord.template", { korean: word.korean, meaning: meaning(word), key: getWordKey(word) }),
  };
  return (
    <Link
      to="/feedback"
      state={{ from: pathname, prefill }}
      onClick={(event) => event.stopPropagation()}
      className={`inline-flex items-center gap-1 text-xs font-bold text-slate-400 underline-offset-2 hover:text-rose-500 hover:underline ${className}`}
    >
      ⚑ {t("reportWord.link")}
    </Link>
  );
}

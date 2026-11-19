import { useTranslation } from "react-i18next";

// Pages a message can open from the learner's bell.
const PAGES = ["", "/study", "/review", "/premium", "/topik", "/speaking", "/speaking?tab=invite", "/grammar", "/stories", "/feedback"];

// The optional parts of a message to learners: shown as the bar at the top
// of the site too, and a page the bell opens.
export default function MessageExtras({ important, onImportant, link, onLink, field }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-white/10">
        <input type="checkbox" checked={important} onChange={(event) => onImportant(event.target.checked)} className="accent-sky-600" />
        {t("adminNotifications.important")}
      </label>
      <select value={link} onChange={(event) => onLink(event.target.value)} aria-label={t("adminNotifications.link")} className={field}>
        {PAGES.map((page) => <option key={page} value={page}>{page ? `→ ${page}` : t("adminNotifications.noLink")}</option>)}
      </select>
    </div>
  );
}

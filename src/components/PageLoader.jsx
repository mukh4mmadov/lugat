import { useTranslation } from "react-i18next";

// Shown while a page's code downloads.
export default function PageLoader({ fullScreen = false }) {
  const { t } = useTranslation();
  return (
    <div role="status" className={`grid place-items-center ${fullScreen ? "min-h-screen bg-slate-950" : "min-h-[50vh]"}`}>
      <span className="flex flex-col items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
        <span className="h-9 w-9 animate-spin rounded-full border-4 border-sky-500/25 border-t-sky-500" aria-hidden="true" />
        {t("common.loading")}
      </span>
    </div>
  );
}

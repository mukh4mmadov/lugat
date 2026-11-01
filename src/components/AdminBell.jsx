import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminUnseen } from "../lib/adminNotifications";

// Admins only: a bell in the header with the number of unseen notifications.
export default function AdminBell() {
  const { t } = useTranslation();
  const unseen = useAdminUnseen(true);
  return (
    <Link
      to="/admin/notifications"
      aria-label={unseen ? t("adminNotifications.bellUnseen", { count: unseen }) : t("adminNotifications.title")}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-base shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10"
    >
      <span aria-hidden="true">🔔</span>
      {unseen > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-black leading-none text-white ring-2 ring-white dark:ring-slate-900">
          {unseen > 99 ? "99+" : unseen}
        </span>
      )}
    </Link>
  );
}

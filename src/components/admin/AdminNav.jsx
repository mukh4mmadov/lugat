import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminSearch from "./AdminSearch";

const GROUPS = ["daily", "content", "site"];

const Badge = ({ count }) => (count > 0 ? <span className="rounded-full bg-rose-600 px-1.5 text-[11px] font-black text-white">{count > 99 ? "99+" : count}</span> : null);

// On a phone: every section at once, in big tiles, with search on top.
function SectionSheet({ tabs, onClose }) {
  const { t } = useTranslation();
  const closeRef = useRef(null);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t("adminNav.menu")} className="fixed inset-0 z-[90] overflow-y-auto bg-slate-50 p-4 pb-10 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black">{t("adminNav.menu")}</h2>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t("common.close")} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-200 text-lg font-black dark:bg-white/10">✕</button>
      </div>
      <AdminSearch tabs={tabs} inline onPick={onClose} />
      {GROUPS.map((group) => (
        <section key={group} className="mt-5">
          <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">{t(`adminNav.group.${group}`)}</h3>
          <div className="grid grid-cols-3 gap-2">
            {tabs.filter((tab) => tab.group === group).map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                onClick={onClose}
                className={({ isActive }) => `relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl p-2 text-center text-xs font-black ${isActive ? "bg-sky-600 text-white" : "bg-white text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-100"}`}
              >
                <span aria-hidden="true" className="text-2xl">{tab.icon}</span>
                <span className="break-words leading-tight">{tab.label}</span>
                {tab.count > 0 && <span className="absolute right-1.5 top-1.5"><Badge count={tab.count} /></span>}
              </NavLink>
            ))}
          </div>
        </section>
      ))}
    </div>,
    document.body,
  );
}

// Tabs and search on a wide screen; one button that stays in reach on a phone.
export default function AdminNav({ tabs }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const current = tabs.find((tab) => (tab.end ? pathname === tab.to || pathname === `${tab.to}/` : pathname.startsWith(tab.to))) || tabs[0];
  const unseen = tabs.reduce((sum, tab) => sum + (tab.count || 0), 0);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-1 px-1 md:hidden">
        <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} className="flex min-h-12 w-full items-center gap-2 rounded-2xl bg-sky-600 px-4 text-left text-sm font-black text-white shadow-lg">
          <span aria-hidden="true" className="text-lg">{current.icon}</span>
          <span className="min-w-0 flex-1 truncate">{current.label}</span>
          <Badge count={unseen} />
          <span className="shrink-0 rounded-lg bg-white/20 px-2 py-1 text-xs">☰ {t("adminNav.menu")}</span>
        </button>
      </div>
      {open && <SectionSheet tabs={tabs} onClose={() => setOpen(false)} />}

      <div className="hidden max-w-xl md:block">
        <AdminSearch tabs={tabs} />
      </div>
      <nav aria-label={t("admin.tools")} className="-mx-1 hidden gap-1 overflow-x-auto px-1 pb-1 md:flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `shrink-0 rounded-xl px-4 py-2 text-sm font-black transition ${
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "bg-white/70 text-slate-600 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`
            }
          >
            {tab.label}
            {tab.count > 0 && <span className="ml-1.5"><Badge count={tab.count} /></span>}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

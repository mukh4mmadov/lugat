import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getReviewCount } from "../lib/srs";

const ICONS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  study: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5",
  review: "M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5",
  topik: "M9 3h6l1 2h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3zM8 11h8M8 15h5",
  menu: "M4 6h16M4 12h16M4 18h16",
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const itemClass = (active) =>
  `relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold transition ${
    active ? "text-sky-600 dark:text-sky-300" : "text-slate-500 dark:text-slate-400"
  }`;

// Phone-only tab bar for the places learners go most.
export default function BottomNav({ onMenu, badge = 0 }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const words = useSelector((state) => state.progress.words);
  const due = getReviewCount(words);
  const items = [
    ["/", "home", t("nav.home"), (path) => path === "/"],
    ["/study", "study", t("nav.study"), (path) => /^\/(study|lesson|courses)/.test(path)],
    ["/review", "review", t("nav.review"), (path) => path.startsWith("/review")],
    ["/topik", "topik", "TOPIK", (path) => path.startsWith("/topik")],
  ];

  return (
    <nav
      aria-label={t("nav.mainNavigation")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/90 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {items.map(([to, icon, label, isActive]) => (
          <NavLink key={to} to={to} className={() => itemClass(isActive(pathname))} aria-current={isActive(pathname) ? "page" : undefined}>
            <Icon name={icon} />
            <span className="max-w-full truncate">{label}</span>
            {icon === "review" && due > 0 && (
              <span className="absolute right-[22%] top-0.5 min-w-[1.1rem] rounded-full bg-rose-500 px-1 text-center text-[10px] font-black leading-[1.1rem] text-white">
                {due > 99 ? "99+" : due}
              </span>
            )}
          </NavLink>
        ))}
        <button type="button" onClick={onMenu} className={itemClass(false)}>
          <Icon name="menu" />
          <span>{t("nav.menu")}</span>
          {badge > 0 && <span className="absolute right-[26%] top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" aria-hidden="true" />}
        </button>
      </div>
    </nav>
  );
}

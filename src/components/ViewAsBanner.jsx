import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isViewingAs, stopViewAs, viewAs } from "../lib/viewAs";

// Shown on every page while an admin views the site as a learner, so the
// admin always knows nothing here is saved, and how long the view lasts.
export default function ViewAsBanner() {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isViewingAs) return undefined;
    document.documentElement.classList.add("k-view-as");
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const left = isViewingAs ? viewAs.expiresAt - now : 0;
  useEffect(() => {
    if (isViewingAs && left <= 0) stopViewAs();
  }, [left]);

  if (!isViewingAs) return null;
  const minutes = Math.max(0, Math.floor(left / 60000));
  const seconds = String(Math.max(0, Math.floor((left % 60000) / 1000))).padStart(2, "0");
  return (
    <>
      <div role="status" className="sticky top-0 z-[90] flex h-9 items-center gap-2 bg-amber-500 px-3 text-xs font-black text-slate-950 shadow-lg">
        <span aria-hidden="true">👁</span>
        <span className="min-w-0 flex-1 truncate">{t("viewAs.banner", { name: viewAs.name || viewAs.user.email })}</span>
        <span className="tabular-nums">{minutes}:{seconds}</span>
        <button type="button" onClick={stopViewAs} className="rounded-lg bg-slate-950 px-2.5 py-1 text-white">{t("viewAs.exit")}</button>
      </div>
      {/* A frame round the whole screen: this is not the admin's own account. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[89] border-4 border-amber-500" />
    </>
  );
}

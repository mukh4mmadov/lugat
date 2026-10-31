import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";

const DISMISSED_KEY = "k-talim:announcement-dismissed";

// The site-wide message admins set in the dashboard. Closing it hides that
// text only, so a new announcement shows again.
export default function AnnouncementBanner() {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase.rpc("get_announcement").then(({ data, error }) => {
      if (cancelled || error || !data?.text) return;
      if (window.localStorage.getItem(DISMISSED_KEY) === data.text) return;
      setAnnouncement(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!announcement) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, announcement.text);
    } catch {
      // Blocked storage: it hides for this visit only.
    }
    setAnnouncement(null);
  }

  const link = announcement.link;
  const linkClass = "shrink-0 rounded-lg bg-white/20 px-3 py-1 text-xs font-black hover:bg-white/30";
  return (
    <div role="status" className="relative z-40 flex items-center justify-center gap-3 bg-gradient-to-r from-sky-600 to-violet-600 px-4 py-2 text-sm font-bold text-white">
      <span className="min-w-0 text-center">📣 {announcement.text}</span>
      {link && (link.startsWith("/") ? (
        <Link to={link} onClick={dismiss} className={linkClass}>{t("announcement.open")}</Link>
      ) : (
        <a href={link} target="_blank" rel="noreferrer" className={linkClass}>{t("announcement.open")}</a>
      ))}
      <button type="button" onClick={dismiss} aria-label={t("common.close")} className="shrink-0 rounded-lg px-2 py-1 hover:bg-white/20">✕</button>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { formatDate, timeAgo } from "../lib/dates";
import { markAllRead, markRead, useNotifications } from "../lib/notifications";
import { selectReviewCount } from "../store";

const ICONS = { admin: "📬", feedback: "💬", premium: "🎁", premium_expiring: "⏳", referral_joined: "👋", referral_qualified: "🎉", streak: "🔥", review: "🔁" };

// The review reminder is live (it comes from the learner's cards), so it
// counts as new once a day until the bell is opened.
const REVIEW_SEEN_KEY = "k-talim:bell-review-seen";
const today = () => new Date().toISOString().slice(0, 10);
function reviewSeenToday() {
  try {
    return localStorage.getItem(REVIEW_SEEN_KEY) === today();
  } catch {
    return false;
  }
}

// Title and text of one notification in the learner's language.
function describe(item, t, language) {
  const data = item.data || {};
  const name = data.name || t("notif.someone");
  switch (item.kind) {
    case "feedback":
      return { title: t("notif.feedback.title"), text: data.preview || "" };
    case "premium":
      return { title: t("notif.premium.title", { count: data.days || 0 }), text: data.until ? t("notif.premium.text", { date: formatDate(data.until, language) }) : "" };
    case "premium_expiring":
      return { title: t("notif.expiring.title"), text: t("notif.expiring.text", { date: formatDate(data.until, language) }) };
    case "referral_joined":
      return { title: t("notif.referralJoined.title"), text: t("notif.referralJoined.text", { name }) };
    case "referral_qualified":
      return { title: t("notif.referralQualified.title"), text: t("notif.referralQualified.text", { name }) };
    case "streak":
      return { title: t("notif.streak.title", { count: data.streak || 0 }), text: t("notif.streak.text") };
    case "review":
      return { title: t("notif.review.title"), text: t("notif.review.text", { count: data.count }) };
    default:
      return { title: item.title || "", text: item.body || "" };
  }
}

// Learners' bell in the header: everything that happened for them, newest
// first. Opening one marks it read and goes to the page it is about.
export default function UserBell() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loaded } = useNotifications(user?.id);
  const reviewCount = useSelector(selectReviewCount);
  const [open, setOpen] = useState(false);
  const [reviewSeen, setReviewSeen] = useState(reviewSeenToday);
  const boxRef = useRef(null);

  // Close on page change, outside click and Escape.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => boxRef.current && !boxRef.current.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const review = reviewCount > 0 ? { id: "review", kind: "review", link: "/review", data: { count: reviewCount }, created_at: null, read_at: reviewSeen ? "seen" : null } : null;
  const list = review ? [review, ...items] : items;
  const unread = list.filter((item) => !item.read_at).length;

  function toggle() {
    setOpen((value) => !value);
    if (!open && review && !reviewSeen) {
      try {
        localStorage.setItem(REVIEW_SEEN_KEY, today());
      } catch {
        // Shown again tomorrow anyway.
      }
      setReviewSeen(true);
    }
  }

  function openItem(item) {
    if (item.kind !== "review" && !item.read_at) markRead(item.id);
    if (item.link) {
      setOpen(false);
      navigate(item.link);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={unread ? t("notif.bellUnread", { count: unread }) : t("notif.title")}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-base shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-black leading-none text-white ring-2 ring-white dark:ring-slate-900">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label={t("notif.title")} className="fixed inset-x-2 top-[4.25rem] z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-96">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <p className="font-black">{t("notif.title")}</p>
            {items.some((item) => !item.read_at) && (
              <button type="button" onClick={markAllRead} className="text-xs font-bold text-sky-600 dark:text-sky-300">{t("notif.markAll")}</button>
            )}
          </div>
          <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto dark:divide-white/5">
            {list.map((item) => {
              const { title, text } = describe(item, t, i18n.language);
              const fresh = !item.read_at;
              return (
                <li key={item.id}>
                  <button type="button" onClick={() => openItem(item)} className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/5 ${fresh ? "bg-sky-50/70 dark:bg-sky-500/10" : ""}`}>
                    <span className="mt-0.5 text-xl" aria-hidden="true">{ICONS[item.kind] || "📬"}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black">{title}</span>
                      {text && <span className="mt-0.5 block text-sm text-slate-600 dark:text-slate-300">{text}</span>}
                      <span className="mt-1 block text-[11px] font-bold text-slate-400">
                        {item.created_at ? timeAgo(item.created_at, i18n.language) : t("notif.now")}
                        {item.link && ` · ${t("notif.open")} →`}
                      </span>
                    </span>
                    {fresh && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" aria-label={t("notif.new")} />}
                  </button>
                </li>
              );
            })}
            {!list.length && (
              <li className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                <p className="text-3xl" aria-hidden="true">🔕</p>
                <p className="mt-2">{loaded ? t("notif.empty") : t("common.loading")}</p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

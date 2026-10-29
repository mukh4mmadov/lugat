import { useTranslation } from "react-i18next";
import { formatDate } from "../lib/dates";
import { CATEGORY_ICON, PRIORITY_TONE, STATUS_TONE } from "../lib/feedback";

export function StatusPill({ status, className = "" }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-black ${STATUS_TONE[status]} ${className}`}>
      {t(`feedback.status.${status}`)}
    </span>
  );
}

export function PriorityPill({ priority }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-black ${PRIORITY_TONE[priority]}`}>
      {priority === "urgent" ? "‼ " : priority === "high" ? "! " : ""}
      {t(`feedback.priority.${priority}`)}
    </span>
  );
}

export function CategoryLabel({ category }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <span aria-hidden="true">{CATEGORY_ICON[category] || "💬"}</span>
      {t(`feedback.category.${category}`)}
    </span>
  );
}

export function UnreadDot({ label }) {
  return <span role="img" aria-label={label} title={label} className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />;
}

export function Stars({ value, onChange, size = "text-2xl", label }) {
  const interactive = Boolean(onChange);
  return (
    <span role={interactive ? "radiogroup" : "img"} aria-label={label} className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={String(star)}
            onClick={() => onChange(star)}
            className={`${size} leading-none transition hover:scale-110 ${star <= (value || 0) ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
          >
            ★
          </button>
        ) : (
          <span key={star} aria-hidden="true" className={`${size} leading-none ${star <= (value || 0) ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}>
            ★
          </span>
        ),
      )}
    </span>
  );
}

// A chat-style conversation. `viewer` is whose side is on the right.
// Each message: { id, role: "user" | "admin", internal, body, created_at, author, canDelete }.
export function MessageThread({ messages, viewer, onDelete }) {
  const { t, i18n } = useTranslation();
  return (
    <ol className="space-y-3">
      {messages.map((message) => {
        if (message.internal) {
          return (
            <li key={message.id} className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-400/30 dark:bg-amber-500/10">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-200">
                <span>🔒 {t("feedback.internalNote")}</span>
                <span className="font-semibold normal-case tracking-normal opacity-80">
                  {message.author} · {formatDate(message.created_at, i18n.language, { time: true })}
                </span>
                {message.canDelete && onDelete && (
                  <button type="button" onClick={() => onDelete(message)} className="ml-auto font-bold normal-case tracking-normal underline">
                    {t("feedback.delete")}
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words leading-6 text-amber-950 dark:text-amber-50">{message.body}</p>
            </li>
          );
        }
        const mine = message.role === viewer;
        return (
          <li key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] sm:max-w-[80%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
              <span className="mb-1 px-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {message.author} · {formatDate(message.created_at, i18n.language, { time: true })}
              </span>
              <div
                className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-6 ${
                  mine
                    ? "rounded-br-md bg-sky-600 text-white"
                    : message.role === "admin"
                      ? "rounded-bl-md border border-violet-200 bg-violet-50 text-slate-900 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-slate-100"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                }`}
              >
                {message.body}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../lib/adminApi";
import { timeAgo } from "../../lib/dates";

// Earlier states of one item; any of them can be brought back.
export default function ContentHistory({ kind, itemId, onRestored }) {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      setRows((await adminRequest({ action: "contentHistory", kind, itemId })).history);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function restore(historyId) {
    if (!window.confirm(t("studio.restoreConfirm"))) return;
    setBusy(true);
    try {
      await adminRequest({}, { action: "contentRestore", historyId });
      await onRestored();
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details key={`${kind}:${itemId}`} onToggle={(event) => event.currentTarget.open && load()} className="rounded-xl border border-slate-100 p-2.5 text-sm dark:border-white/5">
      <summary className="cursor-pointer text-xs font-black text-slate-500">{t("studio.history")}</summary>
      {error && <p role="alert" className="mt-2 text-xs font-bold text-rose-600">{error}</p>}
      {rows && !rows.length && <p className="mt-2 text-xs text-slate-500">{t("studio.noHistory")}</p>}
      <ul className="mt-2 space-y-1.5">
        {rows?.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-2 text-xs">
            <span>{timeAgo(row.saved_at, i18n.language)} · {row.data ? t(row.hidden ? "studio.stateHidden" : "studio.stateShown") : t("studio.stateNone")}</span>
            <button type="button" disabled={busy} onClick={() => restore(row.id)} className="rounded-lg border border-slate-300 px-2 py-1 font-black disabled:opacity-50 dark:border-white/15">{t("studio.restore")}</button>
          </li>
        ))}
      </ul>
    </details>
  );
}

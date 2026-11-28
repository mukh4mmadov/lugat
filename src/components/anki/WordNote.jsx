import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setWordNote } from "../../store";

export default function WordNote({ wordKey }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const saved = useSelector((state) => state.progress.notes?.[wordKey] || "");
  const [draft, setDraft] = useState(saved);
  return (
    <textarea
      value={draft}
      maxLength={300}
      rows={2}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => draft.trim() !== saved && dispatch(setWordNote({ key: wordKey, text: draft }))}
      placeholder={t("anki.notePlaceholder")}
      aria-label={t("anki.note")}
      className="mx-auto mt-3 block w-full max-w-xl rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-left text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5"
    />
  );
}

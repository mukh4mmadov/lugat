import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LEVEL_ICONS, SPEAKING_LEVELS } from "../../data/speakingTopics";
import { supabase } from "../../lib/supabase";

// Gender (for partner matching) and Korean level, asked once before the first
// conversation and editable later from the profile tab.
export default function SpeakingSetup({ userId, initial = {}, suggestedLevel, onSaved, onCancel }) {
  const { t } = useTranslation();
  const [gender, setGender] = useState(initial.gender || "");
  const [level, setLevel] = useState(initial.korean_level || suggestedLevel || "beginner");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event) {
    event.preventDefault();
    if (!gender) {
      setError(t("speaking.setup.pickGender"));
      return;
    }
    setSaving(true);
    setError("");
    const { error: saveError } = await supabase.from("profiles").update({ gender, korean_level: level }).eq("id", userId);
    setSaving(false);
    if (saveError) {
      setError(t("speaking.setup.saveFailed"));
      return;
    }
    onSaved({ gender, korean_level: level });
  }

  const option = (active) =>
    `flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-sm font-black transition ${
      active ? "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-500/10" : "border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5"
    }`;

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <h2 className="text-xl font-black">{t("speaking.setup.title")}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("speaking.setup.text")}</p>
      </div>
      <fieldset>
        <legend className="text-sm font-black">{t("speaking.setup.gender")}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[["male", "👨"], ["female", "👩"]].map(([value, icon]) => (
            <label key={value} className={option(gender === value)}>
              <input type="radio" name="gender" value={value} checked={gender === value} onChange={() => setGender(value)} className="sr-only" />
              <span className="text-2xl" aria-hidden="true">{icon}</span>
              {t(`speaking.gender.${value}`)}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">{t("speaking.setup.genderHint")}</p>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-black">{t("speaking.setup.level")}</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {SPEAKING_LEVELS.map((value) => (
            <label key={value} className={option(level === value)}>
              <input type="radio" name="level" value={value} checked={level === value} onChange={() => setLevel(value)} className="sr-only" />
              <span className="text-2xl" aria-hidden="true">{LEVEL_ICONS[value]}</span>
              {t(`speaking.level.${value}`)}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">{t(`speaking.levelHint.${level}`)}</p>
      </fieldset>
      {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white disabled:opacity-60">
          {saving ? t("common.loading") : t("common.save")}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-300 px-5 py-3 font-bold dark:border-white/15">{t("common.cancel")}</button>
        )}
      </div>
    </form>
  );
}

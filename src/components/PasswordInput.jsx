import { useState } from "react";
import { useTranslation } from "react-i18next";

// A password field with a button that shows or hides what was typed.
export default function PasswordInput({ className = "", wrapperClassName = "", ...props }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <div className={`relative ${wrapperClassName}`}>
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-3xl text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {visible && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </div>
  );
}

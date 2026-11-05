import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { allWords, getWordKey, meaning } from "../../data";
import { adminRequest } from "../../lib/adminApi";

const WAIT_MS = 300;
const MIN_LETTERS = 2;
const MAX_WORDS = 5;

function Group({ title, items, onPick }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wide text-slate-500">{title}</p>
      {items.map((item) => (
        <Link key={item.to} to={item.to} onClick={onPick} className="block min-h-11 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-white/10">
          <span className="block truncate font-bold">{item.title}</span>
          {item.note && <span className="block truncate text-xs text-slate-500">{item.note}</span>}
        </Link>
      ))}
    </div>
  );
}

// One box for the whole panel: sections, learners, tickets and words.
export default function AdminSearch({ tabs, inline = false, onPick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState(null);
  const needle = query.trim().toLowerCase();
  const searching = needle.length >= MIN_LETTERS;

  useEffect(() => {
    setFound(null);
    if (!searching) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      adminRequest({ action: "search", q: needle })
        .then((data) => !cancelled && setFound(data))
        .catch(() => !cancelled && setFound({ users: [], tickets: [] }));
    }, WAIT_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [needle, searching]);

  const groups = useMemo(() => {
    if (!searching) return [];
    const sections = tabs.filter((tab) => tab.label.toLowerCase().includes(needle)).map((tab) => ({ to: tab.to, title: `${tab.icon} ${tab.label}` }));
    const words = allWords
      .filter((word) => [word.korean, word.uzbek, word.english, word.russian].some((text) => text?.toLowerCase().includes(needle)))
      .slice(0, MAX_WORDS)
      .map((word) => ({ to: `/admin/words?word=${encodeURIComponent(getWordKey(word))}`, title: word.korean, note: meaning(word) }));
    return [
      [t("adminSearch.sections"), sections],
      [t("adminSearch.users"), (found?.users || []).map((user) => ({ to: `/admin/users?user=${user.id}`, title: user.name || user.email, note: user.name ? user.email : "" }))],
      [t("adminSearch.tickets"), (found?.tickets || []).map((ticket) => ({ to: `/admin/feedback?ticket=${ticket.id}`, title: ticket.message }))],
      [t("adminSearch.words"), words],
    ];
  }, [searching, needle, tabs, found, t]);

  const first = groups.flatMap(([, items]) => items)[0];

  function pick() {
    setQuery("");
    onPick?.();
  }

  const results = searching && (
    <div className={inline ? "mt-2" : "absolute left-0 right-0 top-full z-30 mt-1 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-slate-900"}>
      {groups.map(([title, items]) => <Group key={title} title={title} items={items} onPick={pick} />)}
      {found && !first && <p className="px-3 py-4 text-center text-sm text-slate-500">{t("adminSearch.none")}</p>}
      {!found && <p role="status" className="px-3 py-2 text-xs text-slate-500">{t("common.loading")}</p>}
    </div>
  );

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
          if (event.key === "Enter" && first) {
            navigate(first.to);
            pick();
          }
        }}
        placeholder={t("adminSearch.placeholder")}
        aria-label={t("adminSearch.placeholder")}
        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900 md:text-sm"
      />
      {results}
    </div>
  );
}

import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { setTheme } from "../store";

const navItems = [
  ["/", "Home"],
  ["/search", "Search"],
  ["/favorites", "Favorites"],
  ["/difficult", "Difficult"],
  ["/stats", "Stats"],
  ["/settings", "Settings"],
];

export default function Layout() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.progress.theme);
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-[#07111f] dark:text-white">
        <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,.24),transparent_28%),radial-gradient(circle_at_bottom,rgba(34,197,94,.15),transparent_32%)]" />
        <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <NavLink to="/" className="group flex items-center gap-3">
              <motion.div whileHover={{ rotate: -8, scale: 1.04 }} className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-xl font-black text-white shadow-xl shadow-sky-500/25">
                K
              </motion.div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-500">K-TALIM 1A</p>
                <h1 className="text-xl font-black tracking-tight">Korean Vocabulary Studio</h1>
              </div>
            </NavLink>

            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {navItems.map(([to, label]) => (
                <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? "bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950" : "bg-white/65 text-slate-700 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"}`}>
                  {label}
                </NavLink>
              ))}
              <button type="button" onClick={() => dispatch(setTheme(nextTheme))} className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white">
                {nextTheme === "dark" ? "Dark" : "Light"}
              </button>
            </nav>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
          <Outlet />
        </div>

        <footer className="relative z-10 mt-16 border-t border-slate-200/70 bg-white/60 px-4 py-8 text-sm text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            <div>
              <p className="font-black text-slate-900 dark:text-white">Vocabulary Source</p>
              <p>K-TALIM 1A · Dong Eun Academy</p>
              <p>Educational purposes only.</p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">Developer</p>
              <p>Mukh4mmadov</p>
              <p>Telegram @mukh4mmadov</p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">For bugs or errors</p>
              <p>Contact Telegram @mukh4mmadov</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

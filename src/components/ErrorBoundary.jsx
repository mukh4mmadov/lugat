import { Component } from "react";
import { useLocation } from "react-router-dom";
import i18n from "../lib/i18n";

// Shows a recovery screen instead of a blank page when a page crashes.
class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const t = i18n.t.bind(i18n);
    return (
      <div role="alert" className="mx-auto mt-10 max-w-md rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-xl dark:border-rose-400/30 dark:bg-slate-900">
        <p className="text-4xl">😕</p>
        <h1 className="mt-3 text-xl font-black">{t("errorBoundary.title")}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("errorBoundary.text")}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={() => window.location.reload()} className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950">
            {t("errorBoundary.reload")}
          </button>
          <a href="/" className="rounded-2xl border border-slate-300 px-5 py-2.5 text-sm font-bold dark:border-white/15">{t("errorBoundary.home")}</a>
        </div>
      </div>
    );
  }
}

// A fresh boundary per page, so moving to another page clears the error.
export default function ErrorBoundary({ children }) {
  const location = useLocation();
  return <Boundary key={location.pathname}>{children}</Boundary>;
}

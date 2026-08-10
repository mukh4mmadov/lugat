import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getDeviceId } from "../lib/deviceId";
import EmptyStateIllustrations from "./EmptyStateIllustrations";

function formatCountdown(ms) {
  if (!ms || ms <= 0) return "00:00:00";

  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

export default function AIChatWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetAt, setResetAt] = useState(null);
  const [countdown, setCountdown] = useState("00:00:00");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (resetAt) {
      intervalRef.current = setInterval(() => {
        const remaining = resetAt - Date.now();
        if (remaining <= 0) {
          setCountdown("00:00:00");
          setResetAt(null);
          setError("");
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else {
          setCountdown(formatCountdown(remaining));
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [resetAt]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setResetAt(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text, deviceId: getDeviceId() }),
      });

      const data = await response.json();

      if (response.status === 429) {
        const serverResetAt = typeof data.resetAt === "number" ? data.resetAt : Date.now() + 60 * 1000;
        setResetAt(serverResetAt);
        throw new Error(t("aiChat.rateLimitExceeded"));
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const isRateLimited = !!resetAt && countdown !== "00:00:00";

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setResetAt(null);
            setError("");
          }
        }}
        aria-label={isOpen ? t("aiChat.closeAriaLabel") : t("aiChat.openAriaLabel")}
        title={isOpen ? t("aiChat.closeAriaLabel") : t("aiChat.openAriaLabel")}
        className="fixed bottom-4 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl shadow-slate-900/30 transition hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 dark:bg-white dark:text-slate-950 md:bottom-6 md:right-6"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          )}
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:bg-black/25"
              onClick={() => {
                setIsOpen(false);
                setResetAt(null);
                setError("");
              }}
            />

            {/* Panel */}
            <motion.div
              key="ai-chat-panel"
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-x-0 bottom-0 z-[65] flex max-h-[85vh] flex-col rounded-t-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 md:inset-y-4 md:left-auto md:right-4 md:w-[400px] md:max-h-none md:rounded-3xl md:border md:shadow-2xl"
              style={{
                boxShadow: "0 24px 96px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 24px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
                    {t("aiChat.badge")}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("aiChat.title")}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setResetAt(null);
                    setError("");
                  }}
                  aria-label={t("aiChat.closeAriaLabel")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-24 w-24">
                        <EmptyStateIllustrations.Chat />
                      </div>
                      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        {t("aiChat.emptyState")}
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium ${
                        msg.role === "user"
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">
                      {t("aiChat.thinking")}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                      {error}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Countdown / Input */}
              <div className="border-t border-slate-200 p-4 dark:border-white/10">
                {isRateLimited && (
                  <div className="mb-3 rounded-2xl bg-slate-950/5 px-4 py-3 text-center dark:bg-white/10">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {t("aiChat.limitResetsIn", { time: countdown })}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("aiChat.placeholder")}
                    className="premium-input flex-1"
                    maxLength={2000}
                    disabled={isRateLimited}
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={loading || !input.trim() || isRateLimited}
                    className="rounded-2xl bg-slate-950 px-5 py-2.5 font-black text-white transition hover:-translate-y-1 disabled:opacity-50 dark:bg-white dark:text-slate-950"
                  >
                    {t("aiChat.send")}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

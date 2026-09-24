import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
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

function formatDate(dateStr, t) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return t("aiChat.justNow");
  if (diffMins < 60) return t("aiChat.minutesAgo", { count: diffMins });
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t("aiChat.hoursAgo", { count: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return t("aiChat.daysAgo", { count: diffDays });
  return date.toLocaleDateString();
}

export default function AIChatWidget() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetAt, setResetAt] = useState(null);
  const [countdown, setCountdown] = useState("00:00:00");
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
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
    if (isOpen) {
      inputRef.current?.focus();
    }
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

  const fetchSessions = useCallback(() => {
    if (!session?.access_token) return;
    fetch("/api/ai-chat?action=sessions", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSessions(data.sessions || []);
      })
      .catch(() => {});
  }, [session?.access_token]);

  const loadSession = useCallback(
    (sessionId) => {
      if (!session?.access_token) return;
      fetch(`/api/ai-chat?action=messages&sessionId=${encodeURIComponent(sessionId)}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            const loaded = (data.messages || []).map((m) => ({
              role: m.role,
              content: m.content,
            }));
            setMessages(loaded);
            setCurrentSessionId(sessionId);
            setShowHistory(false);
          }
        })
        .catch(() => {});
    },
    [session?.access_token]
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
    setError("");
    setResetAt(null);
  }, []);

  useEffect(() => {
    if (isOpen && session?.access_token) {
      fetchSessions();
    }
  }, [isOpen, session?.access_token, fetchSessions]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setResetAt(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const body = {
        message: text,
        deviceId: getDeviceId(),
      };
      if (currentSessionId) {
        body.sessionId = currentSessionId;
      }

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 429) {
        const serverResetAt = typeof data.resetAt === "number" ? data.resetAt : Date.now() + 60 * 1000;
        setResetAt(serverResetAt);
        if (data.isGuest) {
          throw new Error(t("aiChat.guestLimitReached"));
        }
        throw new Error(t("aiChat.rateLimitExceeded"));
      }

      if (!response.ok) {
        throw new Error(data.error || t("aiChat.failedToGetResponse"));
      }

      if (data.sessionId) {
        setCurrentSessionId(data.sessionId);
        fetchSessions();
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || t("aiChat.somethingWentWrong"));
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
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
                    {t("aiChat.badge")}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("aiChat.title")}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {session && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowHistory((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        aria-label={t("aiChat.history")}
                        title={t("aiChat.history")}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={startNewChat}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        aria-label={t("aiChat.newChat")}
                        title={t("aiChat.newChat")}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </>
                  )}
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
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {showHistory ? (
                  <div className="flex h-full flex-col">
                    <h4 className="mb-3 text-sm font-black text-slate-900 dark:text-white">
                      {t("aiChat.history")}
                    </h4>
                    {sessions.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center">
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                          {t("aiChat.noSessions")}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        {sessions.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => loadSession(s.id)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-white/10 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10"
                          >
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {s.title || t("aiChat.newChat")}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(s.updated_at, t)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              <div className="border-t border-slate-200 p-4 dark:border-white/10">
                {isRateLimited && (
                  <div className="mb-3 rounded-2xl bg-slate-950/5 px-4 py-3 text-center dark:bg-white/10">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {t("aiChat.limitResetsIn", { time: countdown })}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <label htmlFor="ai-chat-input" className="sr-only">{t("aiChat.placeholder")}</label>
                  <input
                    ref={inputRef}
                    id="ai-chat-input"
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

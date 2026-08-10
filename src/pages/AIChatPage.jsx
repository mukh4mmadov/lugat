import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { getDeviceId } from "../lib/deviceId";

export default function AIChatPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError("");
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
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <GlassCard className="relative overflow-hidden p-5 md:p-8">
        <div className="absolute right-4 top-4 hidden h-28 w-28 rounded-full bg-violet-300/25 blur-3xl md:block" />
        <div className="relative">
          <WordBadge tone="violet">{t("aiChat.badge")}</WordBadge>
          <h2 className="mt-3 text-2xl font-black md:text-3xl">{t("aiChat.title")}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 md:text-base">{t("aiChat.subtitle")}</p>
        </div>
      </GlassCard>

      <GlassCard className="mt-6 flex h-[500px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                {t("aiChat.emptyState")}
              </p>
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

        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("aiChat.placeholder")}
              className="premium-input flex-1"
              maxLength={2000}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-2xl bg-slate-950 px-5 py-2.5 font-black text-white transition hover:-translate-y-1 disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              {t("aiChat.send")}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

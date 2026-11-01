import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getGrammarPoint } from "../../data/grammar";
import { getSpeakingTopic } from "../../data/speakingTopics";
import { getTopikVariant, TOPIK_EXAMS } from "../../data/topik/exams";
import { adminRequest } from "../../lib/adminApi";
import { formatDate, timeAgo } from "../../lib/dates";
import { Panel } from "../../pages/AdminPage";

const button = "rounded-xl px-3 py-2 text-xs font-black disabled:opacity-50";

function variantName(t, variantId) {
  const variant = getTopikVariant(variantId);
  const exam = variant && TOPIK_EXAMS.find((item) => item.id === variant.examId);
  return variant ? t(`topik.variant.${variant.mode}`, { number: exam?.number || "" }) : variantId;
}

// The learner's request to delete the account: the admin checks the account,
// then rejects the request with a note or deletes the account.
function DeletionRequests({ detail, busy, run, onDelete }) {
  const { t, i18n } = useTranslation();
  const [note, setNote] = useState("");
  const open = detail.deletionRequests.find((request) => request.status === "open");
  return (
    <Panel title={t("admin.records.deletion")} className={open ? "border-rose-300 dark:border-rose-500/40" : ""}>
      <ul className="space-y-2 text-sm">
        {detail.deletionRequests.map((request) => (
          <li key={request.id} className="rounded-xl bg-slate-100 p-2.5 dark:bg-white/5">
            <p className="text-xs font-bold text-slate-500">
              {t(`admin.records.deletionStatus.${request.status}`)} · {formatDate(request.created_at, i18n.language)}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{request.reason}</p>
            {request.admin_note && <p className="mt-1 text-xs text-slate-500">↳ {request.admin_note}</p>}
          </li>
        ))}
      </ul>
      {open && (
        <div className="mt-3 grid gap-2">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("admin.records.rejectNote")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={Boolean(busy)} onClick={() => run("deletionRequest", { requestId: open.id, status: "rejected", note }, t("admin.records.rejected"))} className={`${button} border border-slate-300 dark:border-white/15`}>
              {t("admin.records.reject")}
            </button>
            <button type="button" disabled={Boolean(busy)} onClick={onDelete} className={`${button} bg-rose-600 text-white`}>
              {t("admin.records.approve")}
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function TopikAttempts({ attempts }) {
  const { t, i18n } = useTranslation();
  return (
    <Panel title={t("admin.records.topik", { count: attempts.length })}>
      <ul className="divide-y divide-slate-100 text-sm dark:divide-white/5">
        {attempts.map((attempt) => (
          <li key={attempt.id} className="flex items-center justify-between gap-2 py-1.5">
            <span className="truncate">
              📝 {variantName(t, attempt.variant_id)}
              {attempt.hidden && <span className="ml-1 text-xs text-slate-500">({t("admin.records.hiddenByUser")})</span>}
            </span>
            <span className="shrink-0 text-xs text-slate-500">
              {attempt.status === "submitted" && attempt.result
                ? `${attempt.result.total}/${attempt.result.maxTotal}${attempt.result.level ? ` · ${attempt.result.level}급` : ""}`
                : t("admin.records.inProgress")}
              {" · "}
              {timeAgo(Number(attempt.submitted_at || attempt.started_at) || attempt.updated_at, i18n.language)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function GrammarChecks({ checks }) {
  const { t, i18n } = useTranslation();
  return (
    <Panel title={t("admin.records.grammar", { count: checks.length })}>
      <ul className="max-h-96 space-y-2 overflow-y-auto text-sm">
        {checks.map((check) => (
          <li key={check.id} className="rounded-xl bg-slate-100 p-2.5 dark:bg-white/5">
            <p className="text-xs font-bold text-slate-500">
              {getGrammarPoint(check.point_id)?.pattern || check.point_id} · {timeAgo(check.created_at, i18n.language)} · {check.result?.correct ? "✓" : "✗"}
            </p>
            <p className="mt-1 font-bold">{check.sentence}</p>
            {check.result?.corrected && check.result.corrected !== check.sentence && <p className="text-emerald-700 dark:text-emerald-300">→ {check.result.corrected}</p>}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// Every speaking session; a Friday conversation opens word for word.
function SpeakingHistory({ sessions }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(false);
  async function show(id) {
    if (open === id) {
      setOpen(null);
      return;
    }
    setOpen(id);
    setLoading(true);
    try {
      setTranscript((await adminRequest({ action: "transcript", sessionId: id })).transcript);
    } catch {
      setTranscript([]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Panel title={t("admin.powers.speakingHistory")}>
      <ul className="space-y-2 text-sm">
        {sessions.map((session) => {
          const topic = getSpeakingTopic(session.topic_id);
          const ai = session.kind === "ai";
          return (
            <li key={session.id} className="rounded-xl border border-slate-100 dark:border-white/5">
              <button type="button" disabled={!ai} onClick={() => show(session.id)} className="flex w-full items-center justify-between gap-2 p-2.5 text-left">
                <span className="truncate">{ai ? "🤖" : "👥"} {topic ? `${topic.emoji} ${topic.ko}` : "—"}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  {t("speaking.minutesShort", { count: Math.max(1, Math.round(session.seconds / 60)) })} · {session.turns} · {timeAgo(session.started_at, i18n.language)} {ai ? (open === session.id ? "▴" : "▾") : ""}
                </span>
              </button>
              {open === session.id && (
                <div className="max-h-80 space-y-2 overflow-y-auto border-t border-slate-100 p-2.5 dark:border-white/5">
                  {loading && <p className="text-slate-500">{t("common.loading")}</p>}
                  {transcript.map((turn, index) => (
                    <div key={index} className={`rounded-xl px-3 py-2 ${turn.role === "learner" ? "ml-6 bg-sky-50 dark:bg-sky-500/10" : "mr-6 bg-slate-100 dark:bg-white/5"}`}>
                      <p className="whitespace-pre-wrap">{turn.text || "…"}</p>
                      {turn.translation && <p className="mt-1 text-xs text-slate-500">{turn.translation}</p>}
                    </div>
                  ))}
                  {!loading && !transcript.length && <p className="text-slate-500">{t("admin.records.noTranscript")}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

// Everything the learner did that is kept in the account.
export default function UserRecords({ detail, busy, run, onDelete }) {
  return (
    <>
      {detail.deletionRequests.length > 0 && <DeletionRequests detail={detail} busy={busy} run={run} onDelete={onDelete} />}
      {detail.topikAttempts.length > 0 && <TopikAttempts attempts={detail.topikAttempts} />}
      {detail.grammarChecks.length > 0 && <GrammarChecks checks={detail.grammarChecks} />}
      {detail.speakingSessions.length > 0 && <SpeakingHistory sessions={detail.speakingSessions} />}
    </>
  );
}

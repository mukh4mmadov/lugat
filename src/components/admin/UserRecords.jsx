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

// How the AI tutor treats this learner, and questions it asks them for the admin.
function AiDirectives({ detail, busy, run }) {
  const { t, i18n } = useTranslation();
  const [behavior, setBehavior] = useState(detail.aiBehavior);
  const [question, setQuestion] = useState("");
  return (
    <Panel title={`🤖 ${t("admin.ai.title")}`}>
      <label className="text-xs font-bold text-slate-500">
        {t("admin.ai.behavior")}
        <textarea
          value={behavior}
          onChange={(event) => setBehavior(event.target.value)}
          maxLength={1000}
          rows={3}
          placeholder={t("admin.ai.behaviorHint")}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900 dark:text-white"
        />
      </label>
      <button type="button" disabled={Boolean(busy) || behavior === detail.aiBehavior} onClick={() => run("aiBehavior", { behavior }, t("admin.ai.saved"))} className={`${button} mt-1 bg-violet-600 text-white`}>
        {t("admin.ai.save")}
      </button>

      <p className="mt-4 text-xs font-bold text-slate-500">{t("admin.ai.ask")}</p>
      <div className="mt-1 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={300}
          placeholder={t("admin.ai.askHint")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900"
        />
        <button
          type="button"
          disabled={Boolean(busy) || question.trim().length < 3}
          onClick={async () => {
            await run("aiAsk", { question }, t("admin.ai.asked"));
            setQuestion("");
          }}
          className={`${button} shrink-0 bg-sky-600 text-white`}
        >
          {t("admin.ai.askButton")}
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">{t("admin.ai.askNote")}</p>

      {detail.aiRequests.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm">
          {detail.aiRequests.map((request) => (
            <li key={request.id} className="rounded-xl bg-slate-100 p-2.5 dark:bg-white/5">
              <p className="text-xs font-bold text-slate-500">{t(`admin.ai.status.${request.status}`)} · {formatDate(request.created_at, i18n.language)}</p>
              <p className="mt-1">{request.question}</p>
              {request.answer && <p className="mt-1 font-bold">↳ {request.answer}</p>}
              {request.status === "pending" && (
                <button type="button" disabled={Boolean(busy)} onClick={() => run("aiCancel", { requestId: request.id }, t("admin.ai.cancelled"))} className="mt-1 text-xs font-bold text-rose-600">
                  {t("common.cancel")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// A list of saved items; each one opens from the server when clicked.
function OpenableList({ items, label, load }) {
  const [open, setOpen] = useState(null);
  const [content, setContent] = useState(null);
  async function show(id) {
    if (open === id) {
      setOpen(null);
      return;
    }
    setOpen(id);
    setContent(null);
    setContent(await load(id).catch((error) => ({ error: error.message })));
  }
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border border-slate-100 dark:border-white/5">
          <button type="button" onClick={() => show(item.id)} className="flex w-full items-center justify-between gap-2 p-2.5 text-left">
            <span className="truncate">{label(item)}</span>
            <span aria-hidden="true" className="shrink-0 text-xs text-slate-500">{open === item.id ? "▴" : "▾"}</span>
          </button>
          {open === item.id && (
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-t border-slate-100 p-2.5 text-[11px] dark:border-white/5">{content ? JSON.stringify(content, null, 2) : "…"}</pre>
          )}
        </li>
      ))}
    </ul>
  );
}

function KoreaRecords({ detail }) {
  const { t, i18n } = useTranslation();
  const plan = detail.studyPlan;
  if (!plan && !detail.documents.length && !detail.interviews.length) return null;
  const place = (item) => [item.kind, item.language, item.university_id].filter(Boolean).join(" · ");
  return (
    <Panel title={`🇰🇷 ${t("admin.records.korea")}`}>
      {plan && (
        <dl className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-500">{t("admin.records.targets")}</dt>
          <dd className="text-right font-bold">{plan.targets?.join(", ") || "—"}</dd>
          <dt className="text-slate-500">{t("admin.records.intake")}</dt>
          <dd className="text-right font-bold">{plan.intake || "—"}</dd>
          <dt className="text-slate-500">{t("admin.records.degree")}</dt>
          <dd className="text-right font-bold">{plan.degree || "—"}</dd>
          <dt className="text-slate-500">{t("admin.records.topikGoal")}</dt>
          <dd className="text-right font-bold">{plan.topik_goal || "—"}</dd>
          <dt className="text-slate-500">{t("admin.records.checklist")}</dt>
          <dd className="text-right font-bold">{Object.values(plan.checklist || {}).filter(Boolean).length}</dd>
          <dt className="text-slate-500">{t("admin.records.applications")}</dt>
          <dd className="text-right font-bold">{Object.keys(plan.applications || {}).length}</dd>
        </dl>
      )}
      {detail.documents.length > 0 && (
        <>
          <p className="mb-1 text-xs font-bold text-slate-500">{t("admin.records.documents")}</p>
          <OpenableList items={detail.documents} label={(item) => `📄 ${place(item)} · ${formatDate(item.created_at, i18n.language)}`} load={(id) => adminRequest({ action: "document", docId: id })} />
        </>
      )}
      {detail.interviews.length > 0 && (
        <>
          <p className="mb-1 mt-3 text-xs font-bold text-slate-500">{t("admin.records.interviews")}</p>
          <OpenableList items={detail.interviews} label={(item) => `🎤 ${place(item)} · ${formatDate(item.started_at, i18n.language)}`} load={(id) => adminRequest({ action: "interview", sessionId: id })} />
        </>
      )}
    </Panel>
  );
}

// Calls, invitations and pushes; a direct message; all data in one file.
function ContactTools({ detail, busy, run }) {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [exporting, setExporting] = useState(false);
  const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-slate-900";

  async function download() {
    setExporting(true);
    try {
      const data = await adminRequest({ action: "export", id: detail.id });
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `k-talim-${detail.id}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Panel title={`📬 ${t("admin.records.contact")}`}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-slate-500">{t("admin.records.rating")}</dt>
        <dd className="text-right font-bold">{detail.rating.average === null ? "—" : `⭐ ${detail.rating.average} (${detail.rating.count})`}</dd>
        <dt className="text-slate-500">{t("admin.records.blocksMade")}</dt>
        <dd className="text-right font-bold">{detail.blocks.made}</dd>
        <dt className="text-slate-500">{t("admin.records.blocksReceived")}</dt>
        <dd className="text-right font-bold">{detail.blocks.received}</dd>
        <dt className="text-slate-500">{t("admin.records.referralCode")}</dt>
        <dd className="text-right font-bold">{detail.referralCode?.code || "—"}</dd>
        <dt className="text-slate-500">{t("admin.records.lastPush")}</dt>
        <dd className="text-right font-bold">{detail.pushes[0] ? `${detail.pushes[0].kind} · ${timeAgo(detail.pushes[0].sent_at, i18n.language)}` : "—"}</dd>
      </dl>

      <p className="mt-4 text-xs font-bold text-slate-500">{t("admin.records.notify")}</p>
      <div className="mt-1 grid gap-2">
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder={t("admin.records.notifyTitle")} className={field} />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={200} rows={2} placeholder={t("admin.records.notifyBody")} className={field} />
        <button
          type="button"
          disabled={Boolean(busy) || !title.trim() || !body.trim()}
          onClick={async () => {
            await run("notifyUser", { title, body }, t("admin.records.notifySent"));
            setTitle("");
            setBody("");
          }}
          className={`${button} bg-sky-600 text-white`}
        >
          {t("admin.records.notifySend")}
        </button>
      </div>
      <button type="button" disabled={exporting} onClick={download} className={`${button} mt-3 w-full border border-slate-300 dark:border-white/15`}>
        ⬇️ {exporting ? t("common.loading") : t("admin.records.export")}
      </button>
    </Panel>
  );
}

// Everything the learner did that is kept in the account.
export default function UserRecords({ detail, busy, run, onDelete }) {
  return (
    <>
      {detail.deletionRequests.length > 0 && <DeletionRequests detail={detail} busy={busy} run={run} onDelete={onDelete} />}
      <AiDirectives key={detail.id} detail={detail} busy={busy} run={run} />
      <ContactTools key={`contact-${detail.id}`} detail={detail} busy={busy} run={run} />
      <KoreaRecords detail={detail} />
      {detail.topikAttempts.length > 0 && <TopikAttempts attempts={detail.topikAttempts} />}
      {detail.grammarChecks.length > 0 && <GrammarChecks checks={detail.grammarChecks} />}
      {detail.speakingSessions.length > 0 && <SpeakingHistory sessions={detail.speakingSessions} />}
    </>
  );
}

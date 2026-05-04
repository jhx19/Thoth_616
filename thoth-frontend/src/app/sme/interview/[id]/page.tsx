"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Bot, RefreshCw } from "lucide-react";
import { SmeShell } from "@/components/layout/sme-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ApiError,
  InterviewTurnRecord,
  endSmeInterview,
  resumeInterview,
  submitInterviewAnswer,
  type EntryStatus,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_CHARS = 4000;

const META_PREFIX = "thoth_interview_topic:";

export default function SmeInterviewPage({
  params,
}: {
  params: { id: string };
}) {
  const interviewId = params.id;
  const searchParams = useSearchParams();
  const topicFromQuery = searchParams.get("topic");

  const [topic, setTopic] = useState<string>("Interview");
  const [status, setStatus] = useState<EntryStatus>("in_progress");
  const [history, setHistory] = useState<InterviewTurnRecord[]>([]);
  const [turn, setTurn] = useState(1);
  const [ended, setEnded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastAiIdx = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === "ai") return i;
    }
    return -1;
  })();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (topicFromQuery?.trim()) {
        setTopic(topicFromQuery.trim());
      } else if (typeof window !== "undefined") {
        const stored = window.sessionStorage.getItem(
          `${META_PREFIX}${interviewId}`,
        );
        if (stored) setTopic(stored);
      }

      const data = await resumeInterview(interviewId);
      setTurn(data.turn_number ?? 1);
      const q = (data.last_question ?? "").trim();
      if (q) {
        setHistory([{ role: "ai", content: q }]);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [interviewId, topicFromQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  async function endInterview() {
    try {
      await endSmeInterview(interviewId);
      setStatus("completed");
    } catch {
      // In-memory interviews from /interviews/admin-initiate may not exist in
      // the SQL-backed end endpoint; still mark the UI as ended locally.
      setStatus("completed");
    }
    setEnded(true);
  }

  async function submit() {
    const v = answer.trim();
    if (!v || ended || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const optimistic: InterviewTurnRecord = { role: "sme", content: v };
    setHistory((h) => [...h, optimistic]);
    setAnswer("");
    try {
      const res = await submitInterviewAnswer(interviewId, v);
      const t = res.type;
      if (t === "completed") {
        setEnded(true);
        setStatus("completed");
        return;
      }
      const nextQ = (res.question ?? "").trim();
      if (nextQ) {
        setHistory((h) => [...h, { role: "ai", content: nextQ }]);
      }
      if (typeof res.turn_number === "number") {
        setTurn(res.turn_number);
      } else {
        setTurn((n) => n + 1);
      }
    } catch (err) {
      setHistory((h) => h.filter((m) => m !== optimistic));
      setSubmitError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SmeShell>
      <div className="flex h-full flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-line bg-card px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/sme/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-input text-muted hover:bg-page hover:text-ink"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold text-ink">
                {topic}
              </h2>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                <span>Turn {turn}</span>
                <span>·</span>
                <StatusBadge status={ended ? "completed" : status} />
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => void endInterview()}
            disabled={ended}
          >
            {ended ? "Interview Ended" : "End Interview"}
          </Button>
        </header>

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6"
        >
          <div className="mx-auto max-w-3xl space-y-5">
            {loading ? (
              <div className="rounded-card border border-line bg-card px-4 py-6 text-center text-xs text-muted">
                Loading interview…
              </div>
            ) : loadError ? (
              <div className="flex items-start justify-between gap-4 rounded-card border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
                <div className="flex items-start gap-2 text-sm text-[#991B1B]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Couldn&apos;t load interview</div>
                    <div className="text-xs">{loadError}</div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => void load()}>
                  <RefreshCw size={14} />
                  Retry
                </Button>
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-card border border-line bg-card px-4 py-6 text-center text-xs text-muted">
                No active question from the server yet — try refreshing, or
                confirm this interview was started from the admin portal.
              </div>
            ) : (
              history.map((m, i) =>
                m.role === "ai" ? (
                  <AiQuestion
                    key={i}
                    content={m.content}
                    highlighted={i === lastAiIdx && !ended}
                  />
                ) : (
                  <SmeAnswer key={i} content={m.content} />
                ),
              )
            )}

            {ended && (
              <div className="rounded-card border border-line bg-card px-4 py-3 text-center text-xs text-muted">
                Interview ended. The transcript has been saved as a draft entry.
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-line bg-card px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <Textarea
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value.slice(0, MAX_CHARS))
              }
              rows={6}
              placeholder="Share your expertise in detail…"
              disabled={ended || submitting}
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
              <span>
                {answer.length} / {MAX_CHARS} characters
              </span>
              <span>Be specific — concrete examples help the draft.</span>
            </div>
            {submitError && (
              <div className="mt-2 flex items-start gap-2 rounded-input border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]">
                <AlertCircle size={14} className="mt-px shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <Button
              variant="primary"
              size="lg"
              className="mt-3 w-full"
              onClick={() => void submit()}
              disabled={!answer.trim() || ended || submitting}
            >
              {submitting ? "Submitting…" : "Submit Answer"}
            </Button>
          </div>
        </div>
      </div>
    </SmeShell>
  );
}

function AiQuestion({
  content,
  highlighted,
}: {
  content: string;
  highlighted: boolean;
}) {
  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "max-w-[640px] rounded-card bg-bubble-ai-bg px-4 py-2.5 text-sm text-bubble-ai-fg",
          highlighted &&
            "border-l-2 border-magenta bg-card shadow-card text-[15px] leading-relaxed",
        )}
      >
        <div
          className={cn(
            "mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide",
            highlighted ? "text-magenta" : "text-ink/60",
          )}
        >
          <Bot size={12} />
          AI Interviewer
        </div>
        {content}
      </div>
    </div>
  );
}

function SmeAnswer({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[640px] rounded-card bg-magenta px-4 py-2.5 text-sm text-white shadow-card">
        {content}
      </div>
    </div>
  );
}

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status ? `${err.message} (HTTP ${err.status})` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

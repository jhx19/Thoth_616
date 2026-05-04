"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot } from "lucide-react";
import { SmeShell } from "@/components/layout/sme-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { interviewThreads, type InterviewTurn } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MAX_CHARS = 4000;

export default function SmeInterviewPage({
  params,
}: {
  params: { id: string };
}) {
  const base =
    interviewThreads[params.id] ??
    interviewThreads[Object.keys(interviewThreads)[0]];

  const [history, setHistory] = useState<InterviewTurn[]>(base.history);
  const [turn, setTurn] = useState(base.turn);
  const [ended, setEnded] = useState(false);
  const [answer, setAnswer] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // index of the latest AI question (highlighted)
  const lastAiIdx = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === "ai") return i;
    }
    return -1;
  })();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  function submit() {
    const v = answer.trim();
    if (!v || ended) return;
    setHistory((h) => [...h, { role: "sme", content: v }]);
    setAnswer("");
    setTurn((t) => t + 1);
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
                {base.topic}
              </h2>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                <span>Turn {turn}</span>
                <span>·</span>
                <StatusBadge status={ended ? "completed" : base.status} />
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setEnded(true)}
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
            {history.map((m, i) =>
              m.role === "ai" ? (
                <AiQuestion
                  key={i}
                  content={m.content}
                  highlighted={i === lastAiIdx && !ended}
                />
              ) : (
                <SmeAnswer key={i} content={m.content} />
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
              disabled={ended}
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
              <span>
                {answer.length} / {MAX_CHARS} characters
              </span>
              <span>Be specific — concrete examples help the draft.</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="mt-3 w-full"
              onClick={submit}
              disabled={!answer.trim() || ended}
            >
              Submit Answer
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
            "border-l-2 border-magenta bg-card shadow-card text-[15px] leading-relaxed"
        )}
      >
        <div
          className={cn(
            "mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide",
            highlighted ? "text-magenta" : "text-ink/60"
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

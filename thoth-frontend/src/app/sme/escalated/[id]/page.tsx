"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, AlertTriangle, Send } from "lucide-react";
import { SmeShell } from "@/components/layout/sme-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
/**
 * Escalated-question threads are not yet exposed on `/api/v1`.
 * This page keeps the SME reply UX; history stays empty until a backend route exists.
 */
export default function EscalatedAnswerPage({
  params,
}: {
  params: { id: string };
}) {
  const [reply, setReply] = useState("");
  const [sentReply, setSentReply] = useState<string | null>(null);
  const [escalated, setEscalated] = useState(false);

  function send() {
    const v = reply.trim();
    if (!v) return;
    setSentReply(v);
    setReply("");
  }

  const title = `Escalation ${params.id}`;

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
            <h2 className="truncate text-[15px] font-semibold text-ink">
              {title}
            </h2>
          </div>
          <Button
            variant="danger"
            size="md"
            onClick={() => setEscalated(true)}
            disabled={escalated}
          >
            <AlertTriangle size={14} />
            {escalated ? "Escalated to Admin" : "Cannot Answer — Escalate to Admin"}
          </Button>
        </header>

        {/* Chat history (read-only) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          <div className="mx-auto max-w-3xl space-y-5">
            <p className="rounded-card border border-line bg-card px-4 py-3 text-center text-xs text-muted">
              Conversation history for escalations will load here when the API
              provides a thread endpoint. Escalation id:{" "}
              <span className="font-mono text-ink/80">{params.id}</span>
            </p>

            {/* Forwarded divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-line" />
              <span className="rounded-badge border border-line bg-card px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                Forwarded to SME
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* Sent SME reply (preview) */}
            {sentReply && (
              <div className="flex justify-end">
                <div className="max-w-[640px] rounded-card bg-magenta px-4 py-2.5 text-sm text-white shadow-card">
                  {sentReply}
                </div>
              </div>
            )}

            {escalated && (
              <div className="rounded-card border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs text-[#991B1B]">
                This question has been escalated to an Admin for review.
              </div>
            )}
          </div>
        </div>

        {/* Reply area */}
        <div className="border-t border-line bg-card px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Type your answer…"
              disabled={!!sentReply || escalated}
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11px] text-muted">
                Your answer will be sent back to the user as an SME response once
                the escalation API is connected.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={send}
                disabled={!reply.trim() || !!sentReply || escalated}
              >
                <Send size={14} />
                Send Answer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SmeShell>
  );
}

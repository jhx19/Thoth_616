"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, FileText, RefreshCw, X } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ApiError,
  KnowledgeEntry,
  adminApproveKnowledge,
  listKnowledge,
  rejectKnowledge,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminApprovePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listKnowledge({ status: "sme_approved" });
      setEntries(res.entries);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const removeEntry = (id: string) =>
    setEntries((prev) => prev.filter((e) => e.entry_id !== id));

  return (
    <AdminShell title="Approve Knowledge">
      <div className="px-8 py-6">
        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[24px] font-bold text-ink">Pending Approval</h2>
            <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-full bg-magenta px-2 text-xs font-semibold text-white">
              {loading ? "—" : entries.length}
            </span>
          </div>
          <p className="text-xs text-muted">
            Showing entries with status{" "}
            <span className="font-medium">SME Approved</span> only
          </p>
        </div>

        {/* Body */}
        {loading ? (
          <SkeletonList />
        ) : loadError ? (
          <LoadErrorState message={loadError} onRetry={load} />
        ) : entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <ApprovalCard
                key={entry.entry_id}
                entry={entry}
                onResolved={() => removeEntry(entry.entry_id)}
              />
            ))}
          </div>
        )}

        {/* Pager (mock) */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted">
          <span>10 per page</span>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" disabled>
              Previous
            </Button>
            <Button variant="secondary" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function ApprovalCard({
  entry,
  onResolved,
}: {
  entry: KnowledgeEntry;
  onResolved: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const handleApprove = async () => {
    setSubmitting("approve");
    setActionError(null);
    try {
      await adminApproveKnowledge(entry.entry_id);
      onResolved();
    } catch (err) {
      setActionError(formatError(err));
      setSubmitting(null);
    }
  };

  const handleReject = async () => {
    const reason = comment.trim();
    if (!reason) return;
    setSubmitting("reject");
    setActionError(null);
    try {
      await rejectKnowledge(entry.entry_id, reason);
      onResolved();
    } catch (err) {
      setActionError(formatError(err));
      setSubmitting(null);
    }
  };

  const sourceLabels = [
    ...entry.sources.interviews.map((id) => `Interview ${shortId(id)}`),
    ...entry.sources.materials.map((id) => `Material ${shortId(id)}`),
  ];

  return (
    <article className="rounded-card border border-line bg-card shadow-card">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="truncate text-[15px] font-semibold text-ink">
              {entry.topic}
            </h3>
            <StatusBadge status="sme_approved" />
          </div>
          <p className="mt-1 text-xs text-muted">
            <span className="font-medium text-ink/80">{entry.sme_id}</span> · SME
            Approved on {formatDate(entry.updated_at)}
          </p>
        </div>
      </header>

      {/* Content (read-only) */}
      <div className="px-5 py-4">
        <div
          className={cn(
            "max-h-56 overflow-y-auto scrollbar-thin rounded-input border border-line bg-page px-4 py-3 text-sm leading-relaxed text-ink/90",
          )}
        >
          {entry.content}
        </div>

        {/* Source pills */}
        {sourceLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sourceLabels.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-badge border border-line bg-page px-2 py-1 text-xs text-ink/80"
              >
                <FileText size={12} className="text-muted" />
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Reject inline comment */}
        {rejecting && (
          <div className="mt-4 rounded-card border border-[#FECACA] bg-[#FEF2F2] p-3">
            <label className="mb-1 block text-xs font-medium text-[#991B1B]">
              Reason for rejection
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain what needs to change before this can be approved…"
              rows={3}
              className="bg-card"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={submitting === "reject"}
                onClick={() => {
                  setRejecting(false);
                  setComment("");
                  setActionError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!comment.trim() || submitting === "reject"}
                onClick={handleReject}
              >
                <X size={14} />
                {submitting === "reject" ? "Rejecting…" : "Confirm Reject"}
              </Button>
            </div>
          </div>
        )}

        {actionError && (
          <div className="mt-3 flex items-start gap-2 rounded-input border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]">
            <AlertCircle size={14} className="mt-px shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Action bar */}
      <footer className="flex items-center justify-end gap-2 border-t border-line bg-page px-5 py-3 rounded-b-card">
        {!rejecting && (
          <Button
            variant="danger"
            size="md"
            disabled={submitting !== null}
            onClick={() => setRejecting(true)}
          >
            <X size={14} />
            Reject
          </Button>
        )}
        <Button
          variant="approve"
          size="md"
          disabled={submitting !== null}
          onClick={handleApprove}
        >
          <Check size={14} />
          {submitting === "approve" ? "Approving…" : "Approve"}
        </Button>
      </footer>
    </article>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-card border border-line bg-card shadow-card"
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="w-full">
              <div className="h-4 w-2/3 animate-pulse rounded bg-page" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-page" />
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="h-32 animate-pulse rounded-input bg-page" />
            <div className="mt-3 flex gap-2">
              <div className="h-5 w-20 animate-pulse rounded-badge bg-page" />
              <div className="h-5 w-24 animate-pulse rounded-badge bg-page" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-line bg-page px-5 py-3 rounded-b-card">
            <div className="h-8 w-20 animate-pulse rounded bg-card" />
            <div className="h-8 w-24 animate-pulse rounded bg-card" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-[#FECACA] bg-[#FEF2F2] py-16 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-card text-[#991B1B]">
        <AlertCircle size={18} />
      </div>
      <p className="text-sm font-medium text-[#991B1B]">
        Couldn&apos;t load pending approvals
      </p>
      <p className="mt-1 max-w-md text-xs text-[#991B1B]/80">{message}</p>
      <div className="mt-4">
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Retry
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-card py-16 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-page text-muted">
        <Check size={18} />
      </div>
      <p className="text-sm font-medium text-ink">All caught up</p>
      <p className="mt-1 text-xs text-muted">
        No SME-approved entries are awaiting your review.
      </p>
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}

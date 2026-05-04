"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  RefreshCw,
} from "lucide-react";
import { SmeShell } from "@/components/layout/sme-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ApiError,
  KnowledgeEntry,
  listKnowledge,
  smeApproveKnowledge,
  updateKnowledgeContent,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const PENDING_STATUSES = new Set(["draft", "in_progress", "rejected"]);
const EXISTING_STATUSES = new Set(["approved", "completed", "sme_approved"]);

export default function SmeKnowledgePage() {
  const router = useRouter();
  const [smeId, setSmeId] = useState<string | null>(null);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showExisting, setShowExisting] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listKnowledge();
      const mine = res.entries.filter((e) => e.sme_id === id);
      setEntries(mine);
      setDrafts(
        Object.fromEntries(mine.map((e) => [e.entry_id, e.content])),
      );
      const firstPending = mine.find((e) => PENDING_STATUSES.has(e.status));
      setActiveId(firstPending?.entry_id ?? mine[0]?.entry_id ?? null);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sme_id");
    if (!stored) {
      router.replace("/sme/login");
      return;
    }
    setSmeId(stored);
    void load(stored);
  }, [load, router]);

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 1500);
    return () => clearTimeout(t);
  }, [savedFlash]);

  const pending = entries.filter((e) => PENDING_STATUSES.has(e.status));
  const existing = entries.filter((e) => EXISTING_STATUSES.has(e.status));
  const active = entries.find((e) => e.entry_id === activeId) ?? null;
  const draft = active ? drafts[active.entry_id] ?? "" : "";

  function setDraft(value: string) {
    if (!active) return;
    setDrafts((d) => ({ ...d, [active.entry_id]: value }));
  }

  async function save() {
    if (!active || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      const updated = await updateKnowledgeContent(active.entry_id, draft);
      setEntries((all) =>
        all.map((e) => (e.entry_id === active.entry_id ? updated : e)),
      );
      setSavedFlash(true);
    } catch (err) {
      setActionError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  async function approve() {
    if (!active || approving) return;
    setApproving(true);
    setActionError(null);
    try {
      // Persist any unsaved edits before approving
      if (drafts[active.entry_id] !== active.content) {
        await updateKnowledgeContent(active.entry_id, draft);
      }
      const res = await smeApproveKnowledge(active.entry_id);
      setEntries((all) =>
        all.map((e) =>
          e.entry_id === active.entry_id
            ? { ...e, status: res.status, content: draft }
            : e,
        ),
      );
      setSavedFlash(true);
      // Move selection to next pending entry
      const next = entries.find(
        (e) => e.entry_id !== active.entry_id && PENDING_STATUSES.has(e.status),
      );
      if (next) setActiveId(next.entry_id);
    } catch (err) {
      setActionError(formatError(err));
    } finally {
      setApproving(false);
    }
  }

  return (
    <SmeShell>
      <div className="flex h-full">
        {/* Left list */}
        <aside className="flex w-[340px] shrink-0 flex-col border-r border-line bg-card">
          <div className="border-b border-line px-5 py-3">
            <h3 className="text-[15px] font-semibold text-ink">
              Pending Reviews
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              {loading ? "Loading…" : `${pending.length} draft entries`}
            </p>
          </div>

          <ul className="flex-1 overflow-y-auto scrollbar-thin">
            {loading ? (
              <li className="px-5 py-4 text-xs text-muted">Loading entries…</li>
            ) : loadError ? (
              <li className="px-5 py-4">
                <div className="flex items-start gap-2 text-xs text-[#991B1B]">
                  <AlertCircle size={14} className="mt-px shrink-0" />
                  <span>{loadError}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => smeId && void load(smeId)}
                >
                  <RefreshCw size={14} />
                  Retry
                </Button>
              </li>
            ) : pending.length === 0 ? (
              <li className="px-5 py-4 text-xs text-muted">
                No drafts awaiting your review.
              </li>
            ) : (
              pending.map((p) => (
                <PendingItem
                  key={p.entry_id}
                  entry={p}
                  active={p.entry_id === activeId}
                  onClick={() => setActiveId(p.entry_id)}
                />
              ))
            )}

            {/* Existing entries (collapsed) */}
            {existing.length > 0 && (
              <li className="border-t border-line">
                <button
                  onClick={() => setShowExisting((v) => !v)}
                  className="flex w-full items-center gap-2 px-5 py-2.5 text-left text-xs font-medium text-ink/70 hover:bg-page"
                >
                  {showExisting ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  <span>Existing entries · {existing.length}</span>
                </button>
                {showExisting && (
                  <ul className="border-t border-line">
                    {existing.map((e) => (
                      <li
                        key={e.entry_id}
                        className="flex items-center justify-between gap-3 px-5 py-2.5 text-xs"
                      >
                        <span className="truncate text-ink/80">{e.topic}</span>
                        <StatusBadge status={e.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </aside>

        {/* Right editor */}
        <section className="flex min-w-0 flex-1 flex-col">
          {!active ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted">
              {loading
                ? "Loading…"
                : pending.length === 0
                  ? "No entries to review."
                  : "Select an entry to review."}
            </div>
          ) : (
            <>
              <header className="border-b border-line bg-card px-7 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-[18px] font-semibold leading-tight text-ink">
                      {active.topic}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={active.status} />
                      {active.sources.interviews.map((s) => (
                        <span
                          key={`iv-${s}`}
                          className="inline-flex items-center gap-1.5 rounded-badge border border-line bg-page px-2 py-0.5 text-[11px] text-ink/80"
                        >
                          <FileText size={11} className="text-muted" />
                          Interview {shortId(s)}
                        </span>
                      ))}
                      {active.sources.materials.map((s) => (
                        <span
                          key={`mat-${s}`}
                          className="inline-flex items-center gap-1.5 rounded-badge border border-line bg-page px-2 py-0.5 text-[11px] text-ink/80"
                        >
                          <FileText size={11} className="text-muted" />
                          Material {shortId(s)}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Last updated {formatDate(active.updated_at)}
                    </p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto scrollbar-thin px-7 py-5">
                <label className="mb-2 block text-xs font-medium text-ink">
                  Content
                </label>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="min-h-[360px] font-mono text-[13px] leading-relaxed"
                />
                <p className="mt-2 text-[11px] text-muted">
                  {draft.length} characters · Markdown not supported
                </p>
                {actionError && (
                  <div className="mt-3 flex items-start gap-2 rounded-input border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]">
                    <AlertCircle size={14} className="mt-px shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}
              </div>

              <footer className="flex items-center justify-between gap-3 border-t border-line bg-card px-7 py-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={save}
                    disabled={saving || approving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                  {savedFlash && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#065F46]">
                      <Check size={13} />
                      Saved
                    </span>
                  )}
                </div>
                <Button
                  variant="approve"
                  size="md"
                  onClick={approve}
                  disabled={saving || approving}
                >
                  <Check size={14} />
                  {approving ? "Approving…" : "Approve"}
                </Button>
              </footer>
            </>
          )}
        </section>
      </div>
    </SmeShell>
  );
}

function PendingItem({
  entry,
  active,
  onClick,
}: {
  entry: KnowledgeEntry;
  active: boolean;
  onClick: () => void;
}) {
  const totalSources =
    entry.sources.interviews.length + entry.sources.materials.length;
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "flex w-full flex-col gap-1.5 border-b border-line px-5 py-3 text-left hover:bg-page",
          active && "bg-magenta-50 border-l-2 border-l-magenta pl-[18px]"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 text-sm font-medium text-ink">
            {entry.topic}
          </span>
          <StatusBadge status={entry.status} className="shrink-0" />
        </div>
        <div className="text-[11px] text-muted">
          Updated {formatDate(entry.updated_at)}
        </div>
        <div className="text-[11px] text-muted">
          {totalSources} {totalSources === 1 ? "source" : "sources"}
        </div>
      </button>
    </li>
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

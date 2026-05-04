"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { SmeShell } from "@/components/layout/sme-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  smePendingKnowledge,
  smeExistingEntries,
  type SmePendingKnowledge,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function SmeKnowledgePage() {
  const [activeId, setActiveId] = useState(smePendingKnowledge[0].id);
  const active = smePendingKnowledge.find((p) => p.id === activeId)!;

  // Local edit buffer per entry
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(smePendingKnowledge.map((p) => [p.id, p.content]))
  );
  const [showExisting, setShowExisting] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);

  const draft = drafts[active.id] ?? "";

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 1500);
    return () => clearTimeout(t);
  }, [savedFlash]);

  function setDraft(value: string) {
    setDrafts((d) => ({ ...d, [active.id]: value }));
  }

  function save() {
    setSavedFlash(true);
  }

  function approve() {
    setSavedFlash(true);
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
              {smePendingKnowledge.length} draft entries
            </p>
          </div>

          <ul className="flex-1 overflow-y-auto scrollbar-thin">
            {smePendingKnowledge.map((p) => (
              <PendingItem
                key={p.id}
                entry={p}
                active={p.id === activeId}
                onClick={() => setActiveId(p.id)}
              />
            ))}

            {/* Existing entries (collapsed) */}
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
                <span>Existing entries · {smeExistingEntries.length}</span>
              </button>
              {showExisting && (
                <ul className="border-t border-line">
                  {smeExistingEntries.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 px-5 py-2.5 text-xs"
                    >
                      <span className="truncate text-ink/80">{e.topic}</span>
                      <StatusBadge status={e.status} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </aside>

        {/* Right editor */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="border-b border-line bg-card px-7 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-[18px] font-semibold leading-tight text-ink">
                  {active.topic}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={active.status} />
                  {active.sources.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-badge border border-line bg-page px-2 py-0.5 text-[11px] text-ink/80"
                    >
                      <FileText size={11} className="text-muted" />
                      From: {s}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                  Last updated {active.lastUpdated} · Review due{" "}
                  {active.reviewDue}
                </p>
              </div>
            </div>

            {/* Rejection banner — only shown when status is rejected */}
            {active.status === "rejected" && active.rejectionComment && (
              <div className="mt-4 overflow-hidden rounded-card border border-[#FECACA]">
                <div className="flex items-center gap-2 bg-[#FEE2E2] px-4 py-2 text-xs font-medium text-[#991B1B]">
                  Rejected by Admin
                </div>
                <div className="bg-[#FEF3C7] px-4 py-3 text-xs text-[#78350F]">
                  <span className="font-medium">Comment: </span>
                  {active.rejectionComment}
                </div>
              </div>
            )}
          </header>

          {/* Editable content */}
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
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between gap-3 border-t border-line bg-card px-7 py-4">
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={save}>
                Save Changes
              </Button>
              {savedFlash && (
                <span className="inline-flex items-center gap-1 text-xs text-[#065F46]">
                  <Check size={13} />
                  Saved
                </span>
              )}
            </div>
            <Button variant="approve" size="md" onClick={approve}>
              <Check size={14} />
              Approve
            </Button>
          </footer>
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
  entry: SmePendingKnowledge;
  active: boolean;
  onClick: () => void;
}) {
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
          Updated {entry.lastUpdated} · Due {entry.reviewDue}
        </div>
        <div className="text-[11px] text-muted">
          {entry.sources.length}{" "}
          {entry.sources.length === 1 ? "source" : "sources"}
        </div>
      </button>
    </li>
  );
}

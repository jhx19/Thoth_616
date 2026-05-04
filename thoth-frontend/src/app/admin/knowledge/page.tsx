"use client";

import { useState } from "react";
import { Search, X, FileText, CircleDot } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  knowledgeBaseEntries,
  smes,
  type KnowledgeBaseEntry,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { id: "sme_approved" | "approved" | "rejected"; label: string }[] = [
  { id: "sme_approved", label: "SME Approved" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default function AdminKnowledgePage() {
  const [smeFilter, setSmeFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [topic, setTopic] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const open = openId
    ? knowledgeBaseEntries.find((e) => e.id === openId) ?? null
    : null;

  const filtered = knowledgeBaseEntries.filter((e) => {
    if (smeFilter.size > 0 && !smeFilter.has(e.smeId)) return false;
    if (statusFilter.size > 0 && !statusFilter.has(e.status)) return false;
    if (topic.trim() && !e.topic.toLowerCase().includes(topic.toLowerCase()))
      return false;
    return true;
  });

  function toggleIn(set: Set<string>, id: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  }

  function clearAll() {
    setSmeFilter(new Set());
    setStatusFilter(new Set());
    setTopic("");
  }

  return (
    <AdminShell title="Knowledge Base">
      <div className="flex h-full">
        {/* Filter sidebar */}
        <aside className="w-[220px] shrink-0 border-r border-line bg-card px-4 py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">
              Filters
            </h3>
            <button
              onClick={clearAll}
              className="text-[11px] font-medium text-magenta hover:underline"
            >
              Clear
            </button>
          </div>

          {/* By SME */}
          <FilterGroup label="SME">
            {smes.map((s) => (
              <Checkbox
                key={s.id}
                label={s.name}
                checked={smeFilter.has(s.id)}
                onChange={() => toggleIn(smeFilter, s.id, setSmeFilter)}
              />
            ))}
          </FilterGroup>

          {/* By Status */}
          <FilterGroup label="Status">
            {STATUS_FILTERS.map((s) => (
              <Checkbox
                key={s.id}
                label={s.label}
                checked={statusFilter.has(s.id)}
                onChange={() => toggleIn(statusFilter, s.id, setStatusFilter)}
              />
            ))}
          </FilterGroup>

          {/* Topic search */}
          <FilterGroup label="Topic">
            <div className="relative">
              <Search
                size={12}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Search topic"
                className="w-full rounded-input border border-line bg-card py-1.5 pl-7 pr-2 text-xs text-ink placeholder:text-muted focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30"
              />
            </div>
          </FilterGroup>
        </aside>

        {/* Entries list */}
        <section className="min-w-0 flex-1">
          <div className="border-b border-line bg-card px-6 py-3">
            <p className="text-xs text-muted">
              <span className="font-semibold text-ink">{filtered.length}</span>{" "}
              entries
            </p>
          </div>
          <div className="px-6 py-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-card py-16 text-center">
                <p className="text-sm font-medium text-ink">No entries match</p>
                <p className="mt-1 text-xs text-muted">
                  Adjust the filters to see more results.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-card border border-line bg-card shadow-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-page text-left text-[11px] uppercase tracking-wide text-muted">
                      <th className="px-5 py-2.5 font-medium">Topic</th>
                      <th className="px-5 py-2.5 font-medium">SME</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                      <th className="px-5 py-2.5 font-medium">Created</th>
                      <th className="px-5 py-2.5 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-line last:border-0 hover:bg-page"
                      >
                        <td className="px-5 py-3 font-medium text-ink">
                          {e.topic}
                        </td>
                        <td className="px-5 py-3 text-ink/80">{e.smeName}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={e.status} />
                        </td>
                        <td className="px-5 py-3 text-xs text-muted">
                          {e.createdAt}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setOpenId(e.id)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Detail panel slide-in */}
        <DetailPanel entry={open} onClose={() => setOpenId(null)} />
      </div>
    </AdminShell>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-input px-1 py-1 text-sm text-ink/90 hover:bg-page">
      <span
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
          checked ? "border-magenta bg-magenta" : "border-line bg-card"
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white">
            <path
              d="M2.5 6.5l2.5 2.5 4.5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-[13px]">{label}</span>
    </label>
  );
}

function DetailPanel({
  entry,
  onClose,
}: {
  entry: KnowledgeBaseEntry | null;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity",
          entry ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      {/* Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-[480px] flex-col border-l border-line bg-card shadow-card transition-transform",
          entry ? "translate-x-0" : "translate-x-full"
        )}
      >
        {entry && (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div className="min-w-0">
                <h3 className="text-[18px] font-semibold leading-tight text-ink">
                  {entry.topic}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {entry.smeName} · created {entry.createdAt}
                </p>
                <div className="mt-2">
                  <StatusBadge status={entry.status} />
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-input text-muted hover:bg-page hover:text-ink"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
              {/* Content */}
              <section>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Content
                </h4>
                <div className="rounded-input border border-line bg-page px-4 py-3 text-sm leading-relaxed text-ink/90">
                  {entry.content}
                </div>
              </section>

              {/* Sources */}
              <section className="mt-5">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Sources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {entry.sources.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-badge border border-line bg-page px-2 py-1 text-xs text-ink/80"
                    >
                      <FileText size={12} className="text-muted" />
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              {/* Timeline */}
              <section className="mt-5">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Approval Timeline
                </h4>
                <ol className="space-y-3">
                  {entry.timeline.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CircleDot size={14} className="mt-0.5 text-magenta" />
                      <div className="text-xs">
                        <div className="text-ink">
                          <span className="font-medium">{t.actor}</span> ·{" "}
                          <span className="text-ink/70">{t.action}</span>
                        </div>
                        <div className="mt-0.5 text-muted">{t.at}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

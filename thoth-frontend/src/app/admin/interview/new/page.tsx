"use client";

import { useMemo, useState } from "react";
import { Check, Search, Sparkles } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { smes, type SME } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "recommend" | "manual";

export default function StartInterviewPage() {
  const [topic, setTopic] = useState("");
  const [tab, setTab] = useState<Tab>("recommend");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [topicError, setTopicError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    // mock match: each SME gets a reason tailored to their specialization
    return smes.map((s) => ({
      sme: s,
      reason: `Topic looks aligned with ${s.specialization} (${s.sub_areas[0]?.toLowerCase()})`,
    }));
  }, []);

  const filteredManual = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return smes;
    return smes.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.specialization.toLowerCase().includes(q)
    );
  }, [search]);

  const selected = selectedId ? smes.find((s) => s.id === selectedId) : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) {
      setTopicError("Topic is required");
      return;
    }
    if (!selected) {
      setTopicError("");
      return;
    }
    setTopicError("");
    setToast(`Interview created · ${selected.name} has been notified`);
    // auto-clear
    setTimeout(() => setToast(null), 3000);
    // reset form
    setTopic("");
    setSelectedId(null);
  }

  return (
    <AdminShell title="Start Interview">
      <div className="flex justify-center px-8 py-10">
        <form
          onSubmit={submit}
          className="w-[560px] rounded-card border border-line bg-card p-7 shadow-card"
        >
          <h2 className="text-[18px] font-semibold text-ink">
            Start a new SME interview
          </h2>
          <p className="mt-1 text-sm text-muted">
            Define the topic and select the right SME to interview.
          </p>

          {/* Topic */}
          <div className="mt-6">
            <label className="mb-1 block text-xs font-medium text-ink">
              Topic <span className="text-magenta">*</span>
            </label>
            <Textarea
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (topicError) setTopicError("");
              }}
              rows={2}
              placeholder="e.g. Edge cases in restricted commodity transfers under Article 14"
              className={cn(topicError && "border-[#EF4444]")}
            />
            {topicError && (
              <p className="mt-1 text-xs text-[#EF4444]">{topicError}</p>
            )}
          </div>

          {/* SME tabs */}
          <div className="mt-6">
            <div className="mb-2 text-xs font-medium text-ink">Select SME</div>
            <div className="flex border-b border-line">
              <TabBtn active={tab === "recommend"} onClick={() => setTab("recommend")}>
                <Sparkles size={13} className="mr-1.5" />
                Recommend
              </TabBtn>
              <TabBtn active={tab === "manual"} onClick={() => setTab("manual")}>
                Select manually
              </TabBtn>
            </div>

            {tab === "recommend" ? (
              <ul className="mt-3 space-y-2">
                {recommendations.map((r) => (
                  <SmeRow
                    key={r.sme.id}
                    sme={r.sme}
                    reason={r.reason}
                    selected={selectedId === r.sme.id}
                    onSelect={() => setSelectedId(r.sme.id)}
                  />
                ))}
              </ul>
            ) : (
              <div className="mt-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search all SMEs"
                    className="w-full rounded-input border border-line bg-card py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30"
                  />
                </div>
                <ul className="mt-3 max-h-[200px] space-y-2 overflow-y-auto scrollbar-thin pr-1">
                  {filteredManual.map((s) => (
                    <SmeRow
                      key={s.id}
                      sme={s}
                      selected={selectedId === s.id}
                      onSelect={() => setSelectedId(s.id)}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Selected preview */}
          {selected && (
            <div className="mt-6 rounded-card border border-line bg-page p-4">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                Selected SME
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-magenta text-xs font-semibold text-white">
                  {initials(selected.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">
                    {selected.name}
                  </div>
                  <div className="text-xs text-muted">
                    {selected.specialization} · {selected.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-7 w-full"
            disabled={!selected || !topic.trim()}
          >
            Start Interview
          </Button>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-card border border-line bg-card px-4 py-3 shadow-card">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D1FAE5] text-[#065F46]">
            <Check size={14} />
          </span>
          <span className="text-sm text-ink">{toast}</span>
        </div>
      )}
    </AdminShell>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center px-4 py-2.5 text-sm text-ink/70 hover:text-ink",
        active && "font-medium text-magenta"
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-3 bottom-0 h-[2px] bg-magenta" />
      )}
    </button>
  );
}

function SmeRow({
  sme,
  reason,
  selected,
  onSelect,
}: {
  sme: SME;
  reason?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 rounded-card border border-line bg-card p-3 text-left transition-colors hover:bg-page",
          selected && "border-magenta bg-magenta-50"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-magenta text-xs font-semibold text-white">
          {initials(sme.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-ink">{sme.name}</div>
          <div className="text-xs text-muted">{sme.specialization}</div>
          {reason && (
            <div className="mt-1 text-[11px] text-ink/70">{reason}</div>
          )}
        </div>
        {selected && (
          <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-magenta text-white">
            <Check size={12} />
          </span>
        )}
      </button>
    </li>
  );
}

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

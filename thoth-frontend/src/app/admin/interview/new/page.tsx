"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Search, Sparkles } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, SME, listSmes, postAdminInitiateInterview } from "@/lib/api";
import { cn } from "@/lib/utils";

const META_PREFIX = "thoth_interview_topic:";

type Tab = "recommend" | "manual";

export default function StartInterviewPage() {
  const [topic, setTopic] = useState("");
  const [tab, setTab] = useState<Tab>("recommend");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [topicError, setTopicError] = useState("");
  const [toast, setToast] = useState<{
    text: string;
    variant: "success" | "error";
  } | null>(null);
  const [smes, setSmes] = useState<SME[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingSmes, setLoadingSmes] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSmes = useCallback(async () => {
    setLoadingSmes(true);
    setLoadError(null);
    try {
      const res = await listSmes();
      setSmes(res.smes ?? []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setLoadingSmes(false);
    }
  }, []);

  useEffect(() => {
    void loadSmes();
  }, [loadSmes]);

  const recommendations = useMemo(() => {
    return smes.map((s) => ({
      sme: s,
      reason: `Topic looks aligned with ${s.specialization} (${(s.sub_areas?.[0] ?? "expertise").toLowerCase()})`,
    }));
  }, [smes]);

  const filteredManual = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return smes;
    return smes.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.specialization.toLowerCase().includes(q),
    );
  }, [search, smes]);

  const selected = selectedId
    ? smes.find((s) => s.sme_id === selectedId)
    : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) {
      setTopicError("Topic is required");
      return;
    }
    if (!selected) return;
    setTopicError("");
    setSubmitting(true);
    try {
      const res = await postAdminInitiateInterview({
        sme_id: selected.sme_id,
        topic: topic.trim(),
        requested_by_admin: "Admin",
        note: "",
      });
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          `${META_PREFIX}${res.interview_id}`,
          res.topic ?? topic.trim(),
        );
      }
      setToast({
        text: `Interview created · ${selected.name} has been notified`,
        variant: "success",
      });
      setTimeout(() => setToast(null), 3000);
      setTopic("");
      setSelectedId(null);
    } catch (err) {
      setToast({ text: formatError(err), variant: "error" });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell title="Start Interview">
      <div className="flex flex-col items-center px-8 py-10">
        {loadError && (
          <div className="mb-4 flex w-[560px] items-start gap-2 rounded-card border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Could not load SMEs</div>
              <div className="text-xs">{loadError}</div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                type="button"
                onClick={() => void loadSmes()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}
        <form
          onSubmit={(e) => void submit(e)}
          className="w-[560px] rounded-card border border-line bg-card p-7 shadow-card"
        >
          <h2 className="text-[18px] font-semibold text-ink">Start a new SME interview</h2>
          <p className="mt-1 text-sm text-muted">
            Define the topic and select the right SME to interview.
          </p>

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

            {loadingSmes ? (
              <p className="mt-4 text-center text-xs text-muted">Loading SMEs…</p>
            ) : tab === "recommend" ? (
              <ul className="mt-3 space-y-2">
                {recommendations.map((r) => (
                  <SmeRow
                    key={r.sme.sme_id}
                    sme={r.sme}
                    reason={r.reason}
                    selected={selectedId === r.sme.sme_id}
                    onSelect={() => setSelectedId(r.sme.sme_id)}
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
                      key={s.sme_id}
                      sme={s}
                      selected={selectedId === s.sme_id}
                      onSelect={() => setSelectedId(s.sme_id)}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>

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
                  <div className="text-sm font-medium text-ink">{selected.name}</div>
                  <div className="text-xs text-muted">
                    {selected.specialization} · {selected.contact_email}
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
            disabled={!selected || !topic.trim() || submitting || loadingSmes}
          >
            {submitting ? "Starting…" : "Start Interview"}
          </Button>
        </form>
      </div>

      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-card border px-4 py-3 shadow-card",
            toast.variant === "success"
              ? "border-line bg-card"
              : "border-[#FECACA] bg-[#FEF2F2]",
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              toast.variant === "success"
                ? "bg-[#D1FAE5] text-[#065F46]"
                : "bg-[#FEE2E2] text-[#991B1B]",
            )}
          >
            {toast.variant === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
          </span>
          <span
            className={cn(
              "text-sm",
              toast.variant === "error" ? "text-[#991B1B]" : "text-ink",
            )}
          >
            {toast.text}
          </span>
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
        active && "font-medium text-magenta",
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
          selected && "border-magenta bg-magenta-50",
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

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status ? `${err.message} (HTTP ${err.status})` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

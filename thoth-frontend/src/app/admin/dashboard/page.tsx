"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  DashboardKpis,
  KnowledgeEntry,
  getDashboardKpis,
  listKnowledge,
} from "@/lib/api";

export default function AdminDashboardPage() {
  const [showAnswered, setShowAnswered] = useState(false);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [pending, setPending] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [kpiData, pendingRes] = await Promise.all([
        getDashboardKpis(),
        listKnowledge({ status: "sme_approved" }),
      ]);
      setKpis(kpiData);
      setPending(pendingRes.entries);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const escalated = kpis?.escalatedQuestions ?? 0;

  return (
    <AdminShell title="Dashboard">
      <div className="px-8 py-6">
        <div className="mb-6">
          <h2 className="text-[24px] font-bold leading-tight text-ink">
            Welcome back, L. Park
          </h2>
          <p className="mt-1 text-sm text-muted">Admin · MEZ Knowledge Operations</p>
        </div>

        {loadError ? (
          <div className="flex items-start justify-between gap-4 rounded-card border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
            <div className="flex items-start gap-2 text-sm text-[#991B1B]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Couldn&apos;t load dashboard data</div>
                <div className="text-xs">{loadError}</div>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void load()}>
              <RefreshCw size={14} />
              Retry
            </Button>
          </div>
        ) : loading || !kpis ? (
          <div className="grid grid-cols-4 gap-4" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[88px] animate-pulse rounded-card border border-line bg-card shadow-card"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Pending Approvals" value={kpis.pendingApprovals} />
            <KpiCard label="SMEs Onboarded" value={kpis.smesOnboarded} />
            <KpiCard label="Approved Entries" value={kpis.approvedEntries} />
            <KpiCard label="Escalated Questions" value={kpis.escalatedQuestions} />
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-6">
          <section className="col-span-2 rounded-card border border-line bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="text-[15px] font-semibold text-ink">
                Pending admin approvals
              </h3>
              <Link
                href="/admin/approve"
                className="inline-flex items-center gap-1 text-xs font-medium text-magenta hover:underline"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <ul className="divide-y divide-line">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="px-5 py-3">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-page" />
                    <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-page" />
                  </li>
                ))}
              </ul>
            ) : pending.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-muted">
                No entries awaiting admin approval.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {pending.slice(0, 3).map((p) => (
                  <li
                    key={p.entry_id}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="truncate text-sm font-medium text-ink">
                          {p.topic}
                        </h4>
                        <StatusBadge status="sme_approved" />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        <span className="font-medium text-ink/70">{p.sme_id}</span> · SME
                        approved{" "}
                        {new Date(p.updated_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Link href="/admin/approve">
                      <Button variant="secondary" size="sm">
                        Review
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-card border border-line bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-ink">Escalated Questions</h3>
                {escalated > 0 && (
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-magenta px-1 text-[11px] font-semibold leading-none text-white">
                    {escalated}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">unanswered</span>
            </div>
            <ul className="divide-y divide-line">
              <li className="px-5 py-6 text-center text-xs text-muted">
                {escalated > 0
                  ? "Escalation count comes from KPIs. Per-item lists require backend support."
                  : "No unanswered escalated questions."}
              </li>
            </ul>
            <div className="border-t border-line">
              <button
                type="button"
                onClick={() => setShowAnswered((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-2.5 text-left text-xs font-medium text-ink/70 hover:bg-page"
              >
                {showAnswered ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="flex-1 px-2">Answered escalations</span>
              </button>
              {showAnswered && (
                <ul className="divide-y divide-line border-t border-line">
                  <li className="px-5 py-4 text-center text-xs text-muted">
                    No answered escalation list from the API yet.
                  </li>
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status ? `${err.message} (HTTP ${err.status})` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

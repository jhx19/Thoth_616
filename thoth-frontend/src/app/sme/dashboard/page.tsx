"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { SmeShell } from "@/components/layout/sme-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  EntryStatus,
  InterviewSummary,
  KnowledgeEntry,
  SME,
  getSme,
  getSmeUnreadCounts,
  listKnowledge,
  listSmeInterviews,
} from "@/lib/api";

const PENDING_REVIEW = new Set<EntryStatus>(["draft", "in_progress", "rejected"]);

function interviewPending(status: string | undefined): boolean {
  if (!status) return true;
  return status.toLowerCase() !== "completed";
}

export default function SmeDashboardPage() {
  const router = useRouter();
  const [smeId, setSmeId] = useState<string | null>(null);
  const [me, setMe] = useState<SME | null>(null);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [escalatedCount, setEscalatedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const pendingReviews = useMemo(() => {
    if (!smeId) return [];
    return knowledge
      .filter(
        (e) =>
          e.sme_id === smeId && PENDING_REVIEW.has(e.status as EntryStatus),
      )
      .slice(0, 8);
  }, [knowledge, smeId]);

  const kpis = useMemo(() => {
    if (!smeId) {
      return {
        pendingInterviews: 0,
        pendingReviews: 0,
        escalatedQuestions: 0,
        approvedEntries: 0,
      };
    }
    const mine = knowledge.filter((e) => e.sme_id === smeId);
    return {
      pendingInterviews: interviews.filter((iv) =>
        interviewPending(iv.status as string | undefined),
      ).length,
      pendingReviews: mine.filter((e) =>
        PENDING_REVIEW.has(e.status as EntryStatus),
      ).length,
      escalatedQuestions: escalatedCount,
      approvedEntries: mine.filter((e) => e.status === "approved").length,
    };
  }, [smeId, knowledge, interviews, escalatedCount]);

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const [sme, ivList, kn, unread] = await Promise.all([
        getSme(id),
        listSmeInterviews(id),
        listKnowledge(),
        getSmeUnreadCounts().catch(() => ({ escalated: 0 })),
      ]);
      setMe(sme);
      setInterviews(ivList.interviews ?? []);
      setKnowledge(kn.entries ?? []);
      setEscalatedCount(
        typeof unread.escalated === "number" ? unread.escalated : 0,
      );
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
    void loadData(stored);
  }, [loadData, router]);

  return (
    <SmeShell>
      <div className="px-8 py-6">
        <div className="mb-6">
          {loading || !me ? (
            <>
              <div className="h-7 w-72 animate-pulse rounded bg-card" />
              <div className="mt-2 h-4 w-48 animate-pulse rounded bg-card" />
            </>
          ) : (
            <>
              <h2 className="text-[24px] font-bold leading-tight text-ink">
                Welcome back, {me.name}
              </h2>
              <p className="mt-1 text-sm text-muted">{me.specialization}</p>
            </>
          )}
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
            <Button variant="secondary" size="sm" onClick={() => smeId && void loadData(smeId)}>
              <RefreshCw size={14} />
              Retry
            </Button>
          </div>
        ) : loading ? (
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
            <KpiCard label="Pending Interviews" value={kpis.pendingInterviews} />
            <KpiCard label="Pending Reviews" value={kpis.pendingReviews} />
            <KpiCard label="Escalated Questions" value={kpis.escalatedQuestions} />
            <KpiCard label="Approved Entries" value={kpis.approvedEntries} />
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-6">
          <section className="col-span-2 rounded-card border border-line bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="text-[15px] font-semibold text-ink">Interview list</h3>
              <Link
                href="/sme/interview"
                className="inline-flex items-center gap-1 text-xs font-medium text-magenta hover:underline"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-page text-left text-[11px] uppercase tracking-wide text-muted">
                    <th className="px-5 py-2.5 font-medium">Topic</th>
                    <th className="px-5 py-2.5 font-medium">Requested by</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-xs text-muted">
                        Loading…
                      </td>
                    </tr>
                  ) : interviews.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-xs text-muted">
                        No interviews yet.
                      </td>
                    </tr>
                  ) : (
                    interviews.map((iv) => {
                      const id = (iv.interview_id ?? iv.id ?? "") as string;
                      const topic = (iv.topic ?? "Untitled") as string;
                      const q = encodeURIComponent(topic);
                      return (
                        <tr
                          key={id}
                          onClick={() =>
                            id && router.push(`/sme/interview/${id}?topic=${q}`)
                          }
                          className="cursor-pointer border-b border-line last:border-0 hover:bg-page"
                        >
                          <td className="px-5 py-3 font-medium text-ink">{topic}</td>
                          <td className="px-5 py-3 text-ink/80">
                            {iv.requested_by ?? "—"}
                          </td>
                          <td className="px-5 py-3">
                            {iv.status ? (
                              <StatusBadge status={iv.status as never} />
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-xs text-muted">
                            {iv.created_at
                              ? new Date(iv.created_at).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-card border border-line bg-card shadow-card">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <h3 className="text-[15px] font-semibold text-ink">Pending Reviews</h3>
                <Link
                  href="/sme/knowledge"
                  className="text-xs font-medium text-magenta hover:underline"
                >
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-line">
                {pendingReviews.length === 0 ? (
                  <li className="px-5 py-6 text-center text-xs text-muted">
                    No pending knowledge reviews.
                  </li>
                ) : (
                  pendingReviews.map((r) => (
                    <li
                      key={r.entry_id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-ink">{r.topic}</div>
                        <div className="mt-1">
                          <StatusBadge status={r.status as EntryStatus} />
                        </div>
                      </div>
                      <Link href={`/sme/knowledge?id=${r.entry_id}`}>
                        <Button variant="secondary" size="sm">
                          Review
                        </Button>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="rounded-card border border-line bg-card shadow-card">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <h3 className="text-[15px] font-semibold text-ink">
                  Escalated Questions
                </h3>
                <span className="text-xs text-muted">from API</span>
              </div>
              <ul className="divide-y divide-line">
                <li className="px-5 py-6 text-center text-xs text-muted">
                  {escalatedCount > 0
                    ? `${escalatedCount} in queue — list views require an escalations feed from the backend.`
                    : "No escalated questions in queue."}
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </SmeShell>
  );
}

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status ? `${err.message} (HTTP ${err.status})` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

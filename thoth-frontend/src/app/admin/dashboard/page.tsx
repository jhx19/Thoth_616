"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  adminKpis,
  adminEscalatedAnswered,
  adminEscalatedUnanswered,
  pendingAdminApprovals,
} from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const [showAnswered, setShowAnswered] = useState(false);

  return (
    <AdminShell title="Dashboard">
      <div className="px-8 py-6">
        <div className="mb-6">
          <h2 className="text-[24px] font-bold leading-tight text-ink">
            Welcome back, L. Park
          </h2>
          <p className="mt-1 text-sm text-muted">
            Admin · MEZ Knowledge Operations
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Pending Approvals" value={adminKpis.pendingApprovals} />
          <KpiCard label="SMEs Onboarded" value={adminKpis.smesOnboarded} />
          <KpiCard label="Approved Entries" value={adminKpis.approvedEntries} />
          <KpiCard label="Escalated Questions" value={adminKpis.escalatedQuestions} />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          {/* Pending admin approvals */}
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
            <ul className="divide-y divide-line">
              {pendingAdminApprovals.slice(0, 3).map((p) => (
                <li
                  key={p.id}
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
                      <span className="font-medium text-ink/70">{p.smeName}</span>{" "}
                      · SME approved {p.smeApprovedOn}
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
          </section>

          {/* Escalated questions */}
          <section className="rounded-card border border-line bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-ink">
                  Escalated Questions
                </h3>
                {adminEscalatedUnanswered.length > 0 && (
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-magenta px-1 text-[11px] font-semibold leading-none text-white">
                    {adminEscalatedUnanswered.length}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">unanswered</span>
            </div>

            <ul className="divide-y divide-line">
              {adminEscalatedUnanswered.map((q) => (
                <li key={q.id} className="px-5 py-3">
                  <p className="line-clamp-2 text-sm text-ink">{q.question}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted">
                      Routed from {q.routedFrom} · {q.ts}
                    </span>
                    <Button variant="secondary" size="sm">
                      Answer
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Answered (collapsed) */}
            <div className="border-t border-line">
              <button
                onClick={() => setShowAnswered((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-2.5 text-left text-xs font-medium text-ink/70 hover:bg-page"
              >
                {showAnswered ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                <span className="flex-1 px-2">
                  Show {adminEscalatedAnswered.length} answered
                </span>
              </button>
              {showAnswered && (
                <ul className="divide-y divide-line border-t border-line">
                  {adminEscalatedAnswered.map((q) => (
                    <li key={q.id} className="px-5 py-2.5">
                      <p className="line-clamp-1 text-xs text-ink/80">
                        {q.question}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        Answered by {q.answeredBy} · {q.ts}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

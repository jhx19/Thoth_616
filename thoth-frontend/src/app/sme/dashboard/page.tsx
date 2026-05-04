"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SmeShell } from "@/components/layout/sme-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  smeKpis,
  smeInterviews,
  smePendingReviews,
  smeEscalated,
  smes,
} from "@/lib/mock-data";

export default function SmeDashboardPage() {
  const me = smes[0]; // Dr. Elara Voss
  const router = useRouter();

  return (
    <SmeShell>
      <div className="px-8 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-[24px] font-bold leading-tight text-ink">
            Welcome back, {me.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{me.specialization}</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Pending Interviews" value={smeKpis.pendingInterviews} />
          <KpiCard label="Pending Reviews" value={smeKpis.pendingReviews} />
          <KpiCard label="Escalated Questions" value={smeKpis.escalatedQuestions} />
          <KpiCard label="Approved Entries" value={smeKpis.approvedEntries} />
        </div>

        {/* Two-column layout */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          {/* Interview list */}
          <section className="col-span-2 rounded-card border border-line bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="text-[15px] font-semibold text-ink">
                Interview list
              </h3>
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
                  {smeInterviews.map((iv) => (
                    <tr
                      key={iv.id}
                      onClick={() => router.push(`/sme/interview/${iv.id}`)}
                      className="cursor-pointer border-b border-line last:border-0 hover:bg-page"
                    >
                      <td className="px-5 py-3 font-medium text-ink">
                        {iv.topic}
                      </td>
                      <td className="px-5 py-3 text-ink/80">
                        {iv.requestedBy}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={iv.status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">{iv.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right column */}
          <div className="space-y-6">
            {/* Pending reviews */}
            <section className="rounded-card border border-line bg-card shadow-card">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <h3 className="text-[15px] font-semibold text-ink">
                  Pending Reviews
                </h3>
                <Link
                  href="/sme/knowledge"
                  className="text-xs font-medium text-magenta hover:underline"
                >
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-line">
                {smePendingReviews.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm text-ink">
                        {r.topic}
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                    <Link href={`/sme/knowledge?id=${r.id}`}>
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
                  {smeEscalated.length > 0 && (
                    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-magenta px-1 text-[11px] font-semibold leading-none text-white">
                      {smeEscalated.length}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">unanswered</span>
              </div>
              <ul className="divide-y divide-line">
                {smeEscalated.map((q) => (
                  <li key={q.id} className="px-5 py-3">
                    <p className="line-clamp-2 text-sm text-ink">
                      {q.question}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-muted">{q.ts}</span>
                      <Link href={`/sme/escalated/${q.id}`}>
                        <Button variant="secondary" size="sm">
                          Answer
                        </Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </SmeShell>
  );
}

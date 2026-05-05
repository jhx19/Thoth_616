'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { KPICard } from '@/components/shared/KPICard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { getSMEs, getKnowledge } from '@/lib/api'
import { formatRelative, initials } from '@/lib/utils'
import type { SME, KnowledgeEntry } from '@/lib/types'
import { ChevronRight, CheckSquare, AlertTriangle } from 'lucide-react'

export default function AdminDashboardPage() {
  const [smes, setSmes] = useState<SME[]>([])
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSMEs(), getKnowledge()]).then(([s, e]) => {
      setSmes(s); setEntries(e); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const pendingApproval = entries.filter(e => e.status === 'sme_approved')
  const approved = entries.filter(e => e.status === 'approved')

  const getSMEName = (id: string) => smes.find(s => s.sme_id === id)?.name || 'Unknown'

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-6 gap-4">
          <h1 className="text-sm font-semibold text-[#1A1A1A] flex-1">Dashboard</h1>
          <div className="w-8 h-8 rounded-full bg-[#E20074] flex items-center justify-center text-white text-xs font-semibold">A</div>
        </header>

        <main className="flex-1 px-6 py-6 max-w-5xl">
          {/* KPI */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <KPICard label="Pending Approvals" value={pendingApproval.length} loading={loading} />
            <KPICard label="SMEs Onboarded" value={smes.length} loading={loading} />
            <KPICard label="Approved Entries" value={approved.length} loading={loading} />
            <KPICard label="Escalated Questions" value={0} loading={loading} />
          </div>

          {/* Pending Approvals */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#1A1A1A]">Pending Admin Approvals</h2>
                {pendingApproval.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E20074] text-white text-xs font-semibold">
                    {pendingApproval.length}
                  </span>
                )}
              </div>
              <Link href="/admin/approve" className="text-xs text-[#E20074] hover:underline">View All</Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded skeleton" />)}</div>
            ) : pendingApproval.length === 0 ? (
              <div className="py-10 text-center">
                <CheckSquare size={24} className="mx-auto text-[#D1D5DB] mb-2" />
                <p className="text-sm text-[#6B7280]">No pending approvals</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {pendingApproval.slice(0, 3).map(e => (
                  <div key={e.entry_id} className="px-5 py-3.5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{e.topic}</p>
                      <p className="text-xs text-[#6B7280]">{getSMEName(e.sme_id)} · {formatRelative(e.updated_at)}</p>
                    </div>
                    <StatusBadge status={e.status} />
                    <Link href="/admin/approve"
                      className="px-3 py-1.5 rounded-lg bg-[#E20074] text-white text-xs font-medium hover:bg-[#C5006A] transition-colors shrink-0">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SMEs snapshot */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">SME Directory</h2>
              <Link href="/admin/smes" className="text-xs text-[#E20074] hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">{[1,2].map(i => <div key={i} className="h-12 rounded skeleton" />)}</div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {smes.slice(0, 4).map(s => (
                  <div key={s.sme_id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E20074] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {initials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A]">{s.name}</p>
                      <p className="text-xs text-[#6B7280]">{s.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSMEs, getKnowledge, getInterviews } from '@/lib/api'
import { SMENav } from '@/components/sme/SMENav'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { KPICard } from '@/components/shared/KPICard'
import { formatRelative, formatDate } from '@/lib/utils'
import type { SME, Interview, KnowledgeEntry } from '@/lib/types'
import { ClipboardList, FileCheck, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react'

export default function SMEDashboardPage() {
  const [sme, setSme] = useState<SME | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [smeName, setSmeName] = useState('')

  useEffect(() => {
    const name = sessionStorage.getItem('sme_name') || 'SME User'
    const smeId = sessionStorage.getItem('sme_id') || ''
    setSmeName(name)

    const load = async () => {
      try {
        const [allSmes, allEntries] = await Promise.all([getSMEs(), getKnowledge()])
        const mySme = smeId ? allSmes.find(s => s.sme_id === smeId) || allSmes[0] : allSmes[0]
        setSme(mySme || null)
        setEntries(allEntries)
        if (mySme) {
          const ints = await getInterviews(mySme.sme_id)
          setInterviews(ints)
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const myEntries = entries.filter(e => sme && e.sme_id === sme.sme_id)
  const pending = myEntries.filter(e => e.status === 'draft' || e.status === 'rejected')
  const approved = myEntries.filter(e => e.status === 'approved')

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <SMENav name={smeName} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Welcome back, {smeName}</h1>
          {sme && <p className="text-sm text-[#6B7280] mt-1">{sme.specialization}</p>}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <KPICard label="Pending Interviews" value={interviews.filter(i => i.status === 'in_progress').length} loading={loading} />
          <KPICard label="Pending Reviews" value={pending.length} loading={loading} />
          <KPICard label="Escalated Questions" value={0} loading={loading} />
          <KPICard label="Approved Entries" value={approved.length} loading={loading} />
        </div>

        {/* Interview List */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl mb-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1A1A1A]">Interviews</h2>
            <span className="text-xs text-[#6B7280]">{interviews.length} total</span>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2].map(i => <div key={i} className="h-10 rounded skeleton" />)}
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList size={28} className="mx-auto text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#6B7280]">No interviews yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Topic', 'Requested By', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {interviews.map(iv => (
                  <tr key={iv.interview_id}
                    className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/sme/interview/${iv.interview_id}`}>
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1A1A1A]">{iv.topic}</td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280]">Admin</td>
                    <td className="px-5 py-3.5"><StatusBadge status={iv.status} /></td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280]">{formatRelative(iv.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pending Reviews */}
        {pending.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-base font-semibold text-[#1A1A1A]">Pending Reviews</h2>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {pending.map(e => (
                <div key={e.entry_id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={e.status} />
                    <span className="text-sm font-medium text-[#1A1A1A]">{e.topic}</span>
                  </div>
                  <Link href="/sme/knowledge"
                    className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#1A1A1A] hover:bg-[#F9FAFB] transition-colors flex items-center gap-1">
                    Review <ChevronRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

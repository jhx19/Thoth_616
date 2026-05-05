'use client'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { getSMEs, getKnowledge } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { SME, KnowledgeEntry } from '@/lib/types'
import { X, FileText, ChevronRight } from 'lucide-react'

const STATUSES = ['sme_approved', 'approved', 'rejected']

export default function AdminKnowledgePage() {
  const [smes, setSmes] = useState<SME[]>([])
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSmes, setSelectedSmes] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [topicSearch, setTopicSearch] = useState('')
  const [detail, setDetail] = useState<KnowledgeEntry | null>(null)

  useEffect(() => {
    Promise.all([getSMEs(), getKnowledge()]).then(([s, e]) => {
      setSmes(s); setEntries(e); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getSMEName = (id: string) => smes.find(s => s.sme_id === id)?.name || id

  const filtered = entries.filter(e => {
    if (selectedSmes.length && !selectedSmes.includes(e.sme_id)) return false
    if (selectedStatuses.length && !selectedStatuses.includes(e.status)) return false
    if (topicSearch && !e.topic.toLowerCase().includes(topicSearch.toLowerCase())) return false
    return true
  })

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const clearAll = () => { setSelectedSmes([]); setSelectedStatuses([]); setTopicSearch('') }
  const hasFilters = selectedSmes.length || selectedStatuses.length || topicSearch

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <AdminSidebar />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {/* Filter sidebar */}
        <aside className="w-[220px] bg-white border-r border-[#E5E7EB] py-5 px-4 shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">Filters</h2>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-[#E20074] hover:underline">Clear all</button>
            )}
          </div>

          {/* Filter by SME */}
          <div className="mb-5">
            <p className="text-xs font-medium text-[#6B7280] mb-2">By SME</p>
            <div className="space-y-1.5">
              {smes.map(s => (
                <label key={s.sme_id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSmes.includes(s.sme_id)}
                    onChange={() => toggle(selectedSmes, s.sme_id, setSelectedSmes)}
                    className="w-3.5 h-3.5 accent-[#E20074]"
                  />
                  <span className="text-xs text-[#1A1A1A] truncate">{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter by Status */}
          <div className="mb-5">
            <p className="text-xs font-medium text-[#6B7280] mb-2">By Status</p>
            <div className="space-y-1.5">
              {STATUSES.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(s)}
                    onChange={() => toggle(selectedStatuses, s, setSelectedStatuses)}
                    className="w-3.5 h-3.5 accent-[#E20074]"
                  />
                  <StatusBadge status={s} />
                </label>
              ))}
            </div>
          </div>

          {/* Filter by Topic */}
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-2">By Topic</p>
            <input
              value={topicSearch}
              onChange={e => setTopicSearch(e.target.value)}
              placeholder="Search topics…"
              className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg text-xs outline-none focus:border-[#E20074]"
            />
          </div>
        </aside>

        {/* Main list */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-6 gap-4 shrink-0">
            <h1 className="text-sm font-semibold text-[#1A1A1A] flex-1">Knowledge Base</h1>
            <span className="text-xs text-[#6B7280]">{filtered.length} entries</span>
            <div className="w-8 h-8 rounded-full bg-[#E20074] flex items-center justify-center text-white text-xs font-semibold">A</div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-12 rounded skeleton" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText size={28} className="mx-auto text-[#D1D5DB] mb-2" />
                <p className="text-sm text-[#6B7280]">No entries match your filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white border-b border-[#E5E7EB] sticky top-0">
                  <tr>
                    {['Topic', 'SME', 'Status', 'Created', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.entry_id}
                      onClick={() => setDetail(e)}
                      className="border-b border-[#E5E7EB] hover:bg-white cursor-pointer transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-[#1A1A1A]">{e.topic}</td>
                      <td className="px-5 py-3.5 text-sm text-[#6B7280]">{getSMEName(e.sme_id)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                      <td className="px-5 py-3.5 text-sm text-[#6B7280]">{formatDate(e.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <ChevronRight size={14} className="text-[#D1D5DB]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail slide-in */}
        {detail && (
          <div className="w-[400px] bg-white border-l border-[#E5E7EB] flex flex-col shrink-0 overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={detail.status} />
                </div>
                <h2 className="text-sm font-semibold text-[#1A1A1A]">{detail.topic}</h2>
                <p className="text-xs text-[#6B7280]">{getSMEName(detail.sme_id)}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
              {detail.content}
            </div>

            <div className="px-5 py-4 border-t border-[#E5E7EB] space-y-2">
              <p className="text-xs font-medium text-[#6B7280]">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {detail.sources.interviews.map(id => (
                  <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280]">
                    <FileText size={10} />Interview #{id.slice(-4)}
                  </span>
                ))}
                {detail.sources.materials.map(id => (
                  <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280]">
                    <FileText size={10} />Material #{id.slice(-4)}
                  </span>
                ))}
              </div>
              <div className="text-xs text-[#6B7280] pt-1">
                <p>Created: {formatDate(detail.created_at)}</p>
                <p>Updated: {formatDate(detail.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

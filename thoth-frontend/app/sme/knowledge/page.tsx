'use client'
import { useEffect, useState } from 'react'
import { getKnowledge, updateKnowledge, approveKnowledge } from '@/lib/api'
import { SMENav } from '@/components/sme/SMENav'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/shared/Toast'
import { formatDate } from '@/lib/utils'
import type { KnowledgeEntry } from '@/lib/types'
import { FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function SMEKnowledgePage() {
  const { show } = useToast()
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [selected, setSelected] = useState<KnowledgeEntry | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const smeName = typeof window !== 'undefined' ? sessionStorage.getItem('sme_name') || '' : ''

  const smeId = typeof window !== 'undefined' ? sessionStorage.getItem('sme_id') || '' : ''

  useEffect(() => {
    getKnowledge().then(all => {
      const mine = smeId ? all.filter(e => e.sme_id === smeId) : all
      setEntries(mine)
      const first = mine.find(e => ['draft', 'rejected', 'sme_approved'].includes(e.status))
      if (first) { setSelected(first); setContent(first.content) }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [smeId])

  const select = (e: KnowledgeEntry) => { setSelected(e); setContent(e.content) }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const updated = await updateKnowledge(selected.entry_id, content)
      setEntries(prev => prev.map(e => e.entry_id === updated.entry_id ? updated : e))
      setSelected(updated)
      show('Changes saved')
    } catch (e: any) { show(e.message || 'Save failed', 'error') }
    setSaving(false)
  }

  const approve = async () => {
    if (!selected || selected.status !== 'draft') return
    setApproving(true)
    try {
      await approveKnowledge(selected.entry_id)
      const updated = { ...selected, status: 'sme_approved' as const }
      setEntries(prev => prev.map(e => e.entry_id === selected.entry_id ? updated : e))
      setSelected(updated)
      show('Entry approved — pending admin review')
    } catch (e: any) { show(e.message || 'Approval failed', 'error') }
    setApproving(false)
  }

  const pending = entries.filter(e => ['draft', 'rejected'].includes(e.status))
  const existing = entries.filter(e => ['approved', 'sme_approved'].includes(e.status))

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <SMENav name={smeName} />

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left panel */}
        <aside className="w-[340px] bg-white border-r border-[#E5E7EB] flex flex-col overflow-y-auto shrink-0">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Pending Reviews</h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2].map(i => <div key={i} className="h-20 rounded-lg skeleton" />)}
            </div>
          ) : pending.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
              <CheckCircle size={28} className="text-[#D1FAE5] mb-2" />
              <p className="text-sm text-[#6B7280]">No pending reviews</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {pending.map(e => (
                <button
                  key={e.entry_id}
                  onClick={() => select(e)}
                  className="w-full text-left px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors"
                  style={selected?.entry_id === e.entry_id ? { borderLeft: '2px solid #E20074', paddingLeft: '14px' } : {}}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-[#1A1A1A] line-clamp-1">{e.topic}</p>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="text-xs text-[#6B7280]">Updated {formatDate(e.updated_at)}</p>
                  <p className="text-xs text-[#6B7280]">
                    {(e.sources.interviews.length + e.sources.materials.length)} sources
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Existing entries */}
          {existing.length > 0 && (
            <>
              <div className="px-4 py-3 border-t border-[#E5E7EB]">
                <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Existing Entries</h2>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {existing.map(e => (
                  <div key={e.entry_id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-[#1A1A1A] line-clamp-1">{e.topic}</p>
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Right panel */}
        {selected ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-base font-semibold text-[#1A1A1A]">{selected.topic}</h1>
                <StatusBadge status={selected.status} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selected.sources.interviews.map(id => (
                  <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280]">
                    <FileText size={10} />Interview #{id.slice(-4)}
                  </span>
                ))}
                {selected.sources.materials.map(id => (
                  <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280]">
                    <FileText size={10} />Material #{id.slice(-4)}
                  </span>
                ))}
              </div>

              {selected.status === 'rejected' && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">Rejected by Admin: {(selected as any).rejection_reason || 'No reason provided'}</p>
                </div>
              )}
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden px-6 py-4">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                disabled={selected.status === 'sme_approved' || selected.status === 'approved'}
                className="w-full h-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-sm font-mono leading-relaxed outline-none focus:border-[#E20074] transition-colors resize-none disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                placeholder="Knowledge content..."
              />
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-[#E5E7EB] px-6 py-3 flex items-center justify-between">
              <button
                onClick={save}
                disabled={saving || selected.status === 'sme_approved'}
                className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#1A1A1A] hover:bg-[#F9FAFB] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {selected.status === 'draft' && (
                <button
                  onClick={approve}
                  disabled={approving}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {approving ? 'Approving…' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText size={32} className="mx-auto text-[#D1D5DB] mb-3" />
              <p className="text-sm text-[#6B7280]">Select an entry to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

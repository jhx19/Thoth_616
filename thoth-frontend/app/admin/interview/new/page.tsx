'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, CheckCircle2 } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { getSMEs, createInterview } from '@/lib/api'
import { useToast } from '@/components/shared/Toast'
import { initials } from '@/lib/utils'
import type { SME } from '@/lib/types'

export default function AdminNewInterviewPage() {
  const { show } = useToast()
  const [smes, setSmes] = useState<SME[]>([])
  const [topic, setTopic] = useState('')
  const [tab, setTab] = useState<'recommend' | 'select'>('recommend')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SME | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => { getSMEs().then(setSmes) }, [])

  const filtered = smes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.specialization.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async () => {
    const errs: Record<string, string> = {}
    if (!topic.trim()) errs.topic = 'Topic is required'
    if (!selected) errs.sme = 'Please select an SME'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await createInterview(selected!.sme_id, topic)
      setSubmitted(true)
      show(`Interview created · ${selected!.name} has been notified`)
    } catch (e: any) {
      show(e.message || 'Failed to create interview', 'error')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-[#F9FAFB]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500 mb-4" />
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">Interview Created</h2>
          <p className="text-sm text-[#6B7280] mb-6">{selected?.name} has been notified</p>
          <div className="flex gap-3">
            <Link href="/admin/dashboard"
              className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#1A1A1A] hover:bg-[#F9FAFB]">
              Back to Dashboard
            </Link>
            <button onClick={() => { setSubmitted(false); setTopic(''); setSelected(null) }}
              className="px-4 py-2 rounded-lg bg-[#E20074] text-white text-sm font-medium hover:bg-[#C5006A]">
              Start Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-6 gap-4">
          <Link href="/admin/dashboard" className="text-[#6B7280] hover:text-[#1A1A1A]"><ArrowLeft size={16} /></Link>
          <h1 className="text-sm font-semibold text-[#1A1A1A] flex-1">Start Interview</h1>
          <div className="w-8 h-8 rounded-full bg-[#E20074] flex items-center justify-center text-white text-xs font-semibold">A</div>
        </header>

        <main className="flex-1 flex items-start justify-center px-6 py-8">
          <div className="w-full max-w-[560px] bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5">
            {/* Topic */}
            <div>
              <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                Topic<span className="text-[#E20074] ml-0.5">*</span>
              </label>
              <textarea
                value={topic}
                onChange={e => { setTopic(e.target.value); setErrors(p => ({ ...p, topic: '' })) }}
                placeholder="Describe the knowledge area to capture in this interview..."
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-colors ${errors.topic ? 'border-red-400' : 'border-[#E5E7EB] focus:border-[#E20074]'}`}
              />
              {errors.topic && <p className="mt-1 text-xs text-red-500">{errors.topic}</p>}
            </div>

            {/* SME Selection */}
            <div>
              <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                Select SME<span className="text-[#E20074] ml-0.5">*</span>
              </label>

              {/* Tabs */}
              <div className="flex border-b border-[#E5E7EB] mb-3">
                {(['recommend', 'select'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-4 py-2 text-xs font-medium capitalize relative"
                    style={{ color: tab === t ? '#E20074' : 'rgba(26,26,26,0.6)' }}>
                    {t === 'recommend' ? 'Recommend' : 'Select Manually'}
                    {tab === t && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E20074] rounded-t" />}
                  </button>
                ))}
              </div>

              {tab === 'select' && (
                <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-1.5 mb-2">
                  <Search size={13} className="text-[#6B7280] shrink-0" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or specialization..."
                    className="bg-transparent text-xs outline-none flex-1 placeholder:text-[#9CA3AF]" />
                </div>
              )}

              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {(tab === 'recommend' ? smes : filtered).map(s => (
                  <button key={s.sme_id} onClick={() => { setSelected(s); setErrors(p => ({ ...p, sme: '' })) }}
                    className="w-full text-left px-3 py-2.5 rounded-lg border transition-colors"
                    style={selected?.sme_id === s.sme_id
                      ? { borderColor: '#E20074', background: '#FFF0F8' }
                      : { borderColor: '#E5E7EB', background: 'white' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#E20074] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {initials(s.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#1A1A1A]">{s.name}</p>
                        <p className="text-[11px] text-[#6B7280] truncate">{s.specialization}</p>
                      </div>
                      {tab === 'recommend' && (
                        <span className="ml-auto text-[11px] text-[#6B7280] shrink-0">Best match</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.sme && <p className="mt-1 text-xs text-red-500">{errors.sme}</p>}
            </div>

            {/* Selected preview */}
            {selected && (
              <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                <div className="w-9 h-9 rounded-full bg-[#E20074] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {initials(selected.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{selected.name}</p>
                  <p className="text-xs text-[#6B7280]">{selected.specialization} · {selected.contact_email}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#E20074] text-white text-sm font-medium hover:bg-[#C5006A] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Creating…' : 'Start Interview'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

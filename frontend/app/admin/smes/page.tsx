'use client'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { getSMEs, getKnowledge, getInterviews } from '@/lib/api'
import { initials } from '@/lib/utils'
import type { SME } from '@/lib/types'
import { Search, Mail } from 'lucide-react'

export default function AdminSMEsPage() {
  const [smes, setSmes] = useState<SME[]>([])
  const [filtered, setFiltered] = useState<SME[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSMEs().then(s => { setSmes(s); setFiltered(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(smes.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.specialization.toLowerCase().includes(q) ||
      s.sub_areas.some(a => a.toLowerCase().includes(q))
    ))
  }, [search, smes])

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-6 gap-4">
          <h1 className="text-sm font-semibold text-[#1A1A1A] flex-1">SME Directory</h1>
          <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-1.5 w-56">
            <Search size={13} className="text-[#6B7280] shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search SMEs..."
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-[#9CA3AF]"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#E20074] flex items-center justify-center text-white text-xs font-semibold">A</div>
        </header>

        <main className="flex-1 px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-40 rounded-xl skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-[#6B7280]">No SMEs found{search ? ` for "${search}"` : ''}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              {filtered.map(sme => (
                <div key={sme.sme_id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-[#E20074] transition-colors group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-[#E20074] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {initials(sme.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1A1A1A] text-sm">{sme.name}</p>
                      <p className="text-xs text-[#6B7280]">{sme.specialization}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {sme.sub_areas.map(a => (
                      <span key={a} className="px-2 py-0.5 rounded-full border border-[#E5E7EB] text-xs text-[#6B7280]">{a}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-4">
                    <Mail size={11} />
                    <span className="truncate">{sme.contact_email}</span>
                  </div>

                  <button className="w-full py-2 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#1A1A1A] hover:bg-[#F9FAFB] group-hover:border-[#E20074] group-hover:text-[#E20074] transition-colors">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

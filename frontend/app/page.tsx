import Link from 'next/link'
import { MessageSquare, Shield, User } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#E20074] flex items-center justify-center">
            <span className="text-white text-lg font-bold">T</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Project Thoth</h1>
        </div>
        <p className="text-[#6B7280] text-base">AI-powered expert knowledge management</p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl px-4">
        <Link href="/chat" className="group bg-white border border-[#E5E7EB] rounded-xl p-6 text-center hover:border-[#E20074] hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-lg bg-[#FFF0F8] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#E20074] transition-colors">
            <MessageSquare size={22} className="text-[#E20074] group-hover:text-white transition-colors" />
          </div>
          <h2 className="font-semibold text-[#1A1A1A] mb-1">User</h2>
          <p className="text-xs text-[#6B7280]">Ask questions from the knowledge base</p>
        </Link>

        <Link href="/sme/login" className="group bg-white border border-[#E5E7EB] rounded-xl p-6 text-center hover:border-[#E20074] hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-lg bg-[#FFF0F8] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#E20074] transition-colors">
            <User size={22} className="text-[#E20074] group-hover:text-white transition-colors" />
          </div>
          <h2 className="font-semibold text-[#1A1A1A] mb-1">SME</h2>
          <p className="text-xs text-[#6B7280]">Share expertise through interviews</p>
        </Link>

        <Link href="/admin/dashboard" className="group bg-white border border-[#E5E7EB] rounded-xl p-6 text-center hover:border-[#E20074] hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-lg bg-[#FFF0F8] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#E20074] transition-colors">
            <Shield size={22} className="text-[#E20074] group-hover:text-white transition-colors" />
          </div>
          <h2 className="font-semibold text-[#1A1A1A] mb-1">Admin</h2>
          <p className="text-xs text-[#6B7280]">Manage SMEs and approve knowledge</p>
        </Link>
      </div>

      <p className="mt-12 text-xs text-[#6B7280]">
        This system surfaces approved expert knowledge and does not constitute professional advice.
      </p>
    </div>
  )
}

'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AlertTriangle } from 'lucide-react'

export default function AdminEscalatedPage() {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-6">
          <h1 className="text-sm font-semibold text-[#1A1A1A] flex-1">Escalated Questions</h1>
          <div className="w-8 h-8 rounded-full bg-[#E20074] flex items-center justify-center text-white text-xs font-semibold">A</div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center">
          <AlertTriangle size={32} className="text-[#D1D5DB] mb-3" />
          <p className="text-sm text-[#6B7280]">No escalated questions</p>
        </div>
      </div>
    </div>
  )
}

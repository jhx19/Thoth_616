'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CheckSquare, Database, MessageSquarePlus, AlertTriangle } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/smes', label: 'Manage SMEs', icon: Users },
  { href: '/admin/approve', label: 'Approve Knowledge', icon: CheckSquare },
  { href: '/admin/knowledge', label: 'Knowledge Base', icon: Database },
  { href: '/admin/interview/new', label: 'Start Interview', icon: MessageSquarePlus },
  { href: '/admin/escalated', label: 'Escalated Questions', icon: AlertTriangle, badge: true },
]

export function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="w-[240px] min-h-screen bg-white border-r border-[#E5E7EB] flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#E20074] flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="font-semibold text-[#1A1A1A] text-sm">Thoth <span className="text-[#6B7280] font-normal">Admin</span></span>
        </Link>
      </div>

      <nav className="flex-1 py-3 px-2">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 text-sm transition-all group"
              style={active ? {
                borderLeft: '2px solid #E20074',
                background: '#FFF0F8',
                color: '#E20074',
                fontWeight: 500,
                paddingLeft: '10px',
              } : {
                borderLeft: '2px solid transparent',
                color: '#1A1A1A',
                paddingLeft: '10px',
              }}
            >
              <Icon size={15} className={active ? 'text-[#E20074]' : 'text-[#6B7280] group-hover:text-[#1A1A1A]'} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">!</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E20074] flex items-center justify-center text-white text-xs font-semibold">A</div>
          <div>
            <p className="text-xs font-medium text-[#1A1A1A]">Admin</p>
            <p className="text-[11px] text-[#6B7280]">admin@thoth.ai</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

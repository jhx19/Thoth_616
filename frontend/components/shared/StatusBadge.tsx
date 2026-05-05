'use client'
import { STATUS_STYLES } from '@/lib/utils'

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || { bg: '#F3F4F6', text: '#6B7280', label: status }
  return (
    <span
      style={{ background: s.bg, color: s.text }}
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
    >
      {s.label}
    </span>
  )
}

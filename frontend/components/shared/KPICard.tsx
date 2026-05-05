'use client'

interface KPICardProps {
  label: string
  value: number | string
  loading?: boolean
}

export function KPICard({ label, value, loading }: KPICardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 border-l-2 border-l-[#E20074] flex flex-col gap-1 min-w-0">
      <span className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">{label}</span>
      {loading ? (
        <div className="h-7 w-16 rounded animate-pulse bg-gray-100" />
      ) : (
        <span className="text-3xl font-bold text-[#1A1A1A]">{value}</span>
      )}
    </div>
  )
}

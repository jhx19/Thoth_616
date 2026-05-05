import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft:        { bg: '#F3F4F6', text: '#6B7280', label: 'Draft' },
  in_progress:  { bg: '#FEF3C7', text: '#92400E', label: 'In Progress' },
  sme_approved: { bg: '#DBEAFE', text: '#1E40AF', label: 'SME Approved' },
  approved:     { bg: '#D1FAE5', text: '#065F46', label: 'Approved' },
  rejected:     { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected' },
  completed:    { bg: '#D1FAE5', text: '#065F46', label: 'Completed' },
  pending_sme:  { bg: '#FEF3C7', text: '#92400E', label: 'Pending SME' },
  processing:   { bg: '#FEF3C7', text: '#92400E', label: 'Processing' },
  processed:    { bg: '#D1FAE5', text: '#065F46', label: 'Processed' },
  failed:       { bg: '#FEE2E2', text: '#991B1B', label: 'Failed' },
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelative(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return formatDate(iso)
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).slice(2, 11)
}

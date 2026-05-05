'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createSME } from '@/lib/api'
import { useToast } from '@/components/shared/Toast'

export default function SMELoginPage() {
  const router = useRouter()
  const { show } = useToast()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Login
  const [email, setEmail] = useState('')

  // Register
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [subInput, setSubInput] = useState('')
  const [subAreas, setSubAreas] = useState<string[]>([])
  const [regEmail, setRegEmail] = useState('')
  const [dept, setDept] = useState('')

  const validate = (fields: Record<string, string>) => {
    const errs: Record<string, string> = {}
    Object.entries(fields).forEach(([k, v]) => { if (!v.trim()) errs[k] = 'This field is required' })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLogin = async () => {
    if (!validate({ email })) return
    setLoading(true)
    // Store email in session storage for display
    sessionStorage.setItem('sme_email', email)
    sessionStorage.setItem('sme_name', email.split('@')[0])
    setTimeout(() => { router.push('/sme/dashboard') }, 500)
  }

  const handleRegister = async () => {
    const required: Record<string, string> = { name, specialization, regEmail }
    if (subAreas.length === 0) { setErrors({ ...errors, subAreas: 'Add at least one sub-expertise' }); return }
    if (!validate(required)) return
    setLoading(true)
    try {
      const sme = await createSME({ name, specialization, sub_areas: subAreas, contact_email: regEmail })
      sessionStorage.setItem('sme_id', sme.sme_id)
      sessionStorage.setItem('sme_name', sme.name)
      sessionStorage.setItem('sme_email', regEmail)
      show('Account created successfully!')
      router.push('/sme/dashboard')
    } catch (e: any) {
      show(e.message || 'Registration failed', 'error')
      setLoading(false)
    }
  }

  const addSubArea = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && subInput.trim()) {
      e.preventDefault()
      setSubAreas(prev => [...prev, subInput.trim()])
      setSubInput('')
      setErrors(prev => ({ ...prev, subAreas: '' }))
    }
  }

  const field = (label: string, required: boolean, input: React.ReactNode, error?: string) => (
    <div>
      <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
        {label}{required && <span className="text-[#E20074] ml-0.5">*</span>}
      </label>
      {input}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )

  const inputCls = (err?: string) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${err ? 'border-red-400 focus:border-red-400' : 'border-[#E5E7EB] focus:border-[#E20074]'}`

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-sm font-semibold text-[#1A1A1A] mb-6">
        Thoth <span className="text-[#6B7280] font-normal">· SME</span>
      </Link>

      <div className="w-full max-w-[480px] bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#E5E7EB]">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setErrors({}) }}
              className="flex-1 py-3.5 text-sm font-medium capitalize relative transition-colors"
              style={{ color: tab === t ? '#E20074' : 'rgba(26,26,26,0.7)' }}
            >
              {t}
              {tab === t && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#E20074] rounded-t" />}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-4">
          {tab === 'login' ? (
            <>
              {field('Email', true,
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors({}) }}
                  placeholder="your@email.com"
                  className={inputCls(errors.email)}
                />,
                errors.email
              )}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#E20074] text-white text-sm font-medium hover:bg-[#C5006A] disabled:opacity-60 transition-colors"
              >
                {loading ? 'Signing in…' : 'Continue'}
              </button>
            </>
          ) : (
            <>
              {field('Full Name', true,
                <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
                  placeholder="Dr. Jane Smith" className={inputCls(errors.name)} />, errors.name)}
              {field('Role', false,
                <input value={role} onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Senior Compliance Officer" className={inputCls()} />)}
              {field('Specialization', true,
                <input value={specialization} onChange={e => { setSpecialization(e.target.value); setErrors(p => ({ ...p, specialization: '' })) }}
                  placeholder="e.g. MEZ Trade Compliance" className={inputCls(errors.specialization)} />, errors.specialization)}
              {field('Sub Expertise', true,
                <div className={`w-full px-3 py-2 rounded-lg border text-sm min-h-[40px] ${errors.subAreas ? 'border-red-400' : 'border-[#E5E7EB] focus-within:border-[#E20074]'} transition-colors`}>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {subAreas.map((s, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF0F8] text-[#E20074] text-xs">
                        {s}
                        <button onClick={() => setSubAreas(prev => prev.filter((_, j) => j !== i))}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    value={subInput}
                    onChange={e => setSubInput(e.target.value)}
                    onKeyDown={addSubArea}
                    placeholder="Type and press Enter…"
                    className="outline-none w-full text-sm bg-transparent placeholder:text-[#9CA3AF]"
                  />
                </div>, errors.subAreas)}
              {field('Email', true,
                <input type="email" value={regEmail} onChange={e => { setRegEmail(e.target.value); setErrors(p => ({ ...p, regEmail: '' })) }}
                  placeholder="your@email.com" className={inputCls(errors.regEmail)} />, errors.regEmail)}
              {field('Department', false,
                <input value={dept} onChange={e => setDept(e.target.value)}
                  placeholder="e.g. Legal & Compliance" className={inputCls()} />)}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#E20074] text-white text-sm font-medium hover:bg-[#C5006A] disabled:opacity-60 transition-colors mt-1"
              >
                {loading ? 'Creating account…' : 'Submit'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

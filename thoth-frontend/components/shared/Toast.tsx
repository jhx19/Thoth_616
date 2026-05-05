'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ToastItem { id: string; message: string; type?: 'success' | 'error' }
interface ToastCtx { show: (msg: string, type?: 'success' | 'error') => void }

const Ctx = createContext<ToastCtx>({ show: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  const remove = (id: string) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up"
            style={{ background: t.type === 'error' ? '#991B1B' : '#1A1A1A', color: 'white' }}
          >
            <span>{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)

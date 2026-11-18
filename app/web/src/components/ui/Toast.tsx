import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

/* ─── Types ─── */
type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-white', border: 'border-green-200', icon: 'text-green-500' },
  error: { bg: 'bg-white', border: 'border-red-200', icon: 'text-red-500' },
  info: { bg: 'bg-white', border: 'border-teal-200', icon: 'text-teal-500' },
  warning: { bg: 'bg-white', border: 'border-amber-200', icon: 'text-amber-500' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...t, id }])
  }, [])

  const toast = useCallback(addToast, [addToast])
  const success = useCallback((title: string, description?: string) => addToast({ type: 'success', title, description }), [addToast])
  const error = useCallback((title: string, description?: string) => addToast({ type: 'error', title, description }), [addToast])
  const info = useCallback((title: string, description?: string) => addToast({ type: 'info', title, description }), [addToast])
  const warning = useCallback((title: string, description?: string) => addToast({ type: 'warning', title, description }), [addToast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type]
  const style = styles[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 ${style.bg} border ${style.border} rounded-xl shadow-lg shadow-black/5`}
    >
      <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.description && <p className="text-xs text-ink-4 mt-0.5">{toast.description}</p>}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-ink-5 hover:bg-ink-8 hover:text-ink transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

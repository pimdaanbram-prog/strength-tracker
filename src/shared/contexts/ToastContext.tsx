import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, Trophy, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'achievement'

interface Toast {
  id: string
  type: ToastType
  message: string
  subtitle?: string
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, subtitle?: string) => void
  showSuccess: (message: string, subtitle?: string) => void
  showError: (message: string, subtitle?: string) => void
  showAchievement: (message: string, subtitle?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  achievement: Trophy,
}

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', icon: '#10b981', text: '#10b981' },
  error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', icon: '#ef4444', text: '#ef4444' },
  info: { bg: 'var(--theme-accent-muted)', border: 'var(--theme-accent)', icon: 'var(--theme-accent)', text: 'var(--theme-accent)' },
  achievement: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.5)', icon: '#fbbf24', text: '#fbbf24' },
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = ICONS[toast.type]
  const colors = COLORS[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl pointer-events-auto"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <Icon size={18} style={{ color: colors.icon, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold m-0 truncate" style={{ color: 'var(--theme-text-primary)' }}>
          {toast.message}
        </p>
        {toast.subtitle && (
          <p className="text-xs m-0 mt-0.5 truncate" style={{ color: 'var(--theme-text-secondary)' }}>
            {toast.subtitle}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
        style={{ color: 'var(--theme-text-muted)' }}
      >
        <X size={13} />
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', subtitle?: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    const toast: Toast = { id, type, message, subtitle }
    setToasts(prev => [toast, ...prev].slice(0, 4))
    setTimeout(() => removeToast(id), type === 'achievement' ? 5000 : 3000)
  }, [removeToast])

  const showSuccess = useCallback((msg: string, sub?: string) => showToast(msg, 'success', sub), [showToast])
  const showError = useCallback((msg: string, sub?: string) => showToast(msg, 'error', sub), [showToast])
  const showAchievement = useCallback((msg: string, sub?: string) => showToast(msg, 'achievement', sub), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showAchievement }}>
      {children}
      <div className="toast-container">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

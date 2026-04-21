import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[90] mx-auto w-full max-w-lg flex flex-col"
            style={{
              maxHeight: '90dvh',
              background: 'var(--theme-bg-card)',
              border: '1px solid var(--theme-glass-border)',
              borderBottom: 'none',
              borderRadius: '28px 28px 0 0',
              boxShadow: '0 -24px 64px rgba(0,0,0,0.7)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--theme-border-subtle)' }} />
            </div>

            {/* Title row */}
            {title && (
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--theme-border)' }}
              >
                <h2 className="text-lg tracking-wider m-0">{title.toUpperCase()}</h2>
                <button
                  onClick={onClose}
                  className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer border-0"
                  style={{ background: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Content — scrollable */}
            <div className="overflow-y-auto flex-1 px-5 py-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

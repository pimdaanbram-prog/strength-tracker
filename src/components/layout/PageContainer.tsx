import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`min-h-[100dvh] px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-0 lg:ml-[280px] lg:px-8 lg:pb-8 ${className}`}
    >
      {children}
    </motion.main>
  )
}

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.99 }}
      transition={{
        type: 'spring',
        damping: 28,
        stiffness: 300,
        mass: 0.8,
      }}
      className={`max-w-lg mx-auto w-full px-5 pb-32 pt-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}

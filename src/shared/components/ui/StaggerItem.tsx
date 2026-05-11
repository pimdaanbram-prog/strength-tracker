import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StaggerItemProps {
  children: ReactNode
  delay?: number
  className?: string
}

export default function StaggerItem({ children, delay = 0, className }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: delay / 1000,
        duration: 0.55,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: ReactNode
}

export default function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 pt-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="m-0 text-4xl font-bold leading-none md:text-5xl"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="m-0 mt-2 max-w-2xl text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <div
        className="mt-5 h-px w-full"
        style={{ background: 'linear-gradient(90deg, var(--accent-primary), transparent)' }}
      />
    </motion.header>
  )
}

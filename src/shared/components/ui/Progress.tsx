import { motion } from 'framer-motion'

interface ProgressProps {
  value: number // 0-100
  color?: string
  height?: number
  className?: string
}

export default function Progress({
  value,
  color = 'var(--color-accent)',
  height = 4,
  className = '',
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      className={`w-full bg-bg-input rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}

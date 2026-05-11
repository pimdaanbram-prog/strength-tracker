interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
  height?: number | string
  width?: number | string
  borderRadius?: number | string
}

export default function Skeleton({ className = '', style, height, width, borderRadius = 8 }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width, borderRadius, ...style }}
    />
  )
}

/** Pre-built skeleton for a card row (icon + two lines of text) */
export function SkeletonCard() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 18, background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)' }}>
      <Skeleton height={44} width={44} borderRadius={12} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton height={13} width="60%" />
        <Skeleton height={11} width="40%" />
      </div>
    </div>
  )
}

/** List of N skeleton cards */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

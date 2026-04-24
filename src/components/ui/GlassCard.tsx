import { useState, type HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hi?: boolean
  blur?: number
}

export default function GlassCard({ hi = false, blur = 24, className = '', style = {}, onClick, children, ...rest }: GlassCardProps) {
  const [hover, setHover] = useState(false)

  const base = hi
    ? 'rgba(30,30,38,0.70)'
    : 'var(--theme-glass)'
  const border = hover
    ? 'var(--theme-glass-border-hi, rgba(255,255,255,0.18))'
    : 'var(--theme-glass-border)'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        position: 'relative',
        background: base,
        backdropFilter: `blur(${hi ? blur + 4 : blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${hi ? blur + 4 : blur}px) saturate(180%)`,
        border: `1px solid ${border}`,
        borderRadius: 22,
        boxShadow: hi
          ? `0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)`
          : `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`,
        transition: 'transform 0.25s cubic-bezier(.2,.8,.2,1), border-color 0.2s',
        transform: onClick && hover ? 'translateY(-1px)' : 'translateY(0)',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {/* specular top edge */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      {children}
    </div>
  )
}

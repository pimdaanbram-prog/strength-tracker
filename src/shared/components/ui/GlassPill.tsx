import type { ReactNode, CSSProperties } from 'react'

type Tone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

interface GlassPillProps {
  tone?: Tone
  style?: CSSProperties
  children: ReactNode
}

const TONE_STYLES: Record<Tone, { bg: string; color: string; border: string }> = {
  default: {
    bg: 'var(--theme-glass)',
    color: 'var(--theme-text-secondary)',
    border: 'var(--theme-glass-border)',
  },
  accent: {
    bg: 'var(--theme-accent-muted)',
    color: 'var(--theme-accent)',
    border: 'color-mix(in srgb, var(--theme-accent) 27%, transparent)',
  },
  success: {
    bg: 'rgba(62,232,168,0.12)',
    color: 'var(--theme-success)',
    border: 'rgba(62,232,168,0.25)',
  },
  warning: {
    bg: 'rgba(255,176,32,0.12)',
    color: 'var(--theme-warning)',
    border: 'rgba(255,176,32,0.25)',
  },
  danger: {
    bg: 'rgba(255,84,112,0.12)',
    color: 'var(--theme-error)',
    border: 'rgba(255,84,112,0.25)',
  },
}

export default function GlassPill({ tone = 'default', style, children }: GlassPillProps) {
  const t = TONE_STYLES[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 9.5,
        fontFamily: 'var(--theme-font-mono)',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '4px 8px',
        borderRadius: 999,
        background: t.bg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: t.color,
        border: `1px solid ${t.border}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

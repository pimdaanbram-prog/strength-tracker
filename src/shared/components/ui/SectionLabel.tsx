import type { ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  right?: ReactNode
}

export default function SectionLabel({ children, right }: SectionLabelProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      padding: '0 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 3,
          height: 12,
          background: 'var(--theme-accent-grad)',
          borderRadius: 2,
          boxShadow: '0 0 12px var(--theme-accent-glow)',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--theme-font-mono)',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--theme-text-secondary)',
        }}>
          {children}
        </span>
      </div>
      {right}
    </div>
  )
}

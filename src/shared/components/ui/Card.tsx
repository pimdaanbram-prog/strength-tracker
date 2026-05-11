import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  active?: boolean
  accentColor?: string
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, active = false, accentColor, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          backdrop-blur-xl backdrop-saturate-150 rounded-2xl
          border transition-all duration-200
          ${active
            ? accentColor
              ? 'shadow-lg'
              : 'border-accent shadow-lg shadow-accent/10'
            : 'border-border'
          }
          ${hover ? 'hover:border-border-light cursor-pointer' : ''}
          ${className}
        `}
      style={{
        background: 'var(--theme-bg-card)',
        boxShadow: active && accentColor
          ? `0 10px 15px -3px ${accentColor}20`
          : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        ...(active && accentColor ? { borderColor: accentColor } : {}),
      }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card

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
          bg-bg-card/80 backdrop-blur-sm rounded-2xl
          border transition-all duration-200
          ${active
            ? accentColor
              ? 'shadow-lg'
              : 'border-accent shadow-lg shadow-accent/10'
            : 'border-border'
          }
          ${hover ? 'hover:border-border-light hover:bg-bg-card cursor-pointer' : ''}
          ${className}
        `}
        style={
          active && accentColor
            ? { borderColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}20` }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card

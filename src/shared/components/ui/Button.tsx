import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))',
    color: '#fff',
    boxShadow: '0 6px 20px var(--theme-accent-glow)',
    border: 'none',
  },
  secondary: {
    background: 'var(--theme-bg-card)',
    color: 'var(--theme-text-primary)',
    border: '1px solid var(--theme-border)',
    boxShadow: 'none',
  },
  danger: {
    background: 'rgba(255,59,59,0.1)',
    color: 'var(--theme-error)',
    border: '1px solid rgba(255,59,59,0.2)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--theme-text-secondary)',
    border: 'none',
    boxShadow: 'none',
  },
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-2xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className = '', children, disabled, style, ...props }, ref) => {
    // motion.button has slightly different prop types; this spread is safe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const restProps = props as any
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        className={`
          inline-flex items-center justify-center gap-2 font-semibold
          transition-opacity duration-200 cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled}
        style={{ ...variantStyles[variant], fontFamily: 'inherit', ...style }}
        {...restProps}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
export default Button

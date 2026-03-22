import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Card from '../ui/Card'

// Step wrapper with slide animation
interface StepWrapperProps {
  children: ReactNode
  direction: number
}

export function StepWrapper({ children, direction }: StepWrapperProps) {
  return (
    <motion.div
      initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

// Emoji picker grid
interface EmojiPickerProps {
  emojis: string[]
  selected: string
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ emojis, selected, onSelect }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`
            w-14 h-14 rounded-2xl text-2xl flex items-center justify-center
            transition-all duration-200 cursor-pointer
            ${selected === emoji
              ? 'bg-accent/20 border-2 border-accent scale-110'
              : 'bg-bg-input border-2 border-transparent hover:border-border-light hover:bg-bg-card'
            }
          `}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

// Selectable option card
interface OptionCardProps {
  title: string
  description?: string
  icon?: ReactNode
  selected: boolean
  onSelect: () => void
}

export function OptionCard({ title, description, icon, selected, onSelect }: OptionCardProps) {
  return (
    <Card
      hover
      active={selected}
      className="p-4 flex items-start gap-3"
      onClick={onSelect}
    >
      {icon && (
        <div className={`text-xl mt-0.5 ${selected ? 'text-accent' : 'text-text-muted'}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
          transition-colors duration-200
          ${selected ? 'border-accent bg-accent' : 'border-border-light'}
        `}
      >
        {selected && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>
    </Card>
  )
}

// Multi-select chip
interface ChipProps {
  label: string
  selected: boolean
  onToggle: () => void
  color?: string
}

export function Chip({ label, selected, onToggle, color }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        px-4 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 cursor-pointer border
        ${selected
          ? 'text-white border-transparent'
          : 'bg-bg-input text-text-secondary border-border hover:border-border-light'
        }
      `}
      style={
        selected
          ? { backgroundColor: color || 'var(--color-accent)', borderColor: color || 'var(--color-accent)' }
          : undefined
      }
    >
      {label}
    </button>
  )
}

// Color picker
interface ColorPickerProps {
  colors: string[]
  selected: string
  onSelect: (color: string) => void
}

export function ColorPicker({ colors, selected, onSelect }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className={`
            w-10 h-10 rounded-full transition-all duration-200 cursor-pointer
            ${selected === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-bg-primary' : 'hover:scale-110'}
          `}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

// Step title
interface StepTitleProps {
  title: string
  subtitle?: string
}

export function StepTitle({ title, subtitle }: StepTitleProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-heading tracking-wide text-text-primary">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-text-muted mt-1">{subtitle}</p>
      )}
    </div>
  )
}

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Card from '../ui/Card'

// Step wrapper
interface StepWrapperProps { children: ReactNode; direction: number }
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

// Emoji picker — 4 columns so each cell is ~72px on a 320px screen (safe touch target)
interface EmojiPickerProps { emojis: string[]; selected: string; onSelect: (emoji: string) => void }
export function EmojiPicker({ emojis, selected, onSelect }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`
            h-14 rounded-2xl text-2xl flex items-center justify-center w-full
            transition-all duration-200 cursor-pointer
            ${selected === emoji
              ? 'border-2 scale-105'
              : 'border-2 border-transparent hover:border-border-light'
            }
          `}
          style={selected === emoji
            ? { background: 'var(--theme-accent-muted)', borderColor: 'var(--theme-accent)' }
            : { background: 'var(--theme-bg-input)' }
          }
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

// Selectable option card
interface OptionCardProps {
  title: string; description?: string; icon?: ReactNode; selected: boolean; onSelect: () => void
}
export function OptionCard({ title, description, icon, selected, onSelect }: OptionCardProps) {
  return (
    <Card hover active={selected} className="p-4 flex items-start gap-3 min-h-[56px]" onClick={onSelect}>
      {icon && (
        <div className={`text-xl mt-0.5 ${selected ? 'text-accent' : 'text-text-muted'}`}>{icon}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>{title}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      {/* Checkbox — 24×24 minimum */}
      <div
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200"
        style={selected
          ? { borderColor: 'var(--theme-accent)', background: 'var(--theme-accent)' }
          : { borderColor: 'var(--theme-border-subtle)', background: 'transparent' }
        }
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </Card>
  )
}

// Multi-select chip — min 44px height
interface ChipProps { label: string; selected: boolean; onToggle: () => void; color?: string }
export function Chip({ label, selected, onToggle, color }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border"
      style={selected
        ? { background: color || 'var(--theme-accent)', borderColor: color || 'var(--theme-accent)', color: '#fff' }
        : { background: 'var(--theme-bg-input)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }
      }
    >
      {label}
    </button>
  )
}

// Color picker — 48×48 touch targets
interface ColorPickerProps { colors: string[]; selected: string; onSelect: (color: string) => void }
export function ColorPicker({ colors, selected, onSelect }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className="w-12 h-12 rounded-full transition-all duration-200 cursor-pointer border-0 flex items-center justify-center"
          style={{
            backgroundColor: color,
            transform: selected === color ? 'scale(1.2)' : 'scale(1)',
            boxShadow: selected === color ? `0 0 0 2px #060606, 0 0 0 4px ${color}` : 'none',
          }}
        />
      ))}
    </div>
  )
}

// Step title
interface StepTitleProps { title: string; subtitle?: string }
export function StepTitle({ title, subtitle }: StepTitleProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-heading tracking-wide text-text-primary">{title}</h2>
      {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus, Sliders } from 'lucide-react'
import { useTheme, MAX_CUSTOM_THEMES } from '@/features/themes/context/ThemeContext'
import type { Theme } from '@/features/themes/data/themes'

const TABS: { id: NonNullable<Theme['category']>; label: string }[] = [
  { id: 'dark', label: 'Donker' },
  { id: 'light', label: 'Licht' },
  { id: 'neon', label: 'Neon' },
  { id: 'special', label: 'Speciaal' },
]

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ]
}

function shift(hex: string, amount: number) {
  const next = hexToRgb(hex).map(value => Math.max(0, Math.min(255, value + amount)))
  return `#${next.map(value => value.toString(16).padStart(2, '0')).join('')}`
}

function customTheme(name: string, bg: string, accent: string, text: string): Theme {
  const [ar, ag, ab] = hexToRgb(accent)
  const bgSecondary = shift(bg, 10)
  const bgTertiary = shift(bg, 20)
  const accentGlow = `rgba(${ar}, ${ag}, ${ab}, 0.32)`
  return {
    id: `custom-${Date.now()}`,
    name,
    nameNL: name,
    isDark: true,
    emoji: '🎨',
    category: 'special',
    preview: { bg, card: bgSecondary, accent, text },
    colors: {
      bgPrimary: bg,
      bgSecondary,
      bgTertiary,
      bgGlass: `rgba(${hexToRgb(bg).join(', ')}, 0.86)`,
      borderPrimary: `rgba(${ar}, ${ag}, ${ab}, 0.16)`,
      borderAccent: `rgba(${ar}, ${ag}, ${ab}, 0.42)`,
      accentPrimary: accent,
      accentSecondary: shift(accent, 34),
      accentGlow,
      textPrimary: text,
      textSecondary: `rgba(${hexToRgb(text).join(', ')}, 0.72)`,
      textMuted: `rgba(${hexToRgb(text).join(', ')}, 0.42)`,
      success: '#10d97a',
      warning: '#f59e0b',
      danger: '#ef4444',
      gradient: `linear-gradient(135deg, ${bg} 0%, ${bgSecondary} 100%)`,
      gradientCard: `linear-gradient(135deg, rgba(${ar},${ag},${ab},0.16), rgba(${ar},${ag},${ab},0.04))`,
      noise: true,
    },
    fonts: {
      display: "'Syne', sans-serif",
      body: "'DM Sans', sans-serif",
    },
    vars: {
      '--bg-primary': bg,
      '--bg-secondary': bgSecondary,
      '--bg-tertiary': bgTertiary,
      '--bg-glass': `rgba(${hexToRgb(bg).join(', ')}, 0.86)`,
      '--border-primary': `rgba(${ar}, ${ag}, ${ab}, 0.16)`,
      '--border-accent': `rgba(${ar}, ${ag}, ${ab}, 0.42)`,
      '--accent-primary': accent,
      '--accent-secondary': shift(accent, 34),
      '--accent-glow': accentGlow,
      '--text-primary': text,
      '--text-secondary': `rgba(${hexToRgb(text).join(', ')}, 0.72)`,
      '--text-muted': `rgba(${hexToRgb(text).join(', ')}, 0.42)`,
      '--success': '#10d97a',
      '--warning': '#f59e0b',
      '--danger': '#ef4444',
      '--gradient': `linear-gradient(135deg, ${bg} 0%, ${bgSecondary} 100%)`,
      '--gradient-card': `linear-gradient(135deg, rgba(${ar},${ag},${ab},0.16), rgba(${ar},${ag},${ab},0.04))`,
      '--font-display': "'Syne', sans-serif",
      '--font-body': "'DM Sans', sans-serif",
      '--theme-bg-primary': bg,
      '--theme-bg-secondary': bgSecondary,
      '--theme-bg-card': `rgba(${hexToRgb(bg).join(', ')}, 0.86)`,
      '--theme-bg-input': bgTertiary,
      '--theme-text-primary': text,
      '--theme-text-secondary': `rgba(${hexToRgb(text).join(', ')}, 0.72)`,
      '--theme-text-muted': `rgba(${hexToRgb(text).join(', ')}, 0.42)`,
      '--theme-accent': accent,
      '--theme-accent-hi': shift(accent, 34),
      '--theme-accent-hover': shift(accent, -24),
      '--theme-accent-muted': accentGlow,
      '--theme-accent-glow': accentGlow,
      '--theme-accent-grad': `linear-gradient(135deg, ${accent}, ${shift(accent, 34)})`,
      '--theme-border': `rgba(${ar}, ${ag}, ${ab}, 0.16)`,
      '--theme-border-subtle': `rgba(${ar}, ${ag}, ${ab}, 0.10)`,
      '--theme-success': '#10d97a',
      '--theme-warning': '#f59e0b',
      '--theme-error': '#ef4444',
      '--theme-glass': `rgba(${hexToRgb(bg).join(', ')}, 0.86)`,
      '--theme-glass-hi': `rgba(${hexToRgb(bgSecondary).join(', ')}, 0.9)`,
      '--theme-glass-border': `rgba(${ar}, ${ag}, ${ab}, 0.16)`,
      '--theme-glass-border-hi': `rgba(${ar}, ${ag}, ${ab}, 0.42)`,
      '--theme-shadow-sm': 'var(--shadow-sm)',
      '--theme-shadow-md': 'var(--shadow-md)',
      '--theme-shadow-lg': 'var(--shadow-lg)',
      '--theme-nav-bg': `rgba(${hexToRgb(bg).join(', ')}, 0.86)`,
      '--theme-gradient-text-from': accent,
      '--theme-gradient-text-to': shift(accent, 34),
      '--theme-font-display': "'Syne', sans-serif",
      '--theme-font-body': "'DM Sans', sans-serif",
      '--theme-font-mono': "'JetBrains Mono', ui-monospace, monospace",
    },
  }
}

export default function ThemePicker() {
  const { themes, customThemes, themeId, setTheme, saveCustomTheme, deleteCustomTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<NonNullable<Theme['category']>>('dark')
  const [name, setName] = useState('Mijn Thema')
  const [accent, setAccent] = useState('#6366f1')
  const [background, setBackground] = useState('#0a0a0b')
  const [text, setText] = useState('#f4f4f8')
  const preview = useMemo(() => customTheme(name || 'Mijn Thema', background, accent, text), [accent, background, name, text])
  const visibleThemes = themes.filter(theme => !theme.id.startsWith('custom-') && (theme.category ?? (theme.isDark ? 'dark' : 'light')) === activeTab)

  function save() {
    if (customThemes.length >= MAX_CUSTOM_THEMES) return
    const theme = customTheme(name || 'Mijn Thema', background, accent, text)
    saveCustomTheme(theme)
    setTheme(theme.id)
  }

  return (
    <div>
      <div className="mb-5 grid grid-cols-4 gap-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="min-h-[44px] rounded-2xl border text-xs font-bold"
            style={{
              background: activeTab === tab.id ? 'var(--gradient-card)' : 'var(--bg-glass)',
              borderColor: activeTab === tab.id ? 'var(--border-accent)' : 'var(--border-primary)',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {visibleThemes.map(theme => {
          const active = theme.id === themeId
          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setTheme(theme.id)}
              className="relative overflow-hidden rounded-3xl border p-0 text-left"
              style={{
                background: theme.preview.bg,
                borderColor: active ? theme.preview.accent : 'var(--border-primary)',
                boxShadow: active ? `0 0 28px ${theme.preview.accent}66` : 'none',
              }}
            >
              {active && (
                <span className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full" style={{ background: theme.preview.accent }}>
                  <Check size={14} color="#fff" />
                </span>
              )}
              <div className="h-24 p-3" style={{ background: theme.colors?.gradient ?? theme.preview.bg }}>
                <div className="h-8 w-8 rounded-xl" style={{ background: theme.preview.accent }} />
                <div className="mt-4 h-3 w-20 rounded-full" style={{ background: theme.preview.text, opacity: 0.75 }} />
                <div className="mt-2 h-2 w-14 rounded-full" style={{ background: theme.preview.text, opacity: 0.35 }} />
              </div>
              <div className="flex items-center gap-2 p-3" style={{ background: theme.preview.card }}>
                <span>{theme.emoji}</span>
                <span className="truncate text-sm font-bold" style={{ color: theme.preview.text }}>{theme.nameNL}</span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {customThemes.length > 0 && (
        <div className="mt-7">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>Mijn thema's</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {customThemes.map(theme => (
              <div key={theme.id} className="relative">
                <button
                  onClick={() => setTheme(theme.id)}
                  className="w-full overflow-hidden rounded-3xl border p-4 text-left"
                  style={{ background: theme.preview.bg, borderColor: theme.id === themeId ? theme.preview.accent : 'var(--border-primary)' }}
                >
                  <div className="mb-3 h-10 w-10 rounded-2xl" style={{ background: theme.preview.accent }} />
                  <p className="m-0 text-sm font-bold" style={{ color: theme.preview.text }}>{theme.nameNL}</p>
                </button>
                <button onClick={() => deleteCustomTheme(theme.id)} className="absolute right-2 top-2 rounded-full border-0 px-2 py-1 text-[10px]" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                  Wis
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-[2rem] p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}>
        <div className="mb-4 flex items-center gap-2">
          <Sliders size={16} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="display m-0 text-2xl font-bold">Custom builder</h2>
          <span className="ml-auto rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}>
            {customThemes.length}/{MAX_CUSTOM_THEMES}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          <div className="grid gap-3">
            <input value={name} onChange={event => setName(event.target.value)} className="min-h-[48px] rounded-2xl border px-4 outline-none" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            {[
              { label: 'Accent', value: accent, set: setAccent },
              { label: 'Achtergrond', value: background, set: setBackground },
              { label: 'Tekst', value: text, set: setText },
            ].map(item => (
              <label key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border p-3" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                <span className="text-sm font-bold">{item.label}</span>
                <input type="color" value={item.value} onChange={event => item.set(event.target.value)} className="h-10 w-16 cursor-pointer border-0 bg-transparent" />
              </label>
            ))}
            <button onClick={save} disabled={customThemes.length >= MAX_CUSTOM_THEMES} className="min-h-[50px] rounded-2xl border-0 text-sm font-bold text-white disabled:opacity-40" style={{ background: 'var(--theme-accent-grad)' }}>
              <Plus className="mr-2 inline" size={16} />
              Opslaan als custom thema
            </button>
          </div>
          <div className="rounded-3xl p-4" style={{ background: preview.preview.bg, color: preview.preview.text }}>
            <div className="mb-5 h-12 w-12 rounded-2xl" style={{ background: preview.preview.accent, boxShadow: `0 0 22px ${preview.preview.accent}77` }} />
            <p className="m-0 text-xl font-bold">{preview.nameNL}</p>
            <p className="m-0 mt-2 text-sm opacity-70">Live preview</p>
            <div className="mt-5 rounded-2xl p-3" style={{ background: preview.preview.card }}>
              <div className="h-3 w-24 rounded-full" style={{ background: preview.preview.text, opacity: 0.8 }} />
              <div className="mt-2 h-2 w-16 rounded-full" style={{ background: preview.preview.text, opacity: 0.35 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

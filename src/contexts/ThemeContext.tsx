import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { themes as builtInThemes, DEFAULT_THEME_ID, type Theme } from '../data/themes'

const STORAGE_KEY = 'st-theme-id'
const CUSTOM_THEMES_KEY = 'st-custom-themes'
export const MAX_CUSTOM_THEMES = 3

interface ThemeContextValue {
  theme: Theme
  themeId: string
  setTheme: (id: string) => void
  themes: Theme[]
  customThemes: Theme[]
  saveCustomTheme: (theme: Theme) => void
  deleteCustomTheme: (id: string) => void
  accent: string
  accentHi: string
  accentGrad: string
  accentGlow: string
  accentSoft: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }

  // Compute derived accent vars for the v2 design system
  const accent = theme.vars['--theme-accent'] ?? '#FF7A1F'
  const accentHi = theme.vars['--theme-accent-hi'] ?? theme.vars['--theme-gradient-text-to'] ?? accent

  root.style.setProperty('--theme-accent-hi', accentHi)
  root.style.setProperty('--theme-accent-grad', `linear-gradient(135deg, ${accent} 0%, ${accentHi} 100%)`)

  if (accent.startsWith('#') && accent.length >= 7) {
    root.style.setProperty('--theme-accent-glow', hexToRgba(accent, 0.45))
    root.style.setProperty('--theme-accent-muted', hexToRgba(accent, 0.13))
  }

  // Ensure v2 glass vars exist for all themes
  if (!theme.vars['--theme-glass-hi']) {
    root.style.setProperty('--theme-glass-hi', theme.isDark ? 'rgba(30,30,38,0.70)' : 'rgba(255,255,255,0.80)')
  }
  if (!theme.vars['--theme-glass-border-hi']) {
    root.style.setProperty('--theme-glass-border-hi', theme.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)')
  }

  root.setAttribute('data-theme', theme.id)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme.vars['--theme-bg-primary'] ?? '#060606')
  document.body.style.backgroundColor = theme.vars['--theme-bg-primary'] ?? '#060606'
  document.body.style.color = theme.vars['--theme-text-primary'] ?? '#FAFAFA'
}

function loadCustomThemes(): Theme[] {
  try {
    const raw = localStorage.getItem(CUSTOM_THEMES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Theme[]
  } catch {
    return []
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => loadCustomThemes())

  const allThemes = [...builtInThemes, ...customThemes]

  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID
  })

  function findTheme(id: string, customs = customThemes): Theme {
    return [...builtInThemes, ...customs].find(t => t.id === id) ?? builtInThemes[0]
  }

  const theme = findTheme(themeId)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const customs = loadCustomThemes()
    const id = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID
    applyTheme(findTheme(id, customs))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setTheme(id: string) {
    setThemeId(id)
    localStorage.setItem(STORAGE_KEY, id)
    applyTheme(findTheme(id))
  }

  function saveCustomTheme(newTheme: Theme) {
    setCustomThemes(prev => {
      const existingIdx = prev.findIndex(t => t.id === newTheme.id)
      let updated: Theme[]
      if (existingIdx >= 0) {
        updated = prev.map((t, i) => (i === existingIdx ? newTheme : t))
      } else {
        // Max 3: drop oldest if full
        const trimmed = prev.length >= MAX_CUSTOM_THEMES ? prev.slice(1) : prev
        updated = [...trimmed, newTheme]
      }
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated))
      return updated
    })
  }

  function deleteCustomTheme(id: string) {
    setCustomThemes(prev => {
      const updated = prev.filter(t => t.id !== id)
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated))
      if (themeId === id) {
        const fallbackId = DEFAULT_THEME_ID
        setThemeId(fallbackId)
        localStorage.setItem(STORAGE_KEY, fallbackId)
        applyTheme(builtInThemes[0])
      }
      return updated
    })
  }

  const accent = theme.vars['--theme-accent'] ?? '#FF7A1F'
  const accentHi = theme.vars['--theme-accent-hi'] ?? theme.vars['--theme-gradient-text-to'] ?? accent
  const accentGrad = `linear-gradient(135deg, ${accent} 0%, ${accentHi} 100%)`
  const accentGlow = accent.startsWith('#') && accent.length >= 7 ? hexToRgba(accent, 0.45) : `${accent}72`
  const accentSoft = accent.startsWith('#') && accent.length >= 7 ? hexToRgba(accent, 0.13) : `${accent}21`

  return (
    <ThemeContext.Provider value={{
      theme, themeId, setTheme,
      themes: allThemes,
      customThemes,
      saveCustomTheme,
      deleteCustomTheme,
      accent,
      accentHi,
      accentGrad,
      accentGlow,
      accentSoft,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

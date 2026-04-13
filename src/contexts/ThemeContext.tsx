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
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
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

  return (
    <ThemeContext.Provider value={{
      theme, themeId, setTheme,
      themes: allThemes,
      customThemes,
      saveCustomTheme,
      deleteCustomTheme,
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

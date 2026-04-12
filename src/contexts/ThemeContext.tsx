import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { themes, DEFAULT_THEME_ID, getTheme, type Theme } from '../data/themes'

const STORAGE_KEY = 'st-theme-id'

interface ThemeContextValue {
  theme: Theme
  themeId: string
  setTheme: (id: string) => void
  themes: Theme[]
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID
  })

  const theme = getTheme(themeId)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    applyTheme(getTheme(localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setTheme(id: string) {
    setThemeId(id)
    localStorage.setItem(STORAGE_KEY, id)
    applyTheme(getTheme(id))
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

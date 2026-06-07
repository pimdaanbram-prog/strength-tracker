import type { Theme } from '@/styles/themes'

function setThemeVar(root: HTMLElement, name: string, value: string) {
  root.style.setProperty(name, value)
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const { colors, fonts } = theme

  setThemeVar(root, '--bg-primary', colors.bgPrimary)
  setThemeVar(root, '--bg-secondary', colors.bgSecondary)
  setThemeVar(root, '--bg-tertiary', colors.bgTertiary)
  setThemeVar(root, '--bg-glass', colors.bgGlass)
  setThemeVar(root, '--border-primary', colors.borderPrimary)
  setThemeVar(root, '--border-accent', colors.borderAccent)
  setThemeVar(root, '--accent-primary', colors.accentPrimary)
  setThemeVar(root, '--accent-secondary', colors.accentSecondary)
  setThemeVar(root, '--accent-glow', colors.accentGlow)
  setThemeVar(root, '--text-primary', colors.textPrimary)
  setThemeVar(root, '--text-secondary', colors.textSecondary)
  setThemeVar(root, '--text-muted', colors.textMuted)
  setThemeVar(root, '--success', colors.success)
  setThemeVar(root, '--warning', colors.warning)
  setThemeVar(root, '--danger', colors.danger)
  setThemeVar(root, '--gradient', colors.gradient)
  setThemeVar(root, '--gradient-card', colors.gradientCard)
  setThemeVar(root, '--font-display', fonts.display)
  setThemeVar(root, '--font-body', fonts.body)

  setThemeVar(root, '--theme-bg-primary', colors.bgPrimary)
  setThemeVar(root, '--theme-bg-secondary', colors.bgSecondary)
  setThemeVar(root, '--theme-bg-card', colors.bgGlass)
  setThemeVar(root, '--theme-bg-input', colors.bgTertiary)
  setThemeVar(root, '--theme-text-primary', colors.textPrimary)
  setThemeVar(root, '--theme-text-secondary', colors.textSecondary)
  setThemeVar(root, '--theme-text-muted', colors.textMuted)
  setThemeVar(root, '--theme-text-faint', colors.textMuted)
  setThemeVar(root, '--theme-accent', colors.accentPrimary)
  setThemeVar(root, '--theme-accent-hi', colors.accentSecondary)
  setThemeVar(root, '--theme-accent-hover', colors.accentSecondary)
  setThemeVar(root, '--theme-accent-muted', colors.accentGlow)
  setThemeVar(root, '--theme-accent-glow', colors.accentGlow)
  setThemeVar(root, '--theme-accent-grad', `linear-gradient(135deg, ${colors.accentPrimary} 0%, ${colors.accentSecondary} 100%)`)
  setThemeVar(root, '--theme-border', colors.borderPrimary)
  setThemeVar(root, '--theme-border-subtle', colors.borderPrimary)
  setThemeVar(root, '--theme-success', colors.success)
  setThemeVar(root, '--theme-warning', colors.warning)
  setThemeVar(root, '--theme-error', colors.danger)
  setThemeVar(root, '--theme-glass', colors.bgGlass)
  setThemeVar(root, '--theme-glass-hi', colors.bgGlass)
  setThemeVar(root, '--theme-glass-border', colors.borderPrimary)
  setThemeVar(root, '--theme-glass-border-hi', colors.borderAccent)
  setThemeVar(root, '--theme-shadow-sm', 'var(--shadow-sm)')
  setThemeVar(root, '--theme-shadow-md', 'var(--shadow-md)')
  setThemeVar(root, '--theme-shadow-lg', 'var(--shadow-lg)')
  setThemeVar(root, '--theme-nav-bg', colors.bgGlass)
  setThemeVar(root, '--theme-gradient-text-from', colors.accentPrimary)
  setThemeVar(root, '--theme-gradient-text-to', colors.accentSecondary)
  setThemeVar(root, '--theme-font-display', fonts.display)
  setThemeVar(root, '--theme-font-body', fonts.body)
  setThemeVar(root, '--theme-font-mono', "'JetBrains Mono', ui-monospace, monospace")

  root.setAttribute('data-noise', colors.noise ? 'true' : 'false')
  root.setAttribute('data-theme', theme.id)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', colors.bgPrimary)

  document.body.style.backgroundColor = colors.bgPrimary
  document.body.style.color = colors.textPrimary

  localStorage.setItem('strengthtracker_theme', theme.id)
}

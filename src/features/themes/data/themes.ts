import {
  DEFAULT_THEME_ID as DESIGN_DEFAULT_THEME_ID,
  themes as designThemes,
  type Theme as DesignTheme,
} from '@/styles/themes'

export interface Theme {
  id: string
  name: string
  nameNL: string
  isDark: boolean
  emoji?: string
  category?: DesignTheme['category']
  colors?: DesignTheme['colors']
  fonts?: DesignTheme['fonts']
  preview: {
    bg: string
    card: string
    accent: string
    text: string
  }
  vars: Record<string, string>
}

function toVars(theme: DesignTheme): Record<string, string> {
  const { colors, fonts } = theme

  return {
    '--bg-primary': colors.bgPrimary,
    '--bg-secondary': colors.bgSecondary,
    '--bg-tertiary': colors.bgTertiary,
    '--bg-glass': colors.bgGlass,
    '--border-primary': colors.borderPrimary,
    '--border-accent': colors.borderAccent,
    '--accent-primary': colors.accentPrimary,
    '--accent-secondary': colors.accentSecondary,
    '--accent-glow': colors.accentGlow,
    '--text-primary': colors.textPrimary,
    '--text-secondary': colors.textSecondary,
    '--text-muted': colors.textMuted,
    '--success': colors.success,
    '--warning': colors.warning,
    '--danger': colors.danger,
    '--gradient': colors.gradient,
    '--gradient-card': colors.gradientCard,
    '--font-display': fonts.display,
    '--font-body': fonts.body,
    '--theme-bg-primary': colors.bgPrimary,
    '--theme-bg-secondary': colors.bgSecondary,
    '--theme-bg-card': colors.bgGlass,
    '--theme-bg-input': colors.bgTertiary,
    '--theme-text-primary': colors.textPrimary,
    '--theme-text-secondary': colors.textSecondary,
    '--theme-text-muted': colors.textMuted,
    '--theme-text-faint': colors.textMuted,
    '--theme-accent': colors.accentPrimary,
    '--theme-accent-hi': colors.accentSecondary,
    '--theme-accent-hover': colors.accentSecondary,
    '--theme-accent-muted': colors.accentGlow,
    '--theme-accent-glow': colors.accentGlow,
    '--theme-accent-grad': `linear-gradient(135deg, ${colors.accentPrimary} 0%, ${colors.accentSecondary} 100%)`,
    '--theme-border': colors.borderPrimary,
    '--theme-border-subtle': colors.borderPrimary,
    '--theme-success': colors.success,
    '--theme-warning': colors.warning,
    '--theme-error': colors.danger,
    '--theme-glass': colors.bgGlass,
    '--theme-glass-hi': colors.bgGlass,
    '--theme-glass-border': colors.borderPrimary,
    '--theme-glass-border-hi': colors.borderAccent,
    '--theme-shadow-sm': 'var(--shadow-sm)',
    '--theme-shadow-md': 'var(--shadow-md)',
    '--theme-shadow-lg': 'var(--shadow-lg)',
    '--theme-nav-bg': colors.bgGlass,
    '--theme-gradient-text-from': colors.accentPrimary,
    '--theme-gradient-text-to': colors.accentSecondary,
    '--theme-font-display': fonts.display,
    '--theme-font-body': fonts.body,
    '--theme-font-mono': "'JetBrains Mono', ui-monospace, monospace",
  }
}

function toAppTheme(theme: DesignTheme): Theme {
  return {
    ...theme,
    nameNL: theme.name,
    isDark: theme.category !== 'light',
    preview: {
      bg: theme.colors.bgPrimary,
      card: theme.colors.bgSecondary,
      accent: theme.colors.accentPrimary,
      text: theme.colors.textPrimary,
    },
    vars: toVars(theme),
  }
}

export const themes: Theme[] = designThemes.map(toAppTheme)
export const DEFAULT_THEME_ID = DESIGN_DEFAULT_THEME_ID

export function getTheme(id: string): Theme {
  return themes.find(t => t.id === id) ?? themes[0]
}

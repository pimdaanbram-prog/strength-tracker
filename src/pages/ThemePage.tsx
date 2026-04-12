import { motion } from 'framer-motion'
import { Check, Palette, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
}

function ThemeCard({ theme, isActive, onSelect }: {
  theme: import('../data/themes').Theme
  isActive: boolean
  onSelect: () => void
}) {
  const p = theme.preview
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className="relative rounded-2xl overflow-hidden cursor-pointer border-0 p-0 text-left w-full"
      style={{
        outline: isActive ? `2px solid ${p.accent}` : '2px solid transparent',
        outlineOffset: 2,
        boxShadow: isActive ? `0 0 20px ${p.accent}40` : 'none',
      }}
    >
      {/* Preview thumbnail */}
      <div className="relative" style={{ background: p.bg, aspectRatio: '4/3', minHeight: 120 }}>
        {/* Fake app content */}
        <div className="absolute inset-2 flex flex-col gap-1.5 p-2">
          {/* Fake header */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md" style={{ background: p.accent, opacity: 0.9 }} />
            <div className="flex-1 h-2.5 rounded-full" style={{ background: p.text, opacity: 0.15 }} />
          </div>
          {/* Fake stat cards */}
          <div className="grid grid-cols-3 gap-1">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-lg p-1.5" style={{ background: p.card }}>
                <div className="w-4 h-4 rounded-md mb-1" style={{ background: p.accent, opacity: 0.5 + i * 0.1 }} />
                <div className="h-2 w-full rounded-full" style={{ background: p.text, opacity: 0.12 }} />
              </div>
            ))}
          </div>
          {/* Fake card */}
          <div className="rounded-xl flex-1 p-2 flex items-end" style={{ background: p.card }}>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg" style={{ background: p.accent }} />
              <div>
                <div className="h-2 w-16 rounded-full mb-1" style={{ background: p.text, opacity: 0.8 }} />
                <div className="h-1.5 w-10 rounded-full" style={{ background: p.text, opacity: 0.3 }} />
              </div>
            </div>
          </div>
        </div>
        {/* Active check */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: p.accent }}
          >
            <Check size={14} color="#fff" strokeWidth={3} />
          </motion.div>
        )}
        {/* Light/Dark badge */}
        <div
          className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
        >
          {theme.isDark
            ? <Moon size={9} color="#aaa" />
            : <Sun size={9} color="#aaa" />}
          <span style={{ color: '#ccc', fontSize: 9, fontWeight: 600 }}>
            {theme.isDark ? 'Dark' : 'Light'}
          </span>
        </div>
      </div>
      {/* Name */}
      <div
        className="px-3 py-2.5"
        style={{ background: p.card }}
      >
        <p className="text-sm font-semibold m-0 truncate" style={{ color: p.text }}>
          {theme.nameNL}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-3 h-3 rounded-full" style={{ background: p.accent }} />
          <p className="text-[10px] m-0" style={{ color: p.text, opacity: 0.5 }}>
            {p.accent.toUpperCase()}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

export default function ThemePage() {
  const { theme, themeId, setTheme, themes } = useTheme()

  const darkThemes = themes.filter(t => t.isDark)
  const lightThemes = themes.filter(t => !t.isDark)

  return (
    <>
      <Header title="Thema's" showBack />
      <PageWrapper>
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Header info */}
          <motion.div variants={itemVariants} className="mb-6">
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'var(--theme-accent-muted)', border: '1px solid var(--theme-accent)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--theme-accent)' }}
              >
                <Palette size={18} color="#fff" />
              </div>
              <div>
                <p className="text-sm font-bold m-0" style={{ color: 'var(--theme-text-primary)' }}>
                  Actief thema: {theme.nameNL}
                </p>
                <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                  Tik een thema aan om direct te wisselen
                </p>
              </div>
            </div>
          </motion.div>

          {/* Dark Themes */}
          <motion.div variants={itemVariants} className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <Moon size={14} style={{ color: 'var(--theme-text-muted)' }} />
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Donkere thema's
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {darkThemes.map(t => (
              <ThemeCard
                key={t.id}
                theme={t}
                isActive={themeId === t.id}
                onSelect={() => setTheme(t.id)}
              />
            ))}
          </div>

          {/* Light Themes */}
          <motion.div variants={itemVariants} className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <Sun size={14} style={{ color: 'var(--theme-text-muted)' }} />
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Lichte thema's
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {lightThemes.map(t => (
              <ThemeCard
                key={t.id}
                theme={t}
                isActive={themeId === t.id}
                onSelect={() => setTheme(t.id)}
              />
            ))}
          </div>

          {/* Current theme accent preview */}
          <motion.div variants={itemVariants}>
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'var(--theme-bg-card)',
                border: '1px solid var(--theme-border)',
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Kleurenpalette
              </p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Accent', color: 'var(--theme-accent)' },
                  { label: 'Succes', color: 'var(--theme-success)' },
                  { label: 'Waarschuwing', color: 'var(--theme-warning)' },
                  { label: 'Fout', color: 'var(--theme-error)' },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border" style={{ background: color, borderColor: 'var(--theme-border)' }} />
                    <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </PageWrapper>
    </>
  )
}

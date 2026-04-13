import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Palette, Moon, Sun, Plus, Trash2, Sliders } from 'lucide-react'
import { useTheme, MAX_CUSTOM_THEMES } from '../contexts/ThemeContext'
import type { Theme } from '../data/themes'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

// ─── Colour helpers ────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ]
}

function adjustL(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex)
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${[r + delta, g + delta, b + delta].map(c).map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function buildCustomTheme(
  name: string,
  bgHex: string,
  accentHex: string,
  isDark: boolean,
  id?: string,
): Theme {
  const [ar, ag, ab] = hexToRgb(accentHex)
  const [nr, ng, nb] = hexToRgb(adjustL(bgHex, -5))
  const bgCard = adjustL(bgHex, isDark ? 12 : -6)
  return {
    id: id ?? `custom-${Date.now()}`,
    name,
    nameNL: name,
    isDark,
    preview: {
      bg: bgHex,
      card: bgCard,
      accent: accentHex,
      text: isDark ? '#FAFAFA' : '#0f172a',
    },
    vars: {
      '--theme-bg-primary': adjustL(bgHex, -5),
      '--theme-bg-secondary': bgHex,
      '--theme-bg-card': bgCard,
      '--theme-bg-input': adjustL(bgHex, isDark ? 20 : -12),
      '--theme-text-primary': isDark ? '#FAFAFA' : '#0f172a',
      '--theme-text-secondary': isDark ? '#888888' : '#475569',
      '--theme-text-muted': isDark ? '#444444' : '#94a3b8',
      '--theme-accent': accentHex,
      '--theme-accent-hover': adjustL(accentHex, -18),
      '--theme-accent-muted': `rgba(${ar},${ag},${ab},0.12)`,
      '--theme-accent-glow': `rgba(${ar},${ag},${ab},0.30)`,
      '--theme-border': adjustL(bgHex, isDark ? 22 : -20),
      '--theme-border-subtle': adjustL(bgHex, isDark ? 32 : -30),
      '--theme-success': isDark ? '#00E5A0' : '#10b981',
      '--theme-warning': isDark ? '#FFB300' : '#f59e0b',
      '--theme-error': isDark ? '#FF3B3B' : '#ef4444',
      '--theme-glass': isDark ? `rgba(${ar},${ag},${ab},0.05)` : 'rgba(255,255,255,0.7)',
      '--theme-glass-border': isDark ? `rgba(${ar},${ag},${ab},0.11)` : 'rgba(0,0,0,0.08)',
      '--theme-shadow-sm': isDark ? '0 2px 8px rgba(0,0,0,0.55)' : '0 2px 8px rgba(0,0,0,0.07)',
      '--theme-shadow-md': isDark ? '0 8px 24px rgba(0,0,0,0.65)' : '0 8px 24px rgba(0,0,0,0.11)',
      '--theme-shadow-lg': isDark ? '0 16px 48px rgba(0,0,0,0.75)' : '0 16px 48px rgba(0,0,0,0.16)',
      '--theme-nav-bg': `rgba(${nr},${ng},${nb},0.95)`,
      '--theme-gradient-text-from': accentHex,
      '--theme-gradient-text-to': adjustL(accentHex, isDark ? 36 : -24),
    },
  }
}

// ─── Animation variants ────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
}

// ─── Theme card ────────────────────────────────────────────────────────
function ThemeCard({
  theme, isActive, onSelect, onDelete,
}: {
  theme: Theme
  isActive: boolean
  onSelect: () => void
  onDelete?: () => void
}) {
  const p = theme.preview
  return (
    <motion.div
      variants={itemVariants}
      layout
      className="relative rounded-2xl overflow-hidden"
      style={{
        outline: isActive ? `2px solid ${p.accent}` : '2px solid transparent',
        outlineOffset: 2,
        boxShadow: isActive
          ? `0 0 0 1px ${p.accent}60, 0 0 28px ${p.accent}35`
          : 'none',
      }}
    >
      <motion.button
        whileHover={{ scale: 1.03, y: -3 }}
        whileTap={{ scale: 0.96 }}
        onClick={onSelect}
        className="relative w-full cursor-pointer border-0 p-0 text-left block"
      >
        {/* Preview area */}
        <div className="relative" style={{ background: p.bg, aspectRatio: '4/3', minHeight: 120 }}>
          <div className="absolute inset-2 flex flex-col gap-1.5 p-2">
            {/* Fake header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-md" style={{ background: p.accent, opacity: 0.9 }} />
              <div className="flex-1 h-2.5 rounded-full" style={{ background: p.text, opacity: 0.15 }} />
            </div>
            {/* Fake stat cards */}
            <div className="grid grid-cols-3 gap-1">
              {[0.5, 0.65, 0.8].map((op, i) => (
                <div key={i} className="rounded-lg p-1.5" style={{ background: p.card }}>
                  <div className="w-4 h-4 rounded-md mb-1" style={{ background: p.accent, opacity: op }} />
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
            {/* Fake accent button */}
            <div
              className="h-5 rounded-lg flex items-center justify-center"
              style={{ background: p.accent }}
            >
              <div className="h-2 w-12 rounded-full bg-white opacity-60" />
            </div>
          </div>

          {/* Active checkmark */}
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
              style={{ background: p.accent, boxShadow: `0 0 12px ${p.accent}80` }}
            >
              <Check size={14} color="#fff" strokeWidth={3} />
            </motion.div>
          )}

          {/* Light/Dark badge */}
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
          >
            {theme.isDark
              ? <Moon size={9} color="#ccc" />
              : <Sun size={9} color="#ccc" />}
            <span style={{ color: '#ccc', fontSize: 9, fontWeight: 600 }}>
              {theme.isDark ? 'Dark' : 'Light'}
            </span>
          </div>
        </div>

        {/* Name row */}
        <div className="px-3 py-2.5" style={{ background: p.card }}>
          <p className="text-sm font-semibold m-0 truncate" style={{ color: p.text }}>
            {theme.nameNL}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: p.accent }} />
            <p className="text-[10px] m-0 font-mono" style={{ color: p.text, opacity: 0.45 }}>
              {p.accent.toUpperCase()}
            </p>
          </div>
        </div>
      </motion.button>

      {/* Delete button for custom themes */}
      {onDelete && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-0 z-10"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          title="Verwijder thema"
        >
          <Trash2 size={10} color="#ff6b6b" />
        </motion.button>
      )}
    </motion.div>
  )
}

// ─── Mini live preview ─────────────────────────────────────────────────
function MiniPreview({ theme }: { theme: Theme }) {
  const p = theme.preview
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: p.accent + '40' }}
    >
      <div style={{ background: p.bg, padding: 12 }}>
        {/* Header bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg" style={{ background: p.accent }} />
          <div className="flex-1">
            <div className="h-2.5 w-20 rounded-full mb-1" style={{ background: p.text, opacity: 0.8 }} />
            <div className="h-1.5 w-12 rounded-full" style={{ background: p.text, opacity: 0.3 }} />
          </div>
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[0.5, 0.65, 1].map((op, i) => (
            <div key={i} className="rounded-lg p-2" style={{ background: p.card }}>
              <div className="h-4 w-4 rounded-md mb-1.5" style={{ background: p.accent, opacity: op }} />
              <div className="h-3 w-full rounded-full" style={{ background: p.text, opacity: 0.7 }} />
              <div className="h-2 w-8 rounded-full mt-1" style={{ background: p.text, opacity: 0.25 }} />
            </div>
          ))}
        </div>
        {/* Button */}
        <div
          className="h-7 rounded-xl flex items-center justify-center"
          style={{ background: p.accent }}
        >
          <div className="h-2.5 w-16 rounded-full bg-white opacity-70" />
        </div>
      </div>
    </div>
  )
}

// ─── Custom theme builder ──────────────────────────────────────────────
function CustomThemeBuilder() {
  const { customThemes, saveCustomTheme, setTheme, themeId } = useTheme()
  const [name, setName] = useState('Mijn Thema')
  const [bgColor, setBgColor] = useState('#1a1a2e')
  const [accentColor, setAccentColor] = useState('#e94560')
  const [isDark, setIsDark] = useState(true)
  const [saved, setSaved] = useState(false)

  const previewTheme = buildCustomTheme(name || 'Mijn Thema', bgColor, accentColor, isDark)
  const isFull = customThemes.length >= MAX_CUSTOM_THEMES

  function handleSave() {
    const t = buildCustomTheme(name || 'Mijn Thema', bgColor, accentColor, isDark)
    saveCustomTheme(t)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setTheme(t.id)
  }

  return (
    <motion.div variants={itemVariants} className="mb-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Sliders size={14} style={{ color: 'var(--theme-text-muted)' }} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          Maak je eigen thema
        </span>
        <span
          className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{
            background: 'var(--theme-accent-muted)',
            color: 'var(--theme-accent)',
          }}
        >
          {customThemes.length}/{MAX_CUSTOM_THEMES}
        </span>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
      >
        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
              style={{ color: 'var(--theme-text-muted)' }}>
              Naam
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={24}
              placeholder="Mijn Thema"
              className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none border"
              style={{
                background: 'var(--theme-bg-input)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
              }}
            />
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
                style={{ color: 'var(--theme-text-muted)' }}>
                Achtergrond
              </label>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 border"
                style={{
                  background: 'var(--theme-bg-input)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  style={{ outline: 'none' }}
                />
                <span className="text-xs font-mono" style={{ color: 'var(--theme-text-secondary)' }}>
                  {bgColor.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
                style={{ color: 'var(--theme-text-muted)' }}>
                Accentkleur
              </label>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 border"
                style={{
                  background: 'var(--theme-bg-input)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  style={{ outline: 'none' }}
                />
                <span className="text-xs font-mono" style={{ color: 'var(--theme-text-secondary)' }}>
                  {accentColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Dark/light toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDark
                ? <Moon size={14} style={{ color: 'var(--theme-text-secondary)' }} />
                : <Sun size={14} style={{ color: 'var(--theme-text-secondary)' }} />}
              <span className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                {isDark ? 'Donkere basis' : 'Lichte basis'}
              </span>
            </div>
            <button
              onClick={() => setIsDark(d => !d)}
              className="relative w-12 h-6 rounded-full border-0 cursor-pointer transition-colors"
              style={{
                background: isDark ? 'var(--theme-accent)' : 'var(--theme-border-subtle)',
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: isDark ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Live preview */}
        <div className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--theme-text-muted)' }}>
            Live preview
          </p>
          <MiniPreview theme={previewTheme} />
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Save button */}
        <div className="p-4">
          {isFull && (
            <p className="text-[11px] mb-3 text-center" style={{ color: 'var(--theme-warning)' }}>
              Maximum van {MAX_CUSTOM_THEMES} opgeslagen thema's bereikt. Verwijder er één om op te slaan.
            </p>
          )}
          <motion.button
            whileHover={{ scale: isFull ? 1 : 1.02 }}
            whileTap={{ scale: isFull ? 1 : 0.97 }}
            onClick={handleSave}
            disabled={isFull}
            className="w-full py-3 rounded-xl font-bold text-sm text-white border-0 cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: isFull
                ? 'var(--theme-border)'
                : saved
                ? 'var(--theme-success)'
                : `linear-gradient(135deg, ${previewTheme.preview.accent}, ${adjustL(previewTheme.preview.accent, 30)})`,
              opacity: isFull ? 0.5 : 1,
              transition: 'background 0.3s ease',
              color: isFull ? 'var(--theme-text-muted)' : '#fff',
            }}
          >
            {saved ? (
              <>
                <Check size={16} />
                Opgeslagen en toegepast!
              </>
            ) : (
              <>
                <Plus size={16} />
                Opslaan als thema
              </>
            )}
          </motion.button>
          {themeId === previewTheme.id && (
            <p className="text-[11px] text-center mt-2" style={{ color: 'var(--theme-text-muted)' }}>
              Dit thema is actief
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section label helper ──────────────────────────────────────────────
function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants} className="mb-3">
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color: 'var(--theme-text-muted)' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>
          {children}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────
export default function ThemePage() {
  const { theme, themeId, setTheme, themes, customThemes, deleteCustomTheme } = useTheme()

  const darkThemes = themes.filter(t => t.isDark && !t.id.startsWith('custom-'))
  const lightThemes = themes.filter(t => !t.isDark && !t.id.startsWith('custom-'))

  return (
    <>
      <Header title="Thema's" showBack />
      <PageWrapper>
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Active theme info */}
          <motion.div variants={itemVariants} className="mb-6">
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{
                background: 'var(--theme-accent-muted)',
                border: '1px solid var(--theme-accent)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--theme-accent)' }}
              >
                <Palette size={18} color="#fff" />
              </div>
              <div>
                <p className="text-sm font-bold m-0" style={{ color: 'var(--theme-text-primary)' }}>
                  Actief: {theme.nameNL}
                </p>
                <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                  Tik een thema aan om direct te wisselen
                </p>
              </div>
              {/* Colour swatches */}
              <div className="ml-auto flex gap-1.5 shrink-0">
                {['--theme-accent', '--theme-success', '--theme-warning', '--theme-error'].map(v => (
                  <div
                    key={v}
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ background: `var(${v})` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Dark themes */}
          <SectionLabel icon={Moon}>Donkere thema's ({darkThemes.length})</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <AnimatePresence mode="popLayout">
              {darkThemes.map(t => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  isActive={themeId === t.id}
                  onSelect={() => setTheme(t.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Light themes */}
          <SectionLabel icon={Sun}>Lichte thema's ({lightThemes.length})</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <AnimatePresence mode="popLayout">
              {lightThemes.map(t => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  isActive={themeId === t.id}
                  onSelect={() => setTheme(t.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Custom themes */}
          {customThemes.length > 0 && (
            <>
              <SectionLabel icon={Sliders}>Mijn thema's ({customThemes.length})</SectionLabel>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <AnimatePresence mode="popLayout">
                  {customThemes.map(t => (
                    <ThemeCard
                      key={t.id}
                      theme={t}
                      isActive={themeId === t.id}
                      onSelect={() => setTheme(t.id)}
                      onDelete={() => deleteCustomTheme(t.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Colour palette preview */}
          <motion.div variants={itemVariants} className="mb-8">
            <div
              className="p-4 rounded-2xl"
              style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--theme-text-muted)' }}>
                Kleurenpalette – {theme.nameNL}
              </p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Accent', v: '--theme-accent' },
                  { label: 'Succes', v: '--theme-success' },
                  { label: 'Waarschuwing', v: '--theme-warning' },
                  { label: 'Fout', v: '--theme-error' },
                  { label: 'Tekst', v: '--theme-text-primary' },
                  { label: 'Kaart', v: '--theme-bg-card' },
                ].map(({ label, v }) => (
                  <div key={v} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-8 h-8 rounded-xl border"
                      style={{ background: `var(${v})`, borderColor: 'var(--theme-border)' }}
                    />
                    <span className="text-[9px] font-semibold" style={{ color: 'var(--theme-text-muted)' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Custom theme builder */}
          <CustomThemeBuilder />

        </motion.div>
      </PageWrapper>
    </>
  )
}

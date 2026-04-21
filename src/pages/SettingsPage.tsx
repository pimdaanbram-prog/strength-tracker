import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Palette, Dumbbell, Bell, Database, Info,
  ChevronRight, Download, Trash2, AlertTriangle, Weight, Plus, Minus, Check,
} from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import Modal from '../components/ui/Modal'
import { useAppStore } from '../store/appStore'
import type { WeightSettings } from '../store/appStore'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { getAchievableBarbellWeights } from '../utils/plateCalculator'

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Themed card wrapping a settings section */
function SettingsCard({
  icon, title, accent = 'var(--theme-accent)', children,
}: {
  icon: React.ReactNode
  title: string
  accent?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
        >
          {icon}
        </div>
        <h3
          className="text-xs font-bold uppercase tracking-widest m-0"
          style={{ color: 'var(--theme-text-muted)', letterSpacing: '0.1em' }}
        >
          {title}
        </h3>
      </div>
      <div className="h-px" style={{ background: 'var(--theme-border)' }} />
      {/* Rows */}
      <div className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
        {children}
      </div>
    </div>
  )
}

/** A single row inside a SettingsCard */
function SettingRow({
  label, description, children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold m-0" style={{ color: 'var(--theme-text-primary)' }}>
          {label}
        </p>
        {description && (
          <p className="text-[10px] m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

/** On/off toggle switch */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative rounded-full cursor-pointer border-0 transition-all"
      style={{
        width: 46,
        height: 26,
        background: checked ? 'var(--theme-accent)' : 'var(--theme-bg-input)',
        border: `1px solid ${checked ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
        boxShadow: checked ? '0 0 12px var(--theme-accent-glow)' : 'none',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <span
        className="absolute rounded-full"
        style={{
          width: 18,
          height: 18,
          top: 3,
          left: checked ? 23 : 3,
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  )
}

/** Small themed <select> */
function ThemedSelect({
  value, onChange, options,
}: {
  value: string | number
  onChange: (v: string) => void
  options: { label: string; value: string | number }[]
}) {
  return (
    <select
      value={String(value)}
      onChange={e => onChange(e.target.value)}
      className="rounded-xl px-3 py-2 text-sm font-semibold outline-none cursor-pointer"
      style={{
        background: 'var(--theme-bg-input)',
        border: '1px solid var(--theme-border)',
        color: 'var(--theme-text-primary)',
        colorScheme: 'dark',
      }}
    >
      {options.map(o => (
        <option key={String(o.value)} value={String(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/** kg / lbs segmented button */
function UnitToggle({
  value, onChange,
}: {
  value: 'kg' | 'lbs'
  onChange: (v: 'kg' | 'lbs') => void
}) {
  return (
    <div
      className="flex gap-0.5 p-1 rounded-xl"
      style={{ background: 'var(--theme-bg-input)', border: '1px solid var(--theme-border)' }}
    >
      {(['kg', 'lbs'] as const).map(u => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-0 transition-all"
          style={{
            background: value === u ? 'var(--theme-accent)' : 'transparent',
            color: value === u ? '#fff' : 'var(--theme-text-secondary)',
            boxShadow: value === u ? '0 2px 8px var(--theme-accent-glow)' : 'none',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {u}
        </button>
      ))}
    </div>
  )
}

// ─── Export helper ────────────────────────────────────────────────────────────

function exportAllData(zustandState: object) {
  // Collect all "st-*" localStorage keys
  const lsData: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    try { lsData[key] = JSON.parse(localStorage.getItem(key) ?? 'null') }
    catch { lsData[key] = localStorage.getItem(key) }
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    store: zustandState,
    localStorage: lsData,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `strength-tracker-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function deleteAllData() {
  // Clear all localStorage keys (st-* + Zustand persist key)
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) keysToRemove.push(key)
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
  window.location.reload()
}

// ─── Weight Settings Modal ────────────────────────────────────────────────────

const STANDARD_DUMBBELLS = [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 40, 45, 50]
const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]

function WeightSettingsModal({
  isOpen,
  onClose,
  current,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  current: WeightSettings
  onSave: (ws: WeightSettings) => void
}) {
  const [draft, setDraft] = useState<WeightSettings>(current)

  const setPlateCount = (plateWeight: number, count: number) => {
    setDraft(d => ({
      ...d,
      plates: d.plates.map(p => p.weight === plateWeight ? { ...p, count: Math.max(0, count) } : p),
    }))
  }

  const getPlateCount = (plateWeight: number) =>
    draft.plates.find(p => p.weight === plateWeight)?.count ?? 0

  const toggleDumbbell = (w: number) => {
    setDraft(d => ({
      ...d,
      dumbbells: d.dumbbells.includes(w)
        ? d.dumbbells.filter(x => x !== w)
        : [...d.dumbbells, w].sort((a, b) => a - b),
    }))
  }

  const barbellWeights = getAchievableBarbellWeights(draft)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Beschikbare Gewichten">
      <div className="space-y-5">

        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold m-0" style={{ color: 'var(--theme-text-primary)' }}>
              Slim filteren op gewichten
            </p>
            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              Adviezen afstemmen op jouw beschikbare gewichten
            </p>
          </div>
          <button
            role="switch"
            aria-checked={draft.enabled}
            onClick={() => setDraft(d => ({ ...d, enabled: !d.enabled }))}
            className="relative rounded-full cursor-pointer border-0 shrink-0 transition-all"
            style={{
              width: 46, height: 26,
              background: draft.enabled ? 'var(--theme-accent)' : 'var(--theme-bg-input)',
              border: `1px solid ${draft.enabled ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
            }}
          >
            <span
              className="absolute rounded-full"
              style={{
                width: 18, height: 18, top: 3,
                left: draft.enabled ? 23 : 3,
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                transition: 'left 0.2s ease',
              }}
            />
          </button>
        </div>

        <div className="h-px" style={{ background: 'var(--theme-border)' }} />

        {/* ── Barbell section ─────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{ color: 'var(--theme-text-muted)' }}>
            Stang &amp; Schijven
          </p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Stanggewicht</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setDraft(d => ({ ...d, barbellWeight: Math.max(0, d.barbellWeight - 2.5) }))}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}>
                <Minus size={13} />
              </button>
              <span className="text-sm font-bold w-14 text-center" style={{ color: 'var(--theme-text-primary)' }}>
                {draft.barbellWeight} kg
              </span>
              <button onClick={() => setDraft(d => ({ ...d, barbellWeight: d.barbellWeight + 2.5 }))}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}>
                <Plus size={13} />
              </button>
            </div>
          </div>

          <p className="text-xs mb-2 m-0" style={{ color: 'var(--theme-text-muted)' }}>
            Aantal schijven per type (totaal, niet per kant)
          </p>
          <div className="space-y-1.5">
            {PLATE_SIZES.map(pw => {
              const count = getPlateCount(pw)
              return (
                <div key={pw} className="flex items-center justify-between">
                  <span className="text-sm w-16" style={{ color: 'var(--theme-text-secondary)' }}>{pw} kg</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPlateCount(pw, count - 2)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                      style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}>
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-8 text-center" style={{ color: count > 0 ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }}>
                      {count}
                    </span>
                    <button onClick={() => setPlateCount(pw, count + 2)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                      style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {barbellWeights.length > 1 && (
            <div className="mt-2 p-2 rounded-xl" style={{ background: 'var(--theme-bg-input)' }}>
              <p className="text-[10px] mb-1 m-0" style={{ color: 'var(--theme-text-muted)' }}>
                Mogelijke stanggewichten:
              </p>
              <p className="text-xs m-0" style={{ color: 'var(--theme-text-secondary)' }}>
                {barbellWeights.slice(0, 12).join(' · ')}{barbellWeights.length > 12 ? ' …' : ''}
              </p>
            </div>
          )}
        </div>

        <div className="h-px" style={{ background: 'var(--theme-border)' }} />

        {/* ── Dumbbells ─────────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2 m-0" style={{ color: 'var(--theme-text-muted)' }}>
            Dumbbells
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STANDARD_DUMBBELLS.map(w => {
              const active = draft.dumbbells.includes(w)
              return (
                <button
                  key={w}
                  onClick={() => toggleDumbbell(w)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border-0 transition-all"
                  style={{
                    background: active ? 'var(--theme-accent-muted)' : 'var(--theme-bg-input)',
                    color: active ? 'var(--theme-accent)' : 'var(--theme-text-muted)',
                    border: `1px solid ${active ? 'var(--theme-accent-glow)' : 'var(--theme-border)'}`,
                  }}
                >
                  {w}
                </button>
              )
            })}
          </div>
        </div>

        <div className="h-px" style={{ background: 'var(--theme-border)' }} />

        {/* ── Machine ───────────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{ color: 'var(--theme-text-muted)' }}>
            Machines &amp; Kabels
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Stapgrootte</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setDraft(d => ({ ...d, machineStep: Math.max(1, d.machineStep - 2.5) }))}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}>
                <Minus size={12} />
              </button>
              <span className="text-sm font-bold w-14 text-center" style={{ color: 'var(--theme-text-primary)' }}>
                {draft.machineStep} kg
              </span>
              <button onClick={() => setDraft(d => ({ ...d, machineStep: d.machineStep + 2.5 }))}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}>
                <Plus size={12} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Maximum</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setDraft(d => ({ ...d, machineMax: Math.max(d.machineStep, d.machineMax - 10) }))}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}>
                <Minus size={12} />
              </button>
              <span className="text-sm font-bold w-14 text-center" style={{ color: 'var(--theme-text-primary)' }}>
                {draft.machineMax} kg
              </span>
              <button onClick={() => setDraft(d => ({ ...d, machineMax: d.machineMax + 10 }))}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}>
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Save / Cancel ─────────────────────────────────── */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm cursor-pointer border-0"
            style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }}
          >
            Annuleren
          </button>
          <button
            onClick={() => { onSave(draft); onClose() }}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm cursor-pointer border-0 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))', color: '#fff' }}
          >
            <Check size={15} /> Opslaan
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme }          = useTheme()
  const settings           = useAppStore(s => s.settings)
  const updateSettings     = useAppStore(s => s.updateSettings)
  const profiles           = useAppStore(s => s.profiles)
  const language           = useAppStore(s => s.language)
  const { showSuccess }    = useToast()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
  }

  return (
    <>
      <Header title="INSTELLINGEN" showBack />
      <PageWrapper>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="flex items-center gap-3 mb-6"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.2)' }}
          >
            <Info size={22} style={{ color: 'var(--theme-accent)' }} />
          </div>
          <div>
            <h2 className="text-2xl tracking-wider m-0" style={{ color: 'var(--theme-text-primary)' }}>
              INSTELLINGEN
            </h2>
            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              Uiterlijk · training · data
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >

          {/* ─── 1. Uiterlijk ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={<Palette size={15} style={{ color: '#A855F7' }} />}
              title="Uiterlijk"
              accent="#A855F7"
            >
              <SettingRow
                label="Thema"
                description={theme.nameNL ?? theme.name}
              >
                <button
                  onClick={() => navigate('/themes')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 transition-all"
                  style={{
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.25)',
                    color: '#A855F7',
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: theme.preview.accent }}
                  />
                  Kiezen
                  <ChevronRight size={13} />
                </button>
              </SettingRow>
            </SettingsCard>
          </motion.div>

          {/* ─── 2. Training ──────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={<Dumbbell size={15} style={{ color: 'var(--theme-accent)' }} />}
              title="Training"
            >
              <SettingRow
                label="Standaard rusttimer"
                description="Automatisch ingesteld na een set"
              >
                <ThemedSelect
                  value={settings.defaultRestSeconds}
                  onChange={v => updateSettings({ defaultRestSeconds: +v })}
                  options={[
                    { label: '30 sec', value: 30  },
                    { label: '60 sec', value: 60  },
                    { label: '90 sec', value: 90  },
                    { label: '2 min',  value: 120 },
                    { label: '3 min',  value: 180 },
                  ]}
                />
              </SettingRow>

              <SettingRow
                label="Gewichtsstappen"
                description="Stapgrootte bij gewicht verhogen/verlagen"
              >
                <ThemedSelect
                  value={settings.weightStep}
                  onChange={v => updateSettings({ weightStep: +v })}
                  options={[
                    { label: '0.5 kg', value: 0.5 },
                    { label: '1 kg',   value: 1   },
                    { label: '2.5 kg', value: 2.5 },
                    { label: '5 kg',   value: 5   },
                  ]}
                />
              </SettingRow>

              <SettingRow
                label="Gewichtseenheid"
                description="kg of lbs voor alle gewichten"
              >
                <UnitToggle
                  value={settings.weightUnit}
                  onChange={v => updateSettings({ weightUnit: v })}
                />
              </SettingRow>
            </SettingsCard>
          </motion.div>

          {/* ─── 3. Beschikbare gewichten ─────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={<Weight size={15} style={{ color: '#00C9FF' }} />}
              title="Beschikbare Gewichten"
              accent="#00C9FF"
            >
              <SettingRow
                label="Mijn gewichten"
                description={settings.weightSettings?.enabled
                  ? `Actief — ${settings.weightSettings.dumbbells.length} dumbbells, stang ${settings.weightSettings.barbellWeight}kg`
                  : 'Adviezen aanpassen op beschikbare gewichten'
                }
              >
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 transition-all"
                  style={{
                    background: 'rgba(0,201,255,0.1)',
                    border: '1px solid rgba(0,201,255,0.25)',
                    color: '#00C9FF',
                  }}
                >
                  {settings.weightSettings?.enabled && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: '#00E5A0' }}
                    />
                  )}
                  Instellen
                  <ChevronRight size={13} />
                </button>
              </SettingRow>
            </SettingsCard>
          </motion.div>

          {/* ─── 4. Notificaties ──────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={<Bell size={15} style={{ color: '#FFB300' }} />}
              title="Notificaties"
              accent="#FFB300"
            >
              <SettingRow
                label="Geluid"
                description="Piepgeluid bij einde rusttimer"
              >
                <Toggle
                  checked={settings.soundEnabled}
                  onChange={v => updateSettings({ soundEnabled: v })}
                />
              </SettingRow>

              <SettingRow
                label="Trillen"
                description="Vibratie bij einde rusttimer"
              >
                <Toggle
                  checked={settings.hapticEnabled}
                  onChange={v => updateSettings({ hapticEnabled: v })}
                />
              </SettingRow>
            </SettingsCard>
          </motion.div>

          {/* ─── 5. Data ──────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={<Database size={15} style={{ color: '#00C060' }} />}
              title="Data"
              accent="#00C060"
            >
              {/* Export */}
              <SettingRow
                label="Exporteer mijn data"
                description="Download al je data als JSON-bestand"
              >
                <button
                  onClick={() => {
                    exportAllData({ profiles, settings, language })
                    showSuccess('Data geëxporteerd', 'Bestand wordt gedownload')
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 transition-all"
                  style={{
                    background: 'rgba(0,192,96,0.1)',
                    border: '1px solid rgba(0,192,96,0.25)',
                    color: '#00C060',
                  }}
                >
                  <Download size={13} />
                  Export
                </button>
              </SettingRow>

              {/* Delete */}
              <SettingRow
                label="Verwijder al mijn data"
                description="Wist alle trainingen, metingen en instellingen"
              >
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 transition-all"
                  style={{
                    background: 'rgba(255,59,59,0.1)',
                    border: '1px solid rgba(255,59,59,0.25)',
                    color: 'var(--theme-error)',
                  }}
                >
                  <Trash2 size={13} />
                  Wissen
                </button>
              </SettingRow>
            </SettingsCard>
          </motion.div>

          {/* ─── 6. Over ──────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={<Info size={15} style={{ color: 'var(--theme-text-muted)' }} />}
              title="Over"
              accent="var(--theme-text-muted)"
            >
              <SettingRow label="Versie">
                <span className="text-xs font-bold" style={{ color: 'var(--theme-text-muted)' }}>
                  1.0.0
                </span>
              </SettingRow>

              <SettingRow label="Credits">
                <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-muted)' }}>
                  Gemaakt met ❤️ en Claude
                </span>
              </SettingRow>
            </SettingsCard>
          </motion.div>

        </motion.div>
      </PageWrapper>

      {/* ─── Weight settings modal ───────────────────────────────────────── */}
      <WeightSettingsModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        current={settings.weightSettings}
        onSave={ws => updateSettings({ weightSettings: ws })}
      />

      {/* ─── Delete confirmation modal ───────────────────────────────────── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Data Verwijderen"
      >
        <div className="flex items-start gap-3 mb-5 p-3.5 rounded-2xl" style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)' }}>
          <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--theme-error)' }} />
          <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--theme-text-secondary)' }}>
            <strong style={{ color: 'var(--theme-text-primary)' }}>Weet je het zeker?</strong>
            {' '}Dit verwijdert alle trainingen, metingen, profielen en instellingen.
            Dit kan <strong style={{ color: 'var(--theme-error)' }}>niet ongedaan</strong> worden gemaakt.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm cursor-pointer border-0"
            style={{
              background: 'var(--theme-bg-input)',
              color: 'var(--theme-text-secondary)',
              border: '1px solid var(--theme-border)',
            }}
          >
            Annuleren
          </button>
          <button
            onClick={deleteAllData}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm cursor-pointer border-0 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,59,59,0.15)',
              color: 'var(--theme-error)',
              border: '1px solid rgba(255,59,59,0.3)',
            }}
          >
            <Trash2 size={15} />
            Alles Verwijderen
          </button>
        </div>
      </Modal>
    </>
  )
}

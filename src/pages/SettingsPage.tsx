import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Palette, Dumbbell, Bell, Database, Info,
  ChevronRight, Download, Trash2, AlertTriangle,
} from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import Modal from '../components/ui/Modal'
import { useAppStore } from '../store/appStore'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'

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

          {/* ─── 3. Notificaties ──────────────────────────────────────────── */}
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

          {/* ─── 4. Data ──────────────────────────────────────────────────── */}
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

          {/* ─── 5. Over ──────────────────────────────────────────────────── */}
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight, Download, Trash2, AlertTriangle, Plus, Minus, Check,
} from 'lucide-react'
import Modal from '@/shared/components/ui/Modal'
import AmbientBackground from '@/shared/components/ui/AmbientBackground'
import { useAppStore, DEFAULT_WEIGHT_SETTINGS } from '@/shared/store/appStore'
import type { WeightSettings } from '@/shared/store/appStore'
import { useTheme } from '@/app/ThemeContext'
import { useToast } from '@/app/ToastContext'
import { getAchievableBarbellWeights } from '@/shared/utils/plateCalculator'

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-muted)', marginBottom: 10, paddingLeft: 4 }}>{title}</div>
      <div style={{ background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)', borderRadius: 18, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', gap: 16, borderBottom: '1px solid var(--theme-glass-border)' }}
      className="last:border-b-0" >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{label}</p>
        {description && <p style={{ fontSize: 10, margin: '2px 0 0', color: 'var(--theme-text-muted)' }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{ position: 'relative', width: 46, height: 26, borderRadius: 999, cursor: 'pointer', border: `1px solid ${checked ? 'var(--theme-accent)' : 'var(--theme-glass-border)'}`, background: checked ? 'var(--theme-accent)' : 'var(--theme-glass)', boxShadow: checked ? '0 0 12px var(--theme-accent-glow)' : 'none', transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s' }}>
      <span style={{ position: 'absolute', width: 18, height: 18, top: 3, left: checked ? 23 : 3, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.35)', transition: 'left 0.2s ease' }} />
    </button>
  )
}

function ThemedSelect({ value, onChange, options }: { value: string | number; onChange: (v: string) => void; options: { label: string; value: string | number }[] }) {
  return (
    <select value={String(value)} onChange={e => onChange(e.target.value)}
      style={{ borderRadius: 12, padding: '8px 12px', fontSize: 12, fontWeight: 600, outline: 'none', cursor: 'pointer', background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)', color: 'var(--theme-text-primary)', colorScheme: 'dark' }}>
      {options.map(o => (
        <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
      ))}
    </select>
  )
}

function UnitToggle({ value, onChange }: { value: 'kg' | 'lbs'; onChange: (v: 'kg' | 'lbs') => void }) {
  return (
    <div style={{ display: 'flex', gap: 2, padding: 4, borderRadius: 12, background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)' }}>
      {(['kg', 'lbs'] as const).map(u => (
        <button key={u} onClick={() => onChange(u)}
          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 0, transition: 'background 0.15s, color 0.15s', background: value === u ? 'var(--theme-accent)' : 'transparent', color: value === u ? '#fff' : 'var(--theme-text-secondary)', boxShadow: value === u ? '0 2px 8px var(--theme-accent-glow)' : 'none' }}>
          {u}
        </button>
      ))}
    </div>
  )
}

function exportAllData(zustandState: object) {
  const lsData: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    try { lsData[key] = JSON.parse(localStorage.getItem(key) ?? 'null') }
    catch { lsData[key] = localStorage.getItem(key) }
  }
  const payload = { exportedAt: new Date().toISOString(), appVersion: '1.0.0', store: zustandState, localStorage: lsData }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `strength-tracker-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

function deleteAllData() {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i); if (key) keysToRemove.push(key)
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
  window.location.reload()
}

const STANDARD_DUMBBELLS = [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 40, 45, 50]
const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]

function WeightSettingsModal({ isOpen, onClose, current, onSave }: { isOpen: boolean; onClose: () => void; current: WeightSettings; onSave: (ws: WeightSettings) => void }) {
  const [draft, setDraft] = useState<WeightSettings>(current)
  const setPlateCount = (plateWeight: number, count: number) => setDraft(d => ({ ...d, plates: d.plates.map(p => p.weight === plateWeight ? { ...p, count: Math.max(0, count) } : p) }))
  const getPlateCount = (plateWeight: number) => draft.plates.find(p => p.weight === plateWeight)?.count ?? 0
  const toggleDumbbell = (w: number) => setDraft(d => ({ ...d, dumbbells: d.dumbbells.includes(w) ? d.dumbbells.filter(x => x !== w) : [...d.dumbbells, w].sort((a, b) => a - b) }))
  const barbellWeights = getAchievableBarbellWeights(draft)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Beschikbare Gewichten">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold m-0" style={{ color: 'var(--theme-text-primary)' }}>Slim filteren op gewichten</p>
            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>Adviezen afstemmen op jouw beschikbare gewichten</p>
          </div>
          <button role="switch" aria-checked={draft.enabled} onClick={() => setDraft(d => ({ ...d, enabled: !d.enabled }))}
            style={{ position: 'relative', width: 46, height: 26, borderRadius: 999, cursor: 'pointer', border: `1px solid ${draft.enabled ? 'var(--theme-accent)' : 'var(--theme-glass-border)'}`, background: draft.enabled ? 'var(--theme-accent)' : 'var(--theme-glass)', flexShrink: 0 }}>
            <span style={{ position: 'absolute', width: 18, height: 18, top: 3, left: draft.enabled ? 23 : 3, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.35)', transition: 'left 0.2s ease' }} />
          </button>
        </div>
        <div className="h-px" style={{ background: 'var(--theme-glass-border)' }} />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{ color: 'var(--theme-text-muted)' }}>Stang &amp; Schijven</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Stanggewicht</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setDraft(d => ({ ...d, barbellWeight: Math.max(0, d.barbellWeight - 2.5) }))} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 0, background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)' }}><Minus size={13} /></button>
              <span className="text-sm font-bold w-14 text-center" style={{ color: 'var(--theme-text-primary)' }}>{draft.barbellWeight} kg</span>
              <button onClick={() => setDraft(d => ({ ...d, barbellWeight: d.barbellWeight + 2.5 }))} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 0, background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)' }}><Plus size={13} /></button>
            </div>
          </div>
          <div className="space-y-1.5">
            {PLATE_SIZES.map(pw => {
              const count = getPlateCount(pw)
              return (
                <div key={pw} className="flex items-center justify-between">
                  <span className="text-sm w-16" style={{ color: 'var(--theme-text-secondary)' }}>{pw} kg</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPlateCount(pw, count - 2)} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 0, background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)' }}><Minus size={12} /></button>
                    <span className="text-sm font-bold w-8 text-center" style={{ color: count > 0 ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }}>{count}</span>
                    <button onClick={() => setPlateCount(pw, count + 2)} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 0, background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)' }}><Plus size={12} /></button>
                  </div>
                </div>
              )
            })}
          </div>
          {barbellWeights.length > 1 && (
            <div className="mt-2 p-2 rounded-xl" style={{ background: 'var(--theme-glass)' }}>
              <p className="text-[10px] mb-1 m-0" style={{ color: 'var(--theme-text-muted)' }}>Mogelijke stanggewichten:</p>
              <p className="text-xs m-0" style={{ color: 'var(--theme-text-secondary)' }}>{barbellWeights.slice(0, 12).join(' · ')}{barbellWeights.length > 12 ? ' …' : ''}</p>
            </div>
          )}
        </div>
        <div className="h-px" style={{ background: 'var(--theme-glass-border)' }} />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2 m-0" style={{ color: 'var(--theme-text-muted)' }}>Dumbbells</p>
          <div className="flex flex-wrap gap-1.5">
            {STANDARD_DUMBBELLS.map(w => {
              const active = draft.dumbbells.includes(w)
              return (
                <button key={w} onClick={() => toggleDumbbell(w)}
                  style={{ padding: '6px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${active ? 'var(--theme-accent-glow)' : 'var(--theme-glass-border)'}`, background: active ? 'var(--theme-accent-muted)' : 'var(--theme-glass)', color: active ? 'var(--theme-accent)' : 'var(--theme-text-muted)', transition: 'all 0.15s' }}>
                  {w}
                </button>
              )
            })}
          </div>
        </div>
        <div className="h-px" style={{ background: 'var(--theme-glass-border)' }} />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{ color: 'var(--theme-text-muted)' }}>Machines &amp; Kabels</p>
          {[
            { label: 'Stapgrootte', value: draft.machineStep, onMinus: () => setDraft(d => ({ ...d, machineStep: Math.max(1, d.machineStep - 2.5) })), onPlus: () => setDraft(d => ({ ...d, machineStep: d.machineStep + 2.5 })) },
            { label: 'Maximum',    value: draft.machineMax,  onMinus: () => setDraft(d => ({ ...d, machineMax: Math.max(d.machineStep, d.machineMax - 10) })), onPlus: () => setDraft(d => ({ ...d, machineMax: d.machineMax + 10 })) },
          ].map(({ label, value, onMinus, onPlus }) => (
            <div key={label} className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{label}</span>
              <div className="flex items-center gap-2">
                <button onClick={onMinus} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 0, background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)' }}><Minus size={12} /></button>
                <span className="text-sm font-bold w-14 text-center" style={{ color: 'var(--theme-text-primary)' }}>{value} kg</span>
                <button onClick={onPlus} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 0, background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)' }}><Plus size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} style={{ flex: 1, padding: '14px 18px', borderRadius: 16, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: '1px solid var(--theme-glass-border)', background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)' }}>Annuleren</button>
          <button onClick={() => { onSave(draft); onClose() }} style={{ flex: 1, padding: '14px 18px', borderRadius: 16, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--theme-accent-grad)', color: '#fff' }}>
            <Check size={15} /> Opslaan
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Accent presets ──────────────────────────────────────────────────────────

const ACCENT_PRESETS = [
  { id: 'default-dark',      name: 'Tangerine',  accent: '#FF7A1F', hi: '#FFB020' },
  { id: 'midnight-purple',   name: 'Iris',       accent: '#A855F7', hi: '#C084FC' },
  { id: 'deep-ocean',        name: 'Electric',   accent: '#3D7CFF', hi: '#00D9FF' },
  { id: 'forest-night',      name: 'Neon',       accent: '#3EE8A8', hi: '#9CFF4A' },
  { id: 'crimson-dark',      name: 'Magma',      accent: '#FF3D6E', hi: '#FF7A1F' },
  { id: 'arctic-blue',       name: 'Arctic',     accent: '#A0E9FF', hi: '#E0F4FF' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, themeId, setTheme, themes } = useTheme()
  const settings       = useAppStore(s => s.settings)
  const updateSettings = useAppStore(s => s.updateSettings)
  const profiles       = useAppStore(s => s.profiles)
  const language       = useAppStore(s => s.language)
  const { showSuccess } = useToast()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
      <AmbientBackground intensity={0.6} />
      <div className="relative z-10">

        {/* ── Sticky header ─────────────────────────────────────────────── */}
        <div className="sticky top-0 z-40 px-4 py-3.5"
          style={{ background: 'rgba(6,6,10,0.6)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--theme-glass-border)' }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Instellingen</span>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-5"
          style={{ paddingBottom: 'calc(max(4.5rem, env(safe-area-inset-bottom)) + 4rem)' }}>

          {/* Profile card */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 24 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 20, marginBottom: 24, background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--theme-accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px var(--theme-accent-glow)', fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'var(--theme-font-display)' }}>
              {profiles[0]?.name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{profiles[0]?.name || 'Profiel'}</div>
              <div style={{ fontSize: 10, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)', marginTop: 2 }}>
                {profiles.length} {profiles.length === 1 ? 'profiel' : 'profielen'} · {theme.nameNL ?? theme.name}
              </div>
            </div>
            <button onClick={() => navigate('/profiles')}
              style={{ padding: '8px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid var(--theme-glass-border)', background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-font-mono)', letterSpacing: '0.06em' }}>
              Beheren
            </button>
          </motion.div>

          <motion.div className="flex flex-col gap-0"
            initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>

            {/* ─── Accent kleur ────────────────────────────────────────── */}
            <motion.div variants={itemVariants} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-muted)', marginBottom: 10, paddingLeft: 4 }}>Accent kleur</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {ACCENT_PRESETS.map(preset => {
                  const isActive = themeId === preset.id || (themeId === 'default-dark' && preset.id === 'default-dark')
                  const found = themes.find(t => t.id === preset.id)
                  const displayAccent = found?.vars['--theme-accent'] ?? preset.accent
                  const displayHi = found?.vars['--theme-accent-hi'] ?? preset.hi
                  return (
                    <motion.button key={preset.id} whileTap={{ scale: 0.95 }}
                      onClick={() => setTheme(preset.id)}
                      style={{ padding: '14px 10px', borderRadius: 16, cursor: 'pointer', border: `1.5px solid ${isActive ? displayAccent : 'var(--theme-glass-border)'}`, background: isActive ? `${displayAccent}18` : 'var(--theme-glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, background 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      {isActive && (
                        <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: displayAccent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={9} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                      {/* Gradient swatch */}
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, ${displayAccent}, ${displayHi})`, boxShadow: isActive ? `0 4px 16px ${displayAccent}60` : 'none' }} />
                      <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 600, color: isActive ? displayAccent : 'var(--theme-text-muted)', letterSpacing: '0.06em' }}>
                        {preset.name}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              {/* All themes link */}
              <button onClick={() => navigate('/themes')}
                style={{ width: '100%', marginTop: 10, padding: '11px 16px', borderRadius: 14, cursor: 'pointer', border: '1px solid var(--theme-glass-border)', background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)', fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Alle thema&apos;s bekijken <ChevronRight size={13} />
              </button>
            </motion.div>

            {/* ─── Training ────────────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <SettingsSection title="Training">
                <SettingRow label="Standaard rusttimer" description="Automatisch ingesteld na een set">
                  <ThemedSelect value={settings.defaultRestSeconds} onChange={v => updateSettings({ defaultRestSeconds: +v })}
                    options={[{ label: '30 sec', value: 30 }, { label: '60 sec', value: 60 }, { label: '90 sec', value: 90 }, { label: '2 min', value: 120 }, { label: '3 min', value: 180 }]} />
                </SettingRow>
                <SettingRow label="Gewichtsstappen" description="Stapgrootte bij gewicht verhogen/verlagen">
                  <ThemedSelect value={settings.weightStep} onChange={v => updateSettings({ weightStep: +v })}
                    options={[{ label: '0.5 kg', value: 0.5 }, { label: '1 kg', value: 1 }, { label: '2.5 kg', value: 2.5 }, { label: '5 kg', value: 5 }]} />
                </SettingRow>
                <SettingRow label="Gewichtseenheid" description="kg of lbs voor alle gewichten">
                  <UnitToggle value={settings.weightUnit} onChange={v => updateSettings({ weightUnit: v })} />
                </SettingRow>
              </SettingsSection>
            </motion.div>

            {/* ─── Beschikbare gewichten ───────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <SettingsSection title="Beschikbare Gewichten">
                <SettingRow label="Mijn gewichten" description={settings.weightSettings?.enabled ? `Actief — ${settings.weightSettings.dumbbells.length} dumbbells, stang ${settings.weightSettings.barbellWeight}kg` : 'Adviezen aanpassen op beschikbare gewichten'}>
                  <button onClick={() => setShowWeightModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(0,201,255,0.25)', background: 'rgba(0,201,255,0.1)', color: '#00C9FF' }}>
                    {settings.weightSettings?.enabled && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E5A0' }} />}
                    Instellen <ChevronRight size={12} />
                  </button>
                </SettingRow>
              </SettingsSection>
            </motion.div>

            {/* ─── Notificaties ────────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <SettingsSection title="Notificaties">
                <SettingRow label="Geluid" description="Piepgeluid bij einde rusttimer">
                  <Toggle checked={settings.soundEnabled} onChange={v => updateSettings({ soundEnabled: v })} />
                </SettingRow>
                <SettingRow label="Trillen" description="Vibratie bij einde rusttimer">
                  <Toggle checked={settings.hapticEnabled} onChange={v => updateSettings({ hapticEnabled: v })} />
                </SettingRow>
              </SettingsSection>
            </motion.div>

            {/* ─── Data ────────────────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <SettingsSection title="Data">
                <SettingRow label="Exporteer mijn data" description="Download al je data als JSON-bestand">
                  <button onClick={() => { exportAllData({ profiles, settings, language }); showSuccess('Data geëxporteerd', 'Bestand wordt gedownload') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(0,192,96,0.25)', background: 'rgba(0,192,96,0.1)', color: '#00C060' }}>
                    <Download size={12} /> Export
                  </button>
                </SettingRow>
                <SettingRow label="Verwijder al mijn data" description="Wist alle trainingen, metingen en instellingen">
                  <button onClick={() => setShowDeleteModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(255,59,59,0.25)', background: 'rgba(255,59,59,0.1)', color: 'var(--theme-error)' }}>
                    <Trash2 size={12} /> Wissen
                  </button>
                </SettingRow>
              </SettingsSection>
            </motion.div>

            {/* ─── Over ────────────────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <SettingsSection title="Over">
                <SettingRow label="Versie">
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)' }}>1.0.0</span>
                </SettingRow>
                <SettingRow label="Credits">
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--theme-text-muted)' }}>Gemaakt met ❤️ en Claude</span>
                </SettingRow>
              </SettingsSection>
            </motion.div>

          </motion.div>
        </div>
      </div>

      <WeightSettingsModal isOpen={showWeightModal} onClose={() => setShowWeightModal(false)}
        current={settings.weightSettings ?? DEFAULT_WEIGHT_SETTINGS}
        onSave={ws => updateSettings({ weightSettings: ws })} />

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Data Verwijderen">
        <div className="flex items-start gap-3 mb-5 p-3.5 rounded-2xl" style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)' }}>
          <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--theme-error)' }} />
          <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--theme-text-secondary)' }}>
            <strong style={{ color: 'var(--theme-text-primary)' }}>Weet je het zeker?</strong>{' '}
            Dit verwijdert alle trainingen, metingen, profielen en instellingen.
            Dit kan <strong style={{ color: 'var(--theme-error)' }}>niet ongedaan</strong> worden gemaakt.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '14px 18px', borderRadius: 16, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: '1px solid var(--theme-glass-border)', background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)' }}>Annuleren</button>
          <button onClick={deleteAllData} style={{ flex: 1, padding: '14px 18px', borderRadius: 16, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: '1px solid rgba(255,59,59,0.3)', background: 'rgba(255,59,59,0.15)', color: 'var(--theme-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Trash2 size={15} /> Alles Verwijderen
          </button>
        </div>
      </Modal>
    </div>
  )
}

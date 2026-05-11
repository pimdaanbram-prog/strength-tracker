import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Ruler, Percent, Camera, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Header from '@/app/layout/Header'
import PageWrapper from '@/app/layout/PageWrapper'
import { useAppStore } from '@/shared/lib/store'
import { useToast } from '@/shared/contexts/ToastContext'
import type { BodyWeight, BodyMeasurement } from '@/shared/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

type MeasKey = keyof Omit<BodyMeasurement, 'date' | 'bodyFatPercent' | 'note'>
type BfCat   = [number, string, string]   // [maxPct, label, color]

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAS_FIELDS: { key: MeasKey; label: string }[] = [
  { key: 'chest',      label: 'Borst'           },
  { key: 'leftArm',    label: 'Linkerarm'        },
  { key: 'rightArm',   label: 'Rechterarm'       },
  { key: 'waist',      label: 'Taille'           },
  { key: 'hips',       label: 'Heupen'           },
  { key: 'leftThigh',  label: 'L. bovenbeen'     },
  { key: 'rightThigh', label: 'R. bovenbeen'     },
  { key: 'leftCalf',   label: 'Linkerkuit'       },
  { key: 'rightCalf',  label: 'Rechterkuit'      },
  { key: 'neck',       label: 'Nek'              },
]

const BF_CATS_MALE: BfCat[] = [
  [5,        'Essentieel',       '#FF3B3B'              ],
  [13,       'Atletisch',        'var(--theme-success)' ],
  [17,       'Fit',              '#4A8FFF'              ],
  [24,       'Gemiddeld',        '#FFB300'              ],
  [Infinity, 'Boven gemiddeld',  'var(--theme-error)'   ],
]
const BF_CATS_FEMALE: BfCat[] = [
  [13,       'Essentieel',       '#FF3B3B'              ],
  [20,       'Atletisch',        'var(--theme-success)' ],
  [24,       'Fit',              '#4A8FFF'              ],
  [31,       'Gemiddeld',        '#FFB300'              ],
  [Infinity, 'Boven gemiddeld',  'var(--theme-error)'   ],
]

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function getBodyFatCategory(pct: number, gender: 'male' | 'female'): BfCat {
  const cats = gender === 'male' ? BF_CATS_MALE : BF_CATS_FEMALE
  return cats.find(([max]) => pct <= max) ?? cats[cats.length - 1]
}

function calcNavyBodyFat(
  gender: 'male' | 'female',
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipsCm?: number,
): number | null {
  if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return null
  let result: number
  if (gender === 'male') {
    const diff = waistCm - neckCm
    if (diff <= 0) return null
    result = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightCm)) - 450
  } else {
    if (!hipsCm || hipsCm <= 0) return null
    const sum = waistCm + hipsCm - neckCm
    if (sum <= 0) return null
    result = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.22100 * Math.log10(heightCm)) - 450
  }
  return isFinite(result) ? +result.toFixed(1) : null
}

// ─── LocalStorage hooks ───────────────────────────────────────────────────────

function useBodyWeights() {
  const [weights, setWeights] = useState<BodyWeight[]>(() => {
    try { return JSON.parse(localStorage.getItem('st-body-weights') ?? '[]') }
    catch { return [] }
  })

  const addWeight = useCallback((entry: BodyWeight) => {
    setWeights(prev => {
      const updated = [...prev.filter(w => w.date !== entry.date), entry]
        .sort((a, b) => a.date.localeCompare(b.date))
      localStorage.setItem('st-body-weights', JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeWeight = useCallback((date: string) => {
    setWeights(prev => {
      const updated = prev.filter(w => w.date !== date)
      localStorage.setItem('st-body-weights', JSON.stringify(updated))
      return updated
    })
  }, [])

  return { weights, addWeight, removeWeight }
}

function useMeasurements() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => {
    try { return JSON.parse(localStorage.getItem('st-measurements') ?? '[]') }
    catch { return [] }
  })

  const addMeasurement = useCallback((entry: BodyMeasurement) => {
    setMeasurements(prev => {
      const updated = [...prev.filter(m => m.date !== entry.date), entry]
        .sort((a, b) => a.date.localeCompare(b.date))
      localStorage.setItem('st-measurements', JSON.stringify(updated))
      return updated
    })
  }, [])

  return { measurements, addMeasurement }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  icon, title, accent = 'var(--theme-accent)', action, children,
}: {
  icon: React.ReactNode
  title: string
  accent?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
        >
          {icon}
        </div>
        <h3
          className="flex-1 text-sm font-semibold tracking-widest uppercase m-0"
          style={{ color: 'var(--theme-text-primary)', letterSpacing: '0.08em' }}
        >
          {title}
        </h3>
        {action}
      </div>
      <div className="h-px" style={{ background: 'var(--theme-border)' }} />
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-bold uppercase tracking-widest m-0 mb-1.5"
      style={{ color: 'var(--theme-text-muted)', letterSpacing: '0.1em' }}
    >
      {children}
    </p>
  )
}

function StyledInput({
  value, onChange, type = 'number', placeholder, min, step, onEnter,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  min?: number
  step?: number
  onEnter?: () => void
}) {
  return (
    <input
      type={type}
      inputMode={type === 'number' ? 'decimal' : undefined}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onEnter?.()}
      placeholder={placeholder}
      min={min}
      step={step}
      className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
      style={{
        background: 'var(--theme-bg-input)',
        border: '1px solid var(--theme-border)',
        color: 'var(--theme-text-primary)',
        colorScheme: 'dark',
      }}
    />
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MeasurementsPage() {
  const settings = useAppStore(s => s.settings)
  const profile  = useAppStore(s => s.getActiveProfile())
  const { showSuccess, showError } = useToast()

  const { weights, addWeight, removeWeight } = useBodyWeights()
  const { measurements, addMeasurement }     = useMeasurements()

  const unit = settings.weightUnit

  // ── Weight form ────────────────────────────────────────────────────────────
  const [weightInput,       setWeightInput]       = useState('')
  const [weightDate,        setWeightDate]        = useState(todayStr)
  const [showWeightHistory, setShowWeightHistory] = useState(false)

  const handleAddWeight = useCallback(() => {
    const w = parseFloat(weightInput)
    if (!w || w <= 0 || w > 700) { showError('Ongeldig gewicht'); return }
    addWeight({ date: weightDate, weight: w })
    setWeightInput('')
    showSuccess('Gewicht opgeslagen', `${w} ${unit} — ${fmtDate(weightDate)}`)
  }, [weightInput, weightDate, unit, addWeight, showSuccess, showError])

  // ── Chart ──────────────────────────────────────────────────────────────────
  const [range, setRange] = useState<'30' | '90' | 'all'>('30')

  const chartData = useMemo(() => {
    let data = weights
    if (range !== 'all') {
      const days = range === '30' ? 30 : 90
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      const cutoffStr = cutoff.toISOString().split('T')[0]
      data = weights.filter(w => w.date >= cutoffStr)
    }
    return data.map(w => ({ label: fmtDate(w.date), weight: w.weight }))
  }, [weights, range])

  const chartDomain = useMemo((): [number, number] => {
    if (!chartData.length) return [40, 120]
    const vals = chartData.map(d => d.weight)
    return [Math.floor(Math.min(...vals) - 3), Math.ceil(Math.max(...vals) + 3)]
  }, [chartData])

  // ── Measurements form ──────────────────────────────────────────────────────
  const [measDate,     setMeasDate]     = useState(todayStr)
  const [measForm,     setMeasForm]     = useState<Record<string, string>>(
    () => Object.fromEntries(MEAS_FIELDS.map(f => [f.key, '']))
  )
  const [showMeasForm, setShowMeasForm] = useState(false)

  const setField = useCallback((key: string, val: string) =>
    setMeasForm(prev => ({ ...prev, [key]: val })), [])

  const handleAddMeasurement = useCallback(() => {
    const hasAny = MEAS_FIELDS.some(f => measForm[f.key] !== '')
    if (!hasAny) { showError('Vul minimaal één meting in'); return }

    const updates: Partial<Record<MeasKey, number>> = {}
    MEAS_FIELDS.forEach(f => {
      const val = parseFloat(measForm[f.key])
      if (!isNaN(val) && val > 0) updates[f.key] = val
    })
    const entry: BodyMeasurement = { date: measDate, ...updates }
    addMeasurement(entry)
    setMeasForm(Object.fromEntries(MEAS_FIELDS.map(f => [f.key, ''])))
    setShowMeasForm(false)
    showSuccess('Metingen opgeslagen', fmtDate(measDate))
  }, [measForm, measDate, addMeasurement, showSuccess, showError])

  const latestMeas = measurements[measurements.length - 1]
  const prevMeas   = measurements[measurements.length - 2]

  const getDiff = useCallback((key: MeasKey): number | null => {
    const curr = latestMeas?.[key]
    const prev = prevMeas?.[key]
    if (curr == null || prev == null) return null
    return +(curr - prev).toFixed(1)
  }, [latestMeas, prevMeas])

  // ── Navy Method ────────────────────────────────────────────────────────────
  const bodyFatPct = useMemo((): number | null => {
    if (!latestMeas || !profile?.height || !profile?.gender) return null
    const { neck, waist, hips } = latestMeas
    if (!neck || !waist) return null
    if (profile.gender === 'female' && !hips) return null
    return calcNavyBodyFat(profile.gender, profile.height, neck, waist, hips)
  }, [latestMeas, profile])

  const bfCat: BfCat | null = (bodyFatPct != null && profile)
    ? getBodyFatCategory(bodyFatPct, profile.gender)
    : null

  // ── Animations ─────────────────────────────────────────────────────────────
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header title="METINGEN" showBack />
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
            <Ruler size={22} style={{ color: 'var(--theme-accent)' }} />
          </div>
          <div>
            <h2 className="text-2xl tracking-wider m-0" style={{ color: 'var(--theme-text-primary)' }}>
              METINGEN
            </h2>
            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              Gewicht · lichaamsmetingen · vetpercentage
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >

          {/* ─── 1. Gewicht Tracker ───────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SectionCard
              icon={<TrendingUp size={17} style={{ color: 'var(--theme-accent)' }} />}
              title="Gewicht Tracker"
            >
              {/* Input row */}
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[120px]">
                  <FieldLabel>Gewicht ({unit})</FieldLabel>
                  <StyledInput
                    value={weightInput}
                    onChange={setWeightInput}
                    placeholder="bijv. 82.5"
                    min={1}
                    step={0.1}
                    onEnter={handleAddWeight}
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <FieldLabel>Datum</FieldLabel>
                  <input
                    type="date"
                    value={weightDate}
                    onChange={e => setWeightDate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                    style={{
                      background: 'var(--theme-bg-input)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                      colorScheme: 'dark',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleAddWeight}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-0 font-semibold text-sm"
                style={{
                  background: 'var(--theme-accent)',
                  color: '#fff',
                  boxShadow: '0 4px 16px var(--theme-accent-glow)',
                }}
              >
                <Plus size={16} />
                Gewicht Opslaan
              </button>

              {/* Chart — shows when ≥ 2 points */}
              {chartData.length >= 2 && (
                <div>
                  {/* Range filter */}
                  <div className="flex items-center gap-2 mb-3">
                    {(['30', '90', 'all'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-0 transition-all"
                        style={{
                          background: range === r ? 'var(--theme-accent-muted)' : 'var(--theme-bg-input)',
                          border: `1px solid ${range === r ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                          color: range === r ? 'var(--theme-accent)' : 'var(--theme-text-secondary)',
                        }}
                      >
                        {r === '30' ? '30 dagen' : r === '90' ? '90 dagen' : 'Alles'}
                      </button>
                    ))}
                    <span className="text-[10px] ml-auto" style={{ color: 'var(--theme-text-muted)' }}>
                      {chartData.length} meting{chartData.length !== 1 ? 'en' : ''}
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height={190}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 6, right: 8, bottom: 0, left: -22 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--theme-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: 'var(--theme-text-muted)', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={chartDomain}
                        tick={{ fill: 'var(--theme-text-muted)', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) =>
                          active && payload?.length ? (
                            <div
                              className="rounded-xl px-3 py-2"
                              style={{
                                background: 'var(--theme-bg-card)',
                                border: '1px solid var(--theme-border-subtle)',
                                boxShadow: 'var(--theme-shadow-md)',
                              }}
                            >
                              <p className="text-[10px] m-0" style={{ color: 'var(--theme-text-muted)' }}>
                                {label}
                              </p>
                              <p className="text-sm font-bold m-0 mt-0.5" style={{ color: 'var(--theme-accent)' }}>
                                {payload[0].value} {unit}
                              </p>
                            </div>
                          ) : null
                        }
                        cursor={{ stroke: 'var(--theme-border-subtle)', strokeWidth: 1 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--theme-accent)"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: 'var(--theme-accent)', strokeWidth: 0 }}
                        activeDot={{
                          r: 5.5,
                          fill: 'var(--theme-accent)',
                          stroke: 'var(--theme-bg-card)',
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Single-point hint */}
              {chartData.length === 1 && (
                <p
                  className="text-center text-xs py-3 rounded-xl m-0"
                  style={{ color: 'var(--theme-text-muted)', background: 'var(--theme-bg-input)' }}
                >
                  Voeg een tweede meting toe om de grafiek te zien
                </p>
              )}

              {/* Collapsible history */}
              {weights.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowWeightHistory(v => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-0 bg-transparent p-0"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {showWeightHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    Geschiedenis ({weights.length})
                  </button>

                  <AnimatePresence initial={false}>
                    {showWeightHistory && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="space-y-1.5 mt-2 max-h-52 overflow-y-auto">
                          {[...weights].reverse().map(w => (
                            <div
                              key={w.date}
                              className="flex items-center justify-between px-3 py-2 rounded-xl"
                              style={{ background: 'var(--theme-bg-input)' }}
                            >
                              <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                {fmtDate(w.date)}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                                  {w.weight} {unit}
                                </span>
                                <button
                                  onClick={() => removeWeight(w.date)}
                                  className="p-1 rounded-lg cursor-pointer border-0 bg-transparent transition-colors"
                                  style={{ color: 'rgba(255,59,59,0.35)' }}
                                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-error)')}
                                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,59,59,0.35)')}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* ─── 2. Lichaamsmetingen ──────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SectionCard
              icon={<Ruler size={17} style={{ color: '#4A8FFF' }} />}
              title="Lichaamsmetingen"
              accent="#4A8FFF"
              action={
                <button
                  onClick={() => setShowMeasForm(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border-0 transition-all"
                  style={{
                    background: showMeasForm ? 'rgba(74,143,255,0.15)' : 'var(--theme-bg-input)',
                    border: `1px solid ${showMeasForm ? 'rgba(74,143,255,0.4)' : 'var(--theme-border)'}`,
                    color: showMeasForm ? '#4A8FFF' : 'var(--theme-text-secondary)',
                  }}
                >
                  <Plus size={13} />
                  Nieuw
                </button>
              }
            >
              {/* Collapsible form */}
              <AnimatePresence initial={false}>
                {showMeasForm && (
                  <motion.div
                    key="meas-form"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="space-y-3 pb-4">
                      {/* Date */}
                      <div>
                        <FieldLabel>Datum</FieldLabel>
                        <input
                          type="date"
                          value={measDate}
                          onChange={e => setMeasDate(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                          style={{
                            background: 'var(--theme-bg-input)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text-primary)',
                            colorScheme: 'dark',
                          }}
                        />
                      </div>

                      {/* 10-field grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {MEAS_FIELDS.map(({ key, label }) => (
                          <div key={key}>
                            <FieldLabel>{label} (cm)</FieldLabel>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={measForm[key]}
                              onChange={e => setField(key, e.target.value)}
                              placeholder="—"
                              min={1}
                              className="w-full rounded-xl px-3 py-2 text-sm font-medium outline-none"
                              style={{
                                background: 'var(--theme-bg-input)',
                                border: '1px solid var(--theme-border)',
                                color: 'var(--theme-text-primary)',
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleAddMeasurement}
                        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-0 font-semibold text-sm"
                        style={{
                          background: '#4A8FFF',
                          color: '#fff',
                          boxShadow: '0 4px 16px rgba(74,143,255,0.3)',
                        }}
                      >
                        <Plus size={16} />
                        Metingen Opslaan
                      </button>
                    </div>
                    <div className="h-px" style={{ background: 'var(--theme-border)' }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Latest measurement with diffs */}
              {latestMeas ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>
                      Laatste meting — {fmtDate(latestMeas.date)}
                    </FieldLabel>
                    {prevMeas && (
                      <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                        vs {fmtDate(prevMeas.date)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {MEAS_FIELDS.filter(({ key }) => latestMeas[key] != null).map(({ key, label }) => {
                      const val  = latestMeas[key]!
                      const diff = getDiff(key)
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between px-3 py-2 rounded-xl"
                          style={{ background: 'var(--theme-bg-input)' }}
                        >
                          <div>
                            <p className="text-[9px] m-0 uppercase font-bold tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                              {label}
                            </p>
                            <p className="text-sm font-bold m-0" style={{ color: 'var(--theme-text-primary)' }}>
                              {val} cm
                            </p>
                          </div>
                          {diff != null && (
                            <span
                              className="text-[11px] font-bold"
                              style={{
                                color: diff === 0
                                  ? 'var(--theme-text-muted)'
                                  : diff > 0
                                  ? 'var(--theme-success)'
                                  : 'var(--theme-error)',
                              }}
                            >
                              {diff === 0 ? '±0' : diff > 0 ? `+${diff}` : `${diff}`}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {measurements.length > 1 && (
                    <p className="text-[10px] m-0 mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                      {measurements.length} metingen opgeslagen
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-8 rounded-xl text-center"
                  style={{ background: 'var(--theme-bg-input)' }}
                >
                  <Ruler size={28} className="mb-2" style={{ color: 'var(--theme-text-muted)', opacity: 0.4 }} />
                  <p className="text-sm font-semibold m-0" style={{ color: 'var(--theme-text-secondary)' }}>
                    Nog geen metingen
                  </p>
                  <p className="text-xs m-0 mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                    Klik op "Nieuw" om te beginnen
                  </p>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* ─── 3. Vetpercentage (Navy Method) ──────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SectionCard
              icon={<Percent size={17} style={{ color: '#A855F7' }} />}
              title="Vetpercentage"
              accent="#A855F7"
            >
              {bodyFatPct != null && bfCat ? (
                <div className="space-y-4">
                  {/* Result cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest m-0 mb-1"
                        style={{ color: '#A855F7', letterSpacing: '0.1em' }}
                      >
                        Vetpercentage
                      </p>
                      <p className="text-4xl font-black m-0" style={{ color: 'var(--theme-text-primary)' }}>
                        {bodyFatPct}%
                      </p>
                      <p className="text-[9px] m-0 mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        Navy Method
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: `${bfCat[2]}15`, border: `1px solid ${bfCat[2]}35` }}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest m-0 mb-1"
                        style={{ color: bfCat[2], letterSpacing: '0.1em' }}
                      >
                        Categorie
                      </p>
                      <p className="text-lg font-black m-0 leading-tight" style={{ color: bfCat[2] }}>
                        {bfCat[1]}
                      </p>
                      <p className="text-[9px] m-0 mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        {profile?.gender === 'male' ? 'man' : 'vrouw'}
                      </p>
                    </div>
                  </div>

                  {/* Category scale */}
                  <div>
                    <FieldLabel>Categorieën — {profile?.gender === 'male' ? 'man' : 'vrouw'}</FieldLabel>
                    <div className="space-y-1.5">
                      {(profile?.gender === 'male' ? BF_CATS_MALE : BF_CATS_FEMALE).map(
                        ([max, label, color], i, arr) => {
                          const prevMax = i === 0 ? -1 : arr[i - 1][0] as number
                          const minPct  = prevMax + 1
                          const isActive = bfCat[1] === label
                          const rangeStr = max === Infinity
                            ? `${minPct}%+`
                            : i === 0
                            ? `0–${max}%`
                            : `${minPct}–${max}%`

                          return (
                            <div
                              key={label}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                              style={{
                                background: isActive ? `${color}12` : 'var(--theme-bg-input)',
                                border: `1px solid ${isActive ? `${color}40` : 'transparent'}`,
                              }}
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: color }}
                              />
                              <span
                                className="flex-1 text-xs font-semibold"
                                style={{ color: isActive ? color : 'var(--theme-text-secondary)' }}
                              >
                                {label}
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                                {rangeStr}
                              </span>
                              {isActive && (
                                <span
                                  className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                                  style={{ background: `${color}20`, color }}
                                >
                                  JIJ
                                </span>
                              )}
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] m-0 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                    Berekend op basis van nek: {latestMeas?.neck} cm, taille: {latestMeas?.waist} cm
                    {profile?.gender === 'female' ? `, heupen: ${latestMeas?.hips} cm` : ''}, lengte: {profile?.height} cm
                  </p>
                </div>
              ) : (
                /* Missing data placeholder */
                <div
                  className="flex flex-col items-center py-7 px-4 rounded-xl text-center"
                  style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}
                  >
                    <Percent size={24} style={{ color: '#A855F7', opacity: 0.7 }} />
                  </div>
                  <p className="text-sm font-semibold m-0" style={{ color: '#A855F7' }}>
                    Navy Method
                  </p>
                  <p className="text-xs m-0 mt-2" style={{ color: 'var(--theme-text-muted)' }}>
                    Vereist in de laatste meting:
                  </p>

                  {/* Required fields status */}
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {(['Nek', 'Taille', ...(profile?.gender === 'female' ? ['Heupen'] : [])] as const).map(f => {
                      const keyMap: Record<string, MeasKey> = { Nek: 'neck', Taille: 'waist', Heupen: 'hips' }
                      const filled = latestMeas?.[keyMap[f]] != null
                      return (
                        <span
                          key={f}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: filled ? 'rgba(0,229,160,0.1)' : 'rgba(168,85,247,0.1)',
                            color: filled ? 'var(--theme-success)' : '#A855F7',
                            border: `1px solid ${filled ? 'rgba(0,229,160,0.3)' : 'rgba(168,85,247,0.25)'}`,
                          }}
                        >
                          {filled ? '✓' : '○'} {f}
                        </span>
                      )
                    })}
                  </div>

                  {!profile?.height && (
                    <p className="text-[10px] m-0 mt-3 font-semibold" style={{ color: 'var(--theme-warning)' }}>
                      ⚠ Stel je lengte in via je profiel
                    </p>
                  )}
                  {!profile && (
                    <p className="text-[10px] m-0 mt-3 font-semibold" style={{ color: 'var(--theme-warning)' }}>
                      ⚠ Geen actief profiel gevonden
                    </p>
                  )}
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* ─── 4. Voortgangsfoto's Placeholder ─────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SectionCard
              icon={<Camera size={17} style={{ color: '#FFB300' }} />}
              title="Voortgangsfoto's"
              accent="#FFB300"
            >
              <div
                className="flex flex-col items-center justify-center py-8 px-4 rounded-xl text-center"
                style={{
                  background: 'rgba(255,179,0,0.04)',
                  border: '1px dashed rgba(255,179,0,0.3)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.2)' }}
                >
                  <Camera size={28} style={{ color: '#FFB300', opacity: 0.6 }} />
                </div>
                <p className="text-sm font-semibold m-0" style={{ color: 'var(--theme-text-secondary)' }}>
                  Binnenkort: voortgangsfoto's uploaden
                </p>
                <p
                  className="text-xs m-0 mt-2 leading-relaxed"
                  style={{ color: 'var(--theme-text-muted)', maxWidth: 220 }}
                >
                  Vergelijk je lichaam visueel over tijd en zie je voortgang in één oogopslag
                </p>
                <div
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background: 'rgba(255,179,0,0.1)',
                    color: '#FFB300',
                    border: '1px solid rgba(255,179,0,0.2)',
                  }}
                >
                  Binnenkort beschikbaar
                </div>
              </div>
            </SectionCard>
          </motion.div>

        </motion.div>
      </PageWrapper>
    </>
  )
}

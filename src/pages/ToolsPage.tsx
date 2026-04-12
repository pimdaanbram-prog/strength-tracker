import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, TrendingUp, Flame, Timer, BarChart3, Utensils,
  ChevronDown, Play, Pause, RotateCcw, Wrench,
} from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useAppStore } from '../store/appStore'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]

const PLATE_META: Record<number, { color: string; textColor: string }> = {
  25:   { color: '#FF3B3B', textColor: '#fff' },
  20:   { color: '#4A8FFF', textColor: '#fff' },
  15:   { color: '#FFB300', textColor: '#000' },
  10:   { color: '#00C060', textColor: '#fff' },
  5:    { color: '#DDDDDD', textColor: '#222' },
  2.5:  { color: '#FF5500', textColor: '#fff' },
  1.25: { color: '#888888', textColor: '#fff' },
}

const TIMER_PRESETS = [30, 60, 90, 120, 180]
const TIMER_R = 45
const TIMER_C = 2 * Math.PI * TIMER_R

const ACTIVITY_OPTS = [
  { label: 'Sedentair',    value: 1.2,   desc: 'Weinig/geen beweging' },
  { label: 'Licht actief', value: 1.375, desc: '1–3× sport per week' },
  { label: 'Matig actief', value: 1.55,  desc: '3–5× sport per week' },
  { label: 'Actief',       value: 1.725, desc: '6–7× sport per week' },
  { label: 'Zeer actief',  value: 1.9,   desc: 'Zwaar werk + dagelijks sport' },
]

// ─── Pure calculation helpers ─────────────────────────────────────────────────

function calcPlates(target: number): { plate: number; count: number }[] {
  let remaining = Math.round(((target - 20) / 2) * 1000) / 1000
  if (remaining <= 0) return []
  const result: { plate: number; count: number }[] = []
  for (const plate of PLATES) {
    if (remaining < 0.01) break
    const count = Math.floor(remaining / plate)
    if (count > 0) {
      result.push({ plate, count })
      remaining = Math.round((remaining - count * plate) * 1000) / 1000
    }
  }
  return result
}

function calcEpley(weight: number, reps: number): number {
  return reps === 1 ? weight : weight * (1 + reps / 30)
}

function calcWarmup(w: number) {
  const r = (n: number) => Math.round(n / 2.5) * 2.5
  return [
    { pct: '—',   weight: 20,        reps: '× 10', isWork: false },
    { pct: '40%', weight: r(w * 0.4),  reps: '× 8',  isWork: false },
    { pct: '60%', weight: r(w * 0.6),  reps: '× 5',  isWork: false },
    { pct: '75%', weight: r(w * 0.75), reps: '× 3',  isWork: false },
    { pct: '85%', weight: r(w * 0.85), reps: '× 1',  isWork: false },
    { pct: '100%', weight: w,           reps: '—',    isWork: true  },
  ]
}

function calcBMR(weight: number, height: number, age: number, gender: 'male' | 'female') {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

function calcMacros(tdee: number, goal: 'bulk' | 'cut' | 'maintain', weightKg: number) {
  const cal = goal === 'bulk' ? tdee + 300 : goal === 'cut' ? tdee - 500 : tdee
  const protein = Math.round(weightKg * 2)
  const fat = Math.round((cal * 0.25) / 9)
  const proteinCal = protein * 4
  const fatCal = fat * 9
  const carbs = Math.max(0, Math.round((cal - proteinCal - fatCal) / 4))
  return { cal, protein, fat, carbs }
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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

function NumInput({
  label, value, onChange, placeholder, min, max, step,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
        style={{
          background: 'var(--theme-bg-input)',
          border: '1px solid var(--theme-border)',
          color: 'var(--theme-text-primary)',
        }}
      />
    </div>
  )
}

function Divider() {
  return <div className="h-px" style={{ background: 'var(--theme-border)' }} />
}

// ─── Tool accordion card ──────────────────────────────────────────────────────

function ToolCard({
  id, icon, title, accent, isOpen, onToggle, children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  accent: string
  isOpen: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--theme-bg-card)',
        border: `1px solid ${isOpen ? accent + '50' : 'var(--theme-border)'}`,
        boxShadow: isOpen ? `0 8px 28px ${accent}18` : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-3 p-4 cursor-pointer border-0 bg-transparent text-left"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
        >
          {icon}
        </div>
        <span
          className="flex-1 text-sm font-semibold tracking-widest uppercase"
          style={{ color: 'var(--theme-text-primary)', letterSpacing: '0.08em' }}
        >
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          <ChevronDown size={18} style={{ color: 'var(--theme-text-muted)' }} />
        </motion.div>
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-5 space-y-4">
              <Divider />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const settings   = useAppStore(s => s.settings)
  const getProfile = useAppStore(s => s.getActiveProfile)
  const profile    = getProfile()

  const [openTool, setOpenTool] = useState<string | null>(null)
  const toggle = useCallback((id: string) => {
    setOpenTool(prev => prev === id ? null : id)
  }, [])

  // ── 1. Plate calculator ───────────────────────────────────────────────────
  const [plateTarget, setPlateTarget] = useState('')
  const targetNum   = parseFloat(plateTarget)
  const platesData  = !isNaN(targetNum) && targetNum > 20 ? calcPlates(targetNum) : []
  const achievable  = 20 + platesData.reduce((s, p) => s + p.plate * p.count * 2, 0)

  // ── 2. 1RM calculator ─────────────────────────────────────────────────────
  const [rmWeight, setRmWeight] = useState('')
  const [rmReps,   setRmReps]   = useState('5')
  const rm1 = rmWeight && rmReps ? calcEpley(+rmWeight, Math.min(15, Math.max(1, +rmReps))) : null

  // ── 3. Warm-up calculator ─────────────────────────────────────────────────
  const [warmupWeight, setWarmupWeight] = useState('')
  const warmupSets = warmupWeight && +warmupWeight > 20 ? calcWarmup(+warmupWeight) : null

  // ── 4. Rest timer ─────────────────────────────────────────────────────────
  const [timerDuration, setTimerDuration] = useState(90)
  const [timeLeft,      setTimeLeft]      = useState(90)
  const [timerTotal,    setTimerTotal]    = useState(90)
  const [isRunning,     setIsRunning]     = useState(false)
  const [customSecs,    setCustomSecs]    = useState('')
  const intervalRef  = useRef<number | null>(null)
  const settingsRef  = useRef(settings)
  settingsRef.current = settings

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const resetTimer = useCallback((dur?: number) => {
    clearTimerInterval()
    const d = dur ?? timerDuration
    setTimerDuration(d)
    setTimeLeft(d)
    setTimerTotal(d)
    setIsRunning(false)
  }, [timerDuration, clearTimerInterval])

  // Start/stop interval when isRunning changes
  useEffect(() => {
    if (!isRunning) {
      clearTimerInterval()
      return
    }
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return clearTimerInterval
  }, [isRunning, clearTimerInterval])

  // Handle completion when timeLeft hits 0
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      clearTimerInterval()
      if (settingsRef.current.soundEnabled) {
        try {
          const ctx = new AudioContext()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = 880
          gain.gain.setValueAtTime(0.5, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
          osc.start()
          osc.stop(ctx.currentTime + 0.8)
        } catch { /* AudioContext not available */ }
      }
      if (settingsRef.current.hapticEnabled && navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
    }
  }, [timeLeft, isRunning, clearTimerInterval])

  const timerProgress = timerTotal > 0 ? timeLeft / timerTotal : 0
  const timerOffset   = TIMER_C * (1 - timerProgress)
  const timerDone     = timeLeft === 0 && !isRunning && timerTotal > 0

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // ── 5. BMR/TDEE ───────────────────────────────────────────────────────────
  const [bmrWeight,   setBmrWeight]   = useState(profile?.weight?.toString() ?? '')
  const [bmrHeight,   setBmrHeight]   = useState(profile?.height?.toString() ?? '')
  const [bmrAge,      setBmrAge]      = useState(profile?.age?.toString() ?? '')
  const [bmrGender,   setBmrGender]   = useState<'male' | 'female'>(profile?.gender ?? 'male')
  const [activityLvl, setActivityLvl] = useState(1.55)

  const bmrVal  = bmrWeight && bmrHeight && bmrAge
    ? calcBMR(+bmrWeight, +bmrHeight, +bmrAge, bmrGender)
    : null
  const tdeeVal = bmrVal ? Math.round(bmrVal * activityLvl) : null

  // ── 6. Macros ─────────────────────────────────────────────────────────────
  const [macroTdee,   setMacroTdee]   = useState(tdeeVal?.toString() ?? '')
  const [macroGoal,   setMacroGoal]   = useState<'bulk' | 'cut' | 'maintain'>('maintain')
  const [macroWeight, setMacroWeight] = useState(profile?.weight?.toString() ?? '')

  const macros = macroTdee && macroWeight && +macroTdee > 0 && +macroWeight > 0
    ? calcMacros(+macroTdee, macroGoal, +macroWeight)
    : null

  // Sync TDEE into macro field when BMR section computes it
  useEffect(() => {
    if (tdeeVal) setMacroTdee(tdeeVal.toString())
  }, [tdeeVal])

  // ─── Render ────────────────────────────────────────────────────────────────

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
  }

  return (
    <>
      <Header title="TOOLS" />
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
            <Wrench size={22} style={{ color: 'var(--theme-accent)' }} />
          </div>
          <div>
            <h2 className="text-2xl tracking-wider m-0" style={{ color: 'var(--theme-text-primary)' }}>
              TOOLS
            </h2>
            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              6 calculators voor betere training
            </p>
          </div>
        </motion.div>

        {/* Tool accordion list */}
        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >

          {/* ─── 1. Plate Calculator ──────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <ToolCard
              id="plate" icon={<Dumbbell size={18} style={{ color: '#4A8FFF' }} />}
              title="Platencalculator" accent="#4A8FFF"
              isOpen={openTool === 'plate'} onToggle={toggle}
            >
              <NumInput
                label="Doelgewicht (kg)"
                value={plateTarget} onChange={setPlateTarget}
                placeholder="bijv. 100" min={22.5} step={2.5}
              />

              {platesData.length > 0 && (
                <div className="space-y-3">
                  {/* Visual bar */}
                  <div>
                    <FieldLabel>Visueel — één kant</FieldLabel>
                    <div
                      className="flex items-center gap-1 py-3 px-3 rounded-xl overflow-x-auto"
                      style={{ background: 'var(--theme-bg-input)' }}
                    >
                      {/* Collar / center stub */}
                      <div
                        className="shrink-0 rounded"
                        style={{ width: 10, height: 12, background: 'var(--theme-text-muted)' }}
                      />
                      {platesData.map(({ plate, count }) =>
                        Array.from({ length: count }).map((_, i) => {
                          const meta   = PLATE_META[plate] ?? { color: '#666', textColor: '#fff' }
                          const height = Math.max(26, Math.min(64, plate * 2.2))
                          return (
                            <div
                              key={`${plate}-${i}`}
                              className="shrink-0 rounded flex items-center justify-center font-black"
                              style={{
                                background: meta.color,
                                color: meta.textColor,
                                width: 20,
                                height,
                                fontSize: plate >= 5 ? 8 : 0,
                                boxShadow: `0 2px 6px ${meta.color}60`,
                              }}
                            >
                              {plate >= 5 ? plate : ''}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Plate list */}
                  <div>
                    <FieldLabel>Platen per kant</FieldLabel>
                    <div className="space-y-1.5">
                      {platesData.map(({ plate, count }) => {
                        const meta = PLATE_META[plate] ?? { color: '#666', textColor: '#fff' }
                        return (
                          <div
                            key={plate}
                            className="flex items-center justify-between px-3 py-2 rounded-xl"
                            style={{ background: 'var(--theme-bg-input)' }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-sm" style={{ background: meta.color }} />
                              <span className="text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                                {plate} kg
                              </span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: 'var(--theme-text-secondary)' }}>
                              × {count}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(74,143,255,0.08)', border: '1px solid rgba(74,143,255,0.2)' }}
                  >
                    <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                      Totaal op stang
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-black" style={{ color: '#4A8FFF' }}>
                        {achievable} kg
                      </span>
                      {achievable !== targetNum && (
                        <span className="text-[10px] ml-1.5" style={{ color: 'var(--theme-warning)' }}>
                          (dichtstbijzijnde)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {plateTarget && +plateTarget <= 20 && (
                <p className="text-xs text-center m-0" style={{ color: 'var(--theme-warning)' }}>
                  Gewicht moet groter zijn dan de stang (20 kg)
                </p>
              )}
            </ToolCard>
          </motion.div>

          {/* ─── 2. 1RM Calculator ────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <ToolCard
              id="1rm" icon={<TrendingUp size={18} style={{ color: 'var(--theme-accent)' }} />}
              title="1RM Calculator" accent="var(--theme-accent)"
              isOpen={openTool === '1rm'} onToggle={toggle}
            >
              <div className="grid grid-cols-2 gap-3">
                <NumInput
                  label="Gewicht (kg)" value={rmWeight} onChange={setRmWeight}
                  placeholder="bijv. 80" min={1}
                />
                <NumInput
                  label="Herhalingen" value={rmReps} onChange={setRmReps}
                  placeholder="1–15" min={1} max={15}
                />
              </div>

              {rm1 && (
                <div className="space-y-3">
                  {/* 1RM result */}
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{ background: 'rgba(255,85,0,0.08)', border: '1px solid rgba(255,85,0,0.2)' }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest m-0 mb-1" style={{ color: 'var(--theme-accent)', letterSpacing: '0.1em' }}>
                      Geschat 1RM
                    </p>
                    <p className="text-4xl font-black m-0" style={{ color: 'var(--theme-text-primary)' }}>
                      {Math.round(rm1)} kg
                    </p>
                    <p className="text-[10px] m-0 mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                      Epley-formule
                    </p>
                  </div>

                  {/* Percentage table */}
                  <div>
                    <FieldLabel>Percentagetabel</FieldLabel>
                    <div className="space-y-1.5">
                      {[90, 80, 70, 60, 50].map(pct => {
                        const w = Math.round(rm1 * pct / 100 / 2.5) * 2.5
                        const barPct = pct
                        return (
                          <div
                            key={pct}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl"
                            style={{ background: 'var(--theme-bg-input)' }}
                          >
                            <span
                              className="text-xs font-bold w-9 shrink-0"
                              style={{ color: 'var(--theme-text-muted)' }}
                            >
                              {pct}%
                            </span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${barPct}%`, background: 'var(--theme-accent)' }}
                              />
                            </div>
                            <span
                              className="text-sm font-bold w-16 text-right shrink-0"
                              style={{ color: 'var(--theme-text-primary)' }}
                            >
                              {w} kg
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </ToolCard>
          </motion.div>

          {/* ─── 3. Warm-up Calculator ────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <ToolCard
              id="warmup" icon={<Flame size={18} style={{ color: '#FFB300' }} />}
              title="Warming-up Calculator" accent="#FFB300"
              isOpen={openTool === 'warmup'} onToggle={toggle}
            >
              <NumInput
                label="Werkgewicht (kg)"
                value={warmupWeight} onChange={setWarmupWeight}
                placeholder="bijv. 100" min={22.5} step={2.5}
              />

              {warmupSets && (
                <div>
                  <FieldLabel>Opbouwschema</FieldLabel>
                  <div className="space-y-1.5">
                    {warmupSets.map((set, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{
                          background: set.isWork ? 'rgba(255,179,0,0.08)' : 'var(--theme-bg-input)',
                          border: `1px solid ${set.isWork ? 'rgba(255,179,0,0.25)' : 'transparent'}`,
                        }}
                      >
                        {/* Step number */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                          style={{
                            background: set.isWork ? 'rgba(255,179,0,0.2)' : 'rgba(255,255,255,0.04)',
                            color: set.isWork ? '#FFB300' : 'var(--theme-text-muted)',
                          }}
                        >
                          {i + 1}
                        </div>

                        {/* Percentage */}
                        <span
                          className="text-xs font-bold w-9 shrink-0"
                          style={{ color: set.isWork ? '#FFB300' : 'var(--theme-text-muted)' }}
                        >
                          {set.pct}
                        </span>

                        {/* Weight */}
                        <span
                          className="flex-1 text-sm font-semibold"
                          style={{ color: 'var(--theme-text-primary)' }}
                        >
                          {set.weight} kg
                        </span>

                        {/* Reps */}
                        <span
                          className="text-xs font-bold"
                          style={{ color: set.isWork ? '#FFB300' : 'var(--theme-text-secondary)' }}
                        >
                          {set.reps}
                        </span>

                        {set.isWork && (
                          <span
                            className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-md"
                            style={{ background: 'rgba(255,179,0,0.2)', color: '#FFB300', letterSpacing: '0.08em' }}
                          >
                            WERK
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {warmupWeight && +warmupWeight <= 20 && (
                <p className="text-xs text-center m-0" style={{ color: 'var(--theme-warning)' }}>
                  Werkgewicht moet groter zijn dan 20 kg
                </p>
              )}
            </ToolCard>
          </motion.div>

          {/* ─── 4. Rest Timer ────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <ToolCard
              id="timer" icon={<Timer size={18} style={{ color: 'var(--theme-success)' }} />}
              title="Rusttimer" accent="var(--theme-success)"
              isOpen={openTool === 'timer'} onToggle={toggle}
            >
              {/* Duration presets */}
              <div>
                <FieldLabel>Duur</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {TIMER_PRESETS.map(p => {
                    const active = !customSecs && timerDuration === p
                    return (
                      <button
                        key={p}
                        onClick={() => { setCustomSecs(''); resetTimer(p) }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border-0 transition-all"
                        style={{
                          background: active ? 'rgba(0,229,160,0.15)' : 'var(--theme-bg-input)',
                          border: `1px solid ${active ? 'rgba(0,229,160,0.4)' : 'var(--theme-border)'}`,
                          color: active ? 'var(--theme-success)' : 'var(--theme-text-secondary)',
                        }}
                      >
                        {p >= 60 ? `${p / 60}m` : `${p}s`}
                      </button>
                    )
                  })}
                  {/* Custom input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={customSecs}
                      placeholder="Custom"
                      min={5}
                      max={3600}
                      onChange={e => {
                        const v = e.target.value
                        setCustomSecs(v)
                        if (v && +v >= 5 && +v <= 3600) resetTimer(+v)
                      }}
                      className="w-20 px-2 py-1.5 rounded-xl text-xs font-bold outline-none"
                      style={{
                        background: customSecs ? 'rgba(0,229,160,0.08)' : 'var(--theme-bg-input)',
                        border: `1px solid ${customSecs ? 'rgba(0,229,160,0.35)' : 'var(--theme-border)'}`,
                        color: 'var(--theme-text-primary)',
                      }}
                    />
                    {customSecs && (
                      <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>sec</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Circular countdown */}
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle
                      cx="50" cy="50" r={TIMER_R}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="7"
                    />
                    {/* Progress */}
                    <circle
                      cx="50" cy="50" r={TIMER_R}
                      fill="none"
                      stroke={timerDone ? 'var(--theme-error)' : 'var(--theme-success)'}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={TIMER_C}
                      strokeDashoffset={timerOffset}
                      style={{ transition: 'stroke-dashoffset 0.6s linear, stroke 0.3s ease' }}
                    />
                  </svg>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                    <span
                      className="text-4xl font-black tabular-nums leading-none"
                      style={{ color: timerDone ? 'var(--theme-error)' : 'var(--theme-text-primary)' }}
                    >
                      {fmtTime(timeLeft)}
                    </span>
                    {timerDone && (
                      <span className="text-[10px] font-black tracking-widest" style={{ color: 'var(--theme-error)', letterSpacing: '0.12em' }}>
                        KLAAR!
                      </span>
                    )}
                    {isRunning && (
                      <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                        van {fmtTime(timerTotal)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  {/* Reset */}
                  <button
                    onClick={() => resetTimer()}
                    className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-0 transition-all"
                    style={{ background: 'var(--theme-bg-input)', border: '1px solid var(--theme-border)' }}
                  >
                    <RotateCcw size={16} style={{ color: 'var(--theme-text-secondary)' }} />
                  </button>

                  {/* Play / Pause */}
                  <button
                    onClick={() => {
                      if (timerDone) {
                        resetTimer()
                      } else {
                        setIsRunning(r => !r)
                      }
                    }}
                    className="w-18 h-18 rounded-full flex items-center justify-center cursor-pointer border-0 transition-all"
                    style={{
                      width: 72,
                      height: 72,
                      background: isRunning ? 'rgba(0,229,160,0.12)' : 'var(--theme-success)',
                      border: '2px solid var(--theme-success)',
                      boxShadow: '0 0 28px rgba(0,229,160,0.25)',
                    }}
                  >
                    {timerDone ? (
                      <RotateCcw size={26} style={{ color: 'var(--theme-success)' }} />
                    ) : isRunning ? (
                      <Pause size={26} style={{ color: 'var(--theme-success)' }} />
                    ) : (
                      <Play size={26} fill="currentColor" style={{ color: '#000', marginLeft: 3 }} />
                    )}
                  </button>

                  {/* Spacer for symmetry */}
                  <div style={{ width: 44, height: 44 }} />
                </div>
              </div>
            </ToolCard>
          </motion.div>

          {/* ─── 5. BMR / TDEE Calculator ─────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <ToolCard
              id="bmr" icon={<BarChart3 size={18} style={{ color: '#A855F7' }} />}
              title="BMR / TDEE Calculator" accent="#A855F7"
              isOpen={openTool === 'bmr'} onToggle={toggle}
            >
              {/* Gender */}
              <div>
                <FieldLabel>Geslacht</FieldLabel>
                <div className="flex gap-2">
                  {(['male', 'female'] as const).map(g => {
                    const active = bmrGender === g
                    return (
                      <button
                        key={g}
                        onClick={() => setBmrGender(g)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer border-0 transition-all"
                        style={{
                          background: active ? 'rgba(168,85,247,0.15)' : 'var(--theme-bg-input)',
                          border: `1px solid ${active ? 'rgba(168,85,247,0.4)' : 'var(--theme-border)'}`,
                          color: active ? '#A855F7' : 'var(--theme-text-secondary)',
                        }}
                      >
                        {g === 'male' ? 'Man' : 'Vrouw'}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Measurements */}
              <div className="grid grid-cols-3 gap-2">
                <NumInput label="Gewicht (kg)" value={bmrWeight} onChange={setBmrWeight} placeholder="80" min={30} max={300} />
                <NumInput label="Lengte (cm)" value={bmrHeight} onChange={setBmrHeight} placeholder="180" min={100} max={250} />
                <NumInput label="Leeftijd" value={bmrAge} onChange={setBmrAge} placeholder="25" min={10} max={100} />
              </div>

              {/* Activity level */}
              <div>
                <FieldLabel>Activiteitsniveau</FieldLabel>
                <div className="space-y-1.5">
                  {ACTIVITY_OPTS.map(opt => {
                    const active = activityLvl === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setActivityLvl(opt.value)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left cursor-pointer border-0 transition-all"
                        style={{
                          background: active ? 'rgba(168,85,247,0.1)' : 'var(--theme-bg-input)',
                          border: `1px solid ${active ? 'rgba(168,85,247,0.3)' : 'transparent'}`,
                        }}
                      >
                        <div>
                          <p className="text-xs font-semibold m-0" style={{ color: active ? '#A855F7' : 'var(--theme-text-primary)' }}>
                            {opt.label}
                          </p>
                          <p className="text-[10px] m-0" style={{ color: 'var(--theme-text-muted)' }}>
                            {opt.desc}
                          </p>
                        </div>
                        <span className="text-xs font-bold ml-2 shrink-0" style={{ color: active ? '#A855F7' : 'var(--theme-text-muted)' }}>
                          ×{opt.value}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Results */}
              {bmrVal && tdeeVal && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'BMR', value: Math.round(bmrVal), sub: 'Basaalmetabolisme' },
                    { label: 'TDEE', value: tdeeVal, sub: 'Totaal energieverbruik' },
                  ].map(({ label, value, sub }) => (
                    <div
                      key={label}
                      className="p-4 rounded-xl text-center"
                      style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest m-0 mb-1" style={{ color: '#A855F7', letterSpacing: '0.1em' }}>
                        {label}
                      </p>
                      <p className="text-3xl font-black m-0" style={{ color: 'var(--theme-text-primary)' }}>
                        {value}
                      </p>
                      <p className="text-[9px] m-0 mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        {sub}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ToolCard>
          </motion.div>

          {/* ─── 6. Macro Calculator ──────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <ToolCard
              id="macro" icon={<Utensils size={18} style={{ color: '#00C060' }} />}
              title="Macro Calculator" accent="#00C060"
              isOpen={openTool === 'macro'} onToggle={toggle}
            >
              <div className="grid grid-cols-2 gap-3">
                <NumInput
                  label="TDEE (kcal)" value={macroTdee} onChange={setMacroTdee}
                  placeholder="bijv. 2500" min={1000} max={8000}
                />
                <NumInput
                  label="Gewicht (kg)" value={macroWeight} onChange={setMacroWeight}
                  placeholder="bijv. 80" min={30} max={300}
                />
              </div>

              {/* Goal selector */}
              <div>
                <FieldLabel>Doel</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'maintain' as const, label: 'Maintain', delta: '±0',   color: '#00C060' },
                    { key: 'bulk'     as const, label: 'Bulk',     delta: '+300',  color: '#4A8FFF' },
                    { key: 'cut'      as const, label: 'Cut',      delta: '−500',  color: 'var(--theme-accent)' },
                  ]).map(({ key, label, delta, color }) => {
                    const active = macroGoal === key
                    return (
                      <button
                        key={key}
                        onClick={() => setMacroGoal(key)}
                        className="py-2.5 rounded-xl cursor-pointer border-0 transition-all"
                        style={{
                          background: active ? `${color}18` : 'var(--theme-bg-input)',
                          border: `1px solid ${active ? `${color}45` : 'var(--theme-border)'}`,
                        }}
                      >
                        <p className="text-xs font-bold m-0" style={{ color: active ? color : 'var(--theme-text-secondary)' }}>
                          {label}
                        </p>
                        <p className="text-[9px] m-0 mt-0.5" style={{ color: active ? color + 'cc' : 'var(--theme-text-muted)' }}>
                          {delta} kcal
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Results */}
              {macros && (
                <div className="space-y-3">
                  {/* Total calories */}
                  <div
                    className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(0,192,96,0.08)', border: '1px solid rgba(0,192,96,0.2)' }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest m-0 mb-1" style={{ color: '#00C060', letterSpacing: '0.1em' }}>
                      Dagelijkse calorieën
                    </p>
                    <p className="text-3xl font-black m-0" style={{ color: 'var(--theme-text-primary)' }}>
                      {macros.cal}
                    </p>
                    <p className="text-[10px] m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>kcal/dag</p>
                  </div>

                  {/* Macro bars */}
                  {([
                    { label: 'Eiwit',        grams: macros.protein, calPer: 4, color: '#4A8FFF' },
                    { label: 'Koolhydraten', grams: macros.carbs,   calPer: 4, color: '#FFB300' },
                    { label: 'Vet',          grams: macros.fat,     calPer: 9, color: 'var(--theme-accent)' },
                  ] as const).map(({ label, grams, calPer, color }) => {
                    const kcal = grams * calPer
                    const pct  = Math.round(kcal / macros.cal * 100)
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                            {label}
                          </span>
                          <span className="text-xs font-bold" style={{ color }}>
                            {grams}g &middot; {kcal} kcal &middot; {pct}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-input)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ type: 'spring', damping: 24, stiffness: 200, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ToolCard>
          </motion.div>

        </motion.div>
      </PageWrapper>
    </>
  )
}

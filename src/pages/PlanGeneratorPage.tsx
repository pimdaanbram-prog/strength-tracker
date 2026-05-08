import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ChevronRight, ChevronLeft, Check,
  Calendar, Dumbbell, RotateCcw, BookMarked,
} from 'lucide-react'
import { exercises } from '../data/exercises'
import type { Exercise } from '../data/exercises'
import { usePlans } from '../hooks/usePlans'
import { useProfiles } from '../hooks/useProfiles'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

// ── Types ────────────────────────────────────────────────────────────────────
type MuscleTarget = {
  id: string; label: string; icon: string; category: string; color: string
}
type SplitDay = { label: string; muscles: string[] }

// ── Muscle group definitions ─────────────────────────────────────────────────
const MUSCLE_TARGETS: MuscleTarget[] = [
  { id:'chest',     label:'Borst',       icon:'🫁', category:'Chest',          color:'#FF5A1F' },
  { id:'back',      label:'Rug',         icon:'🔙', category:'Back',           color:'#4A8FFF' },
  { id:'shoulders', label:'Schouders',   icon:'💪', category:'Shoulders',      color:'#A855F7' },
  { id:'biceps',    label:'Biceps',      icon:'💪', category:'Arms - Biceps',  color:'#06b6d4' },
  { id:'triceps',   label:'Triceps',     icon:'💪', category:'Arms - Triceps', color:'#8B5CF6' },
  { id:'legs',      label:'Benen',       icon:'🦵', category:'Legs',           color:'#10b981' },
  { id:'glutes',    label:'Billen',      icon:'🍑', category:'Glutes',         color:'#EC4899' },
  { id:'core',      label:'Core / Abs',  icon:'🎯', category:'Core',           color:'#F59E0B' },
]

// ── Split generator ───────────────────────────────────────────────────────────
function generateSplit(targets: string[], days: number): SplitDay[] {
  const hasPush = targets.some(t => ['chest','shoulders','triceps'].includes(t))
  const hasPull = targets.some(t => ['back','biceps'].includes(t))
  const hasLegs = targets.some(t => ['legs','glutes'].includes(t))
  const hasCore = targets.includes('core')

  const pushMuscles  = targets.filter(t => ['chest','shoulders','triceps'].includes(t))
  const pullMuscles  = targets.filter(t => ['back','biceps'].includes(t))
  const legMuscles   = targets.filter(t => ['legs','glutes'].includes(t))
  const coreMuscles  = hasCore ? ['core'] : []

  if (days <= 2) {
    return [
      { label: 'Dag A — Volledig lichaam', muscles: [...targets] },
      { label: 'Dag B — Volledig lichaam', muscles: [...targets] },
    ].slice(0, days)
  }

  if (days === 3) {
    if (hasPush && hasPull && hasLegs) {
      return [
        { label: 'Push — Borst, Schouders, Triceps', muscles: [...pushMuscles, ...coreMuscles] },
        { label: 'Pull — Rug, Biceps',               muscles: [...pullMuscles] },
        { label: 'Benen & Glutes',                   muscles: [...legMuscles, ...coreMuscles] },
      ]
    }
    return [
      { label: 'Dag A', muscles: targets.slice(0, Math.ceil(targets.length / 3)) },
      { label: 'Dag B', muscles: targets.slice(Math.ceil(targets.length / 3), Math.ceil(targets.length * 2 / 3)) },
      { label: 'Dag C', muscles: targets.slice(Math.ceil(targets.length * 2 / 3)) },
    ]
  }

  if (days === 4) {
    return [
      { label: 'Boven A — Borst & Triceps',    muscles: [...targets.filter(t=>['chest','triceps'].includes(t)), ...coreMuscles] },
      { label: 'Onder A — Quads & Glutes',     muscles: targets.filter(t=>['legs','glutes'].includes(t)) },
      { label: 'Boven B — Rug & Biceps',       muscles: [...targets.filter(t=>['back','biceps','shoulders'].includes(t))] },
      { label: 'Onder B — Hamstrings & Core',  muscles: [...targets.filter(t=>['legs','glutes'].includes(t)), ...coreMuscles] },
    ].filter(d => d.muscles.length > 0)
  }

  if (days === 5) {
    return [
      { label: 'Push — Borst & Schouders',   muscles: [...pushMuscles] },
      { label: 'Pull — Rug & Biceps',         muscles: [...pullMuscles] },
      { label: 'Benen',                        muscles: [...legMuscles] },
      { label: 'Push B — Schouders & Triceps',muscles: targets.filter(t=>['shoulders','triceps','chest'].includes(t)) },
      { label: 'Pull B & Core',               muscles: [...pullMuscles, ...coreMuscles] },
    ].filter(d => d.muscles.length > 0)
  }

  // 6 days
  return [
    { label: 'Push A — Borst',             muscles: targets.filter(t=>['chest','triceps'].includes(t)) },
    { label: 'Pull A — Rug',               muscles: targets.filter(t=>['back','biceps'].includes(t)) },
    { label: 'Benen A',                    muscles: [...legMuscles, ...coreMuscles] },
    { label: 'Push B — Schouders',         muscles: targets.filter(t=>['shoulders','triceps','chest'].includes(t)) },
    { label: 'Pull B — Biceps & Core',     muscles: [...pullMuscles, ...coreMuscles] },
    { label: 'Benen B & Glutes',           muscles: [...legMuscles] },
  ].filter(d => d.muscles.length > 0)
}

// ── Exercise selector ─────────────────────────────────────────────────────────
function pickExercises(muscles: string[], exPerSession: number, level: string): Exercise[] {
  const categories = muscles.map(m => {
    const t = MUSCLE_TARGETS.find(x => x.id === m)
    return t?.category ?? m
  }).filter(Boolean)

  const pool = exercises.filter(e =>
    categories.includes(e.category) &&
    (level === 'all' || e.difficulty === level || e.difficulty === 'beginner')
  )

  // Sort: compounds first, then by difficulty match
  const diffRank: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 }
  const targetRank = level === 'all' ? 1 : (diffRank[level] ?? 1)
  const sorted = [...pool].sort((a, b) => {
    if (a.isCompound !== b.isCompound) return a.isCompound ? -1 : 1
    return Math.abs((diffRank[a.difficulty] ?? 1) - targetRank) -
           Math.abs((diffRank[b.difficulty] ?? 1) - targetRank)
  })

  // Pick unique categories first, then fill up
  const picked: Exercise[] = []
  const usedCats = new Set<string>()
  for (const ex of sorted) {
    if (picked.length >= exPerSession) break
    if (!usedCats.has(ex.category)) { picked.push(ex); usedCats.add(ex.category) }
  }
  for (const ex of sorted) {
    if (picked.length >= exPerSession) break
    if (!picked.some(p => p.id === ex.id)) picked.push(ex)
  }
  return picked.slice(0, exPerSession)
}

// ── Step components ───────────────────────────────────────────────────────────
const STEP_VARIANTS = {
  enter:   { opacity: 0, x: 40 },
  center:  { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
}

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={STEP_VARIANTS}
      initial="enter" animate="center" exit="exit"
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
    >
      {children}
    </motion.div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function PlanGeneratorPage() {
  const navigate = useNavigate()
  const { savePlan } = usePlans()
  useProfiles() // ensure profiles context is loaded

  const [step, setStep]             = useState(0)
  const [targets, setTargets]       = useState<string[]>([])
  const [daysPerWeek, setDays]      = useState(3)
  const [exPerSession, setEx]       = useState(5)
  const [level, setLevel]           = useState<'beginner'|'intermediate'|'advanced'|'all'>('intermediate')
  const [_generated, setGenerated]  = useState(false)
  const [saved, setSaved]           = useState(false)

  const split = useMemo(
    () => targets.length > 0 ? generateSplit(targets, daysPerWeek) : [],
    [targets, daysPerWeek]
  )

  const plan = useMemo(() =>
    split.map(day => ({
      ...day,
      exercises: pickExercises(day.muscles, exPerSession, level),
    })),
    [split, exPerSession, level]
  )

  const toggleTarget = (id: string) => {
    setTargets(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleGenerate = () => { setGenerated(true); setStep(3) }

  const handleSave = () => {
    plan.forEach((day) => {
      savePlan({
        name: `${day.label} (Gegenereerd)`,
        exercises: day.exercises.map(e => ({ exerciseId: e.id, sets: e.defaultSets })),
      })
    })
    setSaved(true)
  }

  const levelColors = {
    beginner:     '#10b981',
    intermediate: 'var(--theme-accent)',
    advanced:     '#EF4444',
    all:          '#A855F7',
  }

  return (
    <>
      <Header />
      <PageWrapper>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--theme-accent-muted)', border: '1px solid var(--theme-accent)' }}
          >
            <Sparkles size={22} style={{ color: 'var(--theme-accent)' }} />
          </div>
          <div>
            <h1 className="text-xl font-heading tracking-wider m-0" style={{ color: 'var(--theme-text-primary)' }}>
              TRAININGSPLAN GENERATOR
            </h1>
            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
              Persoonlijk schema op maat
            </p>
          </div>
        </div>

        {/* ── Progress bar ───────────────────────────────────────────────── */}
        <div className="flex gap-1.5 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--theme-accent)' }}
                animate={{ width: step >= i ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 0: Level ──────────────────────────────────────────────── */}
          {step === 0 && (
            <StepCard key="s0">
              <p className="text-sm font-semibold mb-5" style={{ color: 'var(--theme-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Ervaringsniveau
              </p>
              <div className="space-y-3 mb-8">
                {([
                  { id:'beginner',     label:'Beginner',       sub:'0–1 jaar trainen',   icon:'🌱' },
                  { id:'intermediate', label:'Gevorderd',       sub:'1–3 jaar trainen',   icon:'⚡' },
                  { id:'advanced',     label:'Expert',          sub:'3+ jaar trainen',    icon:'🏆' },
                  { id:'all',          label:'Mix (alle niveaus)', sub:'Brede selectie',   icon:'🎯' },
                ] as const).map(opt => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLevel(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-0 text-left"
                    style={{
                      background: level === opt.id ? `${levelColors[opt.id]}14` : 'var(--theme-bg-card)',
                      border: `1px solid ${level === opt.id ? levelColors[opt.id] + '60' : 'var(--theme-border)'}`,
                      boxShadow: level === opt.id ? `0 0 24px ${levelColors[opt.id]}20` : 'none',
                    }}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold m-0" style={{ color: level === opt.id ? levelColors[opt.id] : 'var(--theme-text-primary)' }}>
                        {opt.label}
                      </p>
                      <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{opt.sub}</p>
                    </div>
                    {level === opt.id && <Check size={18} style={{ color: levelColors[opt.id], flexShrink: 0 }} />}
                  </motion.button>
                ))}
              </div>
            </StepCard>
          )}

          {/* ── STEP 1: Muscle targets ─────────────────────────────────────── */}
          {step === 1 && (
            <StepCard key="s1">
              <p className="text-sm font-semibold mb-5" style={{ color: 'var(--theme-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Welke spiergroepen wil je trainen?
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {MUSCLE_TARGETS.map(t => {
                  const sel = targets.includes(t.id)
                  return (
                    <motion.button
                      key={t.id}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleTarget(t.id)}
                      className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer border-0 text-left"
                      style={{
                        background: sel ? `${t.color}18` : 'var(--theme-bg-card)',
                        border: `1px solid ${sel ? t.color + '60' : 'var(--theme-border)'}`,
                        boxShadow: sel ? `0 4px 20px ${t.color}22` : 'none',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: sel ? `${t.color}25` : 'var(--theme-glass)' }}
                      >
                        {t.icon}
                      </div>
                      <span
                        className="text-sm font-semibold leading-tight"
                        style={{ color: sel ? t.color : 'var(--theme-text-primary)' }}
                      >
                        {t.label}
                      </span>
                      {sel && (
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: t.color }}
                        >
                          <Check size={11} color="#fff" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
              {targets.length === 0 && (
                <p className="text-xs text-center mb-4" style={{ color: 'var(--theme-text-muted)' }}>
                  Selecteer minimaal 1 spiergroep
                </p>
              )}
            </StepCard>
          )}

          {/* ── STEP 2: Frequency & volume ─────────────────────────────────── */}
          {step === 2 && (
            <StepCard key="s2">
              <p className="text-sm font-semibold mb-5" style={{ color: 'var(--theme-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Volume & frequentie
              </p>

              {/* Days per week */}
              <div
                className="p-4 rounded-2xl mb-4"
                style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} style={{ color: 'var(--theme-accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    Trainingsdagen per week
                  </span>
                  <span
                    className="ml-auto text-2xl font-heading"
                    style={{ color: 'var(--theme-accent)' }}
                  >
                    {daysPerWeek}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[2,3,4,5,6].map(d => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDays(d)}
                      className="flex-1 py-2.5 rounded-xl font-heading text-sm cursor-pointer border-0"
                      style={{
                        background: daysPerWeek === d ? 'var(--theme-accent)' : 'var(--theme-glass)',
                        color: daysPerWeek === d ? '#fff' : 'var(--theme-text-secondary)',
                        border: `1px solid ${daysPerWeek === d ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                      }}
                    >
                      {d}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Exercises per session */}
              <div
                className="p-4 rounded-2xl mb-8"
                style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Dumbbell size={16} style={{ color: 'var(--theme-accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    Oefeningen per sessie
                  </span>
                  <span
                    className="ml-auto text-2xl font-heading"
                    style={{ color: 'var(--theme-accent)' }}
                  >
                    {exPerSession}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[3,4,5,6,7,8].map(n => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEx(n)}
                      className="flex-1 py-2.5 rounded-xl font-heading text-sm cursor-pointer border-0"
                      style={{
                        background: exPerSession === n ? 'var(--theme-accent)' : 'var(--theme-glass)',
                        color: exPerSession === n ? '#fff' : 'var(--theme-text-secondary)',
                        border: `1px solid ${exPerSession === n ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                      }}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Split preview */}
              <div className="mb-8">
                <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>
                  Jouw schema wordt
                </p>
                <div className="space-y-2">
                  {split.map((day, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--theme-accent-muted)', color: 'var(--theme-accent)' }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm m-0" style={{ color: 'var(--theme-text-primary)' }}>{day.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StepCard>
          )}

          {/* ── STEP 3: Result ─────────────────────────────────────────────── */}
          {step === 3 && (
            <StepCard key="s3">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--theme-text-secondary)' }}>
                  Jouw trainingsplan
                </p>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setGenerated(false); setStep(2) }}
                  className="flex items-center gap-1.5 text-xs cursor-pointer bg-transparent border-0 font-semibold"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  <RotateCcw size={12} /> Aanpassen
                </motion.button>
              </div>

              <div className="space-y-4 mb-8">
                {plan.map((day, di) => (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: di * 0.07 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid var(--theme-border)' }}
                  >
                    {/* Day header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        background: 'var(--theme-accent-muted)',
                        borderBottom: '1px solid var(--theme-border)',
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--theme-accent)', color: '#fff' }}
                      >
                        {di + 1}
                      </div>
                      <p className="text-sm font-bold m-0" style={{ color: 'var(--theme-accent)' }}>
                        {day.label}
                      </p>
                    </div>

                    {/* Exercises */}
                    <div style={{ background: 'var(--theme-bg-card)' }}>
                      {day.exercises.length === 0 ? (
                        <p className="text-xs p-4" style={{ color: 'var(--theme-text-muted)' }}>
                          Geen oefeningen gevonden voor dit niveau
                        </p>
                      ) : (
                        day.exercises.map((ex, ei) => (
                          <div
                            key={ex.id}
                            className="flex items-center gap-3 px-4 py-3"
                            style={{
                              borderTop: ei > 0 ? '1px solid var(--theme-border)' : 'none',
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: 'var(--theme-glass)', color: 'var(--theme-text-muted)' }}
                            >
                              {ei + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold m-0 truncate" style={{ color: 'var(--theme-text-primary)' }}>
                                {ex.nameNL}
                              </p>
                              <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                                {ex.defaultSets} sets · {ex.defaultReps} reps
                                {ex.isCompound ? ' · Compound' : ''}
                              </p>
                            </div>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
                              style={{
                                background: ex.difficulty === 'beginner' ? 'rgba(16,185,129,0.15)' : ex.difficulty === 'advanced' ? 'rgba(239,68,68,0.15)' : 'var(--theme-accent-muted)',
                                color: ex.difficulty === 'beginner' ? '#10b981' : ex.difficulty === 'advanced' ? '#EF4444' : 'var(--theme-accent)',
                              }}
                            >
                              {ex.difficulty === 'beginner' ? 'Begin' : ex.difficulty === 'advanced' ? 'Pro' : 'Mid'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Save */}
              {!saved ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-white cursor-pointer border-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to, #FF9050))',
                    boxShadow: '0 8px 32px var(--theme-accent-glow)',
                    fontSize: 15,
                  }}
                >
                  <BookMarked size={18} />
                  Sla {plan.length} plannen op
                </motion.button>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-3"
                >
                  <div
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}
                  >
                    <Check size={20} style={{ color: '#10b981' }} />
                    <div>
                      <p className="text-sm font-bold m-0" style={{ color: '#10b981' }}>Opgeslagen!</p>
                      <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                        {plan.length} plannen toegevoegd aan je plannenlijst
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/plans')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold cursor-pointer border-0"
                    style={{
                      background: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                    }}
                  >
                    Bekijk mijn plannen <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              )}
            </StepCard>
          )}

        </AnimatePresence>

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        {step < 3 && (
          <div className="flex gap-3 mt-2">
            {step > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl cursor-pointer border-0 font-semibold"
                style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-secondary)' }}
              >
                <ChevronLeft size={16} /> Terug
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (step === 2) handleGenerate()
                else setStep(s => s + 1)
              }}
              disabled={step === 1 && targets.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white cursor-pointer border-0"
              style={{
                background: step === 2
                  ? 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to, #FF9050))'
                  : 'var(--theme-accent)',
                opacity: step === 1 && targets.length === 0 ? 0.45 : 1,
                boxShadow: step === 2 ? '0 8px 32px var(--theme-accent-glow)' : 'none',
              }}
            >
              {step === 2 ? (
                <><Sparkles size={16} /> Genereer plan</>
              ) : (
                <>Volgende <ChevronRight size={16} /></>
              )}
            </motion.button>
          </div>
        )}

        <div className="h-28" />
      </PageWrapper>
    </>
  )
}

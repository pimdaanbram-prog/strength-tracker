import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Clock, Users, User, CheckCircle, ArrowLeft } from 'lucide-react'
import ExerciseCard from '../components/workout/ExerciseCard'
import MultiPersonExerciseCard from '../components/workout/MultiPersonExerciseCard'
import SamenTrainenSelector from '../components/workout/SamenTrainenSelector'
import WorkoutBuilder from '../components/workout/WorkoutBuilder'
import RestTimer from '../components/workout/RestTimer'
import AmbientBackground from '../components/ui/AmbientBackground'
import { useWorkouts } from '../hooks/useWorkouts'
import type { SessionExercise, SetLog } from '../hooks/useWorkouts'
import { useGamification } from '../hooks/useGamification'
import { useToast } from '../contexts/ToastContext'
import { useExercises } from '../hooks/useExercises'
import { useProfiles } from '../hooks/useProfiles'
import { useAppStore } from '../store/appStore'
import type { UserProfile } from '../store/appStore'
import { useTimer } from '../hooks/useTimer'
import { usePlans } from '../hooks/usePlans'
import { useLanguage } from '../hooks/useLanguage'
import { workoutTemplates } from '../data/workoutTemplates'
import { calculateRecommendedWeight } from '../utils/weightCalculator'
import { getDayLabel, toISODateString } from '../utils/weekUtils'
import type { Exercise } from '../data/exercises'

type WorkoutMode = 'choose' | 'solo' | 'samen-select' | 'samen'

export default function WorkoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { saveSession, saveSessionForProfile, getLastExerciseSets, getSmartRecommendation, getPersonalRecords } = useWorkouts()
  const { awardWorkoutXP } = useGamification()
  const { showAchievement } = useToast()
  const { getExercise } = useExercises()
  const { activeProfile } = useProfiles()
  const allProfiles = useAppStore(s => s.profiles)
  const timer = useTimer()
  const { getPlan, markPlanUsed } = usePlans()
  const { exName } = useLanguage()

  const templateId = (location.state as { templateId?: string })?.templateId
  const planId = (location.state as { planId?: string })?.planId
  const startSamen = (location.state as { samen?: boolean })?.samen ?? false

  const [mode, setMode] = useState<WorkoutMode>(
    startSamen ? 'samen-select' : (templateId || planId) ? 'solo' : 'choose'
  )
  const [workoutName, setWorkoutName] = useState('Eigen Training')
  const [showBuilder, setShowBuilder] = useState(false)
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [started, setStarted] = useState(false)

  const [exercises, setExercises] = useState<SessionExercise[]>([])
  const [samenParticipants, setSamenParticipants] = useState<UserProfile[]>([])
  const [samenExercises, setSamenExercises] = useState<Record<string, SessionExercise[]>>({})
  const [samenExerciseOrder, setSamenExerciseOrder] = useState<string[]>([])

  useEffect(() => {
    if (mode !== 'solo') return
    if (planId) {
      const plan = getPlan(planId)
      if (plan) {
        setWorkoutName(plan.name)
        const sessionExercises: SessionExercise[] = plan.exercises.map(pe => {
          const lastData = getLastExerciseSets(pe.exerciseId)
          const prefilledWeight = lastData?.maxWeight ?? null
          const sets: SetLog[] = Array.from({ length: pe.sets }, (_, i) => ({
            setNumber: i + 1, weight: prefilledWeight,
            reps: lastData?.sets[i]?.reps ?? null, seconds: null, completed: false, rpe: null,
          }))
          return { exerciseId: pe.exerciseId, sets, notes: '' }
        })
        setExercises(sessionExercises)
        setStarted(true)
        timer.start()
        markPlanUsed(planId)
      }
      return
    }
    if (templateId) {
      const template = workoutTemplates.find(t => t.id === templateId)
      if (template) {
        setWorkoutName(exName(template))
        const sessionExercises: SessionExercise[] = template.exercises.map(te => {
          const lastData = getLastExerciseSets(te.exerciseId)
          const prefilledWeight = lastData?.maxWeight ?? null
          const sets: SetLog[] = Array.from({ length: te.sets }, (_, i) => ({
            setNumber: i + 1, weight: prefilledWeight,
            reps: lastData?.sets[i]?.reps ?? null, seconds: null, completed: false, rpe: null,
          }))
          return { exerciseId: te.exerciseId, sets, notes: '' }
        })
        setExercises(sessionExercises)
        setStarted(true)
        timer.start()
      }
    }
  }, [templateId, planId, mode])

  const selectedIds = mode === 'solo' ? exercises.map(e => e.exerciseId) : samenExerciseOrder

  const handleAddExercise = (exercise: Exercise) => {
    if (mode === 'solo') {
      const lastData = getLastExerciseSets(exercise.id)
      const prefilledWeight = lastData?.maxWeight ?? null
      const sets: SetLog[] = Array.from({ length: exercise.defaultSets }, (_, i) => ({
        setNumber: i + 1, weight: prefilledWeight,
        reps: lastData?.sets[i]?.reps ?? null, seconds: null, completed: false, rpe: null,
      }))
      setExercises(prev => [...prev, { exerciseId: exercise.id, sets, notes: '' }])
    } else if (mode === 'samen') {
      setSamenExerciseOrder(prev => [...prev, exercise.id])
      setSamenExercises(prev => {
        const updated = { ...prev }
        for (const profileId of Object.keys(updated)) {
          const lastData = getLastExerciseSets(exercise.id, profileId)
          const prefilledWeight = lastData?.maxWeight ?? null
          const sets: SetLog[] = Array.from({ length: exercise.defaultSets }, (_, i) => ({
            setNumber: i + 1, weight: prefilledWeight,
            reps: lastData?.sets[i]?.reps ?? null, seconds: null, completed: false, rpe: null,
          }))
          updated[profileId] = [...updated[profileId], { exerciseId: exercise.id, sets, notes: '' }]
        }
        return updated
      })
    }
    if (!started) { setStarted(true); timer.start() }
  }

  const handleAddMultipleExercises = (exercises: Exercise[]) => {
    exercises.forEach(exercise => handleAddExercise(exercise))
    setShowBuilder(false)
  }

  const handleUpdateExercise = (index: number, updated: SessionExercise) => {
    setExercises(prev => { const next = [...prev]; next[index] = updated; return next })
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleSamenStart = (selectedProfileIds: string[]) => {
    const selectedProfiles = allProfiles.filter(p => selectedProfileIds.includes(p.id))
    setSamenParticipants(selectedProfiles)
    const initial: Record<string, SessionExercise[]> = {}
    for (const id of selectedProfileIds) initial[id] = []

    if (planId) {
      const plan = getPlan(planId)
      if (plan) {
        setWorkoutName(plan.name)
        const exerciseOrder = plan.exercises.map(pe => pe.exerciseId)
        setSamenExerciseOrder(exerciseOrder)
        const withExercises: Record<string, SessionExercise[]> = {}
        for (const profileId of selectedProfileIds) {
          withExercises[profileId] = plan.exercises.map(pe => {
            const lastData = getLastExerciseSets(pe.exerciseId, profileId)
            const prefilledWeight = lastData?.maxWeight ?? null
            const sets: SetLog[] = Array.from({ length: pe.sets }, (_, i) => ({
              setNumber: i + 1, weight: prefilledWeight,
              reps: lastData?.sets[i]?.reps ?? null, seconds: null, completed: false, rpe: null,
            }))
            return { exerciseId: pe.exerciseId, sets, notes: '' }
          })
        }
        setSamenExercises(withExercises)
        markPlanUsed(planId)
        setStarted(true)
        timer.start()
        setMode('samen')
        return
      }
    }

    setSamenExercises(initial)
    setSamenExerciseOrder([])
    setMode('samen')
  }

  const handleSamenUpdateExercise = (exerciseIndex: number, profileId: string, updated: SessionExercise) => {
    setSamenExercises(prev => {
      const profileExercises = [...(prev[profileId] || [])]
      profileExercises[exerciseIndex] = updated
      return { ...prev, [profileId]: profileExercises }
    })
  }

  const handleSamenRemoveExercise = (exerciseIndex: number) => {
    setSamenExerciseOrder(prev => prev.filter((_, i) => i !== exerciseIndex))
    setSamenExercises(prev => {
      const updated = { ...prev }
      for (const profileId of Object.keys(updated)) {
        updated[profileId] = updated[profileId].filter((_, i) => i !== exerciseIndex)
      }
      return updated
    })
  }

  const handleSave = () => {
    const now = new Date()
    const durationMinutes = Math.round(timer.seconds / 60)
    const existingPRs = getPersonalRecords()
    const prMap: Record<string, number> = {}
    for (const pr of existingPRs) prMap[pr.exerciseId] = pr.weight

    const findNewPRExerciseIds = (exList: SessionExercise[]): string[] =>
      exList.reduce<string[]>((acc, ex) => {
        const maxW = Math.max(0, ...ex.sets
          .filter(s => s.weight !== null && s.weight > 0 && (s.completed || (s.reps !== null && s.reps > 0)))
          .map(s => s.weight!))
        if (maxW > 0 && (prMap[ex.exerciseId] == null || maxW > prMap[ex.exerciseId])) acc.push(ex.exerciseId)
        return acc
      }, [])

    if (mode === 'solo') {
      if (exercises.length === 0) return
      const newPRIds = findNewPRExerciseIds(exercises)
      saveSession({ date: toISODateString(now), dayLabel: getDayLabel(now), workoutName, exercises, durationMinutes, notes, completedAt: now.toISOString() })
      for (const id of newPRIds) { const ex = getExercise(id); showAchievement('Nieuw PR!', ex ? exName(ex) : '') }
      awardWorkoutXP(durationMinutes, newPRIds.length > 0)
    } else if (mode === 'samen') {
      if (samenExerciseOrder.length === 0) return
      let anyPR = false
      for (const participant of samenParticipants) {
        const participantExercises = samenExercises[participant.id] || []
        saveSessionForProfile(participant.id, { date: toISODateString(now), dayLabel: getDayLabel(now), workoutName, exercises: participantExercises, durationMinutes, notes, completedAt: now.toISOString() })
        const newPRIds = findNewPRExerciseIds(participantExercises)
        if (newPRIds.length > 0) anyPR = true
        for (const id of newPRIds) { const ex = getExercise(id); showAchievement('Nieuw PR!', `${participant.name} — ${ex ? exName(ex) : ''}`) }
      }
      awardWorkoutXP(durationMinutes, anyPR)
    }

    timer.reset()
    navigate('/')
  }

  const totalExerciseCount = mode === 'solo' ? exercises.length : samenExerciseOrder.length
  const completedExercises = mode === 'solo'
    ? exercises.filter(e => e.sets.every(s => s.completed) && e.sets.length > 0).length
    : samenExerciseOrder.filter((_, i) => samenParticipants.every(p => {
        const se = samenExercises[p.id]?.[i]
        return se && se.sets.length > 0 && se.sets.every(s => s.completed)
      })).length

  const progressPct = totalExerciseCount > 0 ? (completedExercises / totalExerciseCount) * 100 : 0

  // ── Mode selection screen ──────────────────────────────────────────────────
  if (mode === 'choose' || mode === 'samen-select') {
    return (
      <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
        <AmbientBackground intensity={0.7} />
        <div className="relative z-10">
          {/* Header */}
          <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3.5"
            style={{ background: 'rgba(6,6,10,0.6)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--theme-glass-border)' }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-0"
              style={{ background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)', color: 'var(--theme-text-muted)' }}>
              <ArrowLeft size={16} />
            </motion.button>
            <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>
              Training starten
            </span>
          </div>

          <div className="max-w-lg mx-auto px-4 pt-8"
            style={{ paddingBottom: 'calc(max(4.5rem, env(safe-area-inset-bottom)) + 4rem)' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
                Hoe wil je trainen?
              </div>
              <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>Kies of je alleen of samen wilt trainen</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}>
              {[
                { icon: User, label: 'Solo', desc: 'Alleen trainen', action: () => setMode('solo') },
                { icon: Users, label: 'Samen', desc: allProfiles.length < 2 ? '+ Profiel toevoegen' : 'Samen trainen', action: () => allProfiles.length < 2 ? navigate('/profiles/new') : setMode('samen-select') },
              ].map(({ icon: Icon, label, desc, action }, i) => (
                <motion.button key={label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                  whileTap={{ scale: 0.97 }} onClick={action}
                  className="flex flex-col items-center gap-3 cursor-pointer border-0 text-center"
                  style={{ padding: 28, background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)', borderRadius: 22, transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--theme-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--theme-glass-border)')}>
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--theme-accent-muted)', border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--theme-text-secondary)', margin: '4px 0 0' }}>{desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mode === 'samen-select' && (
            <SamenTrainenSelector profiles={allProfiles} onStart={handleSamenStart}
              onClose={() => { if (startSamen) navigate('/'); else setMode('choose') }} />
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
      <AmbientBackground intensity={0.5} />
      <div className="relative z-10">
        {/* ── Sticky glass top bar ──────────────────────────────────────────────── */}
        <div className="sticky top-0 z-40"
          style={{ background: 'rgba(6,6,10,0.7)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderBottom: '1px solid var(--theme-glass-border)' }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-0 shrink-0"
              style={{ background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)', color: 'var(--theme-text-muted)' }}>
              <ArrowLeft size={16} />
            </motion.button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <input type="text" inputMode="text" autoComplete="off"
                value={workoutName} onChange={e => setWorkoutName(e.target.value)}
                style={{ width: '100%', background: 'transparent', fontSize: 15, fontWeight: 600, color: 'var(--theme-text-primary)', outline: 'none', border: 'none', fontFamily: 'inherit', padding: 0 }}
                placeholder="Training naam..." />
              {mode === 'samen' && samenParticipants.length > 0 && (
                <div style={{ fontSize: 10, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)', marginTop: 1 }}>
                  {samenParticipants.map(p => p.name).join(' · ')}
                </div>
              )}
            </div>

            {started && (
              <div className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full"
                style={{ background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)' }}>
                <Clock size={11} style={{ color: 'var(--theme-accent)' }} />
                <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 600, color: 'var(--theme-text-secondary)' }}>
                  {timer.formatTime()}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {started && totalExerciseCount > 0 && (
            <div style={{ height: 2, background: 'var(--theme-glass-border)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ height: '100%', background: 'var(--theme-accent-grad)' }} />
            </div>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────────────────────── */}
        <div className="max-w-lg mx-auto px-4 pt-4"
          style={{ paddingBottom: 'calc(max(4.5rem, env(safe-area-inset-bottom)) + 6rem)' }}>

          {/* Exercise count pill */}
          {started && totalExerciseCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div style={{ fontSize: 11, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)' }}>
                {completedExercises}/{totalExerciseCount} oefeningen
              </div>
              {completedExercises > 0 && (
                <div style={{ fontSize: 11, color: 'var(--theme-success)', fontFamily: 'var(--theme-font-mono)' }}>
                  · {completedExercises} voltooid
                </div>
              )}
            </div>
          )}

          {/* Exercise cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            <AnimatePresence>
              {mode === 'solo' && exercises.map((se, i) => {
                const exercise = getExercise(se.exerciseId)
                if (!exercise) return null
                const recommended = activeProfile ? calculateRecommendedWeight(exercise, activeProfile) : null
                const lastSession = getLastExerciseSets(se.exerciseId)
                const smartRec = getSmartRecommendation(se.exerciseId)
                return (
                  <motion.div key={se.exerciseId + i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.04 }}>
                    <ExerciseCard exercise={exercise} sessionExercise={se}
                      recommendedWeight={recommended} lastSession={lastSession}
                      smartRecommendation={smartRec}
                      onUpdate={updated => handleUpdateExercise(i, updated)}
                      onRemove={() => handleRemoveExercise(i)}
                      onStartRest={sec => setRestTimer(sec)} />
                  </motion.div>
                )
              })}

              {mode === 'samen' && samenExerciseOrder.map((exerciseId, i) => {
                const exercise = getExercise(exerciseId)
                if (!exercise) return null
                const participantData = samenParticipants.map(p => ({
                  profile: p,
                  sessionExercise: samenExercises[p.id]?.[i] || { exerciseId, sets: [], notes: '' },
                  recommendedWeight: calculateRecommendedWeight(exercise, p),
                  lastSession: getLastExerciseSets(exerciseId, p.id),
                  smartRecommendation: getSmartRecommendation(exerciseId, p.id),
                }))
                return (
                  <motion.div key={exerciseId + i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.04 }}>
                    <MultiPersonExerciseCard exercise={exercise} participants={participantData}
                      onUpdate={(profileId, updated) => handleSamenUpdateExercise(i, profileId, updated)}
                      onRemove={() => handleSamenRemoveExercise(i)}
                      onStartRest={sec => setRestTimer(sec)} />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Add exercise button */}
          {(mode === 'solo' || mode === 'samen') && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowBuilder(true)}
              className="w-full flex items-center justify-center gap-2 cursor-pointer border-0"
              style={{ padding: '14px 18px', borderRadius: 16, background: 'transparent', border: '2px dashed var(--theme-glass-border)', color: 'var(--theme-text-muted)', fontSize: 13, fontWeight: 500, transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--theme-accent)'; e.currentTarget.style.color = 'var(--theme-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--theme-glass-border)'; e.currentTarget.style.color = 'var(--theme-text-muted)' }}>
              <Plus size={16} /> Oefening toevoegen
            </motion.button>
          )}

          {/* Empty state */}
          {totalExerciseCount === 0 && !templateId && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-center" style={{ paddingTop: 48 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--theme-accent-muted)', border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {mode === 'samen' ? <Users size={28} style={{ color: 'var(--theme-accent)' }} /> : <CheckCircle size={28} style={{ color: 'var(--theme-accent)' }} />}
              </div>
              <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
                {mode === 'samen' ? 'Samen trainen' : 'Start je training'}
              </div>
              <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>Voeg oefeningen toe om te beginnen</p>
            </motion.div>
          )}

          {/* Notes */}
          {started && (
            <div style={{ marginTop: 16 }}>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Notities voor deze training..."
                style={{ width: '100%', background: 'var(--theme-glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--theme-glass-border)', borderRadius: 16, padding: '12px 16px', fontSize: 13, color: 'var(--theme-text-primary)', outline: 'none', resize: 'none', height: 80, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>
      </div>

      {/* ── Floating save button ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {totalExerciseCount > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', damping: 20 }}
            style={{ position: 'fixed', bottom: 'calc(max(4.5rem, env(safe-area-inset-bottom)) + 16px)', left: 16, right: 16, zIndex: 50, maxWidth: 480, margin: '0 auto' }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 text-white font-bold cursor-pointer border-0"
              style={{ padding: '17px 18px', borderRadius: 18, fontSize: 14, letterSpacing: '0.04em', fontFamily: 'var(--theme-font-mono)', background: 'var(--theme-accent-grad)', boxShadow: '0 16px 40px var(--theme-accent-glow), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
              <CheckCircle size={16} /> TRAINING AFRONDEN
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showBuilder && (
          <WorkoutBuilder isOpen={showBuilder} onClose={() => setShowBuilder(false)}
            onAddExercise={exercise => { handleAddExercise(exercise); setShowBuilder(false) }}
            onAddMultipleExercises={handleAddMultipleExercises} selectedIds={selectedIds} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {restTimer !== null && (
          <RestTimer duration={restTimer} onClose={() => setRestTimer(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

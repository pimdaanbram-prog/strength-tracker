import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Save, Clock, Users, User } from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import ExerciseCard from '../components/workout/ExerciseCard'
import MultiPersonExerciseCard from '../components/workout/MultiPersonExerciseCard'
import SamenTrainenSelector from '../components/workout/SamenTrainenSelector'
import WorkoutBuilder from '../components/workout/WorkoutBuilder'
import RestTimer from '../components/workout/RestTimer'
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

  // Solo mode state
  const [exercises, setExercises] = useState<SessionExercise[]>([])

  // Samen mode state
  const [samenParticipants, setSamenParticipants] = useState<UserProfile[]>([])
  // Record<profileId, SessionExercise[]>
  const [samenExercises, setSamenExercises] = useState<Record<string, SessionExercise[]>>({})
  // List of exercise IDs in order (shared across participants)
  const [samenExerciseOrder, setSamenExerciseOrder] = useState<string[]>([])

  // Load template or custom plan (solo mode only)
  useEffect(() => {
    if (mode !== 'solo') return

    // Custom plan
    if (planId) {
      const plan = getPlan(planId)
      if (plan) {
        setWorkoutName(plan.name)
        const sessionExercises: SessionExercise[] = plan.exercises.map(pe => {
          const smartRec = getSmartRecommendation(pe.exerciseId)
          const lastData = getLastExerciseSets(pe.exerciseId)
          const prefilledWeight = smartRec?.weight ?? lastData?.maxWeight ?? null
          const sets: SetLog[] = Array.from({ length: pe.sets }, (_, i) => ({
            setNumber: i + 1,
            weight: prefilledWeight,
            reps: null,
            seconds: null,
            completed: false,
            rpe: null,
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

    // Built-in template
    if (templateId) {
      const template = workoutTemplates.find(t => t.id === templateId)
      if (template) {
        setWorkoutName(exName(template))
        const sessionExercises: SessionExercise[] = template.exercises.map(te => {
          const smartRec = getSmartRecommendation(te.exerciseId)
          const lastData = getLastExerciseSets(te.exerciseId)
          const prefilledWeight = smartRec?.weight ?? lastData?.maxWeight ?? null
          const sets: SetLog[] = Array.from({ length: te.sets }, (_, i) => ({
            setNumber: i + 1,
            weight: prefilledWeight,
            reps: null,
            seconds: null,
            completed: false,
            rpe: null,
          }))
          return { exerciseId: te.exerciseId, sets, notes: '' }
        })
        setExercises(sessionExercises)
        setStarted(true)
        timer.start()
      }
    }
  }, [templateId, planId, mode])

  // --- Solo mode handlers ---
  const selectedIds = mode === 'solo'
    ? exercises.map(e => e.exerciseId)
    : samenExerciseOrder

  const handleAddExercise = (exercise: Exercise) => {
    if (mode === 'solo') {
      const smartRec = getSmartRecommendation(exercise.id)
      const lastData = getLastExerciseSets(exercise.id)
      const prefilledWeight = smartRec?.weight ?? lastData?.maxWeight ?? null
      const sets: SetLog[] = Array.from({ length: exercise.defaultSets }, (_, i) => ({
        setNumber: i + 1,
        weight: prefilledWeight,
        reps: null,
        seconds: null,
        completed: false,
        rpe: null,
      }))
      setExercises(prev => [...prev, { exerciseId: exercise.id, sets, notes: '' }])
    } else if (mode === 'samen') {
      // Add exercise for all participants
      setSamenExerciseOrder(prev => [...prev, exercise.id])
      setSamenExercises(prev => {
        const updated = { ...prev }
        for (const profileId of Object.keys(updated)) {
          const smartRec = getSmartRecommendation(exercise.id, profileId)
          const lastData = getLastExerciseSets(exercise.id, profileId)
          const prefilledWeight = smartRec?.weight ?? lastData?.maxWeight ?? null
          const sets: SetLog[] = Array.from({ length: exercise.defaultSets }, (_, i) => ({
            setNumber: i + 1,
            weight: prefilledWeight,
            reps: null,
            seconds: null,
            completed: false,
            rpe: null,
          }))
          updated[profileId] = [
            ...updated[profileId],
            { exerciseId: exercise.id, sets, notes: '' },
          ]
        }
        return updated
      })
    }

    if (!started) {
      setStarted(true)
      timer.start()
    }
  }

  const handleAddMultipleExercises = (exercises: Exercise[]) => {
    exercises.forEach(exercise => handleAddExercise(exercise))
    setShowBuilder(false)
  }

  const handleUpdateExercise = (index: number, updated: SessionExercise) => {
    setExercises(prev => {
      const next = [...prev]
      next[index] = updated
      return next
    })
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  // --- Samen mode handlers ---
  const handleSamenStart = (selectedProfileIds: string[]) => {
    const selectedProfiles = allProfiles.filter(p => selectedProfileIds.includes(p.id))
    setSamenParticipants(selectedProfiles)

    const initial: Record<string, SessionExercise[]> = {}
    for (const id of selectedProfileIds) {
      initial[id] = []
    }

    // If a plan was selected, pre-load its exercises for each participant
    if (planId) {
      const plan = getPlan(planId)
      if (plan) {
        setWorkoutName(plan.name)
        const exerciseOrder = plan.exercises.map(pe => pe.exerciseId)
        setSamenExerciseOrder(exerciseOrder)

        const withExercises: Record<string, SessionExercise[]> = {}
        for (const profileId of selectedProfileIds) {
          withExercises[profileId] = plan.exercises.map(pe => {
            const smartRec = getSmartRecommendation(pe.exerciseId, profileId)
            const lastData = getLastExerciseSets(pe.exerciseId, profileId)
            const prefilledWeight = smartRec?.weight ?? lastData?.maxWeight ?? null
            const sets: SetLog[] = Array.from({ length: pe.sets }, (_, i) => ({
              setNumber: i + 1,
              weight: prefilledWeight,
              reps: null,
              seconds: null,
              completed: false,
              rpe: null,
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

  const handleSamenUpdateExercise = (
    exerciseIndex: number,
    profileId: string,
    updated: SessionExercise
  ) => {
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

  // --- Save ---
  const handleSave = () => {
    const now = new Date()
    const durationMinutes = Math.round(timer.seconds / 60)

    // Snapshot existing PRs BEFORE saving so the new session doesn't inflate the comparison
    const existingPRs = getPersonalRecords()
    const prMap: Record<string, number> = {}
    for (const pr of existingPRs) prMap[pr.exerciseId] = pr.weight

    const findNewPRExerciseIds = (exList: SessionExercise[]): string[] =>
      exList.reduce<string[]>((acc, ex) => {
        const maxW = Math.max(
          0,
          ...ex.sets
            .filter(s => s.weight !== null && s.weight > 0 && (s.completed || (s.reps !== null && s.reps > 0)))
            .map(s => s.weight!)
        )
        if (maxW > 0 && (prMap[ex.exerciseId] == null || maxW > prMap[ex.exerciseId])) {
          acc.push(ex.exerciseId)
        }
        return acc
      }, [])

    if (mode === 'solo') {
      if (exercises.length === 0) return

      const newPRIds = findNewPRExerciseIds(exercises)

      saveSession({
        date: toISODateString(now),
        dayLabel: getDayLabel(now),
        workoutName,
        exercises,
        durationMinutes,
        notes,
        completedAt: now.toISOString(),
      })

      for (const id of newPRIds) {
        const ex = getExercise(id)
        showAchievement('Nieuw PR!', ex ? exName(ex) : '')
      }

      awardWorkoutXP(durationMinutes, newPRIds.length > 0)
    } else if (mode === 'samen') {
      if (samenExerciseOrder.length === 0) return

      let anyPR = false
      const participantIds = samenParticipants.map(p => p.id)
      for (const participant of samenParticipants) {
        const participantExercises = samenExercises[participant.id] || []
        saveSessionForProfile(participant.id, {
          date: toISODateString(now),
          dayLabel: getDayLabel(now),
          workoutName,
          exercises: participantExercises,
          durationMinutes,
          notes,
          completedAt: now.toISOString(),
          isPartnerWorkout: true,
          partners: participantIds.filter(id => id !== participant.id),
        })
        const newPRIds = findNewPRExerciseIds(participantExercises)
        if (newPRIds.length > 0) anyPR = true
        for (const id of newPRIds) {
          const ex = getExercise(id)
          showAchievement('Nieuw PR!', `${participant.name} — ${ex ? exName(ex) : ''}`)
        }
      }

      awardWorkoutXP(durationMinutes, anyPR)
    }

    timer.reset()
    navigate('/')
  }

  // --- Computed ---
  const totalExerciseCount = mode === 'solo' ? exercises.length : samenExerciseOrder.length

  const completedExercises =
    mode === 'solo'
      ? exercises.filter(e => e.sets.every(s => s.completed) && e.sets.length > 0).length
      : samenExerciseOrder.filter((_, i) => {
          return samenParticipants.every(p => {
            const se = samenExercises[p.id]?.[i]
            return se && se.sets.length > 0 && se.sets.every(s => s.completed)
          })
        }).length

  // --- Mode selection screen ---
  if (mode === 'choose') {
    return (
      <>
        <Header title="TRAINING" showBack />
        <PageWrapper>
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h2 className="text-2xl font-heading tracking-wider mb-2">HOE WIL JE TRAINEN?</h2>
            <p className="text-text-secondary text-sm mb-8">
              Kies of je alleen of samen wilt trainen
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('solo')}
                className="flex flex-col items-center gap-3 p-6 bg-bg-card border border-border rounded-xl hover:border-accent transition-colors cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <User size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold m-0">Solo</p>
                  <p className="text-xs text-text-muted m-0 mt-1">Alleen trainen</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('samen-select')}
                className="flex flex-col items-center gap-3 p-6 bg-bg-card border border-border rounded-xl hover:border-accent transition-colors cursor-pointer"
                disabled={allProfiles.length < 2}
              >
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <Users size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold m-0">Samen</p>
                  <p className="text-xs text-text-muted m-0 mt-1">
                    {allProfiles.length < 2
                      ? 'Min. 2 profielen nodig'
                      : 'Samen trainen'}
                  </p>
                </div>
              </motion.button>
            </div>
          </div>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <Header title="TRAINING" showBack />
      <PageWrapper>
        {/* Mode indicator for samen */}
        {mode === 'samen' && (
          <div className="flex items-center gap-2 mb-3 text-xs text-text-muted">
            <Users size={14} className="text-accent" />
            <span>
              Samen trainen:{' '}
              {samenParticipants.map(p => p.name).join(', ')}
            </span>
          </div>
        )}

        {/* Workout name */}
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="w-full bg-transparent text-2xl font-heading tracking-wider text-text-primary outline-none mb-1"
          placeholder="Training naam..."
        />

        {/* Timer & Stats */}
        {started && (
          <div className="flex items-center gap-4 mb-5 text-text-muted">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span className="text-sm font-mono">{timer.formatTime()}</span>
            </div>
            <span className="text-sm">
              {completedExercises}/{totalExerciseCount} oefeningen
            </span>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-4 mb-5">
          <AnimatePresence>
            {mode === 'solo' &&
              exercises.map((se, i) => {
                const exercise = getExercise(se.exerciseId)
                if (!exercise) return null
                const recommended = activeProfile
                  ? calculateRecommendedWeight(exercise, activeProfile)
                  : null
                const lastSession = getLastExerciseSets(se.exerciseId)
                const smartRec = getSmartRecommendation(se.exerciseId)
                return (
                  <motion.div
                    key={se.exerciseId + i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ExerciseCard
                      exercise={exercise}
                      sessionExercise={se}
                      recommendedWeight={recommended}
                      lastSession={lastSession}
                      smartRecommendation={smartRec}
                      onUpdate={updated => handleUpdateExercise(i, updated)}
                      onRemove={() => handleRemoveExercise(i)}
                      onStartRest={sec => setRestTimer(sec)}
                    />
                  </motion.div>
                )
              })}

            {mode === 'samen' &&
              samenExerciseOrder.map((exerciseId, i) => {
                const exercise = getExercise(exerciseId)
                if (!exercise) return null

                const participantData = samenParticipants.map(p => ({
                  profile: p,
                  sessionExercise: samenExercises[p.id]?.[i] || {
                    exerciseId,
                    sets: [],
                    notes: '',
                  },
                  recommendedWeight: calculateRecommendedWeight(exercise, p),
                  lastSession: getLastExerciseSets(exerciseId, p.id),
                  smartRecommendation: getSmartRecommendation(exerciseId, p.id),
                }))

                return (
                  <motion.div
                    key={exerciseId + i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <MultiPersonExerciseCard
                      exercise={exercise}
                      participants={participantData}
                      onUpdate={(profileId, updated) =>
                        handleSamenUpdateExercise(i, profileId, updated)
                      }
                      onRemove={() => handleSamenRemoveExercise(i)}
                      onStartRest={sec => setRestTimer(sec)}
                    />
                  </motion.div>
                )
              })}
          </AnimatePresence>
        </div>

        {/* Add exercise button */}
        {(mode === 'solo' || mode === 'samen') && (
          <button
            onClick={() => setShowBuilder(true)}
            className="w-full py-4 border-2 border-dashed border-border rounded-xl text-text-muted hover:text-text-secondary hover:border-border-light transition-colors flex items-center justify-center gap-2 cursor-pointer bg-transparent"
          >
            <Plus size={18} /> Oefening toevoegen
          </button>
        )}

        {/* Notes */}
        {started && (
          <div className="mt-5">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notities voor deze training..."
              className="w-full bg-bg-input border border-border rounded-xl p-4 text-sm text-text-primary outline-none resize-none h-24 placeholder:text-text-muted"
            />
          </div>
        )}

        {/* Save button */}
        {totalExerciseCount > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6"
          >
            <button
              onClick={handleSave}
              className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={18} /> Training Opslaan
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {totalExerciseCount === 0 && !templateId && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">
              {mode === 'samen' ? '👥' : '🏋️'}
            </span>
            <h3 className="text-xl tracking-wider mb-2">
              {mode === 'samen' ? 'SAMEN TRAINEN' : 'START JE TRAINING'}
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              Voeg oefeningen toe om te beginnen
            </p>
          </div>
        )}

        {/* Workout Builder Modal */}
        <AnimatePresence>
          {showBuilder && (
            <WorkoutBuilder
              isOpen={showBuilder}
              onClose={() => setShowBuilder(false)}
              onAddExercise={exercise => {
                handleAddExercise(exercise)
                setShowBuilder(false)
              }}
              onAddMultipleExercises={handleAddMultipleExercises}
              selectedIds={selectedIds}
            />
          )}
        </AnimatePresence>

        {/* Samen Trainen Selector Modal */}
        <AnimatePresence>
          {mode === 'samen-select' && (
            <SamenTrainenSelector
              profiles={allProfiles}
              onStart={handleSamenStart}
              onClose={() => {
                if (startSamen) {
                  navigate('/')
                } else {
                  setMode('choose')
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Rest Timer */}
        <AnimatePresence>
          {restTimer !== null && (
            <RestTimer
              duration={restTimer}
              onClose={() => setRestTimer(null)}
            />
          )}
        </AnimatePresence>
      </PageWrapper>
    </>
  )
}

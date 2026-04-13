import { useState } from 'react'
import { ChevronDown, ChevronUp, Timer, Trash2, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MultiPersonSetLogger from './MultiPersonSetLogger'
import { useLanguage } from '../../hooks/useLanguage'
import type { SessionExercise, SetLog } from '../../hooks/useWorkouts'
import type { Exercise } from '../../data/exercises'
import type { UserProfile } from '../../store/appStore'

interface LastSession {
  date: string
  sets: { weight: number | null; reps: number | null }[]
  maxWeight: number
  maxReps: number
}

interface SmartRecommendation {
  weight: number
  reps: string
  trend: 'up' | 'same' | 'down' | 'new'
  note: string
}

interface ParticipantData {
  profile: UserProfile
  sessionExercise: SessionExercise
  recommendedWeight: number | null
  lastSession: LastSession | null
  smartRecommendation: SmartRecommendation | null
}

interface MultiPersonExerciseCardProps {
  exercise: Exercise
  participants: ParticipantData[]
  onUpdate: (profileId: string, updated: SessionExercise) => void
  onRemove: () => void
  onStartRest: (seconds: number) => void
}

export default function MultiPersonExerciseCard({
  exercise,
  participants,
  onUpdate,
  onRemove,
  onStartRest,
}: MultiPersonExerciseCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const { exName } = useLanguage()

  const totalCompletedAll = participants.reduce((sum, p) => {
    return sum + p.sessionExercise.sets.filter(s => s.completed).length
  }, 0)
  const totalSetsAll = participants.reduce((sum, p) => {
    return sum + p.sessionExercise.sets.length
  }, 0)

  const handleSetChange = (profileId: string, se: SessionExercise, index: number, updated: SetLog) => {
    const newSets = [...se.sets]
    newSets[index] = updated

    if (updated.completed && !se.sets[index].completed) {
      onStartRest(exercise.restSeconds)
    }

    onUpdate(profileId, { ...se, sets: newSets })
  }

  const addSet = (profileId: string, se: SessionExercise) => {
    const lastSet = se.sets[se.sets.length - 1]
    const newSet: SetLog = {
      setNumber: se.sets.length + 1,
      weight: lastSet?.weight ?? null,
      reps: lastSet?.reps ?? null,
      seconds: lastSet?.seconds ?? null,
      completed: false,
      rpe: null,
    }
    onUpdate(profileId, { ...se, sets: [...se.sets, newSet] })
  }

  const renderPersonColumn = (p: ParticipantData) => {
    const trendIcon = p.smartRecommendation?.trend === 'up'
      ? <TrendingUp size={11} className="shrink-0" />
      : p.smartRecommendation?.trend === 'down'
      ? <TrendingDown size={11} className="shrink-0" />
      : <Minus size={11} className="shrink-0" />

    return (
    <div className="space-y-2">
      {/* Last session + smart recommendation */}
      {p.smartRecommendation ? (
        <div className="text-xs mb-2 space-y-0.5">
          {p.lastSession && p.lastSession.maxWeight > 0 && (
            <div className="text-text-muted">
              Vorige: {p.lastSession.maxWeight}kg × {p.lastSession.maxReps}
            </div>
          )}
          <div className={`flex items-center gap-1 ${
            p.smartRecommendation.trend === 'up' ? 'text-success' :
            p.smartRecommendation.trend === 'down' ? 'text-warning' : 'text-accent'
          }`} style={{ color: undefined }}>
            {trendIcon}
            <span>{p.smartRecommendation.weight}kg · {p.smartRecommendation.reps}</span>
          </div>
        </div>
      ) : p.recommendedWeight !== null && (
        <div className="text-xs mb-2" style={{ color: p.profile.color }}>
          Aanbevolen: {p.recommendedWeight}kg
        </div>
      )}

      {/* Sets */}
      {p.sessionExercise.sets.map((set, i) => (
        <MultiPersonSetLogger
          key={i}
          set={set}
          isTimeBased={exercise.isTimeBased}
          onChange={updated =>
            handleSetChange(p.profile.id, p.sessionExercise, i, updated)
          }
          accentColor={p.profile.color}
        />
      ))}

      {/* Add set */}
      <button
        onClick={() => addSet(p.profile.id, p.sessionExercise)}
        className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
      >
        <Plus size={12} className="inline mr-1" />
        Set toevoegen
      </button>
    </div>
  )
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-text-primary m-0 truncate font-body">
            {exName(exercise)}
          </h4>
          <span className="text-xs text-text-muted">{exercise.category}</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              totalCompletedAll === totalSetsAll && totalSetsAll > 0
                ? 'bg-success/20 text-success'
                : 'bg-bg-input text-text-muted'
            }`}
          >
            {totalCompletedAll}/{totalSetsAll}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-text-muted" />
          ) : (
            <ChevronDown size={16} className="text-text-muted" />
          )}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Tabs for mobile, side-by-side for wider */}
              {/* Tab bar (visible below sm) */}
              <div className="flex gap-1 mb-3 sm:hidden">
                {participants.map((p, i) => {
                  const completedSets = p.sessionExercise.sets.filter(
                    s => s.completed
                  ).length
                  const totalSets = p.sessionExercise.sets.length
                  const allDone = completedSets === totalSets && totalSets > 0
                  return (
                    <button
                      key={p.profile.id}
                      onClick={() => setActiveTab(i)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        activeTab === i
                          ? 'border-border-light bg-white/5'
                          : 'border-transparent bg-transparent text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                        style={{ backgroundColor: p.profile.color + '30' }}
                      >
                        {p.profile.avatar}
                      </span>
                      <span
                        className="truncate"
                        style={
                          activeTab === i
                            ? { color: p.profile.color }
                            : undefined
                        }
                      >
                        {p.profile.name}
                      </span>
                      {allDone && (
                        <span className="text-success text-[10px]">✓</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Mobile: single tab content */}
              <div className="sm:hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    {participants[activeTab] &&
                      renderPersonColumn(participants[activeTab])}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop: side-by-side columns */}
              <div className="hidden sm:grid gap-4" style={{ gridTemplateColumns: `repeat(${participants.length}, 1fr)` }}>
                {participants.map(p => (
                  <div key={p.profile.id}>
                    {/* Column header */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b" style={{ borderColor: p.profile.color + '40' }}>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: p.profile.color + '30' }}
                      >
                        {p.profile.avatar}
                      </span>
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: p.profile.color }}
                      >
                        {p.profile.name}
                      </span>
                    </div>
                    {renderPersonColumn(p)}
                  </div>
                ))}
              </div>

              {/* Footer actions */}
              <div className="flex items-center gap-2 pt-3 mt-3 border-t border-border">
                <button
                  onClick={() => onStartRest(exercise.restSeconds)}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Timer size={12} /> Rust ({exercise.restSeconds}s)
                </button>
                <button
                  onClick={onRemove}
                  className="text-xs text-danger/60 hover:text-danger transition-colors ml-auto cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

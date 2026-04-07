import { useState } from 'react'
import { ChevronDown, ChevronUp, Timer, Trash2, MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SetLogger from './SetLogger'
import type { SessionExercise, SetLog } from '../../hooks/useWorkouts'
import type { Exercise } from '../../data/exercises'

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

interface ExerciseCardProps {
  exercise: Exercise
  sessionExercise: SessionExercise
  recommendedWeight: number | null
  lastSession: LastSession | null
  smartRecommendation: SmartRecommendation | null
  onUpdate: (updated: SessionExercise) => void
  onRemove: () => void
  onStartRest: (seconds: number) => void
}

export default function ExerciseCard({
  exercise,
  sessionExercise,
  recommendedWeight,
  lastSession,
  smartRecommendation,
  onUpdate,
  onRemove,
  onStartRest,
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [showNotes, setShowNotes] = useState(false)

  const completedSets = sessionExercise.sets.filter(s => s.completed).length
  const totalSets = sessionExercise.sets.length

  const handleSetChange = (index: number, updated: SetLog) => {
    const newSets = [...sessionExercise.sets]
    newSets[index] = updated

    if (updated.completed && !sessionExercise.sets[index].completed) {
      onStartRest(exercise.restSeconds)
    }

    onUpdate({ ...sessionExercise, sets: newSets })
  }

  const addSet = () => {
    const lastSet = sessionExercise.sets[sessionExercise.sets.length - 1]
    const newSet: SetLog = {
      setNumber: sessionExercise.sets.length + 1,
      weight: lastSet?.weight ?? null,
      reps: lastSet?.reps ?? null,
      seconds: lastSet?.seconds ?? null,
      completed: false,
      rpe: null,
    }
    onUpdate({ ...sessionExercise, sets: [...sessionExercise.sets, newSet] })
  }

  const trendIcon = smartRecommendation?.trend === 'up'
    ? <TrendingUp size={12} className="text-success shrink-0" />
    : smartRecommendation?.trend === 'down'
    ? <TrendingDown size={12} className="text-warning shrink-0" />
    : <Minus size={12} className="text-accent shrink-0" />

  const trendColor = smartRecommendation?.trend === 'up'
    ? 'text-success'
    : smartRecommendation?.trend === 'down'
    ? 'text-warning'
    : 'text-accent'

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-text-primary m-0 truncate font-body">
            {exercise.nameNL}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            <span className="text-xs text-text-muted">{exercise.category}</span>
            {lastSession && lastSession.maxWeight > 0 && (
              <span className="text-xs text-text-secondary">
                Vorige: {lastSession.maxWeight}kg × {lastSession.maxReps}
              </span>
            )}
            {smartRecommendation && (
              <span className={`text-xs flex items-center gap-0.5 ${trendColor}`}>
                {trendIcon}
                {smartRecommendation.weight}kg · {smartRecommendation.reps}
              </span>
            )}
            {!smartRecommendation && recommendedWeight !== null && (
              <span className="text-xs text-accent">
                Aanbevolen: {recommendedWeight}kg
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            completedSets === totalSets && totalSets > 0
              ? 'bg-success/20 text-success'
              : 'bg-bg-input text-text-muted'
          }`}>
            {completedSets}/{totalSets}
          </span>
          {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </div>
      </div>

      {/* Smart tip banner */}
      {smartRecommendation && expanded && (
        <div className={`mx-4 mb-2 px-3 py-2 rounded-lg text-xs ${
          smartRecommendation.trend === 'up'
            ? 'bg-success/10 border border-success/20 text-success'
            : smartRecommendation.trend === 'down'
            ? 'bg-warning/10 border border-warning/20 text-warning'
            : 'bg-accent/10 border border-accent/20 text-accent'
        }`}>
          {smartRecommendation.note}
        </div>
      )}

      {/* Sets */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {sessionExercise.sets.map((set, i) => (
                <SetLogger
                  key={i}
                  set={set}
                  isTimeBased={exercise.isTimeBased}
                  onChange={(updated) => handleSetChange(i, updated)}
                />
              ))}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={addSet}
                  className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
                >
                  + Set toevoegen
                </button>
                <button
                  onClick={() => onStartRest(exercise.restSeconds)}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Timer size={12} /> Rust ({exercise.restSeconds}s)
                </button>
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare size={12} /> Notities
                </button>
                <button
                  onClick={onRemove}
                  className="text-xs text-danger/60 hover:text-danger transition-colors ml-auto cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {showNotes && (
                <textarea
                  value={sessionExercise.notes}
                  onChange={e => onUpdate({ ...sessionExercise, notes: e.target.value })}
                  placeholder="Notities voor deze oefening..."
                  className="w-full bg-bg-input border border-border rounded-lg p-2 text-sm text-text-primary outline-none resize-none h-16 placeholder:text-text-muted"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

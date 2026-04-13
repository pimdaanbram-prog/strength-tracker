import { useState } from 'react'
import { ChevronDown, ChevronUp, Timer, Trash2, MessageSquare, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SetLogger from './SetLogger'
import type { SessionExercise, SetLog } from '../../hooks/useWorkouts'
import type { Exercise } from '../../data/exercises'
import { useLanguage } from '../../hooks/useLanguage'

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
  exercise, sessionExercise, recommendedWeight, lastSession,
  smartRecommendation, onUpdate, onRemove, onStartRest,
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const { exName } = useLanguage()

  const completedSets = sessionExercise.sets.filter(s => s.completed).length
  const totalSets = sessionExercise.sets.length
  const allDone = completedSets === totalSets && totalSets > 0

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

  const trendColor =
    smartRecommendation?.trend === 'up' ? '#00E5A0' :
    smartRecommendation?.trend === 'down' ? '#FFB300' : '#FF5500'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--theme-bg-card)',
        border: allDone ? '1px solid rgba(0,229,160,0.2)' : '1px solid var(--theme-border)',
        boxShadow: allDone ? '0 0 16px rgba(0,229,160,0.08)' : 'none',
      }}
    >
      {/* Header — full tap area */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer transition-colors active:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Progress indicator */}
        <div
          className="w-1.5 self-stretch rounded-full shrink-0"
          style={{ background: allDone ? 'var(--theme-success)' : 'var(--theme-border)', minHeight: 32 }}
        />

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold m-0 truncate" style={{ color: 'var(--theme-text-primary)' }}>
            {exName(exercise)}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{exercise.category}</span>
            {lastSession && lastSession.maxWeight > 0 && (
              <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                Vorige: {lastSession.maxWeight}kg×{lastSession.maxReps}
              </span>
            )}
            {smartRecommendation && (
              <span className="text-xs flex items-center gap-0.5 font-medium" style={{ color: trendColor }}>
                {smartRecommendation.trend === 'up' ? <TrendingUp size={11} /> :
                 smartRecommendation.trend === 'down' ? <TrendingDown size={11} /> :
                 <Minus size={11} />}
                {smartRecommendation.weight}kg · {smartRecommendation.reps}
              </span>
            )}
            {!smartRecommendation && recommendedWeight !== null && (
              <span className="text-xs font-medium" style={{ color: 'var(--theme-accent)' }}>
                Aanbevolen: {recommendedWeight}kg
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={allDone
              ? { background: 'rgba(0,229,160,0.15)', color: 'var(--theme-success)' }
              : { background: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }
            }
          >
            {completedSets}/{totalSets}
          </span>
          {expanded
            ? <ChevronUp size={16} style={{ color: 'var(--theme-text-muted)' }} />
            : <ChevronDown size={16} style={{ color: 'var(--theme-text-muted)' }} />
          }
        </div>
      </div>

      {/* Smart tip */}
      {smartRecommendation && expanded && (
        <div
          className="mx-4 mb-2 px-3 py-2.5 rounded-xl text-xs"
          style={{
            background: `${trendColor}10`,
            border: `1px solid ${trendColor}25`,
            color: trendColor,
          }}
        >
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
            transition={{ duration: 0.18 }}
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

              {/* Action row — proper touch targets */}
              <div className="flex items-center gap-1 pt-1 flex-wrap">
                {/* Add set */}
                <button
                  onClick={addSet}
                  className="flex items-center gap-1 px-3 h-9 rounded-xl text-xs font-semibold cursor-pointer border-0 transition-colors"
                  style={{ background: 'var(--theme-accent-muted)', color: 'var(--theme-accent)' }}
                >
                  <Plus size={13} /> Set
                </button>

                {/* Rest timer */}
                <button
                  onClick={() => onStartRest(exercise.restSeconds)}
                  className="flex items-center gap-1 px-3 h-9 rounded-xl text-xs font-semibold cursor-pointer border-0 transition-colors"
                  style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)' }}
                >
                  <Timer size={13} /> {exercise.restSeconds}s
                </button>

                {/* Notes */}
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="flex items-center gap-1 px-3 h-9 rounded-xl text-xs font-semibold cursor-pointer border-0 transition-colors"
                  style={{ background: 'var(--theme-bg-input)', color: showNotes ? 'var(--theme-accent)' : 'var(--theme-text-secondary)' }}
                >
                  <MessageSquare size={13} />
                  Notities
                </button>

                {/* Delete — push to right */}
                <button
                  onClick={onRemove}
                  className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-0 transition-colors"
                  style={{ color: 'rgba(255,59,59,0.4)', background: 'transparent' }}
                  onTouchStart={e => (e.currentTarget.style.color = '#FF3B3B')}
                  onTouchEnd={e => (e.currentTarget.style.color = 'rgba(255,59,59,0.4)')}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FF3B3B')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,59,59,0.4)')}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {showNotes && (
                <motion.textarea
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 72 }}
                  value={sessionExercise.notes}
                  onChange={e => onUpdate({ ...sessionExercise, notes: e.target.value })}
                  placeholder="Notities voor deze oefening..."
                  className="w-full rounded-xl p-3 text-sm outline-none resize-none placeholder:text-text-muted"
                  style={{ background: 'var(--theme-bg-input)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-primary)', fontFamily: 'inherit' }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

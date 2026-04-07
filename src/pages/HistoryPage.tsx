import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Dumbbell, Trash2, ChevronDown, ChevronUp, Flame, Calendar } from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { useLanguage } from '../hooks/useLanguage'
import { getWeekNumber, getYear } from '../utils/weekUtils'

const MONTHS_NL = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

const DAYS_NL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']

function formatSessionDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${DAYS_NL[d.getDay()]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]}`
}

function monthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`
}

export default function HistoryPage() {
  // getProfileSessions re-creates when sessionVersion changes (reactive via Zustand)
  const { getProfileSessions, deleteSession, getStreak } = useWorkouts()
  const { getExercise } = useExercises()
  const { exName } = useLanguage()

  const sessions = getProfileSessions()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sorted = useMemo(
    () => sessions.slice().sort((a, b) => b.date.localeCompare(a.date)),
    [sessions]
  )

  // Group by month
  const grouped = useMemo(() => {
    const groups: { month: string; sessions: typeof sorted }[] = []
    for (const s of sorted) {
      const mk = monthKey(s.date)
      const existing = groups.find(g => g.month === mk)
      if (existing) existing.sessions.push(s)
      else groups.push({ month: mk, sessions: [s] })
    }
    return groups
  }, [sorted])

  const streak = getStreak()
  const totalMinutes = sessions.reduce((t, s) => t + (s.durationMinutes || 0), 0)

  const thisWeek = useMemo(() => {
    const now = new Date()
    const wn = getWeekNumber(now)
    const yr = getYear(now)
    return sessions.filter(s => s.weekNumber === wn && s.year === yr)
  }, [sessions])

  const handleDelete = (id: string) => {
    if (!confirm('Training verwijderen?')) return
    deleteSession(id)
  }

  if (sessions.length === 0) {
    return (
      <>
        <Header title="MIJN TRAININGEN" />
        <PageWrapper>
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📋</span>
            <h3 className="text-xl tracking-wider mb-2">GEEN TRAININGEN NOG</h3>
            <p className="text-text-secondary text-sm">
              Start je eerste training om je geschiedenis bij te houden
            </p>
          </div>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <Header title="MIJN TRAININGEN" />
      <PageWrapper>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-heading tracking-wider text-text-primary m-0">{sessions.length}</p>
            <p className="text-xs text-text-muted m-0 mt-0.5">Trainingen</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={14} className="text-warning" />
              <p className="text-2xl font-heading tracking-wider text-text-primary m-0">{streak}</p>
            </div>
            <p className="text-xs text-text-muted m-0">Weken streak</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-heading tracking-wider text-text-primary m-0">
              {Math.round(totalMinutes / 60)}u
            </p>
            <p className="text-xs text-text-muted m-0 mt-0.5">Totaal</p>
          </div>
        </div>

        {/* Deze week */}
        {thisWeek.length > 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-5">
            <p className="text-xs text-accent font-semibold m-0">DEZE WEEK — {thisWeek.length}× getraind</p>
            <p className="text-xs text-text-secondary m-0 mt-0.5">
              {thisWeek.map(s => s.workoutName).join(', ')}
            </p>
          </div>
        )}

        {/* Alle trainingen per maand */}
        <div className="space-y-6">
          {grouped.map(({ month, sessions: ms }) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold tracking-wider text-text-muted m-0 uppercase">{month}</p>
                <span className="text-xs text-text-muted">· {ms.length}×</span>
              </div>
              <div className="space-y-2">
                {ms.map(session => {
                  const isExpanded = expandedId === session.id
                  return (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-bg-card border border-border rounded-xl overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary m-0">{session.workoutName}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                              <span className="text-xs text-text-muted flex items-center gap-1">
                                <Calendar size={11} /> {formatSessionDate(session.date)}
                              </span>
                              <span className="text-xs text-text-muted flex items-center gap-1">
                                <Clock size={11} /> {session.durationMinutes} min
                              </span>
                              <span className="text-xs text-text-muted flex items-center gap-1">
                                <Dumbbell size={11} /> {session.exercises.length} oefeningen
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-1.5 text-danger/40 hover:text-danger transition-colors cursor-pointer bg-transparent border-0 shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Oefeningen — altijd zichtbaar */}
                        <div className="space-y-1 mb-2">
                          {session.exercises.map(se => {
                            const exercise = getExercise(se.exerciseId)
                            const doneSets = se.sets.filter(s => s.completed || (s.weight !== null && s.weight > 0) || (s.reps !== null && s.reps > 0) || (s.seconds !== null && s.seconds > 0))
                            const weightsArr = doneSets.filter(s => s.weight !== null && s.weight > 0).map(s => s.weight!)
                            const repsArr = doneSets.filter(s => s.reps !== null && s.reps > 0).map(s => s.reps!)
                            const maxWeight = weightsArr.length > 0 ? Math.max(...weightsArr) : 0
                            const maxReps = repsArr.length > 0 ? Math.max(...repsArr) : 0

                            return (
                              <div key={se.exerciseId} className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary truncate flex-1 mr-2">
                                  {exName(exercise) || se.exerciseId}
                                </span>
                                <span className="text-xs text-text-muted shrink-0">
                                  {doneSets.length > 0
                                    ? `${doneSets.length}×${maxWeight > 0 ? ` ${maxWeight}kg` : ''}${maxReps > 0 ? ` · ${maxReps} reps` : ''}`
                                    : '—'
                                  }
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Expand toggle voor per-set detail */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : session.id)}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors cursor-pointer bg-transparent border-0 p-0"
                        >
                          {isExpanded
                            ? <><ChevronUp size={11} /> Minder</>
                            : <><ChevronDown size={11} /> Sets & gewichten</>}
                        </button>
                      </div>

                      {/* Per-set detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border">
                              <div className="pt-3 space-y-3">
                                {session.exercises.map(se => {
                                  const exercise = getExercise(se.exerciseId)
                                  const doneSets = se.sets.filter(s => s.completed || (s.weight !== null && s.weight > 0) || (s.reps !== null && s.reps > 0) || (s.seconds !== null && s.seconds > 0))
                                  if (doneSets.length === 0) return null
                                  return (
                                    <div key={se.exerciseId}>
                                      <p className="text-xs font-semibold text-text-primary mb-1.5">
                                        {exName(exercise) || se.exerciseId}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {doneSets.map((set, i) => (
                                          <span key={i} className="text-xs px-2 py-1 bg-bg-input rounded-lg text-text-secondary">
                                            {set.weight !== null && set.weight > 0 ? `${set.weight}kg` : ''}
                                            {set.weight !== null && set.weight > 0 && set.reps !== null ? ' × ' : ''}
                                            {set.reps !== null ? `${set.reps} reps` : ''}
                                            {set.seconds !== null ? `${set.seconds}s` : ''}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })}
                                {session.notes && (
                                  <p className="text-xs text-text-muted italic">"{session.notes}"</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    </>
  )
}

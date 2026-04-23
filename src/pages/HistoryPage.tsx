import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Dumbbell, Trash2, ChevronDown, ChevronUp, Flame, Calendar, Zap } from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { useLanguage } from '../hooks/useLanguage'
import { getWeekNumber, getYear } from '../utils/weekUtils'

const MONTHS_NL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const DAYS_NL   = ['Zo','Ma','Di','Wo','Do','Vr','Za']

function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  return `${DAYS_NL[d.getDay()]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]}`
}
function monthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`
}

// Cycle through gradient colors per workout
const WORKOUT_GRADIENTS = [
  { dot: '#FF5500', glow: 'rgba(255,85,0,0.2)',  border: 'rgba(255,85,0,0.15)' },
  { dot: '#818CF8', glow: 'rgba(129,140,248,0.2)', border: 'rgba(129,140,248,0.15)' },
  { dot: '#00E5A0', glow: 'rgba(0,229,160,0.2)', border: 'rgba(0,229,160,0.15)' },
  { dot: '#FFB300', glow: 'rgba(255,179,0,0.2)', border: 'rgba(255,179,0,0.15)' },
  { dot: '#FF3B3B', glow: 'rgba(255,59,59,0.2)', border: 'rgba(255,59,59,0.15)' },
]

export default function HistoryPage() {
  const { getProfileSessions, deleteSession, getStreak } = useWorkouts()
  const { getExercise } = useExercises()
  const { exName } = useLanguage()

  const sessions = getProfileSessions()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sorted = useMemo(
    () => sessions.slice().sort((a, b) => b.date.localeCompare(a.date)),
    [sessions]
  )

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
    return sessions.filter(s => s.weekNumber === getWeekNumber(now) && s.year === getYear(now))
  }, [sessions])

  const handleDelete = (id: string) => {
    if (!confirm('Training verwijderen?')) return
    deleteSession(id)
  }

  if (sessions.length === 0) {
    return (
      <>
        <Header title="TRAININGEN" />
        <PageWrapper>
          <div className="text-center py-16">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 18 }}>
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl tracking-wider mb-2">GEEN TRAININGEN NOG</h3>
              <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Start je eerste training om je geschiedenis bij te houden</p>
            </motion.div>
          </div>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <Header title="TRAININGEN" />
      <PageWrapper>

        {/* ─── Stats row ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          {[
            { icon: Dumbbell,  value: sessions.length,            label: 'Trainingen', color: '#FF5500' },
            { icon: Flame,     value: `${streak}`,                label: 'Wk streak',  color: '#FFB300' },
            { icon: Clock,     value: `${Math.round(totalMinutes/60)}u`, label: 'Totaal',  color: '#00E5A0' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="relative rounded-2xl p-3 text-center overflow-hidden"
              style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
              <Icon size={16} className="mx-auto mb-1.5" style={{ color }} />
              <p className="text-2xl font-heading tracking-wider m-0" style={{ color: 'var(--theme-text-primary)' }}>{value}</p>
              <p className="text-[10px] m-0 mt-0.5 uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── This week banner ──────────────────────────── */}
        {thisWeek.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-4 mb-5 relative overflow-hidden"
            style={{ background: 'rgba(255,85,0,0.07)', border: '1px solid rgba(255,85,0,0.15)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-accent), transparent)' }} />
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: 'var(--theme-accent)' }} />
              <p className="text-xs font-semibold uppercase tracking-widest m-0" style={{ color: 'var(--theme-accent)', letterSpacing: '0.1em' }}>
                DEZE WEEK — {thisWeek.length}× getraind
              </p>
            </div>
            <p className="text-xs mt-1 m-0" style={{ color: 'var(--theme-text-secondary)' }}>
              {thisWeek.map(s => s.workoutName).join(' · ')}
            </p>
          </motion.div>
        )}

        {/* ─── Timeline ──────────────────────────────────── */}
        <div className="space-y-8">
          {grouped.map(({ month, sessions: ms }, gi) => (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', damping: 24, delay: gi * 0.05 }}
            >
              {/* Month heading */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-heading tracking-widest m-0 uppercase" style={{ color: 'var(--theme-accent)', letterSpacing: '0.15em' }}>
                  {month}
                </h3>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, var(--theme-border), transparent)' }} />
                <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{ms.length}×</span>
              </div>

              {/* Session cards with timeline line */}
              <div className="relative pl-10">
                <div className="timeline-line" />

                <div className="space-y-3">
                  {ms.map((session, si) => {
                    const grad = WORKOUT_GRADIENTS[si % WORKOUT_GRADIENTS.length]
                    const isExpanded = expandedId === session.id

                    return (
                      <motion.div
                        key={session.id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', damping: 24, delay: si * 0.04 }}
                        className="relative"
                      >
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-10 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ background: 'var(--theme-bg-primary)', borderColor: grad.dot, boxShadow: `0 0 8px ${grad.glow}` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: grad.dot }} />
                        </div>

                        <div
                          className="rounded-2xl overflow-hidden"
                          style={{ background: 'var(--theme-bg-card)', border: `1px solid ${grad.border}` }}
                        >
                          {/* Card header */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold m-0" style={{ color: 'var(--theme-text-primary)' }}>{session.workoutName}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
                                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--theme-text-secondary)' }}>
                                    <Calendar size={10} /> {formatDay(session.date)}
                                  </span>
                                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--theme-text-secondary)' }}>
                                    <Clock size={10} /> {session.durationMinutes} min
                                  </span>
                                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--theme-text-secondary)' }}>
                                    <Dumbbell size={10} /> {session.exercises.length} oef
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDelete(session.id)}
                                className="p-1.5 rounded-lg cursor-pointer bg-transparent border-0 transition-colors"
                                style={{ color: 'rgba(255,59,59,0.3)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#FF3B3B')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,59,59,0.3)')}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Exercise summary */}
                            <div className="space-y-1 mb-2.5">
                              {session.exercises.map(se => {
                                const exercise = getExercise(se.exerciseId)
                                const doneSets = se.sets.filter(s => s.completed || (s.weight && s.weight > 0) || (s.reps && s.reps > 0) || (s.seconds && s.seconds > 0))
                                const maxWeight = Math.max(0, ...doneSets.filter(s => s.weight && s.weight > 0).map(s => s.weight!))
                                const maxReps = Math.max(0, ...doneSets.filter(s => s.reps && s.reps > 0).map(s => s.reps!))
                                return (
                                  <div key={se.exerciseId} className="flex items-center justify-between">
                                    <span className="text-xs truncate flex-1 mr-2" style={{ color: 'var(--theme-text-secondary)' }}>
                                      {exName(exercise) || se.exerciseId}
                                    </span>
                                    <span className="text-xs shrink-0" style={{ color: 'var(--theme-text-muted)' }}>
                                      {doneSets.length > 0 ? `${doneSets.length}×${maxWeight > 0 ? ` ${maxWeight}kg` : ''}${maxReps > 0 ? ` · ${maxReps}` : ''}` : '—'}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>

                            <button
                              onClick={() => setExpandedId(isExpanded ? null : session.id)}
                              className="flex items-center gap-1 text-xs cursor-pointer bg-transparent border-0 p-0 transition-colors"
                              style={{ color: 'var(--theme-text-muted)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-accent)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                            >
                              {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                              {isExpanded ? 'Minder' : 'Sets & gewichten'}
                            </button>
                          </div>

                          {/* Per-set detail */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid var(--theme-border)' }}>
                                  {session.exercises.map(se => {
                                    const exercise = getExercise(se.exerciseId)
                                    const doneSets = se.sets.filter(s => s.completed || (s.weight && s.weight > 0) || (s.reps && s.reps > 0) || (s.seconds && s.seconds > 0))
                                    if (doneSets.length === 0) return null
                                    return (
                                      <div key={se.exerciseId}>
                                        <p className="text-xs font-semibold mb-1.5 m-0" style={{ color: 'var(--theme-text-secondary)' }}>
                                          {exName(exercise) || se.exerciseId}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {doneSets.map((set, i) => {
                                            const hasLR = set.repsLeft != null || set.repsRight != null
                                            return (
                                              <span
                                                key={i}
                                                className="text-xs px-2.5 py-1 rounded-xl"
                                                style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }}
                                              >
                                                {set.weight && set.weight > 0 ? `${set.weight}kg` : ''}
                                                {set.weight && set.weight > 0 && (set.reps || hasLR) ? ' × ' : ''}
                                                {hasLR
                                                  ? `${set.repsLeft ?? '?'}L / ${set.repsRight ?? '?'}R`
                                                  : set.reps ? `${set.reps}` : ''
                                                }
                                                {set.seconds ? `${set.seconds}s` : ''}
                                              </span>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )
                                  })}
                                  {session.notes && (
                                    <p className="text-xs italic mt-2 m-0" style={{ color: 'var(--theme-text-muted)' }}>"{session.notes}"</p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PageWrapper>
    </>
  )
}

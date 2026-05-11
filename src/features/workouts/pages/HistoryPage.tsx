import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Dumbbell, Trash2, ChevronDown, ChevronUp, Flame, Calendar, Zap } from 'lucide-react'
import AmbientBackground from '@/shared/components/ui/AmbientBackground'
import { useWorkouts } from '@/features/workouts/hooks/useWorkouts'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { getWeekNumber, getYear } from '@/shared/utils/weekUtils'

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

const WORKOUT_GRADIENTS = [
  { dot: '#FF7A1F', glow: 'rgba(255,122,31,0.2)',  border: 'rgba(255,122,31,0.15)' },
  { dot: '#818CF8', glow: 'rgba(129,140,248,0.2)', border: 'rgba(129,140,248,0.15)' },
  { dot: '#00E5A0', glow: 'rgba(0,229,160,0.2)',   border: 'rgba(0,229,160,0.15)' },
  { dot: '#FFB300', glow: 'rgba(255,179,0,0.2)',   border: 'rgba(255,179,0,0.15)' },
  { dot: '#FF3B3B', glow: 'rgba(255,59,59,0.2)',   border: 'rgba(255,59,59,0.15)' },
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
      <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
        <AmbientBackground intensity={0.6} />
        <div className="relative z-10">
          <div className="sticky top-0 z-40 px-4 py-3.5"
            style={{ background: 'rgba(6,6,10,0.6)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--theme-glass-border)' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Historie</span>
          </div>
          <div className="max-w-lg mx-auto px-4 py-16 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 18 }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>📋</div>
              <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Geen trainingen</div>
              <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>Start je eerste training om je geschiedenis bij te houden</p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
      <AmbientBackground intensity={0.6} />
      <div className="relative z-10">

        {/* ── Sticky header ─────────────────────────────────────────────── */}
        <div className="sticky top-0 z-40 px-4 py-3.5"
          style={{ background: 'rgba(6,6,10,0.6)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--theme-glass-border)' }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Historie</span>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-4"
          style={{ paddingBottom: 'calc(max(4.5rem, env(safe-area-inset-bottom)) + 4rem)' }}>

          {/* ─── Stats row ─────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { icon: Dumbbell, value: sessions.length,                       label: 'Trainingen', color: 'var(--theme-accent)' },
              { icon: Flame,    value: `${streak}`,                           label: 'Wk streak',  color: '#FFB300' },
              { icon: Clock,    value: `${Math.round(totalMinutes/60)}u`,     label: 'Totaal',     color: '#00E5A0' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} style={{ position: 'relative', borderRadius: 18, padding: '12px 14px', textAlign: 'center', overflow: 'hidden', background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
                <Icon size={14} style={{ color, margin: '0 auto 6px', display: 'block' }} />
                <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 9, color: 'var(--theme-text-muted)', marginTop: 5, fontFamily: 'var(--theme-font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </motion.div>

          {/* ─── This week banner ──────────────────────────────────────── */}
          {thisWeek.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              style={{ borderRadius: 16, padding: '12px 16px', marginBottom: 20, position: 'relative', overflow: 'hidden', background: 'var(--theme-accent-muted)', border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--theme-accent), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={13} style={{ color: 'var(--theme-accent)' }} />
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, color: 'var(--theme-accent)', fontFamily: 'var(--theme-font-mono)' }}>
                  DEZE WEEK — {thisWeek.length}× getraind
                </p>
              </div>
              <p style={{ fontSize: 11, marginTop: 4, margin: '4px 0 0', color: 'var(--theme-text-secondary)' }}>
                {thisWeek.map(s => s.workoutName).join(' · ')}
              </p>
            </motion.div>
          )}

          {/* ─── Timeline ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {grouped.map(({ month, sessions: ms }, gi) => (
              <motion.div key={month}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', damping: 24, delay: gi * 0.05 }}>

                {/* Month heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--theme-accent)' }}>
                    {month}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--theme-glass-border), transparent)' }} />
                  <span style={{ fontSize: 10, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)' }}>{ms.length}×</span>
                </div>

                {/* Sessions with timeline */}
                <div style={{ position: 'relative', paddingLeft: 36 }}>
                  {/* Vertical line */}
                  <div style={{ position: 'absolute', left: 8, top: 10, bottom: 10, width: 1, background: 'linear-gradient(to bottom, var(--theme-glass-border), transparent)' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ms.map((session, si) => {
                      const grad = WORKOUT_GRADIENTS[si % WORKOUT_GRADIENTS.length]
                      const isExpanded = expandedId === session.id

                      return (
                        <motion.div key={session.id} layout
                          initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ type: 'spring', damping: 24, delay: si * 0.04 }}
                          style={{ position: 'relative' }}>

                          {/* Timeline dot */}
                          <div style={{ position: 'absolute', left: -28, top: 16, width: 18, height: 18, borderRadius: '50%', border: `2px solid ${grad.dot}`, background: 'var(--theme-bg-primary)', boxShadow: `0 0 8px ${grad.glow}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: grad.dot }} />
                          </div>

                          <div style={{ background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: `1px solid ${grad.border}`, borderRadius: 18, overflow: 'hidden' }}>
                            {/* Card header */}
                            <div style={{ padding: 14 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--theme-text-primary)' }}>{session.workoutName}</p>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0 12px', marginTop: 6 }}>
                                    <span style={{ fontSize: 10, color: 'var(--theme-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Calendar size={9} /> {formatDay(session.date)}
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--theme-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Clock size={9} /> {session.durationMinutes} min
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--theme-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Dumbbell size={9} /> {session.exercises.length} oef
                                    </span>
                                  </div>
                                </div>
                                <button onClick={() => handleDelete(session.id)}
                                  style={{ padding: '4px 6px', borderRadius: 8, cursor: 'pointer', background: 'transparent', border: 0, color: 'rgba(255,59,59,0.25)', transition: 'color 0.2s' }}
                                  onMouseEnter={e => (e.currentTarget.style.color = '#FF3B3B')}
                                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,59,59,0.25)')}>
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Exercise summary */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
                                {session.exercises.map(se => {
                                  const exercise = getExercise(se.exerciseId)
                                  const doneSets = se.sets.filter(s => s.completed || (s.weight && s.weight > 0) || (s.reps && s.reps > 0) || (s.seconds && s.seconds > 0))
                                  const maxWeight = Math.max(0, ...doneSets.filter(s => s.weight && s.weight > 0).map(s => s.weight!))
                                  return (
                                    <div key={se.exerciseId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8, color: 'var(--theme-text-secondary)' }}>
                                        {exName(exercise) || se.exerciseId}
                                      </span>
                                      <span style={{ fontSize: 10, flexShrink: 0, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)' }}>
                                        {doneSets.length > 0 ? `${doneSets.length}×${maxWeight > 0 ? ` ${maxWeight}kg` : ''}` : '—'}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>

                              <button onClick={() => setExpandedId(isExpanded ? null : session.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, cursor: 'pointer', background: 'transparent', border: 0, padding: 0, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-accent)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-text-muted)')}>
                                {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                {isExpanded ? 'Minder' : 'Sets & gewichten'}
                              </button>
                            </div>

                            {/* Per-set detail */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                  style={{ overflow: 'hidden' }}>
                                  <div style={{ padding: '12px 14px 14px', borderTop: '1px solid var(--theme-glass-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {session.exercises.map(se => {
                                      const exercise = getExercise(se.exerciseId)
                                      const doneSets = se.sets.filter(s => s.completed || (s.weight && s.weight > 0) || (s.reps && s.reps > 0) || (s.seconds && s.seconds > 0))
                                      if (doneSets.length === 0) return null
                                      return (
                                        <div key={se.exerciseId}>
                                          <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, margin: '0 0 6px', color: 'var(--theme-text-secondary)' }}>
                                            {exName(exercise) || se.exerciseId}
                                          </p>
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {doneSets.map((set, i) => {
                                              const hasLR = set.repsLeft != null || set.repsRight != null
                                              return (
                                                <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 10, background: 'var(--theme-glass)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-glass-border)' }}>
                                                  {set.weight && set.weight > 0 ? `${set.weight}kg` : ''}
                                                  {set.weight && set.weight > 0 && (set.reps || hasLR) ? ' × ' : ''}
                                                  {hasLR ? `${set.repsLeft ?? '?'}L/${set.repsRight ?? '?'}R` : set.reps ? `${set.reps}` : ''}
                                                  {set.seconds ? `${set.seconds}s` : ''}
                                                </span>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )
                                    })}
                                    {session.notes && (
                                      <p style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4, margin: '4px 0 0', color: 'var(--theme-text-muted)' }}>"{session.notes}"</p>
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
        </div>
      </div>
    </div>
  )
}

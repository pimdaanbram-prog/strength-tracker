import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Flame,
  Gauge,
  Plus,
  Ruler,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react'
import Header from '@/app/layout/Header'
import AnatomicalFigure from '@/components/MuscleMap/AnatomicalFigure'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { usePlans } from '@/features/workouts/hooks/usePlans'
import { useProfiles } from '@/features/profiles/hooks/useProfiles'
import { useWeeklyMuscleActivation } from '@/features/stats/hooks/useWeeklyMuscleActivation'
import { useWorkouts } from '@/features/workouts/hooks/useWorkouts'
import type { WorkoutSession } from '@/features/workouts/hooks/useWorkouts'
import { workoutTemplates } from '@/features/workouts/data/workoutTemplates'
import AmbientBackground from '@/shared/components/ui/AmbientBackground'
import StatCarousel from '@/shared/components/StatCarousel'

const MONTHS_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const WEEK_DAYS = ['M', 'D', 'W', 'D', 'V', 'Z', 'Z']

function greetingForHour(hour: number) {
  if (hour < 12) return 'Goedemorgen'
  if (hour < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

function formatDate(date: Date) {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 900
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return <>{display.toLocaleString('nl-NL')}{suffix}</>
}

function sumVolume(sessions: WorkoutSession[]) {
  return sessions.reduce((total, session) => (
    total + session.exercises.reduce((exerciseTotal, exercise) => (
      exerciseTotal + exercise.sets.reduce((setTotal, set) => (
        setTotal + ((set.completed || (set.weight && set.reps)) ? (set.weight ?? 0) * (set.reps ?? 0) : 0)
      ), 0)
    ), 0)
  ), 0)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { activeProfile, isOnboarding } = useProfiles()
  const { getProfileSessions, getStreak, getThisWeekSessionCount, getPersonalRecords } = useWorkouts()
  const { getExercise } = useExercises()
  const { getPlans } = usePlans()
  const { exName } = useLanguage()
  const muscleActivation = useWeeklyMuscleActivation()

  const sessions = getProfileSessions()
  const plans = getPlans()
  const streak = getStreak()
  const weekCount = getThisWeekSessionCount()
  const prs = getPersonalRecords()
  const now = new Date()
  const monthIso = now.toISOString().slice(0, 7)

  const suggestedTemplate = useMemo(() => {
    const lastSession = sessions[sessions.length - 1]
    if (!lastSession || lastSession.workoutName?.includes('A')) return workoutTemplates.find(t => t.id === 'training-b') ?? workoutTemplates[0]
    return workoutTemplates.find(t => t.id === 'training-a') ?? workoutTemplates[0]
  }, [sessions])

  const weekStart = useMemo(() => {
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1
    const start = new Date(now)
    start.setDate(now.getDate() - day)
    start.setHours(0, 0, 0, 0)
    return start
  }, [now])

  const weekDots = WEEK_DAYS.map((_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return sessions.some(session => session.date === date.toISOString().split('T')[0])
  })

  const thisWeekVolume = useMemo(() => {
    const startIso = weekStart.toISOString().split('T')[0]
    return sumVolume(sessions.filter(session => session.date >= startIso))
  }, [sessions, weekStart])

  const workoutsThisMonth = sessions.filter(session => session.date.startsWith(monthIso)).length
  const bestPr = prs.slice().sort((a, b) => b.weight - a.weight)[0]
  const bestPrExercise = bestPr ? getExercise(bestPr.exerciseId) : undefined
  const recentWorkouts = sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const weeklyGoalPct = Math.min(100, Math.round((weekCount / 5) * 100))

  if (isOnboarding) {
    return (
      <>
        <Header showProfile={false} />
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
          <AmbientBackground intensity={1.2} />
          <motion.div className="relative z-10" initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-[2rem]" style={{ background: 'var(--theme-accent-grad)', boxShadow: '0 0 60px var(--accent-glow)' }}>
              <Dumbbell size={42} color="#fff" />
            </div>
            <h1 className="display m-0 text-5xl font-bold">StrengthTracker</h1>
            <p className="mx-auto mt-3 max-w-xs text-sm" style={{ color: 'var(--text-secondary)' }}>
              Bouw je eerste profiel en start met sterker worden.
            </p>
            <button onClick={() => navigate('/profiles/new')} className="mt-8 min-h-[52px] rounded-2xl border-0 px-8 text-sm font-bold text-white" style={{ background: 'var(--theme-accent-grad)', boxShadow: '0 14px 34px var(--accent-glow)' }}>
              Profiel maken
            </button>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--gradient)' }}>
      <AmbientBackground intensity={0.7} />
      <div className="relative z-10">
        <div className="sticky top-0 z-40 lg:hidden">
          <Header />
        </div>

        <main className="mx-auto w-full max-w-7xl px-0 pb-8 lg:px-6">
          <section className="grid gap-5 px-0 pt-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:pt-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2rem] px-5 py-6 lg:px-8 lg:py-8"
              style={{
                background: 'var(--gradient-card)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(now)}
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold"
                    style={{ background: 'var(--bg-glass)', color: 'var(--warning)', border: '1px solid var(--border-primary)' }}
                  >
                    <Flame size={16} />
                    {streak}
                  </motion.div>
                </div>
                <h1 className="display m-0 max-w-3xl text-5xl font-bold leading-none lg:text-6xl">
                  {greetingForHour(now.getHours())}, {activeProfile?.name ?? 'atleet'}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: 'var(--text-secondary)' }}>
                  Vandaag staat er een sterke trainingsdag klaar. Houd je progressie strak bij en laat je weekdoel vollopen.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Start Workout', icon: Zap, action: () => navigate('/workout', { state: { templateId: suggestedTemplate.id } }), primary: true },
                    { label: 'Snel loggen', icon: Plus, action: () => navigate('/workout') },
                    { label: 'PR bijhouden', icon: Trophy, action: () => navigate('/progress') },
                    { label: 'Meting toevoegen', icon: Ruler, action: () => navigate('/measurements') },
                  ].map(({ label, icon: Icon, action, primary }) => (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={action}
                      className="flex min-h-[58px] cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 px-4 text-sm font-bold"
                      style={{
                        background: primary ? 'var(--theme-accent-grad)' : 'var(--bg-glass)',
                        color: primary ? '#fff' : 'var(--text-primary)',
                        border: primary ? '1px solid transparent' : '1px solid var(--border-primary)',
                        boxShadow: primary ? '0 14px 32px var(--accent-glow)' : 'none',
                      }}
                    >
                      <Icon size={17} />
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden rounded-[2rem] p-4 lg:block"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}
              onClick={() => navigate('/progress')}
            >
              <AnatomicalFigure muscleActivation={muscleActivation} size="md" interactive />
            </motion.div>
          </section>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Streak', value: streak, suffix: ' dagen', icon: Flame, color: 'var(--warning)' },
              { label: 'Volume deze week', value: Math.round(thisWeekVolume), suffix: ' kg', icon: Gauge, color: 'var(--accent-primary)' },
              { label: 'Workouts deze maand', value: workoutsThisMonth, suffix: '', icon: CalendarDays, color: 'var(--success)' },
              { label: 'Gewicht PR', value: bestPr?.weight ?? 0, suffix: ' kg', icon: Trophy, color: 'var(--warning)' },
            ].map(({ label, value, suffix, icon: Icon, color }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="card-hover rounded-3xl p-5"
                style={{ background: 'var(--gradient-card)', border: '1px solid var(--border-primary)' }}
              >
                <Icon size={20} style={{ color }} />
                <p className="display m-0 mt-4 text-4xl font-bold">
                  <AnimatedNumber value={value} suffix={suffix} />
                </p>
                <p className="m-0 mt-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </p>
                {label === 'Gewicht PR' && bestPrExercise && (
                  <p className="m-0 mt-2 truncate text-xs" style={{ color: 'var(--text-secondary)' }}>{exName(bestPrExercise)}</p>
                )}
              </motion.div>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <StatCarousel />

              <div className="mt-6 rounded-[2rem] p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="display m-0 text-2xl font-bold">Recente workouts</h2>
                  <button onClick={() => navigate('/history')} className="flex items-center gap-1 border-0 bg-transparent text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                    Alles <ArrowRight size={13} />
                  </button>
                </div>
                <div className="grid gap-3">
                  {recentWorkouts.length === 0 && (
                    <div className="rounded-2xl border p-5 text-sm" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
                      Nog geen workouts. Start vandaag je eerste sessie.
                    </div>
                  )}
                  {recentWorkouts.map(session => {
                    const volume = sumVolume([session])
                    const chips = Array.from(new Set(session.exercises.map(ex => getExercise(ex.exerciseId)?.category).filter(Boolean))).slice(0, 3)
                    return (
                      <button
                        key={session.id}
                        onClick={() => navigate('/history')}
                        className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border bg-transparent p-4 text-left"
                        style={{ borderColor: 'var(--border-primary)', borderLeft: '3px solid var(--accent-primary)' }}
                      >
                        <div className="min-w-0">
                          <p className="m-0 truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{session.workoutName}</p>
                          <p className="m-0 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            {session.date} · {session.durationMinutes} min · {Math.round(volume).toLocaleString('nl-NL')} kg
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {chips.map(chip => (
                              <span key={chip} className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}>
                                {chip}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <aside className="grid gap-5">
              <div className="rounded-[2rem] p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}>
                <h2 className="display m-0 text-xl font-bold">Weekdoel</h2>
                <div className="relative mx-auto my-6 h-48 w-48">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="var(--border-primary)" strokeWidth="10" />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={302}
                      initial={{ strokeDashoffset: 302 }}
                      animate={{ strokeDashoffset: 302 - (302 * weeklyGoalPct) / 100 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="display text-4xl font-bold">{weeklyGoalPct}%</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{weekCount}/5 workouts</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEK_DAYS.map((day, index) => (
                    <div key={`${day}-${index}`} className="text-center">
                      <div className="mb-1 text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{day}</div>
                      <div className="h-8 rounded-lg" style={{ background: weekDots[index] ? 'var(--theme-accent-grad)' : 'var(--bg-tertiary)', boxShadow: weekDots[index] ? '0 0 14px var(--accent-glow)' : 'none' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}>
                <h2 className="display m-0 text-xl font-bold">Plannen</h2>
                <div className="mt-4 grid gap-2">
                  {plans.slice(0, 3).map(plan => (
                    <button key={plan.id} onClick={() => navigate('/workout', { state: { planId: plan.id } })} className="flex min-h-[54px] items-center justify-between rounded-2xl border bg-transparent px-3 text-left" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                      <span className="truncate text-sm font-bold">{plan.name}</span>
                      <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
                    </button>
                  ))}
                  <button onClick={() => navigate('/plans/new')} className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border bg-transparent text-sm font-bold" style={{ borderColor: 'var(--border-accent)', color: 'var(--accent-primary)' }}>
                    <Plus size={15} /> Plan maken
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] p-5 lg:hidden" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}>
                <AnatomicalFigure muscleActivation={muscleActivation} size="md" interactive />
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

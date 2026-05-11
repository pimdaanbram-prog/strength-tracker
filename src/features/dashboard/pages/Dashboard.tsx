import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play, TrendingUp, Flame, Trophy,
  Zap, Users, Plus, BookMarked, Clock,
  RefreshCw, AlertCircle, ArrowRight,
  Bell, ChevronRight,
} from 'lucide-react'

const MONTHS_SHORT = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec']
function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

import { useProfiles } from '@/features/profiles/hooks/useProfiles'
import { useWorkouts } from '@/features/workouts/hooks/useWorkouts'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { usePlans } from '@/features/plans/hooks/usePlans'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { useSync } from '@/shared/lib/useSync'
import { getDayLabel } from '@/shared/utils/weekUtils'
import { workoutTemplates } from '@/features/workouts/data/workoutTemplates'
import Header from '@/shared/components/layout/Header'
import AmbientBackground from '@/shared/components/ui/AmbientBackground'

const WEEK_LETTERS = ['M','D','W','D','V','Z','Z']

export default function Dashboard() {
  const navigate = useNavigate()
  const { activeProfile, isOnboarding, profiles } = useProfiles()
  const { getThisWeekSessionCount, getStreak, getPersonalRecords, getProfileSessions } = useWorkouts()
  const { getExercise } = useExercises()
  const { getPlans } = usePlans()
  const myPlans = getPlans()
  const { exName } = useLanguage()
  const { pullFromCloud, isSyncing, syncError } = useSync()

  const weekCount = getThisWeekSessionCount()
  const streak = getStreak()
  const prs = getPersonalRecords()
  const recentPRs = prs.slice(-3)

  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  const dayLabel = getDayLabel(today)

  const sessions = getProfileSessions()
  const todaySessions = sessions.filter(s => s.date === today.toISOString().split('T')[0])

  const suggestedTemplate = useMemo(() => {
    const lastSession = sessions[sessions.length - 1]
    if (!lastSession || lastSession.workoutName?.includes('A')) {
      return workoutTemplates.find(t => t.id === 'training-b') || workoutTemplates[1]
    }
    return workoutTemplates.find(t => t.id === 'training-a') || workoutTemplates[0]
  }, [sessions])

  // Build week strip: index 0=Mon, 6=Sun
  // dayOfWeek: 0=Sun,1=Mon,...,6=Sat → convert to Mon-first
  const todayMonIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - todayMonIdx)
  const weekDots = WEEK_LETTERS.map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    return sessions.some(s => s.date === dateStr)
  })

  // Onboarding
  if (isOnboarding) {
    return (
      <>
        <Header showProfile={false} />
        <div className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          <AmbientBackground intensity={1.2} />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative z-10"
          >
            <motion.div
              className="mx-auto mb-8 w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: 'var(--theme-accent-grad)',
                boxShadow: '0 0 60px var(--theme-accent-glow)',
              }}
              animate={{ boxShadow: ['0 0 40px var(--theme-accent-glow)', '0 0 80px var(--theme-accent-glow)', '0 0 40px var(--theme-accent-glow)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Zap size={44} fill="#FFFFFF" strokeWidth={0} />
            </motion.div>
            <h1 className="font-display text-5xl mb-2" style={{ fontFamily: 'var(--theme-font-display)', letterSpacing: '-0.03em' }}>Strength</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--theme-text-secondary)', lineHeight: 1.6 }}>
              Volg je trainingen, meet je vooruitgang,<br />word sterker.
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/profiles/new')}
              className="px-8 py-4 text-white text-sm font-bold rounded-2xl cursor-pointer border-0"
              style={{
                background: 'var(--theme-accent-grad)',
                boxShadow: '0 12px 32px var(--theme-accent-glow)',
                letterSpacing: '0.04em',
              }}
            >
              START — MAAK PROFIEL
            </motion.button>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
      <AmbientBackground intensity={1} />

      <div className="relative z-10">
        {/* ── Sticky glass header ──────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-40"
          style={{
            background: 'rgba(6,6,10,0.6)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid var(--theme-glass-border)',
          }}
        >
          <Header />
        </div>

        {/* ── Scrollable content ───────────────────────────────────────────────── */}
        <div
          className="max-w-lg mx-auto w-full px-4 pt-4 hide-scrollbar"
          style={{ paddingBottom: 'calc(max(4.5rem, env(safe-area-inset-bottom)) + 4rem)' }}
        >
          {/* ─── GREETING ──────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-6 pt-2"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white font-bold text-base shrink-0"
                style={{
                  background: 'var(--theme-accent-grad)',
                  fontFamily: 'var(--theme-font-display)',
                  boxShadow: '0 8px 24px var(--theme-accent-glow), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {activeProfile?.name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', color: 'var(--theme-text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {dayLabel}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 1 }}>
                  Hey {activeProfile?.name} 👋
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sync */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={pullFromCloud}
                disabled={isSyncing}
                className="w-10 h-10 rounded-[12px] flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)', color: 'var(--theme-text-muted)' }}
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/settings')}
                className="w-10 h-10 rounded-[12px] flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)', color: 'var(--theme-text-muted)' }}
              >
                <Bell size={14} />
              </motion.button>
            </div>
          </motion.div>

          {syncError && (
            <div className="flex items-center gap-1 mb-3 text-[11px]" style={{ color: 'var(--theme-error)' }}>
              <AlertCircle size={11} /> {syncError}
            </div>
          )}

          {/* ─── HERO WORKOUT CARD ─────────────────────────────────────────────── */}
          {suggestedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="mb-5"
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', damping: 20 }}
                className="glass-card-v2-hi relative overflow-hidden"
                style={{ padding: 22 }}
              >
                {/* Accent orb */}
                <div style={{
                  position: 'absolute', top: -60, right: -40, width: 220, height: 220,
                  background: 'radial-gradient(circle, var(--theme-accent-glow), transparent 70%)',
                  filter: 'blur(30px)',
                  animation: 'orbPulse 4s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 9.5, fontFamily: 'var(--theme-font-mono)', fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px',
                      borderRadius: 999, background: 'var(--theme-accent-muted)',
                      color: 'var(--theme-accent)', border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)',
                    }}>Aanbevolen</span>
                    {todaySessions.length > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 9.5, fontFamily: 'var(--theme-font-mono)', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px',
                        borderRadius: 999, background: 'var(--theme-glass)',
                        color: 'var(--theme-text-muted)', border: '1px solid var(--theme-glass-border)',
                      }}>Vandaag getraind ✓</span>
                    )}
                  </div>

                  <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
                    {exName(suggestedTemplate)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--theme-text-secondary)', marginBottom: 18 }}>
                    {suggestedTemplate.exercises.length} oefeningen · ~{suggestedTemplate.estimatedMinutes} min
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/workout', { state: { templateId: suggestedTemplate.id } })}
                    className="w-full flex items-center justify-center gap-2 text-white font-bold border-0 cursor-pointer"
                    style={{
                      padding: '15px 18px', borderRadius: 16, fontSize: 13, letterSpacing: '0.03em',
                      background: 'var(--theme-accent-grad)',
                      boxShadow: '0 12px 32px var(--theme-accent-glow), inset 0 1px 0 rgba(255,255,255,0.3)',
                    }}
                  >
                    <Play size={12} fill="white" strokeWidth={0} /> START WORKOUT
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ─── WEEK STRIP ────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', color: 'var(--theme-text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>Deze week</span>
              <span style={{ fontSize: 11, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)', fontWeight: 600 }}>{weekCount} / 5 doel</span>
            </div>
            <div className="glass-card-v2" style={{ padding: 14, display: 'flex', gap: 6 }}>
              {WEEK_LETTERS.map((letter, i) => {
                const active = weekDots[i]
                const isToday = i === todayMonIdx
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 9.5, fontFamily: 'var(--theme-font-mono)', color: isToday ? 'var(--theme-accent)' : 'var(--theme-text-muted)', fontWeight: 700 }}>{letter}</div>
                    <div style={{
                      width: '100%', height: 48, borderRadius: 10,
                      background: active ? 'var(--theme-accent-grad)' : 'rgba(255,255,255,0.04)',
                      border: isToday ? '1.5px solid var(--theme-accent)' : '1px solid var(--theme-glass-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: active ? '0 6px 18px var(--theme-accent-glow)' : 'none',
                    }}>
                      {active
                        ? <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
                        : isToday
                        ? <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--theme-accent)', boxShadow: '0 0 12px var(--theme-accent)' }} />
                        : null
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* ─── STATS GRID ────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="mb-5"
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Streak', value: streak, unit: 'd', icon: Flame, color: 'var(--theme-warning)' },
                { label: "PR's", value: prs.length, unit: '', icon: Trophy, color: 'var(--theme-success)' },
                { label: 'Volume', value: (sessions.reduce((t, s) => t + s.exercises.reduce((a, e) => a + e.sets.reduce((b, set) => b + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0), 0), 0), 0) / 1000).toFixed(1), unit: 'k', icon: Zap, color: 'var(--theme-accent)' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + i * 0.07 }}
                  className="glass-card-v2"
                  style={{ padding: 14, position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.9 }}>
                    <s.icon size={14} style={{ color: s.color }} />
                  </div>
                  <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 28, fontWeight: 700, marginTop: 18, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {s.value}<span style={{ fontSize: 13, color: 'var(--theme-text-muted)', fontWeight: 500, marginLeft: 1 }}>{s.unit}</span>
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--theme-text-muted)', marginTop: 6, fontFamily: 'var(--theme-font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─── RECENTE PR'S ─────────────────────────────────────────────────── */}
          {recentPRs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.5 }}
              className="mb-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 3, height: 12, background: 'var(--theme-accent-grad)', borderRadius: 2, boxShadow: '0 0 10px var(--theme-accent-glow)' }} />
                  <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Recente PR's</span>
                </div>
                <button
                  onClick={() => navigate('/progress')}
                  className="border-0 bg-transparent cursor-pointer"
                  style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, color: 'var(--theme-accent)', letterSpacing: '0.08em' }}
                >
                  ALLE PR'S →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentPRs.map((pr, i) => {
                  const exercise = getExercise(pr.exerciseId)
                  return (
                    <motion.div
                      key={pr.exerciseId}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.38 + i * 0.06 }}
                      className="glass-card-v2"
                      style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(62,232,168,0.12)', border: '1px solid rgba(62,232,168,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(62,232,168,0.2)',
                      }}>
                        <TrendingUp size={16} style={{ color: 'var(--theme-success)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{exName(exercise) || pr.exerciseId}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)', marginTop: 3 }}>
                          {pr.date}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{pr.weight}</div>
                        <div style={{ fontSize: 8.5, fontFamily: 'var(--theme-font-mono)', color: 'var(--theme-text-muted)', marginTop: 3, letterSpacing: '0.08em' }}>KG</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ─── MIJN PLANNEN ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 12, background: 'var(--theme-accent-grad)', borderRadius: 2, boxShadow: '0 0 10px var(--theme-accent-glow)' }} />
                <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Mijn plannen</span>
              </div>
              <button onClick={() => navigate('/plans')} className="border-0 bg-transparent cursor-pointer flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--theme-accent)', fontFamily: 'var(--theme-font-mono)', fontSize: 10, letterSpacing: '0.08em' }}>
                ALLES →
              </button>
            </div>

            {myPlans.length === 0 ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/plans/new')}
                className="w-full flex items-center gap-4 p-4 rounded-[22px] cursor-pointer border-0 text-left glass-card-v2"
                style={{ border: '1px dashed var(--theme-border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--theme-accent-muted)' }}>
                  <Plus size={18} style={{ color: 'var(--theme-accent)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold m-0" style={{ color: 'var(--theme-text-primary)' }}>Maak je eerste plan</p>
                  <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>Stel oefeningen samen en sla op</p>
                </div>
              </motion.button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myPlans.slice(0, 3).map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card-v2"
                    style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--theme-accent-muted)' }}>
                      <BookMarked size={16} style={{ color: 'var(--theme-accent)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-sm font-semibold m-0 truncate" style={{ color: 'var(--theme-text-primary)' }}>{plan.name}</p>
                      <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{plan.exercises.length} oefeningen</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => profiles.length >= 2 ? navigate('/workout', { state: { planId: plan.id, samen: true } }) : navigate('/profiles/new')}
                        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border-0"
                        style={{ background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)', color: 'var(--theme-text-muted)' }}
                      >
                        <Users size={13} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => navigate('/workout', { state: { planId: plan.id } })}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer border-0 text-xs font-bold text-white"
                        style={{ background: 'var(--theme-accent-grad)', boxShadow: '0 4px 12px var(--theme-accent-glow)', fontSize: 10, letterSpacing: '0.04em', fontFamily: 'var(--theme-font-mono)' }}
                      >
                        <Play size={10} fill="#fff" strokeWidth={0} /> START
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ─── RECENTE TRAININGEN ────────────────────────────────────────────── */}
          {sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.5 }}
              className="mb-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 3, height: 12, background: 'var(--theme-accent-grad)', borderRadius: 2, boxShadow: '0 0 10px var(--theme-accent-glow)' }} />
                  <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Recente trainingen</span>
                </div>
                <button onClick={() => navigate('/history')} className="border-0 bg-transparent cursor-pointer flex items-center gap-1" style={{ color: 'var(--theme-accent)', fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.08em' }}>
                  ALLE {sessions.length} →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((session, i) => (
                  <motion.button
                    key={session.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', damping: 24 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/history')}
                    className="w-full text-left cursor-pointer border-0 glass-card-v2"
                    style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--theme-accent-muted)', border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)' }}>
                      <Clock size={15} style={{ color: 'var(--theme-accent)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-sm font-medium m-0 truncate" style={{ color: 'var(--theme-text-primary)' }}>{session.workoutName}</p>
                      <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-font-mono)', fontSize: 10 }}>
                        {formatShortDate(session.date)} · {session.exercises.length} oef. · {session.durationMinutes} min
                      </p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--theme-text-muted)' }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── SAMEN TRAINEN ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mb-5"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => profiles.length >= 2 ? navigate('/workout', { state: { samen: true } }) : navigate('/profiles/new')}
              className="w-full flex items-center gap-4 p-4 text-left cursor-pointer border-0 glass-card-v2 relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--theme-accent-muted), transparent)' }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--theme-accent-muted)', border: '1px solid color-mix(in srgb, var(--theme-accent) 25%, transparent)' }}>
                <Users size={22} style={{ color: 'var(--theme-accent)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p className="text-sm font-bold m-0" style={{ color: 'var(--theme-text-primary)' }}>Samen Trainen</p>
                <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                  {profiles.length >= 2 ? `Train met ${profiles.length} profielen tegelijk` : 'Voeg een tweede profiel toe om samen te trainen →'}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--theme-text-muted)' }} />
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

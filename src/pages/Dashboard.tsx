import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import {
  Play, TrendingUp, Flame, Trophy, ChevronRight,
  Zap, Users, Plus, BookMarked, Clock, RefreshCw,
  AlertCircle, ArrowRight, BarChart3,
  Search, Ruler, Wrench, Settings, Palette,
} from 'lucide-react'

const MONTHS_SHORT = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec']
function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

import { useProfiles } from '../hooks/useProfiles'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { usePlans } from '../hooks/usePlans'
import { useLanguage } from '../hooks/useLanguage'
import { useSync } from '../hooks/useSync'
import { getDayLabel } from '../utils/weekUtils'
import { workoutTemplates } from '../data/workoutTemplates'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

const CARD_GRADIENTS = [
  'gradient-workout-a',
  'gradient-workout-b',
  'gradient-workout-c',
  'gradient-workout-d',
  'gradient-workout-e',
  'gradient-workout-f',
]

const STAT_COLORS = {
  week: { color: '#FF5500', bg: 'rgba(255,85,0,0.12)', glow: 'rgba(255,85,0,0.3)' },
  streak: { color: '#FFB300', bg: 'rgba(255,179,0,0.12)', glow: 'rgba(255,179,0,0.3)' },
  prs: { color: '#00E5A0', bg: 'rgba(0,229,160,0.12)', glow: 'rgba(0,229,160,0.3)' },
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: '#FF5500' }} />
      <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#888888', letterSpacing: '0.12em' }}>
        {children}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { activeProfile, isOnboarding, profiles } = useProfiles()
  const { getThisWeekSessionCount, getStreak, getPersonalRecords, getProfileSessions } = useWorkouts()
  const { getExercise } = useExercises()
  const { getPlans } = usePlans()
  const myPlans = getPlans()
  const { exName } = useLanguage()
  const { pullFromCloud, isSyncing, syncError, lastSyncAt } = useSync()

  const weekCount = getThisWeekSessionCount()
  const streak = getStreak()
  const prs = getPersonalRecords()
  const recentPRs = prs.slice(-3)

  const today = new Date()
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

  // Onboarding screen
  if (isOnboarding) {
    return (
      <>
        <Header showProfile={false} />
        <PageWrapper>
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
              {/* Logo */}
              <motion.div
                className="mx-auto mb-8 w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FF5500, #FF8833)',
                  boxShadow: '0 0 60px rgba(255,85,0,0.5)',
                }}
                animate={{ boxShadow: ['0 0 40px rgba(255,85,0,0.4)', '0 0 80px rgba(255,85,0,0.6)', '0 0 40px rgba(255,85,0,0.4)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Zap size={44} fill="#FFFFFF" strokeWidth={0} />
              </motion.div>

              <h1 className="text-5xl tracking-widest mb-2" style={{ color: '#FAFAFA' }}>STRENGTH</h1>
              <p className="text-base mb-8" style={{ color: '#666666', lineHeight: 1.6 }}>
                Volg je trainingen, meet je vooruitgang,<br />word sterker.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/profiles/new')}
                className="px-8 py-4 text-white text-base font-semibold rounded-2xl cursor-pointer border-0"
                style={{
                  background: 'linear-gradient(135deg, #FF5500, #FF8833)',
                  boxShadow: '0 8px 32px rgba(255,85,0,0.4)',
                }}
              >
                Start — Maak je profiel
              </motion.button>
            </motion.div>
          </div>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <Header />
      <PageWrapper>
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* ─── HERO GREETING ─────────────────────────────────── */}
          <motion.div variants={itemVariants} className="relative mb-8 -mx-4 px-4 pt-6 pb-8 overflow-hidden">
            {/* Background glow blobs */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,85,0,0.08) 0%, transparent 70%)',
                transform: 'translate(30%, -40%)',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,179,0,0.05) 0%, transparent 70%)',
                transform: 'translate(-30%, 40%)',
              }}
            />

            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#444444', letterSpacing: '0.15em' }}>
                {dayLabel}
              </p>
              <h2 className="text-5xl tracking-wider leading-none mb-0.5" style={{ color: '#FAFAFA' }}>
                HEY
              </h2>
              <h2 className="text-5xl tracking-wider leading-none mb-3" style={{ color: '#FF5500' }}>
                {activeProfile?.name?.toUpperCase()}
              </h2>
              <p className="text-sm" style={{ color: '#666666' }}>Klaar om te trainen?</p>

              {/* Sync row */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={pullFromCloud}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 transition-opacity"
                  style={{ color: '#444444', fontSize: 11, opacity: isSyncing ? 0.6 : 1 }}
                >
                  <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing
                    ? 'Syncing...'
                    : lastSyncAt
                    ? `Sync ${lastSyncAt.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Sync cloud'}
                </button>
                {syncError && (
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: '#FF3B3B' }}>
                    <AlertCircle size={10} /> {syncError}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─── STATS CARDS ────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Deze week', value: weekCount, icon: Zap, ...STAT_COLORS.week },
              { label: 'Streak', value: streak, icon: Flame, ...STAT_COLORS.streak },
              { label: "PR's", value: prs.length, icon: Trophy, ...STAT_COLORS.prs },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden rounded-2xl p-4 text-center cursor-default"
                style={{
                  background: '#111111',
                  border: '1px solid #1C1C1C',
                  boxShadow: `0 0 0 1px ${bg}`,
                }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: bg }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-3xl font-heading tracking-wider m-0 leading-none" style={{ color: '#FAFAFA' }}>
                  {value}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider mt-1 m-0" style={{ color: '#444444', letterSpacing: '0.1em' }}>
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* ─── SNELLE LINKS ───────────────────────────────────── */}
          <motion.div variants={itemVariants} className="mb-8">
            <SectionLabel>Snelle links</SectionLabel>
            <div className="grid grid-cols-4 gap-2">
              {[
                { to: '/exercises',    icon: Search,  label: 'Oefeningen', color: '#4A8FFF'  },
                { to: '/measurements', icon: Ruler,   label: 'Metingen',   color: '#06b6d4'  },
                { to: '/tools',        icon: Wrench,  label: 'Tools',      color: '#00C060'  },
                { to: '/themes',       icon: Palette, label: "Thema's",    color: '#A855F7'  },
                { to: '/achievements', icon: Trophy,  label: 'Badges',     color: '#FFB300'  },
                { to: '/plans',        icon: BookMarked, label: 'Plannen', color: '#00E5A0'  },
                { to: '/profiles',     icon: Users,   label: 'Profielen',  color: '#FF5500'  },
                { to: '/settings',     icon: Settings, label: 'Instellingen', color: '#888888' },
              ].map(({ to, icon: Icon, label, color }) => (
                <motion.button
                  key={to}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate(to)}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl cursor-pointer border-0"
                  style={{ background: '#111111', border: '1px solid #1C1C1C' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18` }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <span
                    className="text-[9px] font-semibold text-center leading-tight"
                    style={{ color: '#666666' }}
                  >
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ─── TODAY / QUICK START ────────────────────────────── */}
          {todaySessions.length === 0 && suggestedTemplate ? (
            <motion.div variants={itemVariants} className="mb-8">
              <SectionLabel>Vandaag</SectionLabel>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/workout', { state: { templateId: suggestedTemplate.id } })}
                className="w-full rounded-2xl overflow-hidden cursor-pointer border-0 p-0 text-left"
                style={{ boxShadow: '0 12px 40px rgba(255,85,0,0.25)' }}
              >
                {/* Gradient "image" */}
                <div className="gradient-workout-a relative h-44">
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />

                  {/* Decorative dots */}
                  <div className="absolute top-4 right-4 grid grid-cols-4 gap-1 opacity-20">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white" />
                    ))}
                  </div>

                  {/* Play button */}
                  <div
                    className="absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,85,0,0.9)', boxShadow: '0 0 20px rgba(255,85,0,0.5)' }}
                  >
                    <Play size={22} fill="#FFFFFF" strokeWidth={0} />
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium m-0 mb-1" style={{ color: '#999999' }}>
                      AANBEVOLEN VOOR VANDAAG
                    </p>
                    <p className="text-white text-xl font-heading tracking-wider m-0">
                      {exName(suggestedTemplate).toUpperCase()}
                    </p>
                    <p className="text-sm m-0 mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {suggestedTemplate.exercises.length} oefeningen · ~{suggestedTemplate.estimatedMinutes} min
                    </p>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ) : todaySessions.length > 0 ? (
            <motion.div variants={itemVariants} className="mb-8">
              <div
                className="p-4 rounded-2xl flex items-center gap-3"
                style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.15)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,229,160,0.15)' }}>
                  <Trophy size={18} style={{ color: '#00E5A0' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold m-0" style={{ color: '#00E5A0' }}>
                    Vandaag getraind!
                  </p>
                  <p className="text-xs m-0 mt-0.5" style={{ color: '#444444' }}>
                    {todaySessions.length} training{todaySessions.length > 1 ? 'en' : ''} voltooid
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* ─── RECENTE TRAININGEN ─────────────────────────────── */}
          {sessions.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Recente trainingen</SectionLabel>
                <button
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-1 text-xs cursor-pointer bg-transparent border-0 font-semibold"
                  style={{ color: '#FF5500' }}
                >
                  Alle {sessions.length} <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-2">
                {sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((session, i) => (
                  <motion.button
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', damping: 24 }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/history')}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl text-left cursor-pointer border-0 transition-colors"
                    style={{ background: '#111111', border: '1px solid #1C1C1C' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.15)' }}
                    >
                      <Clock size={15} style={{ color: '#FF5500' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium m-0 truncate" style={{ color: '#FAFAFA' }}>
                        {session.workoutName}
                      </p>
                      <p className="text-xs m-0 mt-0.5" style={{ color: '#555555' }}>
                        {formatShortDate(session.date)} · {session.exercises.length} oef. · {session.durationMinutes} min
                      </p>
                    </div>
                    <ChevronRight size={14} style={{ color: '#333333' }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── MIJN PLANNEN ────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Mijn plannen</SectionLabel>
              <button
                onClick={() => navigate('/plans')}
                className="flex items-center gap-1 text-xs cursor-pointer bg-transparent border-0 font-semibold"
                style={{ color: '#FF5500' }}
              >
                Alles <ArrowRight size={12} />
              </button>
            </div>

            {myPlans.length === 0 ? (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/plans/new')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-0 text-left"
                style={{
                  background: '#111111',
                  border: '1px dashed #282828',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,85,0,0.1)' }}
                >
                  <Plus size={18} style={{ color: '#FF5500' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold m-0" style={{ color: '#FAFAFA' }}>Maak je eerste plan</p>
                  <p className="text-xs m-0 mt-0.5" style={{ color: '#555555' }}>Stel oefeningen samen en sla op</p>
                </div>
              </motion.button>
            ) : (
              <div className="space-y-2">
                {myPlans.slice(0, 3).map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: '#111111', border: '1px solid #1C1C1C' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,85,0,0.1)' }}
                    >
                      <BookMarked size={16} style={{ color: '#FF5500' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold m-0 truncate" style={{ color: '#FAFAFA' }}>{plan.name}</p>
                      <p className="text-xs m-0 mt-0.5" style={{ color: '#555555' }}>{plan.exercises.length} oefeningen</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {profiles.length >= 2 && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate('/workout', { state: { planId: plan.id, samen: true } })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#666666' }}
                          title="Samen trainen"
                        >
                          <Users size={13} />
                        </motion.button>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/workout', { state: { planId: plan.id } })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer border-0 text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #FF5500, #FF8833)' }}
                      >
                        <Play size={11} fill="#fff" strokeWidth={0} /> Start
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {myPlans.length > 3 && (
                  <button
                    onClick={() => navigate('/plans')}
                    className="w-full text-xs py-2 text-center cursor-pointer bg-transparent border-0"
                    style={{ color: '#444444' }}
                  >
                    +{myPlans.length - 3} meer plannen
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* ─── TRAININGSSCHEMA — SWIPEABLE CARDS ──────────────── */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Standaard trainingen</SectionLabel>
              <button
                onClick={() => navigate('/workout')}
                className="flex items-center gap-1 text-xs cursor-pointer bg-transparent border-0 font-semibold"
                style={{ color: '#FF5500' }}
              >
                Eigen <ArrowRight size={12} />
              </button>
            </div>

            {/* Horizontal swipe cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar snap-x snap-mandatory">
              {workoutTemplates.map((template, i) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/workout', { state: { templateId: template.id } })}
                  className={`shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer border-0 p-0 text-left ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
                  style={{ width: 180, minHeight: 220, position: 'relative', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                >
                  {/* Dark gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
                  />

                  {/* Decorative abstract shapes */}
                  <div
                    className="absolute top-3 right-3 w-16 h-16 rounded-full opacity-20"
                    style={{ background: 'rgba(255,255,255,0.3)', filter: 'blur(12px)' }}
                  />
                  <div
                    className="absolute top-8 right-8 w-8 h-8 rounded-full opacity-15"
                    style={{ background: 'rgba(255,255,255,0.5)' }}
                  />

                  {/* Number badge */}
                  <div
                    className="absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                  >
                    <span className="text-xs font-bold text-white">{i + 1}</span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}
                      >
                        {template.difficulty}
                      </span>
                    </div>
                    <p className="text-white text-base font-heading tracking-wider m-0 leading-tight">
                      {exName(template).toUpperCase()}
                    </p>
                    <p className="text-xs m-0 mt-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {template.exercises.length} oefeningen
                    </p>

                    {/* Play button */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(255,85,0,0.8)' }}
                      >
                        <Play size={13} fill="#fff" strokeWidth={0} />
                      </div>
                      <span className="text-xs font-semibold text-white">Start</span>
                    </div>
                  </div>
                </motion.button>
              ))}

              {/* Custom workout card */}
              <motion.button
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/workout')}
                className="shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer border-0 p-0 text-left flex flex-col items-center justify-center gap-3"
                style={{
                  width: 180,
                  minHeight: 220,
                  background: '#111111',
                  border: '1px dashed #282828',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,85,0,0.1)' }}
                >
                  <Plus size={22} style={{ color: '#FF5500' }} />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-semibold m-0" style={{ color: '#FAFAFA' }}>Eigen training</p>
                  <p className="text-xs m-0 mt-1" style={{ color: '#444444' }}>Zelf samenstellen</p>
                </div>
              </motion.button>
            </div>

            {/* Swipe hint */}
            <p className="text-center text-[10px] mt-2" style={{ color: '#333333' }}>
              ← swipe voor meer →
            </p>
          </motion.div>

          {/* ─── SAMEN TRAINEN ─────────────────────────────────── */}
          {profiles.length >= 2 && (
            <motion.div variants={itemVariants} className="mb-8">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/workout', { state: { samen: true } })}
                className="w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-0 text-left overflow-hidden relative"
                style={{ background: '#111111', border: '1px solid #1C1C1C' }}
              >
                {/* Background accent */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, rgba(255,85,0,0.05), transparent)' }}
                />
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,85,0,0.12)', border: '1px solid rgba(255,85,0,0.2)' }}
                >
                  <Users size={22} style={{ color: '#FF5500' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold m-0" style={{ color: '#FAFAFA' }}>Samen Trainen</p>
                  <p className="text-xs m-0 mt-0.5" style={{ color: '#555555' }}>
                    Train met {profiles.length} profielen tegelijk
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: '#333333' }} />
              </motion.button>
            </motion.div>
          )}

          {/* ─── RECENTE PR'S ─────────────────────────────────── */}
          {recentPRs.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <SectionLabel>Recente PR's</SectionLabel>
              <div className="space-y-2">
                {recentPRs.map((pr, i) => {
                  const exercise = getExercise(pr.exerciseId)
                  return (
                    <motion.div
                      key={pr.exerciseId}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{ background: '#111111', border: '1px solid rgba(0,229,160,0.1)' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(0,229,160,0.1)' }}
                      >
                        <TrendingUp size={16} style={{ color: '#00E5A0' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold m-0" style={{ color: '#FAFAFA' }}>
                          {exName(exercise) || pr.exerciseId}
                        </p>
                        <p className="text-xs m-0 mt-0.5" style={{ color: '#444444' }}>{pr.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold font-heading" style={{ color: '#00E5A0' }}>
                          {pr.weight}
                        </span>
                        <span className="text-xs ml-0.5" style={{ color: '#444444' }}>kg</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ─── WEKELIJKSE FEEDBACK ──────────────────────────── */}
          <motion.div variants={itemVariants} className="mb-6">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/week-feedback')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-0 text-left overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.2)' }}
              >
                <BarChart3 size={20} style={{ color: '#818CF8' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold m-0" style={{ color: '#FAFAFA' }}>Wekelijkse Feedback</p>
                <p className="text-xs m-0 mt-0.5" style={{ color: '#555555' }}>Bekijk je voortgang en aanbevelingen</p>
              </div>
              <ArrowRight size={16} style={{ color: '#818CF8' }} />
            </motion.button>
          </motion.div>

        </motion.div>
      </PageWrapper>
    </>
  )
}


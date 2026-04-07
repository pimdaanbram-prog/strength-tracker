import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, TrendingUp, Flame, Trophy, ChevronRight, Zap, Users, Plus, BookMarked, Clock } from 'lucide-react'

const MONTHS_SHORT = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec']
function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}
import { useProfiles } from '../hooks/useProfiles'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { usePlans } from '../hooks/usePlans'
import { getDayLabel } from '../utils/weekUtils'
import { workoutTemplates } from '../data/workoutTemplates'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

export default function Dashboard() {
  const navigate = useNavigate()
  const { activeProfile, isOnboarding, profiles } = useProfiles()
  const { getThisWeekSessionCount, getStreak, getPersonalRecords, getProfileSessions } = useWorkouts()
  const { getExercise } = useExercises()
  const { getPlans } = usePlans()

  const myPlans = getPlans()

  const weekCount = getThisWeekSessionCount()
  const streak = getStreak()
  const prs = getPersonalRecords()
  const recentPRs = prs.slice(-3)

  const today = new Date()
  const dayLabel = getDayLabel(today)
  const sessions = getProfileSessions()
  const todaySessions = sessions.filter(s => s.date === today.toISOString().split('T')[0])

  // Suggest alternating A/B
  const suggestedTemplate = useMemo(() => {
    const lastSession = sessions[sessions.length - 1]
    if (!lastSession || lastSession.workoutName?.includes('A')) {
      return workoutTemplates.find(t => t.id === 'training-b') || workoutTemplates[1]
    }
    return workoutTemplates.find(t => t.id === 'training-a') || workoutTemplates[0]
  }, [sessions])

  if (isOnboarding) {
    return (
      <>
        <Header showProfile={false} />
        <PageWrapper>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-6xl mb-6 block">💪</span>
              <h1 className="text-4xl tracking-wider mb-2">STRENGTH TRACKER</h1>
              <p className="text-text-secondary mb-8 text-lg">
                Volg je trainingen, meet je vooruitgang, word sterker.
              </p>
              <button
                onClick={() => navigate('/profiles/new')}
                className="px-8 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-lg font-semibold transition-colors cursor-pointer"
              >
                Start — Maak je profiel
              </button>
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
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-3xl tracking-wider mb-1">
            HEY {activeProfile?.name?.toUpperCase()}
          </h2>
          <p className="text-text-secondary">{dayLabel} — Klaar om te trainen?</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-bg-card border border-border rounded-xl p-3 text-center"
          >
            <Zap size={18} className="text-accent mx-auto mb-1" />
            <p className="text-2xl font-heading tracking-wider text-text-primary">{weekCount}</p>
            <p className="text-xs text-text-muted">Deze week</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-bg-card border border-border rounded-xl p-3 text-center"
          >
            <Flame size={18} className="text-warning mx-auto mb-1" />
            <p className="text-2xl font-heading tracking-wider text-text-primary">{streak}</p>
            <p className="text-xs text-text-muted">Weken streak</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-bg-card border border-border rounded-xl p-3 text-center"
          >
            <Trophy size={18} className="text-success mx-auto mb-1" />
            <p className="text-2xl font-heading tracking-wider text-text-primary">{prs.length}</p>
            <p className="text-xs text-text-muted">PR's</p>
          </motion.div>
        </div>

        {/* Recente Trainingen */}
        {sessions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg tracking-wider m-0">RECENTE TRAININGEN</h3>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-accent cursor-pointer bg-transparent border-0"
              >
                Alle {sessions.length} zien
              </button>
            </div>
            <div className="space-y-2">
              {sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(session => (
                <button
                  key={session.id}
                  onClick={() => navigate('/history')}
                  className="w-full flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl text-left cursor-pointer hover:border-border-light transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                    <Clock size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium m-0 truncate">{session.workoutName}</p>
                    <p className="text-xs text-text-muted m-0 mt-0.5">
                      {formatShortDate(session.date)} · {session.exercises.length} oefeningen · {session.durationMinutes} min
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-text-muted shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start */}
        {todaySessions.length === 0 && suggestedTemplate && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h3 className="text-lg tracking-wider mb-3">VANDAAG</h3>
            <button
              onClick={() => navigate('/workout', { state: { templateId: suggestedTemplate.id } })}
              className="w-full bg-gradient-to-r from-accent to-blue-600 rounded-xl p-4 text-left cursor-pointer border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-base m-0">
                    {suggestedTemplate.nameNL}
                  </p>
                  <p className="text-white/70 text-sm mt-1 m-0">
                    {suggestedTemplate.exercises.length} oefeningen · ~{suggestedTemplate.estimatedMinutes} min
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Play size={20} className="text-white ml-0.5" />
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {todaySessions.length > 0 && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl">
            <p className="text-success text-sm m-0">
              Je hebt vandaag al {todaySessions.length} training(en) gedaan!
            </p>
          </div>
        )}

        {/* My Plans */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg tracking-wider m-0">MIJN PLANNEN</h3>
            <button
              onClick={() => navigate('/plans')}
              className="text-xs text-accent cursor-pointer bg-transparent border-0"
            >
              Alles zien
            </button>
          </div>

          {myPlans.length === 0 ? (
            <button
              onClick={() => navigate('/plans/new')}
              className="w-full flex items-center gap-3 p-4 bg-bg-card border border-dashed border-border rounded-xl hover:border-accent transition-colors cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-text-primary font-medium m-0">Maak je eerste plan</p>
                <p className="text-xs text-text-muted m-0 mt-0.5">Stel oefeningen samen en sla op</p>
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              {myPlans.slice(0, 3).map(plan => (
                <div
                  key={plan.id}
                  className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                    <BookMarked size={16} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium m-0 truncate">{plan.name}</p>
                    <p className="text-xs text-text-muted m-0 mt-0.5">{plan.exercises.length} oefeningen</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {profiles.length >= 2 && (
                      <button
                        onClick={() => navigate('/workout', { state: { planId: plan.id, samen: true } })}
                        className="p-2 bg-bg-input hover:bg-white/10 text-text-muted rounded-lg transition-colors cursor-pointer border-0"
                        title="Samen trainen"
                      >
                        <Users size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/workout', { state: { planId: plan.id } })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border-0"
                    >
                      <Play size={12} /> Start
                    </button>
                  </div>
                </div>
              ))}
              {myPlans.length > 3 && (
                <button
                  onClick={() => navigate('/plans')}
                  className="w-full text-xs text-text-muted py-2 text-center cursor-pointer bg-transparent border-0 hover:text-text-secondary"
                >
                  +{myPlans.length - 3} meer plannen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Training Templates */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg tracking-wider m-0">STANDAARD TRAININGEN</h3>
            <button
              onClick={() => navigate('/workout')}
              className="text-xs text-accent cursor-pointer bg-transparent border-0"
            >
              Eigen training
            </button>
          </div>
          <div className="space-y-2">
            {workoutTemplates.slice(0, 4).map(template => (
              <button
                key={template.id}
                onClick={() => navigate('/workout', { state: { templateId: template.id } })}
                className="w-full flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl hover:border-border-light transition-colors cursor-pointer text-left"
              >
                <div className="flex-1">
                  <p className="text-sm text-text-primary font-medium m-0">{template.nameNL}</p>
                  <p className="text-xs text-text-muted m-0 mt-0.5">
                    {template.exercises.length} oefeningen · {template.difficulty}
                  </p>
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </button>
            ))}
          </div>
        </div>

        {/* Samen Trainen */}
        {profiles.length >= 2 && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/workout', { state: { samen: true } })}
              className="w-full flex items-center gap-3 p-4 bg-bg-card border border-border rounded-xl hover:border-accent transition-colors cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Users size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-primary font-semibold m-0">Samen Trainen</p>
                <p className="text-xs text-text-muted m-0 mt-0.5">
                  Train met {profiles.length} profielen tegelijk
                </p>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </button>
          </div>
        )}

        {/* Recent PRs */}
        {recentPRs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg tracking-wider mb-3">RECENTE PR'S</h3>
            <div className="space-y-2">
              {recentPRs.map(pr => {
                const exercise = getExercise(pr.exerciseId)
                return (
                  <div key={pr.exerciseId} className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl">
                    <TrendingUp size={16} className="text-success shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary m-0">{exercise?.nameNL || pr.exerciseId}</p>
                      <p className="text-xs text-text-muted m-0 mt-0.5">{pr.date}</p>
                    </div>
                    <span className="text-sm font-semibold text-success">{pr.weight}kg</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Week Feedback link */}
        <button
          onClick={() => navigate('/week-feedback')}
          className="w-full p-4 bg-bg-card border border-border rounded-xl text-left hover:border-border-light transition-colors cursor-pointer mb-6"
        >
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-accent" />
            <div>
              <p className="text-sm text-text-primary font-medium m-0">Wekelijkse Feedback</p>
              <p className="text-xs text-text-muted m-0 mt-0.5">Bekijk je voortgang en aanbevelingen</p>
            </div>
            <ChevronRight size={16} className="text-text-muted ml-auto" />
          </div>
        </button>
      </PageWrapper>
    </>
  )
}

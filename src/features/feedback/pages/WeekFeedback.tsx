import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Star, Target, ArrowUp, RefreshCw, Zap } from 'lucide-react'
import Header from '@/shared/components/layout/Header'
import PageWrapper from '@/shared/components/layout/PageWrapper'
import { useWeekFeedback } from '@/features/feedback/hooks/useWeekFeedback'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { getWeekNumber } from '@/shared/utils/weekUtils'
import type { WeekFeedback as WeekFeedbackType } from '@/features/workouts/hooks/useWorkouts'

function ScoreRing({ score }: { score: number }) {
  const color = score >= 7 ? '#00E5A0' : score >= 4 ? '#FFB300' : '#FF3B3B'
  const r = 44
  const circ = 2 * Math.PI * r
  const progress = (score / 10) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1C1C1C" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - progress }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', damping: 16 }}
          className="text-4xl font-heading tracking-wider m-0"
          style={{ color }}
        >
          {score}
        </motion.p>
        <p className="text-[10px] m-0 uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>/ 10</p>
      </div>
    </div>
  )
}

export default function WeekFeedback() {
  const { generateCurrentWeekFeedback, getLatestFeedback } = useWeekFeedback()
  const { getExercise } = useExercises()
  const { exName } = useLanguage()
  const [feedback, setFeedback] = useState<WeekFeedbackType | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const latest = getLatestFeedback()
    if (latest) setFeedback(latest)
  }, [getLatestFeedback])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      const fb = generateCurrentWeekFeedback()
      setFeedback(fb)
      setGenerating(false)
    }, 600)
  }

  const weekNumber = getWeekNumber(new Date())

  const statusIcon = (status: string) => {
    switch (status) {
      case 'improved':  return <TrendingUp size={14} style={{ color: 'var(--theme-success)' }} />
      case 'regressed': return <TrendingDown size={14} style={{ color: 'var(--theme-error)' }} />
      case 'new':       return <Star size={14} style={{ color: 'var(--theme-accent)' }} />
      default:          return <Minus size={14} style={{ color: 'var(--theme-text-muted)' }} />
    }
  }

  return (
    <>
      <Header title="WEEK FEEDBACK" showBack />
      <PageWrapper>

        {/* ─── Week header ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3" style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.2)' }}>
            <Zap size={12} style={{ color: 'var(--theme-accent)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--theme-accent)', letterSpacing: '0.1em' }}>Week {weekNumber}</span>
          </div>
          <h2 className="text-3xl tracking-wider m-0">VOORTGANGSRAPPORT</h2>
          <p className="text-sm mt-1 m-0" style={{ color: 'var(--theme-text-secondary)' }}>Automatische analyse van je week</p>
        </motion.div>

        {/* ─── Generate button ─────────────────────── */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-0 font-semibold text-white mb-6"
          style={{
            background: generating ? 'var(--theme-bg-input)' : 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))',
            boxShadow: generating ? 'none' : '0 8px 24px var(--theme-accent-glow)',
            fontSize: 15,
          }}
        >
          <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Analyseren...' : feedback ? 'Vernieuwen' : 'Genereer Feedback'}
        </motion.button>

        {/* ─── Feedback content ────────────────────── */}
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 24 }}
              className="space-y-4"
            >
              {/* Score card */}
              <div
                className="rounded-3xl p-6 text-center relative overflow-hidden"
                style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-accent), transparent)' }} />
                <p className="text-xs font-semibold uppercase tracking-widest mb-4 m-0" style={{ color: 'var(--theme-text-muted)', letterSpacing: '0.12em' }}>Score van de week</p>
                <div className="flex justify-center mb-4">
                  <ScoreRing score={feedback.overallScore} />
                </div>
                <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--theme-text-secondary)' }}>{feedback.summary}</p>
              </div>

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', damping: 24 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: 'var(--theme-success)' }} />
                    <p className="text-xs font-bold uppercase tracking-widest m-0" style={{ color: 'var(--theme-success)', letterSpacing: '0.1em' }}>Sterke punten</p>
                  </div>
                  <div className="space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-3 p-3.5 rounded-2xl"
                        style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.12)' }}
                      >
                        <TrendingUp size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--theme-success)' }} />
                        <p className="text-sm m-0 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>{s}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Improvements */}
              {feedback.improvements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', damping: 24 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: 'var(--theme-warning)' }} />
                    <p className="text-xs font-bold uppercase tracking-widest m-0" style={{ color: 'var(--theme-warning)', letterSpacing: '0.1em' }}>Verbeterpunten</p>
                  </div>
                  <div className="space-y-2">
                    {feedback.improvements.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-3 p-3.5 rounded-2xl"
                        style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.12)' }}
                      >
                        <Target size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--theme-warning)' }} />
                        <p className="text-sm m-0 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>{s}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Exercise progress notes */}
              {feedback.progressNotes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', damping: 24 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: '#818CF8' }} />
                    <p className="text-xs font-bold uppercase tracking-widest m-0" style={{ color: '#818CF8', letterSpacing: '0.1em' }}>Oefening details</p>
                  </div>
                  <div className="space-y-2">
                    {feedback.progressNotes.map((note, i) => {
                      const exercise = getExercise(note.exerciseId)
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="p-3.5 rounded-2xl"
                          style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {statusIcon(note.progressStatus)}
                            <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                              {exName(exercise) || note.exerciseId}
                            </span>
                          </div>
                          <p className="text-xs m-0" style={{ color: 'var(--theme-text-secondary)' }}>{note.note}</p>
                          {note.previousBest > 0 && (
                            <p className="text-xs mt-1 m-0 font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                              {note.previousBest}kg →{' '}
                              <span style={{ color: note.currentBest > note.previousBest ? 'var(--theme-success)' : 'var(--theme-error)' }}>
                                {note.currentBest}kg
                              </span>
                            </p>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Next week recommendations */}
              {feedback.nextWeekRecommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', damping: 24 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: 'var(--theme-accent)' }} />
                    <p className="text-xs font-bold uppercase tracking-widest m-0" style={{ color: 'var(--theme-accent)', letterSpacing: '0.1em' }}>Aanbevelingen volgende week</p>
                  </div>
                  <div className="space-y-2">
                    {feedback.nextWeekRecommendations.map((rec, i) => {
                      const exercise = getExercise(rec.exerciseId)
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-3 p-3.5 rounded-2xl relative overflow-hidden"
                          style={{ background: 'var(--theme-accent-muted)', border: '1px solid var(--theme-accent-glow)' }}
                        >
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--theme-accent-muted)' }}>
                            <ArrowUp size={14} style={{ color: 'var(--theme-accent)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold m-0 truncate" style={{ color: 'var(--theme-text-primary)' }}>
                              {exName(exercise) || rec.exerciseId}
                            </p>
                            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{rec.reason}</p>
                          </div>
                          <span className="text-sm font-bold shrink-0" style={{ color: 'var(--theme-accent)' }}>
                            {rec.recommendedWeight}kg
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              <p className="text-xs text-center pt-2 m-0" style={{ color: 'var(--theme-text-muted)' }}>
                Gegenereerd op {new Date(feedback.generatedAt).toLocaleString('nl-NL')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl tracking-wider mb-2">GEEN FEEDBACK</h3>
              <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                Klik op de knop hierboven om je weekfeedback te genereren
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </PageWrapper>
    </>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Star, Target, ArrowUp, RefreshCw } from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useWeekFeedback } from '../hooks/useWeekFeedback'
import { useExercises } from '../hooks/useExercises'
import { useLanguage } from '../hooks/useLanguage'
import { getWeekNumber } from '../utils/weekUtils'
import type { WeekFeedback as WeekFeedbackType } from '../hooks/useWorkouts'

export default function WeekFeedback() {
  const { generateCurrentWeekFeedback, getLatestFeedback } = useWeekFeedback()
  const { getExercise } = useExercises()
  const { exName } = useLanguage()
  const [feedback, setFeedback] = useState<WeekFeedbackType | null>(null)

  useEffect(() => {
    const latest = getLatestFeedback()
    if (latest) setFeedback(latest)
  }, [getLatestFeedback])

  const handleGenerate = () => {
    const fb = generateCurrentWeekFeedback()
    setFeedback(fb)
  }

  const now = new Date()
  const weekNumber = getWeekNumber(now)

  const statusIcon = (status: string) => {
    switch (status) {
      case 'improved': return <TrendingUp size={14} className="text-success" />
      case 'regressed': return <TrendingDown size={14} className="text-danger" />
      case 'new': return <Star size={14} className="text-accent" />
      default: return <Minus size={14} className="text-text-muted" />
    }
  }

  return (
    <>
      <Header title="FEEDBACK" showBack />
      <PageWrapper>
        <div className="text-center mb-6">
          <h2 className="text-3xl tracking-wider mb-1">WEEK {weekNumber}</h2>
          <p className="text-text-secondary text-sm">Wekelijks voortgangsrapport</p>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mb-6"
        >
          <RefreshCw size={16} /> Genereer Feedback
        </button>

        {feedback ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score */}
            <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-sm text-text-muted mb-2 m-0">Score</p>
              <p className="text-5xl font-heading tracking-wider m-0" style={{
                color: feedback.overallScore >= 7 ? '#10B981' : feedback.overallScore >= 4 ? '#F59E0B' : '#EF4444'
              }}>
                {feedback.overallScore}/10
              </p>
            </div>

            {/* Summary */}
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-text-primary m-0">{feedback.summary}</p>
            </div>

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
              <div>
                <h3 className="text-sm tracking-wider text-success mb-2 m-0">STERKE PUNTEN</h3>
                <div className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-xl">
                      <TrendingUp size={14} className="text-success shrink-0" />
                      <p className="text-sm text-text-secondary m-0">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {feedback.improvements.length > 0 && (
              <div>
                <h3 className="text-sm tracking-wider text-warning mb-2 m-0">VERBETERPUNTEN</h3>
                <div className="space-y-1">
                  {feedback.improvements.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                      <Target size={14} className="text-warning shrink-0" />
                      <p className="text-sm text-text-secondary m-0">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise Progress */}
            {feedback.progressNotes.length > 0 && (
              <div>
                <h3 className="text-sm tracking-wider text-text-primary mb-2 m-0">OEFENING DETAILS</h3>
                <div className="space-y-2">
                  {feedback.progressNotes.map((note, i) => {
                    const exercise = getExercise(note.exerciseId)
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-bg-card border border-border rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {statusIcon(note.progressStatus)}
                          <span className="text-sm font-medium text-text-primary">
                            {exName(exercise) || note.exerciseId}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted m-0">{note.note}</p>
                        {note.previousBest > 0 && (
                          <p className="text-xs text-text-muted mt-1 m-0">
                            {note.previousBest}kg → {note.currentBest}kg
                          </p>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {feedback.nextWeekRecommendations.length > 0 && (
              <div>
                <h3 className="text-sm tracking-wider text-accent mb-2 m-0">AANBEVELINGEN VOLGENDE WEEK</h3>
                <div className="space-y-2">
                  {feedback.nextWeekRecommendations.map((rec, i) => {
                    const exercise = getExercise(rec.exerciseId)
                    return (
                      <div key={i} className="bg-accent/10 border border-accent/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowUp size={14} className="text-accent" />
                          <span className="text-sm font-medium text-text-primary">
                            {exName(exercise) || rec.exerciseId}
                          </span>
                          <span className="text-sm text-accent ml-auto font-bold">{rec.recommendedWeight}kg</span>
                        </div>
                        <p className="text-xs text-text-muted m-0">{rec.reason}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-text-muted text-center pt-2 m-0">
              Gegenereerd op {new Date(feedback.generatedAt).toLocaleString('nl-NL')}
            </p>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📊</span>
            <h3 className="text-xl tracking-wider mb-2">GEEN FEEDBACK</h3>
            <p className="text-text-secondary text-sm">
              Klik op de knop hierboven om feedback te genereren voor deze week
            </p>
          </div>
        )}
      </PageWrapper>
    </>
  )
}

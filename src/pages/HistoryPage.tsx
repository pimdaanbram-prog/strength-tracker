import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Dumbbell, Trash2 } from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { getWeekDates, getWeekNumber, getYear, getDayLabel, getMonthLabel, isSameDay, isToday, formatDateShort } from '../utils/weekUtils'

export default function HistoryPage() {
  const { getProfileSessions, deleteSession } = useWorkouts()
  const { getExercise } = useExercises()

  const [currentDate, setCurrentDate] = useState(new Date())
  const weekNumber = getWeekNumber(currentDate)
  const year = getYear(currentDate)
  const weekDates = getWeekDates(weekNumber, year)

  const sessions = getProfileSessions()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return sessions.filter(s => isSameDay(new Date(s.date), selectedDate))
  }, [sessions, selectedDate])

  const sessionDates = useMemo(() => {
    return new Set(sessions.map(s => s.date))
  }, [sessions])

  const prevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
    setSelectedDate(null)
  }

  const nextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
    setSelectedDate(null)
  }

  const weekSessions = sessions.filter(s => {
    const sd = new Date(s.date)
    return weekDates.some(wd => isSameDay(wd, sd))
  })

  return (
    <>
      <Header title="GESCHIEDENIS" />
      <PageWrapper>
        {/* Week navigator */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevWeek} className="p-2 hover:bg-white/5 rounded-lg cursor-pointer bg-transparent border-0">
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary m-0">Week {weekNumber}</p>
            <p className="text-xs text-text-muted m-0">{getMonthLabel(weekDates[0])} {year}</p>
          </div>
          <button onClick={nextWeek} className="p-2 hover:bg-white/5 rounded-lg cursor-pointer bg-transparent border-0">
            <ChevronRight size={20} className="text-text-primary" />
          </button>
        </div>

        {/* Calendar week */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(d => (
            <div key={d} className="text-center text-xs text-text-muted py-1">{d}</div>
          ))}
          {weekDates.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0]
            const hasSession = sessionDates.has(dateStr)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isTodayDate = isToday(date)

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(isSelected ? null : date)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer border-0 ${
                  isSelected
                    ? 'bg-accent text-white'
                    : isTodayDate
                    ? 'bg-accent/20 text-accent'
                    : 'bg-bg-card text-text-primary hover:bg-white/5'
                }`}
              >
                <span className="text-sm">{date.getDate()}</span>
                {hasSession && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-accent'}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* Week summary */}
        <div className="bg-bg-card border border-border rounded-xl p-4 mb-4">
          <h3 className="text-sm tracking-wider text-text-primary m-0 mb-2">WEEK SAMENVATTING</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-heading text-text-primary m-0">{weekSessions.length}</p>
              <p className="text-xs text-text-muted m-0">Trainingen</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-heading text-text-primary m-0">
                {weekSessions.reduce((t, s) => t + s.exercises.length, 0)}
              </p>
              <p className="text-xs text-text-muted m-0">Oefeningen</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-heading text-text-primary m-0">
                {weekSessions.reduce((t, s) => t + s.durationMinutes, 0)}
              </p>
              <p className="text-xs text-text-muted m-0">Minuten</p>
            </div>
          </div>
        </div>

        {/* Selected date sessions */}
        {selectedDate && (
          <div className="mb-4">
            <h3 className="text-sm tracking-wider text-text-primary mb-3 m-0">
              {getDayLabel(selectedDate)} {selectedDate.getDate()} {getMonthLabel(selectedDate)}
            </h3>
            {sessionsForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {sessionsForSelectedDate.map(session => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary m-0">{session.workoutName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} className="text-text-muted" />
                          <span className="text-xs text-text-muted">{session.durationMinutes} min</span>
                          <Dumbbell size={12} className="text-text-muted" />
                          <span className="text-xs text-text-muted">{session.exercises.length} oefeningen</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Training verwijderen?')) deleteSession(session.id)
                        }}
                        className="p-1 text-danger/50 hover:text-danger cursor-pointer bg-transparent border-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {session.exercises.map(se => {
                        const exercise = getExercise(se.exerciseId)
                        const completedSets = se.sets.filter(s => s.completed).length
                        const maxWeight = Math.max(...se.sets.filter(s => s.completed && s.weight).map(s => s.weight!), 0)
                        return (
                          <div key={se.exerciseId} className="flex items-center justify-between text-sm py-1">
                            <span className="text-text-secondary">{exercise?.nameNL || se.exerciseId}</span>
                            <span className="text-text-muted">
                              {completedSets} sets {maxWeight > 0 ? `· ${maxWeight}kg` : ''}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {session.notes && (
                      <p className="text-xs text-text-muted mt-2 m-0 italic">"{session.notes}"</p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm text-center py-4">Geen trainingen op deze dag</p>
            )}
          </div>
        )}

        {/* All sessions list (when no date selected) */}
        {!selectedDate && sessions.length > 0 && (
          <div>
            <h3 className="text-sm tracking-wider text-text-primary mb-3 m-0">RECENTE TRAININGEN</h3>
            <div className="space-y-2">
              {sessions.slice().reverse().slice(0, 10).map(session => (
                <button
                  key={session.id}
                  onClick={() => setSelectedDate(new Date(session.date))}
                  className="w-full flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl text-left hover:border-border-light transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium m-0">{session.workoutName}</p>
                    <p className="text-xs text-text-muted m-0 mt-0.5">
                      {session.dayLabel} {formatDateShort(new Date(session.date))} · {session.durationMinutes} min
                    </p>
                  </div>
                  <span className="text-xs text-text-muted">{session.exercises.length} oef.</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && !selectedDate && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📋</span>
            <h3 className="text-xl tracking-wider mb-2">GEEN GESCHIEDENIS</h3>
            <p className="text-text-secondary text-sm">Start je eerste training om je geschiedenis bij te houden</p>
          </div>
        )}
      </PageWrapper>
    </>
  )
}

import { useCallback } from 'react'
import { useWorkouts } from '@/features/workouts/hooks/useWorkouts'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { generateWeekFeedback } from '@/features/stats/utils/feedbackEngine'
import { getWeekNumber, getYear } from '@/shared/lib/weekUtils'
import type { WeekFeedback } from '@/features/workouts/hooks/useWorkouts'

export function useWeekFeedback() {
  const { getSessionsByWeek, saveWeekFeedback, getWeekLogs } = useWorkouts()
  const { exerciseNameMap } = useExercises()

  const generateFeedbackForWeek = useCallback((weekNumber: number, year: number): WeekFeedback => {
    const currentSessions = getSessionsByWeek(weekNumber, year)
    let prevWeek = weekNumber - 1
    let prevYear = year
    if (prevWeek <= 0) {
      prevWeek = 52
      prevYear--
    }
    const previousSessions = getSessionsByWeek(prevWeek, prevYear)

    const feedback = generateWeekFeedback(currentSessions, previousSessions, exerciseNameMap)
    saveWeekFeedback(weekNumber, year, feedback)
    return feedback
  }, [getSessionsByWeek, saveWeekFeedback, exerciseNameMap])

  const generateCurrentWeekFeedback = useCallback((): WeekFeedback => {
    const now = new Date()
    return generateFeedbackForWeek(getWeekNumber(now), getYear(now))
  }, [generateFeedbackForWeek])

  const getLatestFeedback = useCallback((): WeekFeedback | null => {
    const logs = getWeekLogs()
    const withFeedback = logs.filter(l => l.feedbackGenerated && l.feedback)
    if (withFeedback.length === 0) return null
    withFeedback.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.weekNumber - a.weekNumber
    })
    return withFeedback[0].feedback
  }, [getWeekLogs])

  return {
    generateFeedbackForWeek,
    generateCurrentWeekFeedback,
    getLatestFeedback,
  }
}

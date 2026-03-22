import { useCallback } from 'react'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/localStorage'
import { getWeekNumber, getYear } from '../utils/weekUtils'
import { useAppStore } from '../store/appStore'
import { useSync } from './useSync'

export interface SetLog {
  setNumber: number
  weight: number | null
  reps: number | null
  seconds: number | null
  completed: boolean
  rpe: number | null
}

export interface SessionExercise {
  exerciseId: string
  sets: SetLog[]
  notes: string
}

export interface WorkoutSession {
  id: string
  profileId: string
  date: string
  weekNumber: number
  year: number
  dayLabel: string
  workoutName: string
  exercises: SessionExercise[]
  durationMinutes: number
  notes: string
  completedAt: string
}

export interface WeekFeedback {
  generatedAt: string
  summary: string
  progressNotes: ExerciseFeedback[]
  nextWeekRecommendations: ExerciseRecommendation[]
  overallScore: number
  strengths: string[]
  improvements: string[]
}

export interface ExerciseFeedback {
  exerciseId: string
  progressStatus: 'improved' | 'same' | 'regressed' | 'new'
  previousBest: number
  currentBest: number
  note: string
}

export interface ExerciseRecommendation {
  exerciseId: string
  recommendedWeight: number
  recommendedReps: string
  reason: string
}

export interface WeekLog {
  profileId: string
  weekNumber: number
  year: number
  sessions: string[]
  feedbackGenerated: boolean
  feedback: WeekFeedback | null
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function useWorkouts() {
  const activeProfileId = useAppStore(s => s.activeProfileId)
  const { pushSession, pushWeekLog } = useSync()

  const getSessions = useCallback((): WorkoutSession[] => {
    return getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
  }, [])

  const getProfileSessions = useCallback((): WorkoutSession[] => {
    if (!activeProfileId) return []
    return getSessions().filter(s => s.profileId === activeProfileId)
  }, [activeProfileId, getSessions])

  const getSessionsByWeek = useCallback((weekNumber: number, year: number): WorkoutSession[] => {
    return getProfileSessions().filter(s => s.weekNumber === weekNumber && s.year === year)
  }, [getProfileSessions])

  const saveSession = useCallback((session: Omit<WorkoutSession, 'id' | 'profileId' | 'weekNumber' | 'year'>): WorkoutSession => {
    if (!activeProfileId) throw new Error('No active profile')

    const date = new Date(session.date)
    const newSession: WorkoutSession = {
      ...session,
      id: generateId(),
      profileId: activeProfileId,
      weekNumber: getWeekNumber(date),
      year: getYear(date),
    }

    const sessions = getSessions()
    sessions.push(newSession)
    setToStorage(STORAGE_KEYS.SESSIONS, sessions)

    // Push to cloud
    pushSession(newSession)

    // Update week log
    const weekLogs = getFromStorage<WeekLog[]>(STORAGE_KEYS.WEEK_LOGS, [])
    let weekLog = weekLogs.find(
      w => w.profileId === activeProfileId && w.weekNumber === newSession.weekNumber && w.year === newSession.year
    )
    if (!weekLog) {
      weekLog = {
        profileId: activeProfileId,
        weekNumber: newSession.weekNumber,
        year: newSession.year,
        sessions: [],
        feedbackGenerated: false,
        feedback: null,
      }
      weekLogs.push(weekLog)
    }
    weekLog.sessions.push(newSession.id)
    setToStorage(STORAGE_KEYS.WEEK_LOGS, weekLogs)
    pushWeekLog(weekLog)

    return newSession
  }, [activeProfileId, getSessions, pushSession, pushWeekLog])

  const saveSessionForProfile = useCallback((profileId: string, session: Omit<WorkoutSession, 'id' | 'profileId' | 'weekNumber' | 'year'>): WorkoutSession => {
    const date = new Date(session.date)
    const newSession: WorkoutSession = {
      ...session,
      id: generateId(),
      profileId,
      weekNumber: getWeekNumber(date),
      year: getYear(date),
    }

    const sessions = getSessions()
    sessions.push(newSession)
    setToStorage(STORAGE_KEYS.SESSIONS, sessions)

    // Push to cloud
    pushSession(newSession)

    // Update week log
    const weekLogs = getFromStorage<WeekLog[]>(STORAGE_KEYS.WEEK_LOGS, [])
    let weekLog = weekLogs.find(
      w => w.profileId === profileId && w.weekNumber === newSession.weekNumber && w.year === newSession.year
    )
    if (!weekLog) {
      weekLog = {
        profileId,
        weekNumber: newSession.weekNumber,
        year: newSession.year,
        sessions: [],
        feedbackGenerated: false,
        feedback: null,
      }
      weekLogs.push(weekLog)
    }
    weekLog.sessions.push(newSession.id)
    setToStorage(STORAGE_KEYS.WEEK_LOGS, weekLogs)
    pushWeekLog(weekLog)

    return newSession
  }, [getSessions, pushSession, pushWeekLog])

  const deleteSession = useCallback((sessionId: string) => {
    const sessions = getSessions().filter(s => s.id !== sessionId)
    setToStorage(STORAGE_KEYS.SESSIONS, sessions)
  }, [getSessions])

  const getExerciseHistory = useCallback((exerciseId: string): { date: string; maxWeight: number; maxReps: number; totalVolume: number }[] => {
    const sessions = getProfileSessions()
    const history: { date: string; maxWeight: number; maxReps: number; totalVolume: number }[] = []

    for (const session of sessions) {
      const exercise = session.exercises.find(e => e.exerciseId === exerciseId)
      if (!exercise) continue

      let maxWeight = 0
      let maxReps = 0
      let totalVolume = 0

      for (const set of exercise.sets) {
        if (!set.completed) continue
        if (set.weight !== null && set.weight > maxWeight) maxWeight = set.weight
        if (set.reps !== null && set.reps > maxReps) maxReps = set.reps
        if (set.weight !== null && set.reps !== null) {
          totalVolume += set.weight * set.reps
        }
      }

      if (maxWeight > 0 || maxReps > 0) {
        history.push({ date: session.date, maxWeight, maxReps, totalVolume })
      }
    }

    return history.sort((a, b) => a.date.localeCompare(b.date))
  }, [getProfileSessions])

  const getPersonalRecords = useCallback((): { exerciseId: string; weight: number; reps: number; date: string }[] => {
    const sessions = getProfileSessions()
    const prMap: Record<string, { weight: number; reps: number; date: string }> = {}

    for (const session of sessions) {
      for (const exercise of session.exercises) {
        for (const set of exercise.sets) {
          if (!set.completed || set.weight === null) continue
          const current = prMap[exercise.exerciseId]
          if (!current || set.weight > current.weight) {
            prMap[exercise.exerciseId] = {
              weight: set.weight,
              reps: set.reps || 0,
              date: session.date,
            }
          }
        }
      }
    }

    return Object.entries(prMap).map(([exerciseId, data]) => ({
      exerciseId,
      ...data,
    }))
  }, [getProfileSessions])

  const getWeekLogs = useCallback((): WeekLog[] => {
    if (!activeProfileId) return []
    return getFromStorage<WeekLog[]>(STORAGE_KEYS.WEEK_LOGS, [])
      .filter(w => w.profileId === activeProfileId)
  }, [activeProfileId])

  const saveWeekFeedback = useCallback((weekNumber: number, year: number, feedback: WeekFeedback) => {
    const weekLogs = getFromStorage<WeekLog[]>(STORAGE_KEYS.WEEK_LOGS, [])
    const log = weekLogs.find(
      w => w.profileId === activeProfileId && w.weekNumber === weekNumber && w.year === year
    )
    if (log) {
      log.feedback = feedback
      log.feedbackGenerated = true
      setToStorage(STORAGE_KEYS.WEEK_LOGS, weekLogs)
      pushWeekLog(log)
    }
  }, [activeProfileId, pushWeekLog])

  const getThisWeekSessionCount = useCallback((): number => {
    const now = new Date()
    return getSessionsByWeek(getWeekNumber(now), getYear(now)).length
  }, [getSessionsByWeek])

  const getStreak = useCallback((): number => {
    const sessions = getProfileSessions().sort((a, b) => b.date.localeCompare(a.date))
    if (sessions.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check weeks backwards
    let checkWeek = getWeekNumber(today)
    let checkYear = getYear(today)

    while (true) {
      const weekSessions = sessions.filter(s => s.weekNumber === checkWeek && s.year === checkYear)
      if (weekSessions.length === 0) break
      streak++
      checkWeek--
      if (checkWeek <= 0) {
        checkYear--
        checkWeek = 52
      }
    }

    return streak
  }, [getProfileSessions])

  return {
    getSessions,
    getProfileSessions,
    getSessionsByWeek,
    saveSession,
    saveSessionForProfile,
    deleteSession,
    getExerciseHistory,
    getPersonalRecords,
    getWeekLogs,
    saveWeekFeedback,
    getThisWeekSessionCount,
    getStreak,
  }
}

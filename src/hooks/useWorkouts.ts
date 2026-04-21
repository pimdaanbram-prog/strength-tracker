import { useCallback } from 'react'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/localStorage'
import { getWeekNumber, getYear } from '../utils/weekUtils'
import { useAppStore, DEFAULT_WEIGHT_SETTINGS } from '../store/appStore'
import { useSync } from './useSync'
import { exercises as exerciseData } from '../data/exercises'
import { getAchievableWeightsForEquipment, nearestWeight } from '../utils/plateCalculator'

export interface SetLog {
  setNumber: number
  weight: number | null
  reps: number | null
  repsLeft?: number | null
  repsRight?: number | null
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
  // Subscribing to sessionVersion causes any component using this hook
  // to re-render whenever sessions change (local save/delete or cloud sync)
  const sessionVersion = useAppStore(s => s.sessionVersion)
  const bumpSessionVersion = useAppStore(s => s.bumpSessionVersion)
  const weightSettings = useAppStore(s => s.settings.weightSettings ?? DEFAULT_WEIGHT_SETTINGS)
  const { pushSession, pushWeekLog } = useSync()

  const getSessions = useCallback((): WorkoutSession[] => {
    return getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionVersion])

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
    bumpSessionVersion()

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
  }, [activeProfileId, getSessions, pushSession, pushWeekLog, bumpSessionVersion])

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
    bumpSessionVersion()

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
  }, [getSessions, pushSession, pushWeekLog, bumpSessionVersion])

  const deleteSession = useCallback((sessionId: string) => {
    const sessions = getSessions().filter(s => s.id !== sessionId)
    setToStorage(STORAGE_KEYS.SESSIONS, sessions)
    bumpSessionVersion()
  }, [getSessions, bumpSessionVersion])

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
        if (!set.completed && !(set.weight !== null && set.weight > 0) && !(set.reps !== null && set.reps > 0)) continue
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
          if (set.weight === null || set.weight === 0) continue
          if (!set.completed && !(set.reps !== null && set.reps > 0)) continue
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

    return Object.entries(prMap)
      .map(([exerciseId, data]) => ({ exerciseId, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [getProfileSessions])

  const getLastExerciseSets = useCallback((exerciseId: string, profileId?: string): {
    date: string
    sets: { weight: number | null; reps: number | null }[]
    maxWeight: number
    maxReps: number
  } | null => {
    const pid = profileId ?? activeProfileId
    if (!pid) return null

    const sessions = getSessions()
      .filter(s => s.profileId === pid && s.exercises.some(e => e.exerciseId === exerciseId))
      .sort((a, b) => b.date.localeCompare(a.date))

    if (sessions.length === 0) return null

    const lastSession = sessions[0]
    const exercise = lastSession.exercises.find(e => e.exerciseId === exerciseId)
    if (!exercise) return null

    const doneSets = exercise.sets.filter(s => s.completed || (s.weight !== null && s.weight > 0) || (s.reps !== null && s.reps > 0))
    if (doneSets.length === 0) return null

    const weightsOnly = doneSets.filter(s => s.weight !== null)
    const repsOnly = doneSets.filter(s => s.reps !== null)
    const maxWeight = weightsOnly.length > 0 ? Math.max(...weightsOnly.map(s => s.weight!)) : 0
    const maxReps = repsOnly.length > 0 ? Math.max(...repsOnly.map(s => s.reps!)) : 0

    return {
      date: lastSession.date,
      sets: doneSets.map(s => ({ weight: s.weight, reps: s.reps })),
      maxWeight,
      maxReps,
    }
  }, [activeProfileId, getSessions])

  const getSmartRecommendation = useCallback((exerciseId: string, profileId?: string): {
    weight: number
    reps: string
    trend: 'up' | 'same' | 'down' | 'new'
    note: string
  } | null => {
    const pid = profileId ?? activeProfileId
    if (!pid) return null

    const sessions = getSessions()
      .filter(s => s.profileId === pid && s.exercises.some(e => e.exerciseId === exerciseId))
      .sort((a, b) => a.date.localeCompare(b.date))

    if (sessions.length === 0) return null

    const weightHistory = sessions.map(s => {
      const ex = s.exercises.find(e => e.exerciseId === exerciseId)!
      const done = ex.sets.filter(s => s.completed || (s.weight !== null && s.weight > 0) || (s.reps !== null && s.reps > 0))
      const withWeight = done.filter(s => s.weight !== null)
      const withReps = done.filter(s => s.reps !== null)
      const maxWeight = withWeight.length > 0 ? Math.max(...withWeight.map(s => s.weight!)) : 0
      const maxReps = withReps.length > 0 ? Math.max(...withReps.map(s => s.reps!)) : 0
      return { maxWeight, maxReps }
    })

    const last = weightHistory[weightHistory.length - 1]
    if (last.maxWeight === 0) return null

    const increment = last.maxWeight >= 20 ? 2.5 : 1.25

    // Determine achievable weights for this exercise (if weight settings enabled)
    const exerciseDef = exerciseData.find(e => e.id === exerciseId)
    const achievable = exerciseDef
      ? getAchievableWeightsForEquipment(exerciseDef.equipment, weightSettings)
      : []

    const snap = (w: number) => achievable.length > 0 ? nearestWeight(w, achievable) : w

    if (weightHistory.length === 1) {
      const w = snap(last.maxWeight)
      return { weight: w, reps: '8-10', trend: 'new', note: 'Eerste sessie — houd dit gewicht aan' }
    }

    const prev = weightHistory[weightHistory.length - 2]

    if (last.maxReps >= 12 && last.maxWeight > 0) {
      const w = snap(last.maxWeight + increment)
      return {
        weight: w,
        reps: '8-10',
        trend: 'up',
        note: `Vorige keer ${last.maxReps} reps — probeer ${w}kg`,
      }
    }

    if (last.maxWeight > prev.maxWeight) {
      const w = snap(last.maxWeight)
      return {
        weight: w,
        reps: '8-12',
        trend: 'up',
        note: `Goed bezig! Probeer ${last.maxReps + 1}-${last.maxReps + 2} reps bij ${w}kg`,
      }
    }

    if (last.maxWeight === prev.maxWeight) {
      const w = snap(last.maxWeight)
      return {
        weight: w,
        reps: '10-12',
        trend: 'same',
        note: `Zelfde gewicht — probeer 1-2 extra reps bij ${w}kg`,
      }
    }

    const recoveryRaw = Math.round(prev.maxWeight * 0.95 / 2.5) * 2.5 || last.maxWeight
    const w = snap(recoveryRaw)
    return {
      weight: w,
      reps: '8-10',
      trend: 'down',
      note: `Herstelweek — start bij ${w}kg met goede vorm`,
    }
  }, [activeProfileId, getSessions, weightSettings])

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
    getLastExerciseSets,
    getSmartRecommendation,
    getWeekLogs,
    saveWeekFeedback,
    getThisWeekSessionCount,
    getStreak,
  }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/shared/lib/store'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/shared/lib/localStorage'
import { getWeekNumber, getYear } from '@/shared/lib/weekUtils'
import { qk } from '@/shared/lib/queryKeys'
import type { WorkoutSession, WeekLog } from './useWorkouts'
import { useSync } from '@/shared/hooks/useSync'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11)
}

function readSessions(): WorkoutSession[] {
  return getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
}

/** All sessions for the active profile, re-fetches when sessionVersion bumps */
export function useSessionsQuery() {
  const activeProfileId = useAppStore(s => s.activeProfileId)
  const sessionVersion = useAppStore(s => s.sessionVersion)

  return useQuery({
    queryKey: qk.workouts.sessions(activeProfileId ?? ''),
    queryFn: () =>
      readSessions().filter(s => s.profileId === activeProfileId),
    enabled: !!activeProfileId,
    // sessionVersion in the key ensures a fresh read when local data changes
    // but we add it as a dependency via staleTime 0 so it always re-runs
    staleTime: 0,
    meta: { sessionVersion },
  })
}

/** Sessions for a specific week */
export function useWeekSessionsQuery(weekNumber: number, year: number) {
  const activeProfileId = useAppStore(s => s.activeProfileId)
  const sessionVersion = useAppStore(s => s.sessionVersion)

  return useQuery({
    queryKey: [...qk.workouts.week(activeProfileId ?? '', weekNumber, year), sessionVersion],
    queryFn: () =>
      readSessions().filter(
        s => s.profileId === activeProfileId && s.weekNumber === weekNumber && s.year === year
      ),
    enabled: !!activeProfileId,
    staleTime: 0,
  })
}

/** Save a new session with optimistic update + cloud push */
export function useSaveSessionMutation() {
  const queryClient = useQueryClient()
  const activeProfileId = useAppStore(s => s.activeProfileId)
  const bumpSessionVersion = useAppStore(s => s.bumpSessionVersion)
  const { pushSession, pushWeekLog } = useSync()

  return useMutation({
    mutationFn: async (
      session: Omit<WorkoutSession, 'id' | 'profileId' | 'weekNumber' | 'year'>
    ): Promise<WorkoutSession> => {
      if (!activeProfileId) throw new Error('No active profile')

      const date = new Date(session.date)
      const newSession: WorkoutSession = {
        ...session,
        id: generateId(),
        profileId: activeProfileId,
        weekNumber: getWeekNumber(date),
        year: getYear(date),
      }

      const sessions = readSessions()
      sessions.push(newSession)
      setToStorage(STORAGE_KEYS.SESSIONS, sessions)

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

      pushSession(newSession)
      pushWeekLog(weekLog)

      return newSession
    },
    onSuccess: () => {
      bumpSessionVersion()
      queryClient.invalidateQueries({ queryKey: qk.workouts.all })
      queryClient.invalidateQueries({ queryKey: qk.weekLogs.all })
      queryClient.invalidateQueries({ queryKey: qk.exercises.all })
    },
  })
}

/** Delete a session with optimistic update + cloud delete */
export function useDeleteSessionMutation() {
  const queryClient = useQueryClient()
  const bumpSessionVersion = useAppStore(s => s.bumpSessionVersion)
  const { deleteSession: deleteFromCloud } = useSync()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const sessions = readSessions().filter(s => s.id !== sessionId)
      setToStorage(STORAGE_KEYS.SESSIONS, sessions)
      deleteFromCloud(sessionId)
    },
    onSuccess: () => {
      bumpSessionVersion()
      queryClient.invalidateQueries({ queryKey: qk.workouts.all })
    },
  })
}

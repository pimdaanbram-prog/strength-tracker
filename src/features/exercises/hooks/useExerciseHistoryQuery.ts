import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/shared/lib/store'
import { getFromStorage, STORAGE_KEYS } from '@/shared/lib/localStorage'
import { qk } from '@/shared/lib/queryKeys'
import type { WorkoutSession } from '@/features/workouts/hooks/useWorkouts'

export interface ExerciseHistoryPoint {
  date: string
  maxWeight: number
  maxReps: number
  totalVolume: number
}

export interface PR {
  exerciseId: string
  weight: number
  reps: number
  date: string
}

function computeHistory(sessions: WorkoutSession[], exerciseId: string): ExerciseHistoryPoint[] {
  const result: ExerciseHistoryPoint[] = []
  for (const session of sessions) {
    const ex = session.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) continue
    let maxWeight = 0, maxReps = 0, totalVolume = 0
    for (const set of ex.sets) {
      if (!set.completed && !(set.weight != null && set.weight > 0) && !(set.reps != null && set.reps > 0)) continue
      if (set.weight != null && set.weight > maxWeight) maxWeight = set.weight
      if (set.reps != null && set.reps > maxReps) maxReps = set.reps
      if (set.weight != null && set.reps != null) totalVolume += set.weight * set.reps
    }
    if (maxWeight > 0 || maxReps > 0) result.push({ date: session.date, maxWeight, maxReps, totalVolume })
  }
  return result.sort((a, b) => a.date.localeCompare(b.date))
}

function computePRs(sessions: WorkoutSession[]): PR[] {
  const prMap: Record<string, { weight: number; reps: number; date: string }> = {}
  for (const session of sessions) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (set.weight == null || set.weight === 0) continue
        const cur = prMap[ex.exerciseId]
        if (!cur || set.weight > cur.weight) {
          prMap[ex.exerciseId] = { weight: set.weight, reps: set.reps ?? 0, date: session.date }
        }
      }
    }
  }
  return Object.entries(prMap)
    .map(([exerciseId, data]) => ({ exerciseId, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function useExerciseHistoryQuery(exerciseId: string) {
  const activeProfileId = useAppStore(s => s.activeProfileId)
  const sessionVersion = useAppStore(s => s.sessionVersion)

  return useQuery({
    queryKey: [...qk.exercises.history(activeProfileId ?? '', exerciseId), sessionVersion],
    queryFn: () => {
      const sessions = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
        .filter(s => s.profileId === activeProfileId)
      return computeHistory(sessions, exerciseId)
    },
    enabled: !!activeProfileId && !!exerciseId,
    staleTime: 0,
  })
}

export function usePRsQuery() {
  const activeProfileId = useAppStore(s => s.activeProfileId)
  const sessionVersion = useAppStore(s => s.sessionVersion)

  return useQuery({
    queryKey: [...qk.exercises.prs(activeProfileId ?? ''), sessionVersion],
    queryFn: () => {
      const sessions = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
        .filter(s => s.profileId === activeProfileId)
      return computePRs(sessions)
    },
    enabled: !!activeProfileId,
    staleTime: 0,
  })
}

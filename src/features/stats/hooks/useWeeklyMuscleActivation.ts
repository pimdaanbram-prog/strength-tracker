import { useMemo } from 'react'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { useWorkouts } from '@/features/workouts/hooks/useWorkouts'
import type { IntensityLevel } from '@/components/MuscleMap/AnatomicalFigure'

const MUSCLE_MAP: Record<string, string[]> = {
  chest: ['chest'],
  front_shoulders: ['front deltoids', 'upper chest'],
  biceps: ['biceps', 'brachialis'],
  forearms: ['forearms', 'grip'],
  abs: ['abs', 'core', 'obliques', 'lower abs'],
  quads: ['quadriceps', 'legs'],
  hip_flexors: ['hip flexors'],
  inner_thigh: ['inner thighs', 'hip adductors', 'adductors'],
  calves: ['calves'],
  traps: ['traps', 'upper back'],
  back: ['lats', 'rhomboids', 'back', 'rear deltoids'],
  rear_shoulders: ['rear deltoids', 'rotator cuff'],
  triceps: ['triceps'],
  lower_back: ['lower back'],
  glutes: ['glutes', 'glute medius', 'hip abductors'],
  hamstrings: ['hamstrings'],
  calves_rear: ['calves'],
}

function normalize(value: string) {
  return value.toLowerCase()
}

function toIntensity(volume: number): IntensityLevel {
  if (volume <= 0) return 0
  if (volume < 1500) return 1
  if (volume < 5000) return 2
  return 3
}

export function useWeeklyMuscleActivation(days = 7) {
  const { getProfileSessions } = useWorkouts()
  const { getExercise } = useExercises()

  return useMemo(() => {
    const since = new Date()
    since.setDate(since.getDate() - days + 1)
    since.setHours(0, 0, 0, 0)

    const volumes: Record<string, number> = {}
    for (const session of getProfileSessions()) {
      const date = new Date(session.date)
      date.setHours(0, 0, 0, 0)
      if (date < since) continue

      for (const sessionExercise of session.exercises) {
        const exercise = getExercise(sessionExercise.exerciseId)
        if (!exercise) continue
        const volume = sessionExercise.sets.reduce((total, set) => {
          if (!set.completed && !(set.weight && set.reps)) return total
          return total + (set.weight ?? 0) * (set.reps ?? 0)
        }, 0)
        const descriptors = [exercise.category, ...exercise.musclesWorked].map(normalize)

        for (const [target, aliases] of Object.entries(MUSCLE_MAP)) {
          if (aliases.some(alias => descriptors.some(item => item.includes(alias)))) {
            volumes[target] = (volumes[target] ?? 0) + Math.max(volume, 250)
          }
        }
      }
    }

    return Object.keys(MUSCLE_MAP).reduce<Record<string, IntensityLevel>>((acc, key) => {
      acc[key] = toIntensity(volumes[key] ?? 0)
      return acc
    }, {})
  }, [days, getExercise, getProfileSessions])
}

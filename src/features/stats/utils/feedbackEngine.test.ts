import { describe, it, expect } from 'vitest'
import { generateWeekFeedback } from './feedbackEngine'
import type { WorkoutSession } from '@/features/workouts/hooks/useWorkouts'

function makeSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'session-1',
    profileId: 'profile-1',
    date: '2024-06-10',
    weekNumber: 24,
    year: 2024,
    dayLabel: 'Maandag',
    workoutName: 'Test workout',
    exercises: [],
    durationMinutes: 45,
    notes: '',
    completedAt: '2024-06-10T10:00:00Z',
    ...overrides,
  }
}

const EXERCISE_NAMES = { 'bench-press': 'Bench Press', 'squat': 'Squat' }

const SET = (weight: number, reps: number) => ({
  setNumber: 1, weight, reps, seconds: null, completed: true, rpe: null,
})

const setsImproved: WorkoutSession['exercises'] = [
  { exerciseId: 'bench-press', notes: '', sets: [SET(80, 8), SET(80, 7)] },
]

const setsPrevious: WorkoutSession['exercises'] = [
  { exerciseId: 'bench-press', notes: '', sets: [SET(70, 8), SET(70, 8)] },
]

describe('generateWeekFeedback', () => {
  it('returns an object with the expected shape', () => {
    const result = generateWeekFeedback([], [], EXERCISE_NAMES)
    expect(result).toHaveProperty('progressNotes')
    expect(result).toHaveProperty('nextWeekRecommendations')
    expect(result).toHaveProperty('strengths')
    expect(result).toHaveProperty('improvements')
  })

  it('returns empty arrays for two empty weeks', () => {
    const result = generateWeekFeedback([], [], EXERCISE_NAMES)
    expect(result.progressNotes).toHaveLength(0)
    expect(result.nextWeekRecommendations).toHaveLength(0)
  })

  it('marks a new exercise as "new" status', () => {
    const session = makeSession({ exercises: setsImproved })
    const result  = generateWeekFeedback([session], [], EXERCISE_NAMES)
    const note    = result.progressNotes.find(n => n.exerciseId === 'bench-press')
    expect(note).toBeDefined()
    expect(note?.progressStatus).toBe('new')
  })

  it('marks improved weight as "improved" status', () => {
    const current  = makeSession({ exercises: setsImproved })
    const previous = makeSession({ exercises: setsPrevious })
    const result   = generateWeekFeedback([current], [previous], EXERCISE_NAMES)
    const note     = result.progressNotes.find(n => n.exerciseId === 'bench-press')
    expect(note?.progressStatus).toBe('improved')
    expect(note?.currentBest).toBeGreaterThan(note?.previousBest ?? 0)
  })

  it('marks unchanged weight+reps as "same" status', () => {
    const session = makeSession({ exercises: setsImproved })
    const result  = generateWeekFeedback([session], [session], EXERCISE_NAMES)
    const note    = result.progressNotes.find(n => n.exerciseId === 'bench-press')
    expect(note?.progressStatus).toBe('same')
  })

  it('generates a recommendation for each exercise in current week', () => {
    const session = makeSession({ exercises: setsImproved })
    const result  = generateWeekFeedback([session], [], EXERCISE_NAMES)
    expect(result.nextWeekRecommendations.length).toBeGreaterThan(0)
    expect(result.nextWeekRecommendations[0]).toHaveProperty('exerciseId')
    expect(result.nextWeekRecommendations[0]).toHaveProperty('recommendedWeight')
    expect(result.nextWeekRecommendations[0]).toHaveProperty('recommendedReps')
  })

  it('adds to strengths when weight improves', () => {
    const current  = makeSession({ exercises: setsImproved })
    const previous = makeSession({ exercises: setsPrevious })
    const result   = generateWeekFeedback([current], [previous], EXERCISE_NAMES)
    expect(result.strengths.length).toBeGreaterThan(0)
  })

  it('handles multiple sessions in one week (uses max weight)', () => {
    const sessionA = makeSession({ id: 'a', exercises: setsPrevious })
    const sessionB = makeSession({ id: 'b', exercises: setsImproved })
    const result   = generateWeekFeedback([sessionA, sessionB], [], EXERCISE_NAMES)
    const note     = result.progressNotes.find(n => n.exerciseId === 'bench-press')
    expect(note?.currentBest).toBe(80)
  })
})

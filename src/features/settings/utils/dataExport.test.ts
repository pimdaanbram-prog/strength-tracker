import { describe, it, expect } from 'vitest'
import { toCSV, sessionsToCSV, measurementsToCSV, importBackup } from './dataExport'
import type { WorkoutSession } from '@/features/workouts/hooks/useWorkouts'

describe('toCSV', () => {
  it('joins headers and rows with commas', () => {
    expect(toCSV(['a', 'b'], [[1, 2], [3, 4]])).toBe('a,b\n1,2\n3,4')
  })

  it('escapes quotes, commas and newlines', () => {
    expect(toCSV(['x'], [['he said "hi", twice']])).toBe('x\n"he said ""hi"", twice"')
    expect(toCSV(['x'], [['line1\nline2']])).toBe('x\n"line1\nline2"')
  })

  it('renders null/undefined as empty', () => {
    expect(toCSV(['a', 'b'], [[null, undefined]])).toBe('a,b\n,')
  })
})

describe('sessionsToCSV', () => {
  const session: WorkoutSession = {
    id: 's1',
    profileId: 'p1',
    date: '2026-06-01',
    weekNumber: 23,
    year: 2026,
    dayLabel: 'Ma',
    workoutName: 'Push A',
    durationMinutes: 55,
    notes: 'goed gevoel',
    completedAt: '2026-06-01T10:00:00Z',
    exercises: [
      {
        exerciseId: 'barbell-bench-press',
        notes: '',
        sets: [
          { setNumber: 1, weight: 60, reps: 10, seconds: null, completed: true, rpe: 8 },
          { setNumber: 2, weight: 40, reps: 12, seconds: null, completed: true, rpe: null, type: 'dropset' },
        ],
      },
    ],
  }

  it('produces one row per set with exercise names', () => {
    const csv = sessionsToCSV([session], id => (id === 'barbell-bench-press' ? 'Bankdrukken' : id))
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('date,workout,exercise,set,set_type')
    expect(lines[1]).toContain('2026-06-01,Push A,Bankdrukken,1,normal,60,10')
    expect(lines[2]).toContain('dropset,40,12')
  })
})

describe('measurementsToCSV', () => {
  it('merges weight and measurements on the same date', () => {
    const csv = measurementsToCSV(
      [{ date: '2026-06-01', weight: 82.5 }],
      [{ date: '2026-06-01', waist: 84, chest: 102 }],
    )
    const lines = csv.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('2026-06-01,82.5,102,84,,,,,,,,,,')
  })

  it('sorts rows by date', () => {
    const csv = measurementsToCSV(
      [{ date: '2026-06-05', weight: 82 }, { date: '2026-06-01', weight: 83 }],
      [],
    )
    const lines = csv.split('\n')
    expect(lines[1].startsWith('2026-06-01')).toBe(true)
    expect(lines[2].startsWith('2026-06-05')).toBe(true)
  })
})

describe('importBackup', () => {
  it('rejects invalid JSON', () => {
    expect(importBackup('not json')).toEqual({ ok: false, error: 'Ongeldig JSON-bestand' })
  })

  it('rejects payloads without app data', () => {
    const result = importBackup(JSON.stringify({ localStorage: { random: 1 } }))
    expect(result.ok).toBe(false)
  })

  it('restores strength-tracker keys to localStorage', () => {
    localStorage.clear()
    const payload = {
      exportedAt: '2026-06-01',
      appVersion: '1.0.0',
      localStorage: {
        'strength-tracker-sessions': [{ id: 'a' }],
        'st-body-weights': [{ date: '2026-06-01', weight: 80 }],
        'unrelated-key': 'skip me',
      },
    }
    const result = importBackup(JSON.stringify(payload))
    expect(result).toEqual({ ok: true, keys: 2 })
    expect(JSON.parse(localStorage.getItem('strength-tracker-sessions')!)).toEqual([{ id: 'a' }])
    expect(localStorage.getItem('unrelated-key')).toBeNull()
    localStorage.clear()
  })
})

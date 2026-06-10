import type { WorkoutSession } from '@/features/workouts/hooks/useWorkouts'
import type { BodyWeight, BodyMeasurement } from '@/shared/lib/store'

// CSV-helpers: RFC4180-quoting, ; werkt niet overal — komma + quotes is veiligst

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function toCSV(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvEscape).join(',')]
  for (const row of rows) lines.push(row.map(csvEscape).join(','))
  return lines.join('\n')
}

/** Eén rij per set, zodat het bestand direct bruikbaar is in Excel/Sheets. */
export function sessionsToCSV(
  sessions: WorkoutSession[],
  exerciseName: (exerciseId: string) => string,
): string {
  const headers = [
    'date', 'workout', 'exercise', 'set', 'set_type',
    'weight_kg', 'reps', 'reps_left', 'reps_right', 'seconds', 'rpe', 'completed',
    'duration_min', 'session_notes',
  ]
  const rows: unknown[][] = []
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        rows.push([
          session.date,
          session.workoutName,
          exerciseName(exercise.exerciseId),
          set.setNumber,
          set.type ?? 'normal',
          set.weight,
          set.reps,
          set.repsLeft ?? '',
          set.repsRight ?? '',
          set.seconds,
          set.rpe,
          set.completed ? 1 : 0,
          session.durationMinutes,
          session.notes,
        ])
      }
    }
  }
  return toCSV(headers, rows)
}

export function measurementsToCSV(
  bodyWeights: BodyWeight[],
  measurements: BodyMeasurement[],
): string {
  const headers = [
    'date', 'weight_kg', 'chest', 'waist', 'hips', 'left_arm', 'right_arm',
    'left_thigh', 'right_thigh', 'left_calf', 'right_calf', 'neck', 'body_fat_percent', 'note',
  ]
  // Merge op datum zodat gewicht en metingen in één rij komen
  const byDate = new Map<string, { weight?: BodyWeight; measurement?: BodyMeasurement }>()
  for (const w of bodyWeights) {
    byDate.set(w.date, { ...byDate.get(w.date), weight: w })
  }
  for (const m of measurements) {
    byDate.set(m.date, { ...byDate.get(m.date), measurement: m })
  }
  const rows = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { weight, measurement }]) => [
      date,
      weight?.weight ?? '',
      measurement?.chest ?? '',
      measurement?.waist ?? '',
      measurement?.hips ?? '',
      measurement?.leftArm ?? '',
      measurement?.rightArm ?? '',
      measurement?.leftThigh ?? '',
      measurement?.rightThigh ?? '',
      measurement?.leftCalf ?? '',
      measurement?.rightCalf ?? '',
      measurement?.neck ?? '',
      measurement?.bodyFatPercent ?? '',
      weight?.note ?? measurement?.note ?? '',
    ])
  return toCSV(headers, rows)
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export interface ExportPayload {
  exportedAt: string
  appVersion: string
  store?: object
  localStorage: Record<string, unknown>
}

/** Valideer en herstel een eerder geëxporteerde JSON-backup naar localStorage. */
export function importBackup(jsonText: string): { ok: true; keys: number } | { ok: false; error: string } {
  let payload: ExportPayload
  try {
    payload = JSON.parse(jsonText)
  } catch {
    return { ok: false, error: 'Ongeldig JSON-bestand' }
  }
  if (!payload || typeof payload !== 'object' || typeof payload.localStorage !== 'object' || payload.localStorage === null) {
    return { ok: false, error: 'Dit is geen Strength Tracker backup-bestand' }
  }
  const entries = Object.entries(payload.localStorage)
    .filter(([key]) => key.startsWith('strength-tracker') || key.startsWith('st-'))
  if (entries.length === 0) {
    return { ok: false, error: 'Geen Strength Tracker data gevonden in dit bestand' }
  }
  for (const [key, value] of entries) {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  }
  return { ok: true, keys: entries.length }
}

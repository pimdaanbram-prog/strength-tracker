// 1RM estimation formulas + rep/percentage tables.
// All formulas are only reliable up to ~15 reps; inputs are clamped.

export const MAX_FORMULA_REPS = 15

function clampReps(reps: number): number {
  return Math.min(MAX_FORMULA_REPS, Math.max(1, Math.round(reps)))
}

export function epley1RM(weight: number, reps: number): number {
  const r = clampReps(reps)
  return r === 1 ? weight : weight * (1 + r / 30)
}

export function brzycki1RM(weight: number, reps: number): number {
  const r = clampReps(reps)
  return r === 1 ? weight : weight * (36 / (37 - r))
}

export function lombardi1RM(weight: number, reps: number): number {
  const r = clampReps(reps)
  return r === 1 ? weight : weight * Math.pow(r, 0.1)
}

/** Average of Epley, Brzycki and Lombardi — more stable than a single formula. */
export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  const estimates = [epley1RM(weight, reps), brzycki1RM(weight, reps), lombardi1RM(weight, reps)]
  return estimates.reduce((sum, value) => sum + value, 0) / estimates.length
}

/** Inverse Epley: hoeveel gewicht kun je voor n reps aan op basis van je 1RM. */
export function weightForReps(oneRM: number, reps: number): number {
  const r = clampReps(reps)
  return r === 1 ? oneRM : oneRM / (1 + r / 30)
}

export interface RepMaxRow {
  reps: number
  percentOf1RM: number
  weight: number
}

/** Standaard %1RM-tabel (1–12 reps), gewichten afgerond op 0.5 kg. */
export function repMaxTable(oneRM: number): RepMaxRow[] {
  const PERCENTS = [100, 95, 93, 90, 87, 85, 83, 80, 77, 75, 73, 70]
  return PERCENTS.map((percentOf1RM, index) => ({
    reps: index + 1,
    percentOf1RM,
    weight: Math.round((oneRM * percentOf1RM) / 100 * 2) / 2,
  }))
}

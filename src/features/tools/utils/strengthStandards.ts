// Sterkte-standaarden voor de grote oefeningen, uitgedrukt als 1RM ÷ lichaamsgewicht.
// Gebaseerd op gangbare strength-standards tabellen (Symmetric Strength /
// strengthlevel-stijl), afgerond naar praktische multipliers.

export type StandardLift = 'squat' | 'bench' | 'deadlift' | 'ohp' | 'row'

export type StrengthLevel = 'untrained' | 'novice' | 'intermediate' | 'advanced' | 'elite'

export const STRENGTH_LEVELS: StrengthLevel[] = ['untrained', 'novice', 'intermediate', 'advanced', 'elite']

export const STRENGTH_LEVEL_LABELS: Record<StrengthLevel, { nl: string; en: string }> = {
  untrained: { nl: 'Ongetraind', en: 'Untrained' },
  novice: { nl: 'Beginner', en: 'Novice' },
  intermediate: { nl: 'Gemiddeld', en: 'Intermediate' },
  advanced: { nl: 'Gevorderd', en: 'Advanced' },
  elite: { nl: 'Elite', en: 'Elite' },
}

export const STANDARD_LIFT_LABELS: Record<StandardLift, { nl: string; en: string }> = {
  squat: { nl: 'Squat', en: 'Squat' },
  bench: { nl: 'Bankdrukken', en: 'Bench Press' },
  deadlift: { nl: 'Deadlift', en: 'Deadlift' },
  ohp: { nl: 'Overhead Press', en: 'Overhead Press' },
  row: { nl: 'Barbell Row', en: 'Barbell Row' },
}

/** Koppeling van exercise-ids uit de bibliotheek naar standaard-lifts. */
export const EXERCISE_TO_STANDARD_LIFT: Record<string, StandardLift> = {
  'barbell-squat': 'squat',
  'barbell-bench-press': 'bench',
  'deadlift': 'deadlift',
  'barbell-overhead-press': 'ohp',
  'bent-over-row': 'row',
}

// Bodyweight multipliers per niveau: [novice, intermediate, advanced, elite].
// Alles onder novice telt als untrained.
const MULTIPLIERS: Record<StandardLift, Record<'male' | 'female', [number, number, number, number]>> = {
  squat: {
    male: [0.75, 1.25, 1.75, 2.25],
    female: [0.5, 1.0, 1.5, 2.0],
  },
  bench: {
    male: [0.5, 1.0, 1.5, 2.0],
    female: [0.35, 0.65, 1.0, 1.4],
  },
  deadlift: {
    male: [1.0, 1.5, 2.25, 2.75],
    female: [0.75, 1.25, 1.75, 2.25],
  },
  ohp: {
    male: [0.35, 0.65, 0.95, 1.25],
    female: [0.25, 0.45, 0.7, 0.95],
  },
  row: {
    male: [0.5, 0.9, 1.25, 1.65],
    female: [0.35, 0.65, 0.95, 1.25],
  },
}

/**
 * Leeftijdscorrectie: piekkracht ligt rond 25–35 jaar; daarbuiten worden de
 * drempels verlaagd zodat de vergelijking eerlijk blijft.
 */
export function ageAdjustmentFactor(age: number): number {
  if (age <= 0) return 1
  if (age < 18) return Math.max(0.6, 1 - (18 - age) * 0.04)
  if (age <= 40) return 1
  // ~1% per jaar boven de 40, met een bodem van 0.55
  return Math.max(0.55, 1 - (age - 40) * 0.01)
}

export interface StrengthStandardResult {
  lift: StandardLift
  level: StrengthLevel
  /** 1RM gedeeld door lichaamsgewicht */
  ratio: number
  /** Drempels in kg voor dit lichaamsgewicht/geslacht/leeftijd: [novice, intermediate, advanced, elite] */
  thresholds: [number, number, number, number]
  /** Volgende niveau (null bij elite) */
  nextLevel: StrengthLevel | null
  /** kg tot het volgende niveau (0 bij elite) */
  kgToNextLevel: number
  /** Voortgang 0–1 binnen het huidige niveau richting het volgende */
  progressToNext: number
}

export function getStrengthStandard(
  lift: StandardLift,
  gender: 'male' | 'female',
  bodyweightKg: number,
  oneRM: number,
  age = 30,
): StrengthStandardResult {
  const factor = ageAdjustmentFactor(age)
  const thresholds = MULTIPLIERS[lift][gender].map(
    m => Math.round(m * bodyweightKg * factor * 2) / 2,
  ) as [number, number, number, number]

  let levelIndex = 0
  for (let i = 0; i < thresholds.length; i++) {
    if (oneRM >= thresholds[i]) levelIndex = i + 1
  }

  const level = STRENGTH_LEVELS[levelIndex]
  const nextLevel = levelIndex < 4 ? STRENGTH_LEVELS[levelIndex + 1] : null
  const nextThreshold = levelIndex < 4 ? thresholds[levelIndex] : null
  const prevThreshold = levelIndex > 0 ? thresholds[levelIndex - 1] : 0

  const kgToNextLevel = nextThreshold !== null ? Math.max(0, nextThreshold - oneRM) : 0
  const progressToNext = nextThreshold !== null
    ? Math.min(1, Math.max(0, (oneRM - prevThreshold) / (nextThreshold - prevThreshold)))
    : 1

  return {
    lift,
    level,
    ratio: bodyweightKg > 0 ? oneRM / bodyweightKg : 0,
    thresholds,
    nextLevel,
    kgToNextLevel,
    progressToNext,
  }
}

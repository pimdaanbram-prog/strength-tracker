import type { Exercise } from '@/features/exercises/data/exercises'

// Alternatieven-engine: vind vervangende oefeningen op basis van overlappende
// spiergroepen en categorie — bv. bij blessure, drukte of ontbrekend materiaal.

/** Profiel-equipment labels ('Barbell', 'Alleen lichaamsgewicht') → exercise equipment keys. */
export function normalizeEquipment(profileEquipment: string[]): Exercise['equipment'][] {
  const result = new Set<Exercise['equipment']>(['none', 'bodyweight'])
  for (const label of profileEquipment) {
    const key = label.toLowerCase()
    if (key.includes('lichaamsgewicht') || key === 'bodyweight') {
      result.add('bodyweight')
    } else if (['barbell', 'dumbbell', 'cable', 'machine', 'kettlebell', 'bench'].includes(key)) {
      result.add(key as Exercise['equipment'])
    }
  }
  return [...result]
}

export interface AlternativeResult {
  exercise: Exercise
  /** Aantal gedeelde spiergroepen met de originele oefening */
  sharedMuscles: number
  /** true als de gebruiker het benodigde materiaal heeft (of geen filter actief is) */
  hasEquipment: boolean
}

/**
 * Rangschik alternatieven voor `exercise`:
 * - meer gedeelde spiergroepen = hoger
 * - zelfde categorie geeft bonus
 * - beschikbaar materiaal komt vóór niet-beschikbaar materiaal
 * - ander equipment dan het origineel krijgt een lichte bonus (het is immers
 *   een alternatief voor als de stang/machine bezet of onbeschikbaar is)
 */
export function getAlternatives(
  exercise: Exercise,
  allExercises: Exercise[],
  availableEquipment?: string[],
  limit = 4,
): AlternativeResult[] {
  const ownMuscles = new Set(exercise.musclesWorked.map(m => m.toLowerCase()))
  const equipmentFilter = availableEquipment && availableEquipment.length > 0
    ? new Set(normalizeEquipment(availableEquipment))
    : null

  const scored = allExercises
    .filter(candidate => candidate.id !== exercise.id)
    .map(candidate => {
      const sharedMuscles = candidate.musclesWorked
        .filter(m => ownMuscles.has(m.toLowerCase())).length
      const hasEquipment = equipmentFilter === null || equipmentFilter.has(candidate.equipment)
      let score = sharedMuscles * 10
      if (candidate.category === exercise.category) score += 6
      if (candidate.equipment !== exercise.equipment) score += 3
      if (candidate.isCompound === exercise.isCompound) score += 2
      if (hasEquipment) score += 100 // beschikbaar materiaal altijd eerst
      return { exercise: candidate, sharedMuscles, hasEquipment, score }
    })
    .filter(r => r.sharedMuscles > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ exercise, sharedMuscles, hasEquipment }) => ({
    exercise, sharedMuscles, hasEquipment,
  }))
}

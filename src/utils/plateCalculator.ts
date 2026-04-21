import type { WeightSettings } from '../store/appStore'

/** All barbell weights achievable given the plate inventory (bar + symmetric plate pairs) */
export function getAchievableBarbellWeights(settings: WeightSettings): number[] {
  const { plates, barbellWeight } = settings
  const achievable = new Set<number>()

  function combine(idx: number, current: number) {
    achievable.add(Math.round(current * 100) / 100)
    if (idx >= plates.length) return
    const { weight, count } = plates[idx]
    const maxPairs = Math.floor(count / 2)
    for (let pairs = 1; pairs <= maxPairs; pairs++) {
      combine(idx + 1, current + pairs * weight * 2)
    }
    combine(idx + 1, current)
  }

  combine(0, barbellWeight)
  return Array.from(achievable).sort((a, b) => a - b)
}

/** Machine weights from step to max */
export function getAchievableMachineWeights(settings: WeightSettings): number[] {
  const { machineStep, machineMax } = settings
  if (machineStep <= 0) return []
  const weights: number[] = []
  for (let w = machineStep; w <= machineMax; w = Math.round((w + machineStep) * 100) / 100) {
    weights.push(w)
  }
  return weights
}

/** Round target to the nearest value in the available list */
export function nearestWeight(target: number, available: number[]): number {
  if (available.length === 0) return target
  return available.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  )
}

/** Get all achievable weights for a given equipment type */
export function getAchievableWeightsForEquipment(
  equipment: string,
  settings: WeightSettings
): number[] {
  if (!settings.enabled) return []
  switch (equipment) {
    case 'barbell':
      return getAchievableBarbellWeights(settings)
    case 'dumbbell':
    case 'kettlebell':
      return settings.dumbbells
    case 'machine':
    case 'cable':
      return getAchievableMachineWeights(settings)
    default:
      return []
  }
}

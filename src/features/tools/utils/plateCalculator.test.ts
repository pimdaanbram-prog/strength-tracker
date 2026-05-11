import { describe, it, expect } from 'vitest'
import { getAchievableBarbellWeights, getAchievableMachineWeights, nearestWeight, getAchievableWeightsForEquipment } from './plateCalculator'
import type { WeightSettings } from '@/shared/lib/store'

const BASE_SETTINGS: WeightSettings = {
  enabled: true,
  barbellWeight: 20,
  plates: [
    { weight: 20, count: 2 },
    { weight: 10, count: 4 },
    { weight: 5,  count: 4 },
    { weight: 2.5, count: 4 },
  ],
  dumbbells: [5, 7.5, 10, 12.5, 15, 20, 25, 30],
  machineStep: 5,
  machineMax: 150,
}

describe('getAchievableBarbellWeights', () => {
  it('always includes the bare barbell weight', () => {
    const weights = getAchievableBarbellWeights(BASE_SETTINGS)
    expect(weights).toContain(20)
  })

  it('returns sorted ascending list', () => {
    const weights = getAchievableBarbellWeights(BASE_SETTINGS)
    const sorted = [...weights].sort((a, b) => a - b)
    expect(weights).toEqual(sorted)
  })

  it('barbell + one pair of 20kg plates = 60kg', () => {
    const weights = getAchievableBarbellWeights(BASE_SETTINGS)
    expect(weights).toContain(60)
  })

  it('barbell + one pair of 10kg = 40kg', () => {
    const weights = getAchievableBarbellWeights(BASE_SETTINGS)
    expect(weights).toContain(40)
  })

  it('returns only the barbell weight when no plates', () => {
    const settings: WeightSettings = { ...BASE_SETTINGS, plates: [] }
    const weights = getAchievableBarbellWeights(settings)
    expect(weights).toEqual([20])
  })

  it('handles odd plate counts correctly (floor to pairs)', () => {
    const settings: WeightSettings = {
      ...BASE_SETTINGS,
      plates: [{ weight: 10, count: 3 }],
    }
    const weights = getAchievableBarbellWeights(settings)
    // 3 plates → 1 pair max → barbell + 20
    expect(weights).toContain(40)
    // not barbell + 40 (would need 2 pairs)
    expect(weights).not.toContain(60)
  })
})

describe('getAchievableMachineWeights', () => {
  it('generates weights from step to max', () => {
    const weights = getAchievableMachineWeights(BASE_SETTINGS)
    expect(weights[0]).toBe(5)
    expect(weights[weights.length - 1]).toBe(150)
  })

  it('returns empty array when machineStep <= 0', () => {
    const settings: WeightSettings = { ...BASE_SETTINGS, machineStep: 0 }
    expect(getAchievableMachineWeights(settings)).toEqual([])
  })

  it('step divides max evenly', () => {
    const settings: WeightSettings = { ...BASE_SETTINGS, machineStep: 10, machineMax: 100 }
    const weights = getAchievableMachineWeights(settings)
    expect(weights).toHaveLength(10)
    expect(weights).toContain(50)
    expect(weights).toContain(100)
  })
})

describe('nearestWeight', () => {
  it('returns exact match when present', () => {
    expect(nearestWeight(10, [5, 10, 15])).toBe(10)
  })

  it('rounds down when closer to lower value', () => {
    expect(nearestWeight(12, [10, 15, 20])).toBe(10)
  })

  it('rounds up when closer to higher value', () => {
    expect(nearestWeight(13, [10, 15, 20])).toBe(15)
  })

  it('returns the target itself when list is empty', () => {
    expect(nearestWeight(42, [])).toBe(42)
  })
})

describe('getAchievableWeightsForEquipment', () => {
  it('returns empty when settings disabled', () => {
    const settings: WeightSettings = { ...BASE_SETTINGS, enabled: false }
    expect(getAchievableWeightsForEquipment('barbell', settings)).toEqual([])
  })

  it('returns empty for null settings', () => {
    expect(getAchievableWeightsForEquipment('barbell', null)).toEqual([])
  })

  it('returns barbell weights for barbell equipment', () => {
    const weights = getAchievableWeightsForEquipment('barbell', BASE_SETTINGS)
    expect(weights).toContain(20)
    expect(weights.length).toBeGreaterThan(1)
  })

  it('returns dumbbell list for dumbbell equipment', () => {
    expect(getAchievableWeightsForEquipment('dumbbell', BASE_SETTINGS))
      .toEqual(BASE_SETTINGS.dumbbells)
  })

  it('returns machine weights for machine equipment', () => {
    const weights = getAchievableWeightsForEquipment('machine', BASE_SETTINGS)
    expect(weights[0]).toBe(5)
  })

  it('returns empty for unknown equipment', () => {
    expect(getAchievableWeightsForEquipment('bodyweight', BASE_SETTINGS)).toEqual([])
  })
})

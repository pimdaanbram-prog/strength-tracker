import { describe, it, expect } from 'vitest'
import { getAlternatives, normalizeEquipment } from './alternatives'
import { exercises } from '@/features/exercises/data/exercises'

const benchPress = exercises.find(e => e.id === 'barbell-bench-press')!

describe('normalizeEquipment', () => {
  it('always includes bodyweight and none', () => {
    expect(normalizeEquipment([])).toEqual(expect.arrayContaining(['none', 'bodyweight']))
  })

  it('maps Dutch profile labels to equipment keys', () => {
    const result = normalizeEquipment(['Barbell', 'Alleen lichaamsgewicht', 'Cable'])
    expect(result).toEqual(expect.arrayContaining(['barbell', 'cable', 'bodyweight']))
    expect(result).not.toContain('machine')
  })
})

describe('getAlternatives', () => {
  it('never returns the exercise itself', () => {
    const alts = getAlternatives(benchPress, exercises)
    expect(alts.some(a => a.exercise.id === benchPress.id)).toBe(false)
  })

  it('returns alternatives sharing at least one muscle group', () => {
    const alts = getAlternatives(benchPress, exercises)
    expect(alts.length).toBeGreaterThan(0)
    for (const alt of alts) {
      expect(alt.sharedMuscles).toBeGreaterThan(0)
    }
  })

  it('respects the limit', () => {
    expect(getAlternatives(benchPress, exercises, undefined, 3)).toHaveLength(3)
  })

  it('puts exercises matching available equipment first', () => {
    const alts = getAlternatives(benchPress, exercises, ['Dumbbell'], 10)
    const firstUnavailable = alts.findIndex(a => !a.hasEquipment)
    const lastAvailable = alts.map(a => a.hasEquipment).lastIndexOf(true)
    if (firstUnavailable !== -1) {
      expect(lastAvailable).toBeLessThan(firstUnavailable)
    }
    expect(alts[0].hasEquipment).toBe(true)
    expect(['dumbbell', 'bodyweight', 'none']).toContain(alts[0].exercise.equipment)
  })

  it('marks everything available when no equipment filter is given', () => {
    const alts = getAlternatives(benchPress, exercises)
    expect(alts.every(a => a.hasEquipment)).toBe(true)
  })
})

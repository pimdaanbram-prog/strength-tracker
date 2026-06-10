import { describe, it, expect } from 'vitest'
import {
  getStrengthStandard,
  ageAdjustmentFactor,
  STRENGTH_LEVELS,
  EXERCISE_TO_STANDARD_LIFT,
} from './strengthStandards'

describe('ageAdjustmentFactor', () => {
  it('is 1 in the prime range (18-40)', () => {
    expect(ageAdjustmentFactor(18)).toBe(1)
    expect(ageAdjustmentFactor(30)).toBe(1)
    expect(ageAdjustmentFactor(40)).toBe(1)
  })

  it('reduces thresholds for older lifters', () => {
    expect(ageAdjustmentFactor(50)).toBeCloseTo(0.9, 5)
    expect(ageAdjustmentFactor(60)).toBeCloseTo(0.8, 5)
    expect(ageAdjustmentFactor(100)).toBe(0.55)
  })

  it('reduces thresholds for teens', () => {
    expect(ageAdjustmentFactor(15)).toBeCloseTo(0.88, 5)
    expect(ageAdjustmentFactor(5)).toBeGreaterThanOrEqual(0.6)
  })
})

describe('getStrengthStandard', () => {
  it('classifies an untrained male bench', () => {
    const result = getStrengthStandard('bench', 'male', 80, 30)
    expect(result.level).toBe('untrained')
    expect(result.nextLevel).toBe('novice')
    expect(result.kgToNextLevel).toBeGreaterThan(0)
  })

  it('classifies an intermediate male squat (1.25x bodyweight)', () => {
    const result = getStrengthStandard('squat', 'male', 80, 100)
    expect(result.level).toBe('intermediate')
    expect(result.ratio).toBeCloseTo(1.25, 5)
  })

  it('classifies an elite female deadlift', () => {
    const result = getStrengthStandard('deadlift', 'female', 60, 60 * 2.5)
    expect(result.level).toBe('elite')
    expect(result.nextLevel).toBeNull()
    expect(result.kgToNextLevel).toBe(0)
    expect(result.progressToNext).toBe(1)
  })

  it('uses lower thresholds for women', () => {
    const male = getStrengthStandard('bench', 'male', 70, 0)
    const female = getStrengthStandard('bench', 'female', 70, 0)
    for (let i = 0; i < 4; i++) {
      expect(female.thresholds[i]).toBeLessThan(male.thresholds[i])
    }
  })

  it('age adjustment lowers thresholds for a 60-year-old', () => {
    const young = getStrengthStandard('squat', 'male', 80, 100, 30)
    const older = getStrengthStandard('squat', 'male', 80, 100, 60)
    expect(older.thresholds[0]).toBeLessThan(young.thresholds[0])
  })

  it('progressToNext is between 0 and 1', () => {
    for (const oneRM of [0, 40, 80, 120, 200, 400]) {
      const r = getStrengthStandard('deadlift', 'male', 85, oneRM)
      expect(r.progressToNext).toBeGreaterThanOrEqual(0)
      expect(r.progressToNext).toBeLessThanOrEqual(1)
      expect(STRENGTH_LEVELS).toContain(r.level)
    }
  })

  it('thresholds are strictly increasing', () => {
    const { thresholds } = getStrengthStandard('ohp', 'male', 90, 50)
    for (let i = 1; i < thresholds.length; i++) {
      expect(thresholds[i]).toBeGreaterThan(thresholds[i - 1])
    }
  })

  it('maps known exercise ids to standard lifts', () => {
    expect(EXERCISE_TO_STANDARD_LIFT['barbell-bench-press']).toBe('bench')
    expect(EXERCISE_TO_STANDARD_LIFT['deadlift']).toBe('deadlift')
  })
})

import { describe, it, expect } from 'vitest'
import { calculateRecommendedWeight } from './weightCalculator'

const BENCH_PRESS = {
  recommendedWeight: {
    male:   { beginner: '50-60kg', intermediate: '80-90kg', advanced: '110-120kg' },
    female: { beginner: '25-30kg', intermediate: '40-50kg', advanced: '60-70kg' },
  },
}

const AVERAGE_MALE:   Parameters<typeof calculateRecommendedWeight>[1] = { gender: 'male',   fitnessLevel: 'beginner',     weight: 80, age: 30 }
const AVERAGE_FEMALE: Parameters<typeof calculateRecommendedWeight>[1] = { gender: 'female',  fitnessLevel: 'beginner',     weight: 65, age: 30 }

describe('calculateRecommendedWeight', () => {
  it('returns a number', () => {
    const result = calculateRecommendedWeight(BENCH_PRESS, AVERAGE_MALE)
    expect(typeof result).toBe('number')
  })

  it('is rounded to nearest 2.5kg', () => {
    const result = calculateRecommendedWeight(BENCH_PRESS, AVERAGE_MALE)
    expect(result % 2.5).toBe(0)
  })

  it('male advanced is heavier than male beginner', () => {
    const beginner    = calculateRecommendedWeight(BENCH_PRESS, AVERAGE_MALE)
    const advanced    = calculateRecommendedWeight(BENCH_PRESS, { ...AVERAGE_MALE, fitnessLevel: 'advanced' })
    expect(advanced).toBeGreaterThan(beginner)
  })

  it('intermediate is between beginner and advanced', () => {
    const beginner     = calculateRecommendedWeight(BENCH_PRESS, AVERAGE_MALE)
    const intermediate = calculateRecommendedWeight(BENCH_PRESS, { ...AVERAGE_MALE, fitnessLevel: 'intermediate' })
    const advanced     = calculateRecommendedWeight(BENCH_PRESS, { ...AVERAGE_MALE, fitnessLevel: 'advanced' })
    expect(intermediate).toBeGreaterThan(beginner)
    expect(intermediate).toBeLessThan(advanced)
  })

  it('female beginner is less than male beginner', () => {
    const male   = calculateRecommendedWeight(BENCH_PRESS, AVERAGE_MALE)
    const female = calculateRecommendedWeight(BENCH_PRESS, AVERAGE_FEMALE)
    expect(female).toBeLessThan(male)
  })

  it('heavier user gets higher recommendation', () => {
    const light  = calculateRecommendedWeight(BENCH_PRESS, { ...AVERAGE_MALE, weight: 60 })
    const heavy  = calculateRecommendedWeight(BENCH_PRESS, { ...AVERAGE_MALE, weight: 100 })
    expect(heavy).toBeGreaterThan(light)
  })

  it('very young or old user gets reduced weight', () => {
    const young = calculateRecommendedWeight(BENCH_PRESS, { ...AVERAGE_MALE, age: 18 })
    const prime = calculateRecommendedWeight(BENCH_PRESS, { ...AVERAGE_MALE, age: 30 })
    expect(young).toBeLessThanOrEqual(prime)
  })

  it('result is positive', () => {
    expect(calculateRecommendedWeight(BENCH_PRESS, AVERAGE_MALE)).toBeGreaterThan(0)
    expect(calculateRecommendedWeight(BENCH_PRESS, AVERAGE_FEMALE)).toBeGreaterThan(0)
  })
})

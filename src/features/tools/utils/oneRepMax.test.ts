import { describe, it, expect } from 'vitest'
import { epley1RM, brzycki1RM, lombardi1RM, estimate1RM, weightForReps, repMaxTable } from './oneRepMax'

describe('oneRepMax', () => {
  it('returns the weight itself for 1 rep', () => {
    expect(epley1RM(100, 1)).toBe(100)
    expect(brzycki1RM(100, 1)).toBe(100)
    expect(lombardi1RM(100, 1)).toBe(100)
    expect(estimate1RM(100, 1)).toBe(100)
  })

  it('estimates Epley 1RM for 100kg x 5', () => {
    expect(epley1RM(100, 5)).toBeCloseTo(116.67, 1)
  })

  it('estimates Brzycki 1RM for 100kg x 5', () => {
    expect(brzycki1RM(100, 5)).toBeCloseTo(112.5, 1)
  })

  it('average estimate lies between individual formulas', () => {
    const avg = estimate1RM(100, 8)
    const all = [epley1RM(100, 8), brzycki1RM(100, 8), lombardi1RM(100, 8)]
    expect(avg).toBeGreaterThanOrEqual(Math.min(...all))
    expect(avg).toBeLessThanOrEqual(Math.max(...all))
  })

  it('clamps reps above 15', () => {
    expect(epley1RM(100, 30)).toBe(epley1RM(100, 15))
  })

  it('returns 0 for invalid input', () => {
    expect(estimate1RM(0, 5)).toBe(0)
    expect(estimate1RM(100, 0)).toBe(0)
  })

  it('weightForReps inverts epley1RM', () => {
    const oneRM = epley1RM(100, 5)
    expect(weightForReps(oneRM, 5)).toBeCloseTo(100, 5)
    expect(weightForReps(150, 1)).toBe(150)
  })

  it('repMaxTable starts at 100% and decreases', () => {
    const table = repMaxTable(100)
    expect(table).toHaveLength(12)
    expect(table[0]).toEqual({ reps: 1, percentOf1RM: 100, weight: 100 })
    for (let i = 1; i < table.length; i++) {
      expect(table[i].weight).toBeLessThanOrEqual(table[i - 1].weight)
    }
  })

  it('repMaxTable rounds to 0.5 kg', () => {
    for (const row of repMaxTable(102.3)) {
      expect((row.weight * 2) % 1).toBe(0)
    }
  })
})

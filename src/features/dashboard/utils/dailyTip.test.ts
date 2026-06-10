import { describe, it, expect } from 'vitest'
import { buildApplicableTips, getDailyTip, dayOfYear, type DailyTipInput } from './dailyTip'

const baseInput: DailyTipInput = {
  streak: 0,
  weekSessionCount: 2,
  thisWeekVolume: 0,
  lastWeekVolume: 0,
  prsThisMonth: 0,
  neglectedMuscles: [],
  daysSinceLastWorkout: 1,
}

describe('buildApplicableTips', () => {
  it('always returns at least the general fallback tips', () => {
    expect(buildApplicableTips(baseInput).length).toBeGreaterThanOrEqual(3)
  })

  it('prioritizes a comeback tip after 4+ rest days', () => {
    const tips = buildApplicableTips({ ...baseInput, daysSinceLastWorkout: 6 })
    expect(tips[0].title).toBe('Tijd om weer te beginnen')
    expect(tips[0].text).toContain('6 dagen')
  })

  it('mentions neglected muscles by Dutch name', () => {
    const tips = buildApplicableTips({ ...baseInput, neglectedMuscles: ['hamstrings', 'calves'] })
    const tip = tips.find(t => t.title === 'Vergeten spiergroep')
    expect(tip).toBeDefined()
    expect(tip!.text).toContain('hamstrings en kuiten')
  })

  it('warns when volume jumps more than 30%', () => {
    const tips = buildApplicableTips({ ...baseInput, thisWeekVolume: 14000, lastWeekVolume: 10000 })
    expect(tips.some(t => t.title === 'Let op je herstel')).toBe(true)
    expect(tips.some(t => t.title === 'Progressieve overload werkt')).toBe(false)
  })

  it('praises progressive overload on moderate growth', () => {
    const tips = buildApplicableTips({ ...baseInput, thisWeekVolume: 11000, lastWeekVolume: 10000 })
    expect(tips.some(t => t.title === 'Progressieve overload werkt')).toBe(true)
  })

  it('celebrates streaks and PRs', () => {
    const tips = buildApplicableTips({ ...baseInput, streak: 5, prsThisMonth: 2 })
    expect(tips.some(t => t.title.includes('Streak van 5'))).toBe(true)
    expect(tips.some(t => t.title.includes('2 PR'))).toBe(true)
  })
})

describe('getDailyTip', () => {
  it('is deterministic for the same date', () => {
    const date = new Date('2026-06-10')
    expect(getDailyTip(baseInput, date)).toEqual(getDailyTip(baseInput, date))
  })

  it('rotates between top tips on different days', () => {
    const input = { ...baseInput, streak: 4, prsThisMonth: 1, neglectedMuscles: ['chest'] }
    const titles = new Set(
      [1, 2, 3].map(d => getDailyTip(input, new Date(2026, 5, d)).title),
    )
    expect(titles.size).toBeGreaterThan(1)
  })
})

describe('dayOfYear', () => {
  it('computes day of year', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1)
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(365)
  })
})

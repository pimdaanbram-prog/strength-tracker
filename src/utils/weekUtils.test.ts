import { describe, it, expect } from 'vitest'
import {
  getWeekNumber,
  getYear,
  getDayLabel,
  getMonthLabel,
  formatDate,
  formatDateShort,
  getWeekDates,
  isSameDay,
  isToday,
  toISODateString,
  daysAgo,
} from './weekUtils'

describe('getWeekNumber', () => {
  it('week 1 of 2024 starts on Monday Jan 1 (ISO)', () => {
    expect(getWeekNumber(new Date('2024-01-01'))).toBe(1)
  })

  it('Dec 31 2023 belongs to week 52 of 2023', () => {
    expect(getWeekNumber(new Date('2023-12-31'))).toBe(52)
  })

  it('returns a number between 1 and 53', () => {
    const wk = getWeekNumber(new Date('2025-06-15'))
    expect(wk).toBeGreaterThanOrEqual(1)
    expect(wk).toBeLessThanOrEqual(53)
  })
})

describe('getYear', () => {
  it('returns the correct year', () => {
    expect(getYear(new Date('2025-01-01'))).toBe(2025)
    expect(getYear(new Date('2000-12-31'))).toBe(2000)
  })
})

describe('getDayLabel', () => {
  it('returns Dutch day names', () => {
    expect(getDayLabel(new Date('2024-01-01'))).toBe('Maandag')
    expect(getDayLabel(new Date('2024-01-07'))).toBe('Zondag')
  })
})

describe('getMonthLabel', () => {
  it('returns Dutch month names', () => {
    expect(getMonthLabel(new Date('2024-01-15'))).toBe('Januari')
    expect(getMonthLabel(new Date('2024-12-01'))).toBe('December')
  })
})

describe('formatDate', () => {
  it('formats as "D Month"', () => {
    expect(formatDate(new Date('2024-01-05'))).toBe('5 Januari')
    expect(formatDate(new Date('2024-03-31'))).toBe('31 Maart')
  })
})

describe('formatDateShort', () => {
  it('formats as "DD-MM"', () => {
    expect(formatDateShort(new Date('2024-01-05'))).toBe('05-01')
    expect(formatDateShort(new Date('2024-12-31'))).toBe('31-12')
  })
})

describe('getWeekDates', () => {
  it('returns 7 dates', () => {
    expect(getWeekDates(1, 2024)).toHaveLength(7)
  })

  it('first date is Monday', () => {
    const dates = getWeekDates(1, 2024)
    expect(dates[0].getDay()).toBe(1) // 1 = Monday
  })

  it('last date is Sunday', () => {
    const dates = getWeekDates(1, 2024)
    expect(dates[6].getDay()).toBe(0) // 0 = Sunday
  })

  it('consecutive dates differ by exactly 1 day', () => {
    const dates = getWeekDates(10, 2024)
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i].getTime() - dates[i - 1].getTime()) / 86_400_000
      expect(diff).toBe(1)
    }
  })
})

describe('isSameDay', () => {
  it('returns true for same date', () => {
    expect(isSameDay(new Date('2024-06-15'), new Date('2024-06-15'))).toBe(true)
  })

  it('returns false for different dates', () => {
    expect(isSameDay(new Date('2024-06-15'), new Date('2024-06-16'))).toBe(false)
  })

  it('ignores time component', () => {
    const a = new Date('2024-06-15T08:00:00')
    const b = new Date('2024-06-15T23:59:59')
    expect(isSameDay(a, b)).toBe(true)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date())).toBe(true)
  })

  it('returns false for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(yesterday)).toBe(false)
  })
})

describe('toISODateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = toISODateString(new Date('2024-06-15T12:00:00Z'))
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('daysAgo', () => {
  it('returns a date n days in the past', () => {
    const result = daysAgo(7)
    const diff = Math.round((Date.now() - result.getTime()) / 86_400_000)
    expect(diff).toBe(7)
  })
})

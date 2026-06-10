import { describe, it, expect } from 'vitest'
import { fuzzyScore, fuzzyFilter } from './fuzzySearch'

describe('fuzzyScore', () => {
  it('returns 0 for empty query or no match', () => {
    expect(fuzzyScore('', 'bench press')).toBe(0)
    expect(fuzzyScore('xyz', 'bench press')).toBe(0)
  })

  it('scores exact match highest', () => {
    expect(fuzzyScore('bench press', 'bench press')).toBe(1000)
  })

  it('scores substring above subsequence', () => {
    const substring = fuzzyScore('bench', 'barbell bench press')
    const subsequence = fuzzyScore('bnch', 'barbell bench press')
    expect(substring).toBeGreaterThan(subsequence)
    expect(subsequence).toBeGreaterThan(0)
  })

  it('prefers matches at the start', () => {
    expect(fuzzyScore('bench', 'bench press')).toBeGreaterThan(fuzzyScore('bench', 'incline bench'))
  })

  it('is case-insensitive and accent-insensitive', () => {
    expect(fuzzyScore('BENCH', 'bench press')).toBeGreaterThan(0)
    expect(fuzzyScore('eleve', 'élevé')).toBeGreaterThan(0)
  })

  it('matches abbreviations as subsequence', () => {
    expect(fuzzyScore('rdl', 'romanian deadlift')).toBeGreaterThan(0)
    expect(fuzzyScore('ohp', 'overhead press')).toBeGreaterThan(0)
  })
})

describe('fuzzyFilter', () => {
  const items = [
    { name: 'Barbell Bench Press', nameNL: 'Bankdrukken' },
    { name: 'Deadlift', nameNL: 'Deadlift' },
    { name: 'Romanian Deadlift', nameNL: 'Roemeense Deadlift' },
    { name: 'Bench Dip', nameNL: 'Bank Dip' },
  ]
  const fields = (i: typeof items[number]) => [i.name, i.nameNL]

  it('returns all items for an empty query', () => {
    expect(fuzzyFilter(items, '', fields)).toEqual(items)
    expect(fuzzyFilter(items, '   ', fields)).toEqual(items)
  })

  it('filters out non-matching items', () => {
    const result = fuzzyFilter(items, 'deadlift', fields)
    expect(result.map(r => r.name)).toEqual(['Deadlift', 'Romanian Deadlift'])
  })

  it('matches on any field (NL name)', () => {
    const result = fuzzyFilter(items, 'bankdruk', fields)
    expect(result[0].name).toBe('Barbell Bench Press')
  })

  it('sorts best match first', () => {
    const result = fuzzyFilter(items, 'bench', fields)
    expect(result[0].name).toBe('Bench Dip')
    expect(result).toHaveLength(2)
  })

  it('handles typo-ish subsequence queries', () => {
    const result = fuzzyFilter(items, 'rmn dl', fields)
    expect(result.some(r => r.name === 'Romanian Deadlift')).toBe(true)
  })
})

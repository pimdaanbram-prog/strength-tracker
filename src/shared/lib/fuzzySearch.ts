// Lichtgewicht fuzzy search: subsequence matching met scoring.
// Geen dependency nodig — snel genoeg voor honderden items per toetsaanslag.

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accenten (é → e)
}

/**
 * Score hoe goed `query` als subsequence in `text` past.
 * 0 = geen match. Hoger = beter:
 * - exacte substring scoort het hoogst
 * - matches aan woordgrenzen en opeenvolgende letters krijgen bonus
 * - vroege matches scoren hoger dan late
 */
export function fuzzyScore(query: string, text: string): number {
  const q = normalize(query.trim())
  const t = normalize(text)
  if (!q) return 0
  if (q === t) return 1000

  const substringIndex = t.indexOf(q)
  if (substringIndex !== -1) {
    // Substring: 500 basis, bonus voor match aan begin of woordgrens
    let score = 500 - Math.min(100, substringIndex)
    if (substringIndex === 0) score += 100
    else if (/[\s\-(]/.test(t[substringIndex - 1])) score += 50
    return score
  }

  // Subsequence match
  let score = 0
  let textIndex = 0
  let lastMatch = -2
  for (const char of q) {
    const found = t.indexOf(char, textIndex)
    if (found === -1) return 0
    if (found === lastMatch + 1) score += 8           // opeenvolgend
    else if (found === 0 || /[\s\-(]/.test(t[found - 1])) score += 6 // woordgrens
    else score += 1
    lastMatch = found
    textIndex = found + 1
  }
  // Compactere matches (minder spreiding) scoren hoger
  const spread = lastMatch - t.indexOf(q[0]) + 1
  return Math.max(1, score - Math.floor(spread / 4))
}

export interface FuzzyResult<T> {
  item: T
  score: number
}

/**
 * Filter + sorteer items op fuzzy match over meerdere velden.
 * Lege query geeft alle items terug (score 0, originele volgorde).
 */
export function fuzzyFilter<T>(
  items: T[],
  query: string,
  getFields: (item: T) => string[],
): T[] {
  const q = query.trim()
  if (!q) return items

  const results: FuzzyResult<T>[] = []
  for (const item of items) {
    let best = 0
    for (const field of getFields(item)) {
      const score = fuzzyScore(q, field)
      if (score > best) best = score
    }
    if (best > 0) results.push({ item, score: best })
  }
  return results.sort((a, b) => b.score - a.score).map(r => r.item)
}

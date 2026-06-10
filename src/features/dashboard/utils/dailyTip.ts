// Gepersonaliseerde "tip van de dag": regels op basis van trainingsdata,
// deterministisch gekozen per dag zodat de tip niet bij elke render wisselt.

export interface DailyTipInput {
  streak: number
  weekSessionCount: number
  thisWeekVolume: number
  lastWeekVolume: number
  prsThisMonth: number
  /** Spiergroepen die deze week (bijna) niet getraind zijn */
  neglectedMuscles: string[]
  daysSinceLastWorkout: number | null
}

export interface DailyTip {
  title: string
  text: string
  emoji: string
}

const MUSCLE_LABELS_NL: Record<string, string> = {
  chest: 'borst',
  back: 'rug',
  shoulders: 'schouders',
  biceps: 'biceps',
  triceps: 'triceps',
  quads: 'quadriceps',
  hamstrings: 'hamstrings',
  glutes: 'billen',
  calves: 'kuiten',
  core: 'core',
  abs: 'buikspieren',
  forearms: 'onderarmen',
  traps: 'trapezius',
}

export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000)
}

/** Bouw alle tips die op dit moment van toepassing zijn (volgorde = prioriteit). */
export function buildApplicableTips(input: DailyTipInput): DailyTip[] {
  const tips: DailyTip[] = []

  if (input.daysSinceLastWorkout !== null && input.daysSinceLastWorkout >= 4) {
    tips.push({
      emoji: '🔄',
      title: 'Tijd om weer te beginnen',
      text: `Je laatste workout was ${input.daysSinceLastWorkout} dagen geleden. Een korte sessie vandaag houdt je momentum vast — iets is altijd beter dan niets.`,
    })
  }

  if (input.neglectedMuscles.length > 0) {
    const names = input.neglectedMuscles
      .slice(0, 2)
      .map(m => MUSCLE_LABELS_NL[m] ?? m)
      .join(' en ')
    tips.push({
      emoji: '🎯',
      title: 'Vergeten spiergroep',
      text: `Je ${names} ${input.neglectedMuscles.length === 1 ? 'heeft' : 'hebben'} deze week nog geen training gehad. Plan ze in je volgende sessie voor een gebalanceerde ontwikkeling.`,
    })
  }

  if (input.lastWeekVolume > 0 && input.thisWeekVolume > input.lastWeekVolume * 1.3) {
    tips.push({
      emoji: '⚠️',
      title: 'Let op je herstel',
      text: 'Je volume ligt deze week ruim 30% hoger dan vorige week. Snelle sprongen vergroten de kans op blessures — bouw geleidelijk op en slaap voldoende.',
    })
  } else if (input.lastWeekVolume > 0 && input.thisWeekVolume >= input.lastWeekVolume) {
    tips.push({
      emoji: '📈',
      title: 'Progressieve overload werkt',
      text: 'Je volume groeit ten opzichte van vorige week. Houd dit vol: kleine stapjes van 2,5 kg of één extra herhaling per week stapelen zich op.',
    })
  }

  if (input.streak >= 3) {
    tips.push({
      emoji: '🔥',
      title: `Streak van ${input.streak} weken`,
      text: 'Consistentie is de belangrijkste voorspeller van resultaat. Bescherm je streak door workouts vooraf in te plannen.',
    })
  }

  if (input.prsThisMonth > 0) {
    tips.push({
      emoji: '🏆',
      title: `${input.prsThisMonth} PR${input.prsThisMonth === 1 ? '' : '’s'} deze maand`,
      text: 'Sterk bezig! Na een PR-periode is een lichtere deload-week slim om supercompensatie de ruimte te geven.',
    })
  }

  if (input.weekSessionCount === 0) {
    tips.push({
      emoji: '🚀',
      title: 'Begin je week sterk',
      text: 'Nog geen workout deze week. De beste dag om te trainen is vandaag — start met je favoriete oefening om de drempel laag te houden.',
    })
  }

  // Algemene tips als vangnet zodat er altijd iets te tonen is
  tips.push(
    {
      emoji: '💧',
      title: 'Hydratatie & prestatie',
      text: 'Al 2% vochtverlies vermindert je kracht meetbaar. Drink 500 ml water in het uur voor je training.',
    },
    {
      emoji: '😴',
      title: 'Spieren groeien in je slaap',
      text: '7–9 uur slaap verhoogt je herstel en krachtontwikkeling. Probeer vandaag 30 minuten eerder naar bed te gaan.',
    },
    {
      emoji: '🥩',
      title: 'Eiwit-timing',
      text: 'Richt op 1,6–2,2 g eiwit per kg lichaamsgewicht per dag, verdeeld over 3–5 momenten voor optimale spieropbouw.',
    },
  )

  return tips
}

export function getDailyTip(input: DailyTipInput, date = new Date()): DailyTip {
  const tips = buildApplicableTips(input)
  // Hoogste prioriteit-tips vaker tonen: kies uit de top 3, roterend per dag
  const pool = tips.slice(0, 3)
  return pool[dayOfYear(date) % pool.length]
}

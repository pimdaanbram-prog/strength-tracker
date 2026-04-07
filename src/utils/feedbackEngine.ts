import type { WorkoutSession, SessionExercise, WeekFeedback, ExerciseFeedback, ExerciseRecommendation } from '../hooks/useWorkouts'

export function generateWeekFeedback(
  currentWeekSessions: WorkoutSession[],
  previousWeekSessions: WorkoutSession[],
  exerciseNames: Record<string, string>
): WeekFeedback {
  const currentExerciseMap = buildExerciseMap(currentWeekSessions)
  const previousExerciseMap = buildExerciseMap(previousWeekSessions)

  const progressNotes: ExerciseFeedback[] = []
  const nextWeekRecommendations: ExerciseRecommendation[] = []
  const strengths: string[] = []
  const improvements: string[] = []

  for (const [exerciseId, currentSets] of Object.entries(currentExerciseMap)) {
    const previousSets = previousExerciseMap[exerciseId]
    const currentBest = getMaxWeight(currentSets)
    const currentMaxReps = getMaxReps(currentSets)
    const name = exerciseNames[exerciseId] || exerciseId

    if (!previousSets) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'new',
        previousBest: 0,
        currentBest,
        note: `Nieuwe oefening: ${name} — goed bezig!`,
      })
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: currentBest,
        recommendedReps: '8-10',
        reason: `Houd ${currentBest}kg aan en probeer 8-10 reps te halen`,
      })
      continue
    }

    const previousBest = getMaxWeight(previousSets)
    const previousMaxReps = getMaxReps(previousSets)
    const isBarbell = currentBest >= 20
    const increment = isBarbell ? 2.5 : 1.25

    if (currentBest > previousBest) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'improved',
        previousBest,
        currentBest,
        note: `${name}: ${previousBest}kg → ${currentBest}kg — sterker worden!`,
      })
      strengths.push(`${name}: +${(currentBest - previousBest).toFixed(1)}kg`)

      // If reps are still low, consolidate. If reps are high, keep pushing.
      if (currentMaxReps >= 10) {
        nextWeekRecommendations.push({
          exerciseId,
          recommendedWeight: currentBest + increment,
          recommendedReps: '8-10',
          reason: `${currentMaxReps} reps bij ${currentBest}kg — probeer ${currentBest + increment}kg`,
        })
      } else {
        nextWeekRecommendations.push({
          exerciseId,
          recommendedWeight: currentBest,
          recommendedReps: '8-10',
          reason: `Nieuw gewicht ${currentBest}kg — herhaal dit en bouw reps op naar 10`,
        })
      }
    } else if (currentBest === previousBest && currentMaxReps > previousMaxReps) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'improved',
        previousBest,
        currentBest,
        note: `${name}: ${previousMaxReps} → ${currentMaxReps} reps — klaar voor meer gewicht!`,
      })

      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: currentBest + increment,
        recommendedReps: '8-10',
        reason: `${currentMaxReps} reps met ${currentBest}kg = verhoog naar ${currentBest + increment}kg`,
      })
    } else if (currentBest === previousBest && currentMaxReps === previousMaxReps) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'same',
        previousBest,
        currentBest,
        note: `${name}: ${currentBest}kg × ${currentMaxReps} reps — probeer 1 extra rep volgende week`,
      })
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: currentBest,
        recommendedReps: `${currentMaxReps + 1}-${currentMaxReps + 2}`,
        reason: `Zit vast op ${currentBest}kg — focus op meer reps: probeer ${currentMaxReps + 1}`,
      })
    } else if (currentBest === previousBest && currentMaxReps < previousMaxReps) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'same',
        previousBest,
        currentBest,
        note: `${name}: minder reps dan vorige week (${currentMaxReps} vs ${previousMaxReps}) — herstel goed`,
      })
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: currentBest,
        recommendedReps: `${previousMaxReps}`,
        reason: `Doel: terug naar ${previousMaxReps} reps bij ${currentBest}kg`,
      })
    } else {
      // Regressed on weight
      progressNotes.push({
        exerciseId,
        progressStatus: 'regressed',
        previousBest,
        currentBest,
        note: `${name}: ${currentBest}kg vs ${previousBest}kg vorige week — zware week gehad?`,
      })
      improvements.push(`${name}: ${currentBest}kg (vorige week ${previousBest}kg)`)

      const recoveryWeight = Math.round(previousBest * 0.95 / 2.5) * 2.5
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: recoveryWeight,
        recommendedReps: '8-10',
        reason: `Start bij ${recoveryWeight}kg (95% van ${previousBest}kg) — herstel en bouw weer op`,
      })
    }
  }

  // Training frequency assessment — only mention if genuinely low
  const sessionCount = currentWeekSessions.length
  if (sessionCount >= 3) {
    strengths.push(`${sessionCount}× getraind — uitstekende consistentie!`)
  } else if (sessionCount === 2) {
    strengths.push(`${sessionCount}× getraind — goede week, ga zo door`)
  } else if (sessionCount === 1) {
    improvements.push('Slechts 1 training — meer consistentie = snellere groei')
  }
  // No "try to train 2x a week" if they already do — avoid generic advice

  const totalExercises = progressNotes.length
  const improved = progressNotes.filter(p => p.progressStatus === 'improved').length
  const overallScore = totalExercises > 0
    ? Math.min(10, Math.round((improved / totalExercises) * 7 + Math.min(sessionCount, 3)))
    : Math.min(sessionCount * 2, 5)

  const summary = generateSummary(sessionCount, improved, totalExercises, progressNotes)

  return {
    generatedAt: new Date().toISOString(),
    summary,
    progressNotes,
    nextWeekRecommendations,
    overallScore: Math.max(1, Math.min(10, overallScore)),
    strengths,
    improvements,
  }
}

function buildExerciseMap(sessions: WorkoutSession[]): Record<string, SessionExercise[]> {
  const map: Record<string, SessionExercise[]> = {}
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (!map[exercise.exerciseId]) {
        map[exercise.exerciseId] = []
      }
      map[exercise.exerciseId].push(exercise)
    }
  }
  return map
}

function getMaxWeight(exercises: SessionExercise[]): number {
  let max = 0
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.completed && set.weight !== null && set.weight > max) {
        max = set.weight
      }
    }
  }
  return max
}

function getMaxReps(exercises: SessionExercise[]): number {
  let max = 0
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.completed && set.reps !== null && set.reps > max) {
        max = set.reps
      }
    }
  }
  return max
}

function generateSummary(
  sessionCount: number,
  improved: number,
  total: number,
  _notes: ExerciseFeedback[]
): string {
  if (sessionCount === 0) {
    return 'Geen trainingen deze week — je kunt het volgende week inhalen!'
  }

  const pct = total > 0 ? Math.round((improved / total) * 100) : 0

  if (pct === 100 && total > 0) {
    return `Perfecte week — bij alle ${total} oefeningen progressie gemaakt in ${sessionCount} training${sessionCount > 1 ? 'en' : ''}. Geweldig!`
  }

  if (pct >= 60) {
    return `Sterke week! ${improved} van de ${total} oefeningen verbeterd. Focus volgende week op de rest.`
  }

  if (pct >= 30) {
    return `Solide week met ${sessionCount} training${sessionCount > 1 ? 'en' : ''}. ${improved} oefeningen verbeterd — progressie gaat niet altijd lineair, dat is normaal.`
  }

  if (sessionCount >= 2) {
    return `${sessionCount} trainingen gedaan. Weinig gewichtstoename — maar aanwezigheid is het halve werk. Volgende week beter!`
  }

  return `${sessionCount} training gedaan. Probeer volgende week vaker te komen voor snellere resultaten.`
}

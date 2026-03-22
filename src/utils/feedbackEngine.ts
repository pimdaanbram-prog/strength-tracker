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
    const name = exerciseNames[exerciseId] || exerciseId

    if (!previousSets) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'new',
        previousBest: 0,
        currentBest,
        note: `Nieuwe oefening toegevoegd: ${name}`,
      })
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: currentBest,
        recommendedReps: '8-10',
        reason: 'Houd hetzelfde gewicht aan voor je tweede week',
      })
      continue
    }

    const previousBest = getMaxWeight(previousSets)
    const currentMaxReps = getMaxReps(currentSets)
    const previousMaxReps = getMaxReps(previousSets)

    if (currentBest > previousBest) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'improved',
        previousBest,
        currentBest,
        note: `Progressie! Je hebt meer gewicht gebruikt bij ${name} (${previousBest}kg → ${currentBest}kg)`,
      })
      strengths.push(`${name}: +${(currentBest - previousBest).toFixed(1)}kg`)

      const isBarbell = currentBest >= 20
      const increment = isBarbell ? 5 : 2.5
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: currentBest + increment,
        recommendedReps: '8-10',
        reason: `Je hebt progressie gemaakt, probeer ${(currentBest + increment).toFixed(1)}kg`,
      })
    } else if (currentBest === previousBest && currentMaxReps > previousMaxReps) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'improved',
        previousBest,
        currentBest,
        note: `Meer herhalingen bij ${name}, klaar voor meer gewicht!`,
      })

      const isBarbell = currentBest >= 20
      const increment = isBarbell ? 5 : 2.5
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: currentBest + increment,
        recommendedReps: '8-10',
        reason: 'Meer reps met hetzelfde gewicht = tijd voor progressie',
      })
    } else if (currentBest === previousBest) {
      progressNotes.push({
        exerciseId,
        progressStatus: 'same',
        previousBest,
        currentBest,
        note: `${name}: zelfde gewicht als vorige week. Probeer meer herhalingen.`,
      })
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: currentBest,
        recommendedReps: '10-12',
        reason: 'Probeer meer herhalingen voordat je het gewicht verhoogt',
      })
    } else {
      progressNotes.push({
        exerciseId,
        progressStatus: 'regressed',
        previousBest,
        currentBest,
        note: `Moeilijke week? Probeer volgende week terug naar ${previousBest}kg bij ${name}`,
      })
      improvements.push(`${name}: ${currentBest}kg (was ${previousBest}kg)`)

      const recoveryWeight = Math.round(previousBest * 0.95 * 2) / 2
      nextWeekRecommendations.push({
        exerciseId,
        recommendedWeight: recoveryWeight,
        recommendedReps: '8-10',
        reason: `Herstel met 95% van je vorige beste: ${recoveryWeight}kg`,
      })
    }
  }

  const totalExercises = progressNotes.length
  const improved = progressNotes.filter(p => p.progressStatus === 'improved').length
  const overallScore = totalExercises > 0
    ? Math.min(10, Math.round((improved / totalExercises) * 10 + currentWeekSessions.length))
    : 5

  if (currentWeekSessions.length >= 3) {
    strengths.push(`${currentWeekSessions.length} trainingen deze week - uitstekend!`)
  } else if (currentWeekSessions.length >= 2) {
    strengths.push(`${currentWeekSessions.length} trainingen deze week - goed bezig!`)
  }

  if (currentWeekSessions.length < 2) {
    improvements.push('Probeer minstens 2 keer per week te trainen')
  }

  const summary = generateSummary(currentWeekSessions.length, improved, totalExercises, progressNotes)

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
    return 'Geen trainingen deze week. Probeer volgende week weer aan de slag te gaan!'
  }

  if (improved === total && total > 0) {
    return `Fantastische week! Je hebt bij alle ${total} oefeningen progressie gemaakt over ${sessionCount} trainingen. Blijf zo doorgaan!`
  }

  if (improved > total / 2) {
    return `Goede week met ${sessionCount} trainingen! Je hebt bij ${improved} van de ${total} oefeningen progressie geboekt. Blijf focussen op de oefeningen die nog niet verbeterd zijn.`
  }

  if (sessionCount >= 2) {
    return `Je hebt ${sessionCount} keer getraind deze week. Bij ${improved} van de ${total} oefeningen was er vooruitgang. Focus op consistentie en langzame progressie.`
  }

  return `${sessionCount} training deze week. Probeer volgende week vaker te trainen voor betere resultaten.`
}

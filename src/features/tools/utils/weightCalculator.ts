interface ExerciseWeight {
  recommendedWeight: {
    male: Record<string, string>
    female: Record<string, string>
  }
}

interface ProfileData {
  gender: 'male' | 'female'
  fitnessLevel: string
  weight: number
  age: number
}

function parseWeightRange(weightStr: string): number {
  // Match patterns like "20-25kg", "20kg", "20-25 kg", "20 kg"
  const rangeMatch = weightStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*kg/i)
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1])
    const high = parseFloat(rangeMatch[2])
    return (low + high) / 2
  }

  const singleMatch = weightStr.match(/(\d+(?:\.\d+)?)\s*kg/i)
  if (singleMatch) {
    return parseFloat(singleMatch[1])
  }

  // Try parsing as plain number
  const num = parseFloat(weightStr)
  return isNaN(num) ? 0 : num
}

const LEVEL_MULTIPLIERS = {
  male: {
    beginner: 1.0,
    intermediate: 1.4,
    advanced: 1.8,
  },
  female: {
    beginner: 0.55,
    intermediate: 0.75,
    advanced: 1.0,
  },
} as const

export function calculateRecommendedWeight(
  exercise: ExerciseWeight,
  profile: ProfileData
): number {
  const { gender, fitnessLevel, weight, age } = profile

  // Get the weight string for the gender and fitness level
  const genderWeights = exercise.recommendedWeight[gender]
  const weightStr =
    genderWeights[fitnessLevel] ||
    genderWeights['beginner'] ||
    Object.values(genderWeights)[0] ||
    '0kg'

  const baseWeight = parseWeightRange(weightStr)

  // Apply fitness level multiplier
  const levelKey = fitnessLevel as keyof (typeof LEVEL_MULTIPLIERS)['male']
  const levelMultiplier =
    LEVEL_MULTIPLIERS[gender]?.[levelKey] ??
    LEVEL_MULTIPLIERS[gender].beginner

  // Body weight factor: heavier users get a slight boost for compound lifts
  // Average male ~80kg, female ~65kg
  const avgWeight = gender === 'male' ? 80 : 65
  const weightRatio = weight / avgWeight
  // Clamp boost between -5% and +15%
  const bodyWeightFactor = 1 + Math.max(-0.05, Math.min(0.15, (weightRatio - 1) * 0.3))

  // Age factor: under 20 or over 50 gets -10%
  const ageFactor = age < 20 || age > 50 ? 0.9 : 1.0

  const recommended = baseWeight * levelMultiplier * bodyWeightFactor * ageFactor

  // Round to nearest 2.5kg (standard plate increments)
  return Math.round(recommended / 2.5) * 2.5
}

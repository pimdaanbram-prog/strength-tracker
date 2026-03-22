export interface WorkoutTemplate {
  id: string
  name: string
  nameNL: string
  description: string
  exercises: { exerciseId: string; sets: number; reps: string }[]
  estimatedMinutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'fullbody' | 'custom'
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'training-a',
    name: 'Training A (Push)',
    nameNL: 'Training A — Push',
    description: 'Push-gerichte training met borst, schouders en triceps',
    exercises: [
      { exerciseId: 'barbell-bench-press', sets: 3, reps: '8-10' },
      { exerciseId: 'dumbbell-shoulder-press', sets: 3, reps: '10' },
      { exerciseId: 'chest-fly-dumbbell', sets: 3, reps: '10-12' },
      { exerciseId: 'tricep-dips', sets: 3, reps: '12' },
      { exerciseId: 'plank', sets: 3, reps: '30-45 sec' },
    ],
    estimatedMinutes: 45,
    difficulty: 'beginner',
    category: 'push',
  },
  {
    id: 'training-b',
    name: 'Training B (Pull + Legs)',
    nameNL: 'Training B — Pull + Benen',
    description: 'Pull- en beentraining met rug, billen en biceps',
    exercises: [
      { exerciseId: 'bent-over-row', sets: 3, reps: '10' },
      { exerciseId: 'dumbbell-row', sets: 3, reps: '10/arm' },
      { exerciseId: 'hip-thrust', sets: 3, reps: '12' },
      { exerciseId: 'goblet-squat', sets: 3, reps: '12' },
      { exerciseId: 'romanian-deadlift', sets: 3, reps: '10' },
      { exerciseId: 'glute-bridge-hold', sets: 3, reps: '30-40 sec' },
      { exerciseId: 'bicep-curls', sets: 3, reps: '10-12' },
      { exerciseId: 'sit-ups', sets: 3, reps: '15' },
    ],
    estimatedMinutes: 55,
    difficulty: 'beginner',
    category: 'pull',
  },
  {
    id: 'push-day',
    name: 'Push Day',
    nameNL: 'Push Dag',
    description: 'Volledige push training: borst, schouders, triceps',
    exercises: [
      { exerciseId: 'barbell-bench-press', sets: 4, reps: '8-10' },
      { exerciseId: 'incline-bench-press', sets: 3, reps: '10' },
      { exerciseId: 'dumbbell-shoulder-press', sets: 3, reps: '10' },
      { exerciseId: 'lateral-raises', sets: 3, reps: '12-15' },
      { exerciseId: 'chest-fly-dumbbell', sets: 3, reps: '12' },
      { exerciseId: 'tricep-pushdown', sets: 3, reps: '12' },
      { exerciseId: 'overhead-tricep-extension', sets: 3, reps: '12' },
    ],
    estimatedMinutes: 60,
    difficulty: 'intermediate',
    category: 'push',
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    nameNL: 'Pull Dag',
    description: 'Volledige pull training: rug en biceps',
    exercises: [
      { exerciseId: 'deadlift', sets: 3, reps: '5-8' },
      { exerciseId: 'bent-over-row', sets: 4, reps: '8-10' },
      { exerciseId: 'lat-pulldown', sets: 3, reps: '10-12' },
      { exerciseId: 'seated-cable-row', sets: 3, reps: '10-12' },
      { exerciseId: 'face-pulls', sets: 3, reps: '15' },
      { exerciseId: 'barbell-curl', sets: 3, reps: '10-12' },
      { exerciseId: 'hammer-curl', sets: 3, reps: '12' },
    ],
    estimatedMinutes: 55,
    difficulty: 'intermediate',
    category: 'pull',
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    nameNL: 'Benen Dag',
    description: 'Complete beentraining: quads, hamstrings, billen, kuiten',
    exercises: [
      { exerciseId: 'barbell-squat', sets: 4, reps: '8-10' },
      { exerciseId: 'romanian-deadlift', sets: 3, reps: '10' },
      { exerciseId: 'leg-press', sets: 3, reps: '12' },
      { exerciseId: 'bulgarian-split-squat', sets: 3, reps: '10/been' },
      { exerciseId: 'leg-curl', sets: 3, reps: '12' },
      { exerciseId: 'hip-thrust', sets: 3, reps: '12' },
      { exerciseId: 'calf-raises', sets: 4, reps: '15' },
    ],
    estimatedMinutes: 60,
    difficulty: 'intermediate',
    category: 'legs',
  },
  {
    id: 'upper-body',
    name: 'Upper Body',
    nameNL: 'Bovenlichaam',
    description: 'Complete bovenlichaam training in één sessie',
    exercises: [
      { exerciseId: 'barbell-bench-press', sets: 3, reps: '8-10' },
      { exerciseId: 'bent-over-row', sets: 3, reps: '8-10' },
      { exerciseId: 'dumbbell-shoulder-press', sets: 3, reps: '10' },
      { exerciseId: 'lat-pulldown', sets: 3, reps: '10-12' },
      { exerciseId: 'chest-fly-dumbbell', sets: 3, reps: '12' },
      { exerciseId: 'bicep-curls', sets: 3, reps: '12' },
      { exerciseId: 'tricep-pushdown', sets: 3, reps: '12' },
    ],
    estimatedMinutes: 55,
    difficulty: 'intermediate',
    category: 'upper',
  },
  {
    id: 'lower-body',
    name: 'Lower Body',
    nameNL: 'Onderlichaam',
    description: 'Benen en billen focus training',
    exercises: [
      { exerciseId: 'goblet-squat', sets: 3, reps: '12' },
      { exerciseId: 'hip-thrust', sets: 3, reps: '12' },
      { exerciseId: 'romanian-deadlift', sets: 3, reps: '10' },
      { exerciseId: 'lunges', sets: 3, reps: '12/been' },
      { exerciseId: 'leg-extension', sets: 3, reps: '12' },
      { exerciseId: 'glute-bridge', sets: 3, reps: '15' },
      { exerciseId: 'calf-raises', sets: 3, reps: '15' },
    ],
    estimatedMinutes: 50,
    difficulty: 'beginner',
    category: 'lower',
  },
  {
    id: 'full-body',
    name: 'Full Body',
    nameNL: 'Full Body',
    description: 'Alles-in-één training voor het hele lichaam',
    exercises: [
      { exerciseId: 'barbell-squat', sets: 3, reps: '8-10' },
      { exerciseId: 'barbell-bench-press', sets: 3, reps: '8-10' },
      { exerciseId: 'bent-over-row', sets: 3, reps: '10' },
      { exerciseId: 'dumbbell-shoulder-press', sets: 3, reps: '10' },
      { exerciseId: 'hip-thrust', sets: 3, reps: '12' },
      { exerciseId: 'bicep-curls', sets: 3, reps: '12' },
      { exerciseId: 'plank', sets: 3, reps: '45 sec' },
    ],
    estimatedMinutes: 55,
    difficulty: 'beginner',
    category: 'fullbody',
  },
]

export const getTemplateById = (id: string): WorkoutTemplate | undefined =>
  workoutTemplates.find(t => t.id === id)

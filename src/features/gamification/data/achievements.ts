export type AchievementCategory = 'workouts' | 'streak' | 'volume' | 'prs' | 'social' | 'special'

export interface AchievementDef {
  id: string
  name: string
  nameNL: string
  description: string
  descriptionNL: string
  icon: string
  category: AchievementCategory
  xp: number
  condition: (stats: AchievementStats) => boolean
}

export interface AchievementStats {
  totalWorkouts: number
  currentStreak: number
  longestStreak: number
  totalVolume: number      // kg
  totalPRs: number
  singleWorkoutVolume: number  // max volume in one session
  muscleGroupsCoveredThisWeek: number
  consecutiveDays: number
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string  // ISO date
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ─── Workout count ───
  {
    id: 'first-workout',
    name: 'First Rep',
    nameNL: 'Eerste Rep',
    description: 'Complete your first workout',
    descriptionNL: 'Voltooi je eerste training',
    icon: '🏋️',
    category: 'workouts',
    xp: 50,
    condition: s => s.totalWorkouts >= 1,
  },
  {
    id: '10-workouts',
    name: 'Getting Started',
    nameNL: 'Op Dreef',
    description: 'Complete 10 workouts',
    descriptionNL: 'Voltooi 10 trainingen',
    icon: '💪',
    category: 'workouts',
    xp: 100,
    condition: s => s.totalWorkouts >= 10,
  },
  {
    id: '25-workouts',
    name: 'Dedicated',
    nameNL: 'Toegewijd',
    description: 'Complete 25 workouts',
    descriptionNL: 'Voltooi 25 trainingen',
    icon: '🔥',
    category: 'workouts',
    xp: 200,
    condition: s => s.totalWorkouts >= 25,
  },
  {
    id: '50-workouts',
    name: 'Halfway Hero',
    nameNL: 'Halve Held',
    description: 'Complete 50 workouts',
    descriptionNL: 'Voltooi 50 trainingen',
    icon: '⚡',
    category: 'workouts',
    xp: 350,
    condition: s => s.totalWorkouts >= 50,
  },
  {
    id: '100-workouts',
    name: 'Century Club',
    nameNL: 'Eeuwclub',
    description: 'Complete 100 workouts',
    descriptionNL: 'Voltooi 100 trainingen',
    icon: '🏆',
    category: 'workouts',
    xp: 600,
    condition: s => s.totalWorkouts >= 100,
  },
  {
    id: '250-workouts',
    name: 'Iron Will',
    nameNL: 'IJzeren Wil',
    description: 'Complete 250 workouts',
    descriptionNL: 'Voltooi 250 trainingen',
    icon: '⚔️',
    category: 'workouts',
    xp: 1000,
    condition: s => s.totalWorkouts >= 250,
  },
  {
    id: '500-workouts',
    name: 'Legendary',
    nameNL: 'Legendarisch',
    description: 'Complete 500 workouts',
    descriptionNL: 'Voltooi 500 trainingen',
    icon: '👑',
    category: 'workouts',
    xp: 2000,
    condition: s => s.totalWorkouts >= 500,
  },

  // ─── Streaks ───
  {
    id: 'streak-7',
    name: 'Week Warrior',
    nameNL: 'Week Krijger',
    description: 'Train 7 weeks in a row',
    descriptionNL: '7 weken op rij getraind',
    icon: '📅',
    category: 'streak',
    xp: 150,
    condition: s => s.longestStreak >= 7,
  },
  {
    id: 'streak-30',
    name: 'Monthly Grind',
    nameNL: 'Maandelijkse Grind',
    description: 'Train 30 weeks in a row',
    descriptionNL: '30 weken op rij getraind',
    icon: '🗓️',
    category: 'streak',
    xp: 400,
    condition: s => s.longestStreak >= 30,
  },
  {
    id: 'streak-52',
    name: 'Year of Iron',
    nameNL: 'Jaar van IJzer',
    description: 'Train every week for a full year',
    descriptionNL: 'Een heel jaar elke week getraind',
    icon: '🌟',
    category: 'streak',
    xp: 1500,
    condition: s => s.longestStreak >= 52,
  },

  // ─── Volume ───
  {
    id: 'volume-1000-session',
    name: 'Ton Session',
    nameNL: 'Ton Sessie',
    description: 'Lift 1,000 kg in a single workout',
    descriptionNL: '1.000 kg in één training',
    icon: '🏗️',
    category: 'volume',
    xp: 200,
    condition: s => s.singleWorkoutVolume >= 1000,
  },
  {
    id: 'volume-10k-total',
    name: '10K Club',
    nameNL: '10K Club',
    description: 'Lift 10,000 kg lifetime',
    descriptionNL: '10.000 kg lifetime volume',
    icon: '📦',
    category: 'volume',
    xp: 300,
    condition: s => s.totalVolume >= 10000,
  },
  {
    id: 'volume-100k-total',
    name: 'Titan',
    nameNL: 'Titaan',
    description: 'Lift 100,000 kg lifetime',
    descriptionNL: '100.000 kg lifetime volume',
    icon: '🦍',
    category: 'volume',
    xp: 750,
    condition: s => s.totalVolume >= 100000,
  },
  {
    id: 'volume-1m-total',
    name: 'Million Pound Man',
    nameNL: 'Miljoen Kilo Man',
    description: 'Lift 1,000,000 kg lifetime',
    descriptionNL: '1.000.000 kg lifetime volume',
    icon: '🚀',
    category: 'volume',
    xp: 3000,
    condition: s => s.totalVolume >= 1000000,
  },

  // ─── PRs ───
  {
    id: 'first-pr',
    name: 'Personal Best',
    nameNL: 'Persoonlijk Record',
    description: 'Set your first PR',
    descriptionNL: 'Stel je eerste PR in',
    icon: '🎯',
    category: 'prs',
    xp: 75,
    condition: s => s.totalPRs >= 1,
  },
  {
    id: '10-prs',
    name: 'PR Machine',
    nameNL: 'PR Machine',
    description: 'Set 10 personal records',
    descriptionNL: '10 persoonlijke records',
    icon: '📈',
    category: 'prs',
    xp: 250,
    condition: s => s.totalPRs >= 10,
  },
  {
    id: '25-prs',
    name: 'Record Breaker',
    nameNL: 'Recordbreker',
    description: 'Set 25 personal records',
    descriptionNL: '25 persoonlijke records',
    icon: '💥',
    category: 'prs',
    xp: 500,
    condition: s => s.totalPRs >= 25,
  },

  // ─── Special ───
  {
    id: 'all-muscles-week',
    name: 'Full Body Week',
    nameNL: 'Volledig Lichaam Week',
    description: 'Train all major muscle groups in one week',
    descriptionNL: 'Train alle spiergroepen in één week',
    icon: '🧠',
    category: 'special',
    xp: 300,
    condition: s => s.muscleGroupsCoveredThisWeek >= 6,
  },
]

// Level system
export interface Level {
  level: number
  title: string
  titleNL: string
  minXP: number
  maxXP: number
}

export function getLevel(xp: number): Level {
  const levels = getLevels()
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) return levels[i]
  }
  return levels[0]
}

export function getNextLevel(xp: number): Level | null {
  const levels = getLevels()
  const current = getLevel(xp)
  const next = levels.find(l => l.level === current.level + 1)
  return next ?? null
}

function getLevels(): Level[] {
  return [
    { level: 1, title: 'Newbie', titleNL: 'Beginner', minXP: 0, maxXP: 199 },
    { level: 2, title: 'Rookie', titleNL: 'Rookie', minXP: 200, maxXP: 499 },
    { level: 3, title: 'Trainee', titleNL: 'Leerling', minXP: 500, maxXP: 999 },
    { level: 4, title: 'Athlete', titleNL: 'Atleet', minXP: 1000, maxXP: 1999 },
    { level: 5, title: 'Warrior', titleNL: 'Strijder', minXP: 2000, maxXP: 3499 },
    { level: 6, title: 'Champion', titleNL: 'Kampioen', minXP: 3500, maxXP: 5999 },
    { level: 7, title: 'Elite', titleNL: 'Elite', minXP: 6000, maxXP: 9999 },
    { level: 8, title: 'Beast', titleNL: 'Beest', minXP: 10000, maxXP: 14999 },
    { level: 9, title: 'Legend', titleNL: 'Legende', minXP: 15000, maxXP: 24999 },
    { level: 10, title: 'God Mode', titleNL: 'God Mode', minXP: 25000, maxXP: Infinity },
  ]
}

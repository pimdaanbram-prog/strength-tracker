import { useCallback } from 'react'
import { useAppStore } from '@/shared/store/appStore'
import { ACHIEVEMENTS, getLevel, getNextLevel, type AchievementStats } from '@/features/gamification/data/achievements'
import { useWorkouts } from '@/features/workouts/hooks/useWorkouts'
import { useToast } from '@/app/ToastContext'

export function useGamification() {
  const activeProfileId = useAppStore(s => s.activeProfileId)
  const { addXP, unlockAchievement, getProfileXP, getProfileAchievements } = useAppStore()
  const { getProfileSessions, getPersonalRecords } = useWorkouts()
  const { showAchievement } = useToast()

  const profileXP = activeProfileId ? getProfileXP(activeProfileId) : 0
  const profileAchievements = activeProfileId ? getProfileAchievements(activeProfileId) : []
  const currentLevel = getLevel(profileXP)
  const nextLevel = getNextLevel(profileXP)

  function buildStats(): AchievementStats {
    const sessions = getProfileSessions()
    const prs = getPersonalRecords()

    const totalWorkouts = sessions.length
    const totalPRs = prs.length

    // Calculate lifetime volume
    let totalVolume = 0
    let singleWorkoutVolume = 0
    for (const s of sessions) {
      let vol = 0
      for (const ex of s.exercises) {
        for (const set of ex.sets) {
          if (set.completed && set.weight && set.reps) {
            vol += set.weight * set.reps
          }
        }
      }
      totalVolume += vol
      if (vol > singleWorkoutVolume) singleWorkoutVolume = vol
    }

    // Week streak (simplified)
    const longestStreak = calculateStreak(sessions)
    const currentStreak = longestStreak

    // Muscle groups this week
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const weekSessions = sessions.filter(s => new Date(s.date) >= weekStart)
    const muscleGroups = new Set<string>()
    for (const s of weekSessions) {
      for (const ex of s.exercises) {
        // We track categories as proxy for muscle groups
        muscleGroups.add(ex.exerciseId.split('-')[0])
      }
    }

    return {
      totalWorkouts,
      currentStreak,
      longestStreak,
      totalVolume,
      totalPRs,
      singleWorkoutVolume,
      muscleGroupsCoveredThisWeek: muscleGroups.size,
      consecutiveDays: 0,
    }
  }

  function calculateStreak(sessions: { weekNumber: number; year: number }[]): number {
    if (sessions.length === 0) return 0
    const weeks = new Set(sessions.map(s => `${s.year}-${s.weekNumber}`))
    const now = new Date()
    let streak = 0
    let checkDate = new Date(now)
    for (let i = 0; i < 260; i++) {
      const weekNum = getISOWeek(checkDate)
      const year = checkDate.getFullYear()
      const key = `${year}-${weekNum}`
      if (weeks.has(key)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 7)
      } else if (i === 0) {
        // Current week might not be finished yet
        checkDate.setDate(checkDate.getDate() - 7)
      } else {
        break
      }
    }
    return streak
  }

  function getISOWeek(date: Date): number {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  const checkAndUnlock = useCallback(() => {
    if (!activeProfileId) return

    const stats = buildStats()

    for (const def of ACHIEVEMENTS) {
      if (def.condition(stats)) {
        const newlyUnlocked = unlockAchievement(activeProfileId, def.id)
        if (newlyUnlocked) {
          addXP(activeProfileId, def.xp)
          showAchievement(`Achievement: ${def.nameNL}`, `+${def.xp} XP`)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId, getProfileSessions, getPersonalRecords])

  const awardWorkoutXP = useCallback((durationMinutes: number, hasPR: boolean) => {
    if (!activeProfileId) return
    let xp = 25 + Math.floor(durationMinutes * 0.5)
    if (hasPR) xp += 50
    addXP(activeProfileId, xp)
    setTimeout(() => checkAndUnlock(), 500)
  }, [activeProfileId, addXP, checkAndUnlock])

  const progressToNextLevel = nextLevel
    ? Math.round(((profileXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100)
    : 100

  return {
    profileXP,
    profileAchievements,
    currentLevel,
    nextLevel,
    progressToNextLevel,
    awardWorkoutXP,
    checkAndUnlock,
    allAchievements: ACHIEVEMENTS,
    unlockedCount: profileAchievements.length,
  }
}

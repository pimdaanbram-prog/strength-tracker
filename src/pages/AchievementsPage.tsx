import { motion } from 'framer-motion'
import { Trophy, Zap, Lock, Star } from 'lucide-react'
import { useGamification } from '../hooks/useGamification'
import { ACHIEVEMENTS, type AchievementCategory } from '../data/achievements'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  workouts: 'Trainingen',
  streak: 'Streaks',
  volume: 'Volume',
  prs: "PR's",
  social: 'Sociaal',
  special: 'Speciaal',
}

const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  workouts: '#FF5500',
  streak: '#FFB300',
  volume: '#00E5A0',
  prs: '#06b6d4',
  social: '#a855f7',
  special: '#f97316',
}

export default function AchievementsPage() {
  const {
    profileXP,
    profileAchievements,
    currentLevel,
    nextLevel,
    progressToNextLevel,
    unlockedCount,
  } = useGamification()

  const unlockedIds = new Set(profileAchievements.map(a => a.id))
  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))] as AchievementCategory[]

  return (
    <>
      <Header title="Achievements" showBack />
      <PageWrapper>
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Level Card */}
          <motion.div variants={itemVariants} className="mb-6">
            <div
              className="p-5 rounded-2xl relative overflow-hidden"
              style={{
                background: 'var(--theme-bg-card)',
                border: '1px solid var(--theme-border)',
              }}
            >
              {/* Background glow */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, var(--theme-accent-muted) 0%, transparent 70%)',
                  transform: 'translate(30%, -30%)',
                }}
              />
              <div className="relative flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-3xl"
                  style={{ background: 'var(--theme-accent-muted)', border: '2px solid var(--theme-accent)' }}
                >
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-heading tracking-wider" style={{ color: 'var(--theme-accent)' }}>
                      Level {currentLevel.level}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                      {currentLevel.titleNL}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={13} style={{ color: 'var(--theme-accent)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                      {profileXP.toLocaleString()} XP
                    </span>
                    {nextLevel && (
                      <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                        / {nextLevel.minXP.toLocaleString()} voor Level {nextLevel.level}
                      </span>
                    )}
                  </div>
                  {/* XP progress bar */}
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--theme-border)' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNextLevel}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--theme-accent), var(--theme-gradient-text-to))' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-6">
            <div
              className="p-4 rounded-2xl flex items-center gap-3"
              style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(251,191,36,0.15)' }}
              >
                <Trophy size={18} color="#fbbf24" />
              </div>
              <div>
                <p className="text-2xl font-heading m-0" style={{ color: 'var(--theme-text-primary)' }}>
                  {unlockedCount}
                </p>
                <p className="text-xs m-0" style={{ color: 'var(--theme-text-muted)' }}>Unlocked</p>
              </div>
            </div>
            <div
              className="p-4 rounded-2xl flex items-center gap-3"
              style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--theme-accent-muted)' }}
              >
                <Star size={18} style={{ color: 'var(--theme-accent)' }} />
              </div>
              <div>
                <p className="text-2xl font-heading m-0" style={{ color: 'var(--theme-text-primary)' }}>
                  {ACHIEVEMENTS.length}
                </p>
                <p className="text-xs m-0" style={{ color: 'var(--theme-text-muted)' }}>Totaal</p>
              </div>
            </div>
          </motion.div>

          {/* Achievement categories */}
          {categories.map(cat => {
            const catAchievements = ACHIEVEMENTS.filter(a => a.category === cat)
            const catUnlocked = catAchievements.filter(a => unlockedIds.has(a.id)).length
            const color = CATEGORY_COLORS[cat]

            return (
              <motion.div key={cat} variants={itemVariants} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: color }} />
                    <span
                      className="text-[11px] font-bold tracking-widest uppercase"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    {catUnlocked}/{catAchievements.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {catAchievements.map(achievement => {
                    const isUnlocked = unlockedIds.has(achievement.id)
                    const unlockedData = profileAchievements.find(a => a.id === achievement.id)

                    return (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center gap-3 p-4 rounded-2xl"
                        style={{
                          background: isUnlocked
                            ? `color-mix(in srgb, ${color} 8%, var(--theme-bg-card))`
                            : 'var(--theme-bg-card)',
                          border: isUnlocked
                            ? `1px solid ${color}40`
                            : '1px solid var(--theme-border)',
                          opacity: isUnlocked ? 1 : 0.5,
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                          style={{
                            background: isUnlocked ? `${color}20` : 'var(--theme-border)',
                            filter: isUnlocked ? 'none' : 'grayscale(1)',
                          }}
                        >
                          {isUnlocked ? achievement.icon : <Lock size={16} style={{ color: 'var(--theme-text-muted)' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-bold m-0"
                            style={{ color: isUnlocked ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)' }}
                          >
                            {achievement.nameNL}
                          </p>
                          <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                            {achievement.descriptionNL}
                          </p>
                          {isUnlocked && unlockedData && (
                            <p className="text-[10px] m-0 mt-1" style={{ color }}>
                              Behaald op {new Date(unlockedData.unlockedAt).toLocaleDateString('nl-NL')}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          <Zap size={11} style={{ color: isUnlocked ? '#fbbf24' : 'var(--theme-text-muted)' }} />
                          <span
                            className="text-xs font-bold"
                            style={{ color: isUnlocked ? '#fbbf24' : 'var(--theme-text-muted)' }}
                          >
                            {achievement.xp}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}

        </motion.div>
      </PageWrapper>
    </>
  )
}

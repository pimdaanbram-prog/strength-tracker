import { useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Trophy, Dumbbell, Calendar, Target } from 'lucide-react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { useLanguage } from '../hooks/useLanguage'
import { getWeekNumber, getYear } from '../utils/weekUtils'
import type { WorkoutSession } from '../hooks/useWorkouts'

// ─── Helper ────────────────────────────────────────────────────────────
function sumVolume(sessions: WorkoutSession[]): number {
  return sessions.reduce(
    (total, s) =>
      total +
      s.exercises.reduce(
        (et, ex) =>
          et + ex.sets.reduce((st, set) => st + (set.weight ?? 0) * (set.reps ?? 0), 0),
        0,
      ),
    0,
  )
}

const DAY_LABELS = ['M', 'D', 'W', 'D', 'V', 'Z', 'Z']

// ─── 3D transform per offset ───────────────────────────────────────────
function cardTransform(offset: number): string {
  if (offset === 0) return 'translateX(0%) rotateY(0deg) scale(1)'
  const tx = offset < 0 ? -85 : 85
  const ry = offset < 0 ? 28 : -28
  return `translateX(${tx}%) rotateY(${ry}deg) scale(0.84)`
}

// ─── Main component ────────────────────────────────────────────────────
export default function StatCarousel() {
  const [active, setActive] = useState(0)
  const touchStartX = useRef(0)

  const { getProfileSessions, getStreak, getPersonalRecords } = useWorkouts()
  const { getExercise } = useExercises()
  const { exName } = useLanguage()

  const sessions = getProfileSessions()
  const streak = getStreak()
  const prs = getPersonalRecords()

  const now = new Date()
  const thisWeek = getWeekNumber(now)
  const thisYear = getYear(now)

  // ── Card 1: Streak ────────────────────────────────────────────────────
  const longestStreak = useMemo(() => {
    if (sessions.length === 0) return 0
    const weekSet = new Set(sessions.map(s => `${s.year}-${s.weekNumber}`))
    let max = 0
    let cur = 0
    let wk = thisWeek
    let yr = thisYear
    for (let i = 0; i < 104; i++) {
      if (weekSet.has(`${yr}-${wk}`)) { cur++; max = Math.max(max, cur) }
      else { cur = 0 }
      wk--
      if (wk <= 0) { wk = 52; yr-- }
    }
    return max
  }, [sessions, thisWeek, thisYear])

  // ── Card 2: Weekly volume + sparkline ─────────────────────────────────
  const weekVolumes = useMemo(() => {
    return [3, 2, 1, 0].map(offset => {
      let wk = thisWeek - offset
      let yr = thisYear
      if (wk <= 0) { wk += 52; yr-- }
      return sumVolume(sessions.filter(s => s.weekNumber === wk && s.year === yr))
    })
  }, [sessions, thisWeek, thisYear])

  const thisWeekVol = weekVolumes[3]
  const lastWeekVol = weekVolumes[2]
  const volPctChange = lastWeekVol > 0
    ? Math.round(((thisWeekVol - lastWeekVol) / lastWeekVol) * 100)
    : null

  // ── Card 3: Favourite exercise ────────────────────────────────────────
  const { favExId, favCount, favBestWeight } = useMemo(() => {
    const counts: Record<string, { count: number; bestWeight: number }> = {}
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        if (!counts[ex.exerciseId]) counts[ex.exerciseId] = { count: 0, bestWeight: 0 }
        counts[ex.exerciseId].count++
        const maxW = Math.max(0, ...ex.sets.map(set => set.weight ?? 0))
        counts[ex.exerciseId].bestWeight = Math.max(counts[ex.exerciseId].bestWeight, maxW)
      })
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count)
    if (!sorted.length) return { favExId: null, favCount: 0, favBestWeight: 0 }
    const [id, data] = sorted[0]
    return { favExId: id, favCount: data.count, favBestWeight: data.bestWeight }
  }, [sessions])

  const favExercise = favExId ? getExercise(favExId) : undefined

  // ── Card 4: Muscle group distribution ────────────────────────────────
  const muscleDistribution = useMemo(() => {
    const volumes: Record<string, number> = {}
    sessions
      .filter(s => s.weekNumber === thisWeek && s.year === thisYear)
      .forEach(s => {
        s.exercises.forEach(ex => {
          const exercise = getExercise(ex.exerciseId)
          const cat = exercise?.category ?? 'Overig'
          const vol = ex.sets.reduce((t, set) => t + (set.weight ?? 0) * (set.reps ?? 0), 0)
          volumes[cat] = (volumes[cat] ?? 0) + vol
        })
      })
    const total = Object.values(volumes).reduce((a, b) => a + b, 0)
    return Object.entries(volumes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, vol]) => ({
        cat,
        vol,
        pct: total > 0 ? (vol / total) * 100 : 0,
      }))
  }, [sessions, thisWeek, thisYear]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Card 5: PRs ───────────────────────────────────────────────────────
  const thisMonthStr = now.toISOString().slice(0, 7)
  const prsThisMonth = prs.filter(pr => pr.date.startsWith(thisMonthStr)).length
  const latestPR = prs[0]
  const latestPRExercise = latestPR ? getExercise(latestPR.exerciseId) : undefined

  // ── Card 6: Heatmap + avg per week ───────────────────────────────────
  const heatmap = useMemo(() => {
    const dates = new Set(sessions.map(s => s.date))
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (27 - i))
      return dates.has(d.toISOString().split('T')[0])
    })
  }, [sessions])

  const avgPerWeek = useMemo(() => {
    if (sessions.length === 0) return '0'
    const first = new Date(
      sessions.slice().sort((a, b) => a.date.localeCompare(b.date))[0].date,
    )
    const weeks = Math.max(1, Math.ceil((now.getTime() - first.getTime()) / (7 * 24 * 3600 * 1000)))
    return (sessions.length / weeks).toFixed(1)
  }, [sessions]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Touch handlers ────────────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (dx > 50 && active < CARDS.length - 1) setActive(a => a + 1)
    if (dx < -50 && active > 0) setActive(a => a - 1)
  }

  // ── Card content definitions ──────────────────────────────────────────
  const maxVol = Math.max(...weekVolumes, 1)

  const CARDS = [
    // 1 — Streak
    {
      id: 'streak',
      el: (
        <div
          className="h-full rounded-3xl flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-card), var(--theme-bg-secondary))',
            border: '1px solid var(--theme-border)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 40%, var(--theme-accent-muted), transparent 65%)' }} />
          <div className="text-5xl mb-2 relative">🔥</div>
          <div className="text-8xl font-heading leading-none mb-1 relative"
            style={{ color: 'var(--theme-accent)', textShadow: '0 0 40px var(--theme-accent-glow)' }}>
            {streak}
          </div>
          <div className="text-base font-bold mb-5 relative" style={{ color: 'var(--theme-text-primary)' }}>
            Weken streak
          </div>
          <div
            className="px-4 py-2 rounded-full text-xs font-semibold relative"
            style={{ background: 'var(--theme-accent-muted)', color: 'var(--theme-accent)' }}
          >
            🏆 Langste: {longestStreak} weken
          </div>
        </div>
      ),
    },

    // 2 — Volume
    {
      id: 'volume',
      el: (
        <div
          className="h-full rounded-3xl px-5 py-6 flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-card), var(--theme-bg-secondary))',
            border: '1px solid var(--theme-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--theme-accent-muted)' }}>
              <TrendingUp size={15} style={{ color: 'var(--theme-accent)' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--theme-text-muted)' }}>
              Volume deze week
            </span>
          </div>

          <div className="mb-0.5">
            <span className="text-5xl font-heading" style={{ color: 'var(--theme-text-primary)' }}>
              {thisWeekVol >= 1000
                ? `${(thisWeekVol / 1000).toFixed(1)}k`
                : thisWeekVol.toFixed(0)}
            </span>
            <span className="text-lg ml-1" style={{ color: 'var(--theme-text-muted)' }}>kg</span>
          </div>

          {volPctChange !== null && (
            <div className="text-xs font-semibold mb-4"
              style={{ color: volPctChange >= 0 ? 'var(--theme-success)' : 'var(--theme-error)' }}>
              {volPctChange >= 0 ? '+' : ''}{volPctChange}% vs vorige week
            </div>
          )}

          {/* Sparkline */}
          <div className="mt-auto">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--theme-text-muted)' }}>
              Afgelopen 4 weken
            </p>
            <div className="flex items-end gap-1.5 h-14">
              {weekVolumes.map((vol, i) => (
                <div key={i} className="flex-1 flex flex-col gap-0.5">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${Math.max(8, (vol / maxVol) * 56)}px`,
                      background: i === 3
                        ? 'var(--theme-accent)'
                        : 'var(--theme-border-subtle)',
                      opacity: i === 3 ? 1 : 0.4 + i * 0.12,
                      transition: 'height 0.5s ease',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-1">
              {['W-3', 'W-2', 'W-1', 'Nu'].map((lbl, i) => (
                <div key={i} className="flex-1 text-center text-[9px] font-semibold"
                  style={{ color: i === 3 ? 'var(--theme-accent)' : 'var(--theme-text-muted)' }}>
                  {lbl}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },

    // 3 — Favourite exercise
    {
      id: 'fav',
      el: (
        <div
          className="h-full rounded-3xl px-5 py-6 flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-card), var(--theme-bg-secondary))',
            border: '1px solid var(--theme-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--theme-accent-muted)' }}>
              <Dumbbell size={15} style={{ color: 'var(--theme-accent)' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--theme-text-muted)' }}>
              Favoriete oefening
            </span>
          </div>

          {favExercise ? (
            <>
              <div className="text-lg font-bold leading-snug mb-2"
                style={{ color: 'var(--theme-text-primary)' }}>
                {exName(favExercise)}
              </div>
              <div
                className="inline-block self-start px-3 py-0.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: 'var(--theme-accent-muted)', color: 'var(--theme-accent)' }}
              >
                {favExercise.category}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                {[
                  { label: 'Keer gedaan', value: `${favCount}×` },
                  { label: 'Beste gewicht', value: favBestWeight > 0 ? `${favBestWeight} kg` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl p-3"
                    style={{ background: 'var(--theme-bg-input)', border: '1px solid var(--theme-border)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                      style={{ color: 'var(--theme-text-muted)' }}>{label}</p>
                    <p className="text-2xl font-heading" style={{ color: 'var(--theme-accent)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              Nog geen trainingen geregistreerd
            </p>
          )}
        </div>
      ),
    },

    // 4 — Muscle groups
    {
      id: 'muscles',
      el: (
        <div
          className="h-full rounded-3xl px-5 py-6 flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-card), var(--theme-bg-secondary))',
            border: '1px solid var(--theme-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--theme-accent-muted)' }}>
              <Target size={15} style={{ color: 'var(--theme-accent)' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--theme-text-muted)' }}>
              Spiergroepen week
            </span>
          </div>

          {muscleDistribution.length > 0 ? (
            <div className="space-y-3 flex-1">
              {muscleDistribution.map(({ cat, pct }, i) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                      {cat}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--theme-border)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                      style={{
                        background: 'linear-gradient(90deg, var(--theme-accent), var(--theme-gradient-text-to))',
                        opacity: 1 - i * 0.1,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              Train deze week om je verdeling te zien
            </p>
          )}
        </div>
      ),
    },

    // 5 — Personal records
    {
      id: 'prs',
      el: (
        <div
          className="h-full rounded-3xl px-5 py-6 flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-card), var(--theme-bg-secondary))',
            border: '1px solid var(--theme-border)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 70%, var(--theme-accent-muted), transparent 70%)' }} />

          <div className="flex items-center gap-2 mb-3 relative">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--theme-accent-muted)' }}>
              <Trophy size={15} style={{ color: 'var(--theme-accent)' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--theme-text-muted)' }}>
              Persoonlijke records
            </span>
          </div>

          <div className="flex items-end gap-2 mb-1 relative">
            <span className="text-7xl font-heading leading-none"
              style={{ color: 'var(--theme-accent)', textShadow: '0 0 32px var(--theme-accent-glow)' }}>
              {prsThisMonth}
            </span>
            <span className="text-sm font-semibold mb-1.5" style={{ color: 'var(--theme-text-secondary)' }}>
              PR's<br />deze maand
            </span>
          </div>

          <div className="text-xs mb-4 relative" style={{ color: 'var(--theme-text-muted)' }}>
            {prs.length} PR's in totaal
          </div>

          {latestPR && (
            <div className="rounded-2xl p-3 relative mt-auto"
              style={{ background: 'var(--theme-bg-input)', border: '1px solid var(--theme-border)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'var(--theme-text-muted)' }}>
                Laatste PR
              </p>
              <p className="text-sm font-semibold truncate mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                {exName(latestPRExercise) || latestPR.exerciseId}
              </p>
              <p className="text-2xl font-heading" style={{ color: 'var(--theme-accent)' }}>
                {latestPR.weight} kg
              </p>
            </div>
          )}

          {!prs.length && (
            <p className="text-sm relative" style={{ color: 'var(--theme-text-muted)' }}>
              Nog geen PR's geregistreerd
            </p>
          )}
        </div>
      ),
    },

    // 6 — Heatmap
    {
      id: 'heatmap',
      el: (
        <div
          className="h-full rounded-3xl px-5 py-6 flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-card), var(--theme-bg-secondary))',
            border: '1px solid var(--theme-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--theme-accent-muted)' }}>
              <Calendar size={15} style={{ color: 'var(--theme-accent)' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--theme-text-muted)' }}>
              Trainingsfrequentie
            </span>
          </div>

          <div className="flex items-end gap-1.5 mb-4">
            <span className="text-4xl font-heading leading-none" style={{ color: 'var(--theme-accent)' }}>
              {avgPerWeek}
            </span>
            <span className="text-xs font-semibold mb-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
              workouts/week
            </span>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {DAY_LABELS.map((lbl, i) => (
              <div key={i} className="text-center text-[9px] font-bold"
                style={{ color: 'var(--theme-text-muted)' }}>
                {lbl}
              </div>
            ))}
          </div>

          {/* 4 rows × 7 cols heatmap */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {heatmap.map((hasSession, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01, type: 'spring', damping: 20, stiffness: 300 }}
                className="rounded-sm"
                style={{
                  background: hasSession ? 'var(--theme-accent)' : 'var(--theme-border)',
                  boxShadow: hasSession ? '0 0 6px var(--theme-accent-glow)' : 'none',
                  minHeight: 0,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px]" style={{ color: 'var(--theme-text-muted)' }}>4 weken geleden</span>
            <span className="text-[9px]" style={{ color: 'var(--theme-text-muted)' }}>vandaag</span>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="mb-8">
      {/* 3D carousel */}
      <div
        className="-mx-4 overflow-hidden"
        style={{ height: 272 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-full mx-4" style={{ perspective: '1200px' }}>
          {CARDS.map((card, i) => {
            const offset = i - active
            if (Math.abs(offset) > 1) return null
            return (
              <div
                key={card.id}
                onClick={() => {
                  if (offset < 0) setActive(a => Math.max(0, a - 1))
                  if (offset > 0) setActive(a => Math.min(CARDS.length - 1, a + 1))
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  marginLeft: '-41%',
                  width: '82%',
                  height: '100%',
                  transform: cardTransform(offset),
                  opacity: offset === 0 ? 1 : 0.55,
                  zIndex: offset === 0 ? 10 : 5,
                  transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s ease',
                  cursor: offset !== 0 ? 'pointer' : 'default',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                {card.el}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="border-0 p-0 cursor-pointer"
            style={{
              width: i === active ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: i === active ? 'var(--theme-accent)' : 'var(--theme-border-subtle)',
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

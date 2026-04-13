import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useExercises } from '../hooks/useExercises'
import { useWorkouts } from '../hooks/useWorkouts'
import { useLanguage } from '../hooks/useLanguage'

const CATEGORY_CONFIG: Record<string, { className: string; icon: string; label: string }> = {
  'Chest':         { className: 'cat-chest',     icon: '🫁', label: 'Borst' },
  'Back':          { className: 'cat-back',      icon: '🔙', label: 'Rug' },
  'Shoulders':     { className: 'cat-shoulders', icon: '⚡', label: 'Schouders' },
  'Arms - Biceps': { className: 'cat-arms',      icon: '💪', label: 'Biceps' },
  'Arms - Triceps':{ className: 'cat-arms',      icon: '🦾', label: 'Triceps' },
  'Legs':          { className: 'cat-legs',      icon: '🦵', label: 'Benen' },
  'Glutes':        { className: 'cat-glutes',    icon: '🍑', label: 'Billen' },
  'Core':          { className: 'cat-core',      icon: '🎯', label: 'Core' },
  'Full Body':     { className: 'cat-full',      icon: '⚡', label: 'Full Body' },
}

const DIFFICULTY_STYLE = {
  beginner:     { color: '#00E5A0', bg: 'rgba(0,229,160,0.1)',  label: 'Beginner' },
  intermediate: { color: '#FFB300', bg: 'rgba(255,179,0,0.1)', label: 'Gemiddeld' },
  advanced:     { color: '#FF3B3B', bg: 'rgba(255,59,59,0.1)', label: 'Gevorderd' },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
}

export default function ExercisesPage() {
  const navigate = useNavigate()
  const { exercises, categories, exercisesByCategory } = useExercises()
  const { getPersonalRecords, getLastExerciseSets } = useWorkouts()
  const { exName } = useLanguage()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const prs = useMemo(() => {
    const records = getPersonalRecords()
    return Object.fromEntries(records.map(r => [r.exerciseId, r]))
  }, [getPersonalRecords])

  const filtered = useMemo(() => {
    let result = exercises
    if (activeCategory) result = exercisesByCategory[activeCategory] || []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        e => e.name.toLowerCase().includes(q) || e.nameNL.toLowerCase().includes(q) ||
             e.musclesWorked.some(m => m.toLowerCase().includes(q))
      )
    }
    return result
  }, [exercises, activeCategory, search, exercisesByCategory])

  return (
    <>
      <Header title="OEFENINGEN" />
      <PageWrapper>

        {/* ─── Stats strip ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-5"
        >
          {[
            { label: 'Oefeningen', value: exercises.length, color: '#FF5500' },
            { label: 'Categorieën', value: categories.length, color: '#818CF8' },
            { label: 'PR\'s gehaald', value: Object.keys(prs).length, color: '#00E5A0' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}>
              <p className="text-xl font-heading tracking-wider m-0" style={{ color }}>{value}</p>
              <p className="text-[10px] m-0 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── Search ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-4"
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek oefening, spiergroep..."
            className="input-premium"
            style={{ paddingLeft: 44 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-0 text-xs px-1.5 py-0.5 rounded-lg"
              style={{ color: 'var(--theme-text-secondary)', background: 'var(--theme-border)' }}
            >✕</button>
          )}
        </motion.div>

        {/* ─── Category chips ───────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="flex gap-2 overflow-x-auto pb-3 mb-5 hide-scrollbar"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border-0 transition-all"
            style={!activeCategory
              ? { background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))', color: '#fff', boxShadow: 'var(--theme-accent-glow) 0 4px 12px' }
              : { background: 'var(--theme-bg-card)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }
            }
          >
            Alle
          </button>
          {categories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat]
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border-0 transition-all"
                style={isActive
                  ? { background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))', color: '#fff', boxShadow: 'var(--theme-accent-glow) 0 4px 12px' }
                  : { background: 'var(--theme-bg-card)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }
                }
              >
                {cfg?.icon || '🏋️'} {cfg?.label || cat}
              </button>
            )
          })}
        </motion.div>

        {/* ─── Category hero (when selected) ───── */}
        <AnimatePresence>
          {activeCategory && CATEGORY_CONFIG[activeCategory] && (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div
                className={`rounded-2xl p-5 relative overflow-hidden ${CATEGORY_CONFIG[activeCategory].className}`}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
                <div className="relative">
                  <p className="text-4xl mb-1">{CATEGORY_CONFIG[activeCategory].icon}</p>
                  <h3 className="text-3xl tracking-wider m-0">{CATEGORY_CONFIG[activeCategory].label}</h3>
                  <p className="text-xs m-0 mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {filtered.length} oefeningen
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Exercise list ────────────────────── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold mb-1" style={{ color: 'var(--theme-text-secondary)' }}>Geen oefeningen gevonden</p>
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Probeer een andere zoekterm</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeCategory}-${search}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {filtered.map(exercise => {
              const pr = prs[exercise.id]
              const lastSession = pr ? getLastExerciseSets(exercise.id) : null
              const diff = DIFFICULTY_STYLE[exercise.difficulty]
              const cat = CATEGORY_CONFIG[exercise.category]

              return (
                <motion.button
                  key={exercise.id}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/exercises/${exercise.id}`)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer border-0 text-left transition-colors"
                  style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
                >
                  {/* Category color swatch */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg ${cat?.className || 'gradient-workout-a'}`}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                  >
                    {cat?.icon || '🏋️'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate m-0" style={{ color: 'var(--theme-text-primary)' }}>
                      {exName(exercise)}
                    </p>
                    <p className="text-xs m-0 mt-0.5 truncate" style={{ color: 'var(--theme-text-secondary)' }}>
                      {exercise.equipment} · {exercise.musclesWorked.slice(0, 2).join(', ')}
                    </p>
                    {lastSession && lastSession.maxWeight > 0 && (
                      <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                        Laatste: <span style={{ color: 'var(--theme-text-secondary)' }}>{lastSession.maxWeight}kg × {lastSession.maxReps}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {pr && (
                      <div className="flex items-center gap-1">
                        <Trophy size={11} style={{ color: 'var(--theme-warning)' }} />
                        <span className="text-xs font-bold" style={{ color: 'var(--theme-warning)' }}>{pr.weight}kg</span>
                      </div>
                    )}
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: diff.bg, color: diff.color }}
                    >
                      {diff.label}
                    </span>
                    {exercise.isCompound && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,179,0,0.1)', color: '#FFB300' }}>
                        Compound
                      </span>
                    )}
                  </div>

                  <ChevronRight size={14} style={{ color: 'var(--theme-text-muted)', marginLeft: 2 }} />
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </PageWrapper>
    </>
  )
}

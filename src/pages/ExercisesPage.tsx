import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AmbientBackground from '../components/ui/AmbientBackground'
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

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
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
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) || e.nameNL.toLowerCase().includes(q) ||
        e.musclesWorked.some(m => m.toLowerCase().includes(q))
      )
    }
    return result
  }, [exercises, activeCategory, search, exercisesByCategory])

  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
      <AmbientBackground intensity={0.5} />
      <div className="relative z-10">

        {/* ── Sticky glass header with search ───────────────────────────── */}
        <div className="sticky top-0 z-40"
          style={{ background: 'rgba(6,6,10,0.75)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderBottom: '1px solid var(--theme-glass-border)' }}>
          <div className="max-w-lg mx-auto px-4 pt-3.5 pb-3">
            <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)', display: 'block', marginBottom: 10 }}>Oefeningen</span>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--theme-text-muted)', pointerEvents: 'none' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Zoek oefening, spiergroep..."
                style={{ width: '100%', paddingLeft: 42, paddingRight: search ? 42 : 16, paddingTop: 10, paddingBottom: 10, fontSize: 13, background: 'var(--theme-glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--theme-glass-border)', borderRadius: 14, color: 'var(--theme-text-primary)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'var(--theme-glass-border)', border: 0, color: 'var(--theme-text-secondary)', fontSize: 11, padding: '2px 6px', borderRadius: 6 }}>✕</button>
              )}
            </div>
          </div>

          {/* Category chips */}
          <div className="max-w-lg mx-auto px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveCategory(null)}
              style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: !activeCategory ? 'var(--theme-accent-grad)' : 'var(--theme-glass)',
                color: !activeCategory ? '#fff' : 'var(--theme-text-secondary)',
                boxShadow: !activeCategory ? '0 4px 12px var(--theme-accent-glow)' : 'none',
                border: !activeCategory ? 'none' : '1px solid var(--theme-glass-border)' }}>
              Alle
            </button>
            {categories.map(cat => {
              const cfg = CATEGORY_CONFIG[cat]
              const isActive = activeCategory === cat
              return (
                <button key={cat} onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    background: isActive ? 'var(--theme-accent-grad)' : 'var(--theme-glass)',
                    color: isActive ? '#fff' : 'var(--theme-text-secondary)',
                    boxShadow: isActive ? '0 4px 12px var(--theme-accent-glow)' : 'none',
                    border: isActive ? 'none' : '1px solid var(--theme-glass-border)' }}>
                  {cfg?.icon || '🏋️'} {cfg?.label || cat}
                </button>
              )
            })}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-4"
          style={{ paddingBottom: 'calc(max(4.5rem, env(safe-area-inset-bottom)) + 4rem)' }}>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Oefeningen',   value: exercises.length,          color: 'var(--theme-accent)' },
              { label: 'Categorieën',  value: categories.length,         color: '#818CF8' },
              { label: "PR's gehaald", value: Object.keys(prs).length,   color: '#00E5A0' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, borderRadius: 16, padding: '12px 10px', textAlign: 'center', background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)' }}>
                <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color }}>{value}</div>
                <div style={{ fontSize: 9, color: 'var(--theme-text-muted)', marginTop: 4, fontFamily: 'var(--theme-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </motion.div>

          {/* Category hero (when selected) */}
          <AnimatePresence>
            {activeCategory && CATEGORY_CONFIG[activeCategory] && (
              <motion.div key={activeCategory} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 16, overflow: 'hidden' }}>
                <div className={`rounded-2xl p-5 relative overflow-hidden ${CATEGORY_CONFIG[activeCategory].className}`}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
                  <div style={{ position: 'relative' }}>
                    <p style={{ fontSize: 40, marginBottom: 4 }}>{CATEGORY_CONFIG[activeCategory].icon}</p>
                    <h3 style={{ fontSize: 28, margin: 0, fontFamily: 'var(--theme-font-display)', fontWeight: 700 }}>{CATEGORY_CONFIG[activeCategory].label}</h3>
                    <p style={{ fontSize: 11, margin: '4px 0 0', color: 'rgba(255,255,255,0.5)' }}>{filtered.length} oefeningen</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exercise list */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ fontWeight: 600, color: 'var(--theme-text-secondary)', marginBottom: 4 }}>Geen oefeningen gevonden</p>
              <p style={{ fontSize: 13, color: 'var(--theme-text-muted)' }}>Probeer een andere zoekterm</p>
            </motion.div>
          ) : (
            <motion.div key={`${activeCategory}-${search}`}
              variants={containerVariants} initial="hidden" animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(exercise => {
                const pr = prs[exercise.id]
                const lastSession = pr ? getLastExerciseSets(exercise.id) : null
                const diff = DIFFICULTY_STYLE[exercise.difficulty]
                const cat = CATEGORY_CONFIG[exercise.category]

                return (
                  <motion.button key={exercise.id} variants={itemVariants}
                    whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/exercises/${exercise.id}`)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 18, cursor: 'pointer', border: '1px solid var(--theme-glass-border)', textAlign: 'left', background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--theme-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--theme-glass-border)')}>
                    {/* Icon tile */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg ${cat?.className || 'gradient-workout-a'}`}
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                      {cat?.icon || '🏋️'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exName(exercise)}
                      </p>
                      <p style={{ fontSize: 11, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--theme-text-secondary)' }}>
                        {exercise.equipment} · {exercise.musclesWorked.slice(0, 2).join(', ')}
                      </p>
                      {lastSession && lastSession.maxWeight > 0 && (
                        <p style={{ fontSize: 10, margin: '2px 0 0', color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)' }}>
                          {lastSession.maxWeight}kg × {lastSession.maxReps}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      {pr && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Trophy size={10} style={{ color: 'var(--theme-warning)' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--theme-warning)', fontFamily: 'var(--theme-font-mono)' }}>{pr.weight}kg</span>
                        </div>
                      )}
                      <span style={{ fontSize: 9.5, padding: '3px 8px', borderRadius: 999, fontWeight: 600, background: diff.bg, color: diff.color }}>{diff.label}</span>
                      {exercise.isCompound && (
                        <span style={{ fontSize: 8.5, padding: '2px 6px', borderRadius: 999, background: 'rgba(255,179,0,0.1)', color: '#FFB300' }}>Compound</span>
                      )}
                    </div>

                    <ChevronRight size={13} style={{ color: 'var(--theme-text-muted)', marginLeft: 2 }} />
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

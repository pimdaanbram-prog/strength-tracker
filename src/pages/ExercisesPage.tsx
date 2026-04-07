import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useExercises } from '../hooks/useExercises'
import { useWorkouts } from '../hooks/useWorkouts'
import { useLanguage } from '../hooks/useLanguage'

const categoryEmojis: Record<string, string> = {
  'Borst': '🫁',
  'Rug': '🔙',
  'Schouders': '💪',
  'Biceps': '💪',
  'Triceps': '🦾',
  'Benen': '🦵',
  'Billen': '🍑',
  'Core / Abs': '🎯',
  'Full Body': '⚡',
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
    if (activeCategory) {
      result = exercisesByCategory[activeCategory] || []
    }
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
        {/* Search */}
        <div className="flex items-center gap-2 bg-bg-input border border-border rounded-xl px-3 py-2.5 mb-4">
          <Search size={16} className="text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek oefening..."
            className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              !activeCategory ? 'bg-accent text-white' : 'bg-bg-card text-text-muted border border-border hover:text-text-secondary'
            }`}
          >
            Alle ({exercises.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                activeCategory === cat
                  ? 'bg-accent text-white'
                  : 'bg-bg-card text-text-muted border border-border hover:text-text-secondary'
              }`}
            >
              {categoryEmojis[cat] || '🏋️'} {cat}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div className="space-y-1">
          {filtered.map((exercise, i) => {
            const pr = prs[exercise.id]
            const lastSession = pr ? getLastExerciseSets(exercise.id) : null
            return (
              <motion.button
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                onClick={() => navigate(`/exercises/${exercise.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-card transition-colors cursor-pointer text-left bg-transparent border-0"
              >
                <div className="w-10 h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center text-sm shrink-0">
                  {categoryEmojis[exercise.category] || '🏋️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-medium truncate m-0">
                    {exName(exercise)}
                  </p>
                  <p className="text-xs text-text-muted m-0 mt-0.5">
                    {exercise.equipment} · {exercise.musclesWorked.slice(0, 2).join(', ')}
                  </p>
                  {lastSession && lastSession.maxWeight > 0 && (
                    <p className="text-xs text-text-secondary m-0 mt-0.5">
                      Laatste: {lastSession.maxWeight}kg × {lastSession.maxReps} · {lastSession.date.slice(5)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {pr && (
                    <div className="flex items-center gap-1">
                      <Trophy size={11} className="text-warning" />
                      <span className="text-xs font-semibold text-warning">{pr.weight}kg</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exercise.difficulty === 'beginner' ? 'bg-success/15 text-success' :
                      exercise.difficulty === 'intermediate' ? 'bg-warning/15 text-warning' :
                      'bg-danger/15 text-danger'
                    }`}>
                      {exercise.difficulty}
                    </span>
                    <ChevronRight size={14} className="text-text-muted" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted">Geen oefeningen gevonden</p>
          </div>
        )}
      </PageWrapper>
    </>
  )
}

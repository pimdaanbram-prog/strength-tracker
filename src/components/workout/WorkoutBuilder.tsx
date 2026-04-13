import { useState, useMemo } from 'react'
import { Search, Plus, X, LayoutGrid } from 'lucide-react'
import { motion } from 'framer-motion'
import { useExercises } from '../../hooks/useExercises'
import { useLanguage } from '../../hooks/useLanguage'
import { workoutTemplates } from '../../data/workoutTemplates'
import type { Exercise } from '../../data/exercises'

interface WorkoutBuilderProps {
  isOpen: boolean
  onClose: () => void
  onAddExercise: (exercise: Exercise) => void
  onAddMultipleExercises: (exercises: Exercise[]) => void
  selectedIds: string[]
}

type Tab = 'exercises' | 'templates'

export default function WorkoutBuilder({
  isOpen,
  onClose,
  onAddExercise,
  onAddMultipleExercises,
  selectedIds,
}: WorkoutBuilderProps) {
  const { exercises, categories } = useExercises()
  const { exName } = useLanguage()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('exercises')

  const filtered = useMemo(() => {
    let result = exercises
    if (activeCategory) {
      result = result.filter(e => e.category === activeCategory)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        e => e.name.toLowerCase().includes(q) || e.nameNL.toLowerCase().includes(q) || exName(e).toLowerCase().includes(q) || e.musclesWorked.some(m => m.toLowerCase().includes(q))
      )
    }
    return result
  }, [exercises, activeCategory, search])

  if (!isOpen) return null

  const handleAddTemplate = (templateId: string) => {
    const template = workoutTemplates.find(t => t.id === templateId)
    if (!template) return
    const toAdd = template.exercises
      .map(te => exercises.find(e => e.id === te.exerciseId))
      .filter((e): e is Exercise => e !== undefined && !selectedIds.includes(e.id))
    if (toAdd.length > 0) {
      onAddMultipleExercises(toAdd)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-bg-secondary rounded-t-2xl border-t border-border overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg tracking-wider text-text-primary m-0">OEFENING TOEVOEGEN</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl cursor-pointer">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1.5 px-5 pt-4 pb-2">
          <button
            onClick={() => setTab('exercises')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              tab === 'exercises' ? 'bg-accent text-white' : 'bg-bg-input text-text-muted hover:text-text-secondary'
            }`}
          >
            <Search size={12} /> Oefeningen
          </button>
          <button
            onClick={() => setTab('templates')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              tab === 'templates' ? 'bg-accent text-white' : 'bg-bg-input text-text-muted hover:text-text-secondary'
            }`}
          >
            <LayoutGrid size={12} /> Templates
          </button>
        </div>

        {tab === 'exercises' && (
          <>
            {/* Search */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2 bg-bg-input border border-border rounded-xl px-4 py-3">
                <Search size={16} className="text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Zoek oefening..."
                  className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
                  autoFocus
                />
              </div>
            </div>

            {/* Category filters */}
            <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                  !activeCategory ? 'bg-accent text-white' : 'bg-bg-input text-text-muted hover:text-text-secondary'
                }`}
              >
                Alles
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                    activeCategory === cat ? 'bg-accent text-white' : 'bg-bg-input text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-1">
              {filtered.map(exercise => {
                const isSelected = selectedIds.includes(exercise.id)
                return (
                  <button
                    key={exercise.id}
                    onClick={() => !isSelected && onAddExercise(exercise)}
                    disabled={isSelected}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-accent/10 opacity-50'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate m-0">{exName(exercise)}</p>
                      <p className="text-xs text-text-muted m-0 mt-0.5">
                        {exercise.equipment} · {exercise.musclesWorked.slice(0, 3).join(', ')}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="text-xs text-accent">Toegevoegd</span>
                    ) : (
                      <Plus size={16} className="text-text-muted shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {tab === 'templates' && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            <p className="text-xs text-text-muted mb-3">
              Voeg alle oefeningen uit een template in één keer toe aan je training.
            </p>
            {workoutTemplates.map(template => {
              const newExercises = template.exercises
                .filter(te => !selectedIds.includes(te.exerciseId))
              const alreadyAll = newExercises.length === 0
              return (
                <button
                  key={template.id}
                  onClick={() => !alreadyAll && handleAddTemplate(template.id)}
                  disabled={alreadyAll}
                  className={`w-full p-4 bg-bg-card border rounded-xl text-left transition-colors cursor-pointer ${
                    alreadyAll
                      ? 'border-border opacity-50'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary m-0">{exName(template)}</p>
                      <p className="text-xs text-text-muted m-0 mt-0.5">
                        {template.exercises.length} oefeningen · ~{template.estimatedMinutes}min · {template.difficulty}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.exercises.slice(0, 4).map(te => {
                          const ex = exercises.find(e => e.id === te.exerciseId)
                          const isAdded = selectedIds.includes(te.exerciseId)
                          return ex ? (
                            <span
                              key={te.exerciseId}
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                isAdded ? 'bg-success/10 text-success' : 'bg-bg-input text-text-muted'
                              }`}
                            >
                              {exName(ex)}
                            </span>
                          ) : null
                        })}
                        {template.exercises.length > 4 && (
                          <span className="text-xs text-text-muted">+{template.exercises.length - 4} meer</span>
                        )}
                      </div>
                    </div>
                    {alreadyAll ? (
                      <span className="text-xs text-success shrink-0 ml-2">Alles al toegevoegd</span>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0 ml-2 text-accent">
                        <Plus size={14} />
                        <span className="text-xs">{newExercises.length} oef.</span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

import { useState, useMemo } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useExercises } from '../../hooks/useExercises'
import type { Exercise } from '../../data/exercises'

interface WorkoutBuilderProps {
  isOpen: boolean
  onClose: () => void
  onAddExercise: (exercise: Exercise) => void
  selectedIds: string[]
}

export default function WorkoutBuilder({ isOpen, onClose, onAddExercise, selectedIds }: WorkoutBuilderProps) {
  const { exercises, categories } = useExercises()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = exercises
    if (activeCategory) {
      result = result.filter(e => e.category === activeCategory)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        e => e.name.toLowerCase().includes(q) || e.nameNL.toLowerCase().includes(q) || e.musclesWorked.some(m => m.toLowerCase().includes(q))
      )
    }
    return result
  }, [exercises, activeCategory, search])

  if (!isOpen) return null

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
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg tracking-wider text-text-primary m-0">OEFENING TOEVOEGEN</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 bg-bg-input border border-border rounded-xl px-3 py-2">
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
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
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
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {filtered.map(exercise => {
            const isSelected = selectedIds.includes(exercise.id)
            return (
              <button
                key={exercise.id}
                onClick={() => !isSelected && onAddExercise(exercise)}
                disabled={isSelected}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-accent/10 opacity-50'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate m-0">{exercise.nameNL}</p>
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
      </motion.div>
    </motion.div>
  )
}

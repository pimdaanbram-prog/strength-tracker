import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, Save, GripVertical } from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import WorkoutBuilder from '../components/workout/WorkoutBuilder'
import { usePlans } from '../hooks/usePlans'
import { useExercises } from '../hooks/useExercises'
import { useLanguage } from '../hooks/useLanguage'
import type { PlanExercise } from '../hooks/usePlans'
import type { Exercise } from '../data/exercises'

export default function PlanEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { getPlan, savePlan, updatePlan } = usePlans()
  const { getExercise } = useExercises()
  const { exName } = useLanguage()

  const isEditing = Boolean(id)
  const existing = id ? getPlan(id) : null

  const [name, setName] = useState(existing?.name ?? '')
  const [exercises, setExercises] = useState<PlanExercise[]>(existing?.exercises ?? [])
  const [showBuilder, setShowBuilder] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing && !existing) {
      navigate('/plans')
    }
  }, [isEditing, existing, navigate])

  const selectedIds = exercises.map(e => e.exerciseId)

  const handleAddExercise = (exercise: Exercise) => {
    setExercises(prev => [...prev, { exerciseId: exercise.id, sets: exercise.defaultSets }])
    setShowBuilder(false)
  }

  const handleAddMultiple = (exercisesToAdd: Exercise[]) => {
    setExercises(prev => [
      ...prev,
      ...exercisesToAdd.map(e => ({ exerciseId: e.id, sets: e.defaultSets })),
    ])
    setShowBuilder(false)
  }

  const handleRemove = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleSetCount = (index: number, sets: number) => {
    setExercises(prev => {
      const next = [...prev]
      next[index] = { ...next[index], sets: Math.max(1, sets) }
      return next
    })
  }

  const handleSave = () => {
    if (!name.trim()) {
      setError('Geef je training een naam')
      return
    }
    if (exercises.length === 0) {
      setError('Voeg minimaal 1 oefening toe')
      return
    }
    setError('')

    if (isEditing && id) {
      updatePlan(id, { name: name.trim(), exercises })
    } else {
      savePlan({ name: name.trim(), exercises })
    }
    navigate('/plans')
  }

  return (
    <>
      <Header title={isEditing ? 'PLAN BEWERKEN' : 'NIEUW PLAN'} showBack />
      <PageWrapper>
        {/* Plan name */}
        <div className="mb-5">
          <label className="block text-xs text-text-muted mb-1.5 tracking-wider">NAAM</label>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="Bijv. Push dag, Benen + Billen, ..."
            className="w-full bg-bg-input border border-border rounded-xl px-4 py-3.5 text-text-primary text-base outline-none placeholder:text-text-muted focus:border-accent transition-colors"
          />
        </div>

        {/* Exercise list */}
        <div className="mb-4">
          <label className="block text-xs text-text-muted mb-2 tracking-wider">
            OEFENINGEN ({exercises.length})
          </label>

          {exercises.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
              <p className="text-text-muted text-sm">Nog geen oefeningen — voeg er een toe</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exercises.map((pe, i) => {
                const exercise = getExercise(pe.exerciseId)
                if (!exercise) return null
                return (
                  <motion.div
                    key={pe.exerciseId + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl"
                  >
                    <GripVertical size={16} className="text-text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary font-medium truncate m-0">{exName(exercise)}</p>
                      <p className="text-xs text-text-muted m-0 mt-0.5">{exercise.category} · {exercise.equipment}</p>
                    </div>
                    {/* Sets stepper — 44px touch targets */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSetCount(i, pe.sets - 1)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-0 text-base font-bold"
                        style={{ background: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-7 text-center" style={{ color: 'var(--theme-text-primary)' }}>{pe.sets}</span>
                      <button
                        onClick={() => handleSetCount(i, pe.sets + 1)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-0 text-base font-bold"
                        style={{ background: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                      >
                        +
                      </button>
                      <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>sets</span>
                    </div>
                    <button
                      onClick={() => handleRemove(i)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer bg-transparent border-0 shrink-0 transition-colors"
                      style={{ color: 'rgba(255,59,59,0.4)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FF3B3B')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,59,59,0.4)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add exercise */}
        <button
          onClick={() => setShowBuilder(true)}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted hover:text-text-secondary hover:border-border-light transition-colors flex items-center justify-center gap-2 cursor-pointer bg-transparent mb-6"
        >
          <Plus size={18} /> Oefening toevoegen
        </button>

        {/* Error */}
        {error && (
          <p className="text-danger text-sm text-center mb-4">{error}</p>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save size={18} /> {isEditing ? 'Wijzigingen opslaan' : 'Plan opslaan'}
        </button>

        {/* Workout Builder Modal */}
        <AnimatePresence>
          {showBuilder && (
            <WorkoutBuilder
              isOpen={showBuilder}
              onClose={() => setShowBuilder(false)}
              onAddExercise={handleAddExercise}
              onAddMultipleExercises={handleAddMultiple}
              selectedIds={selectedIds}
            />
          )}
        </AnimatePresence>
      </PageWrapper>
    </>
  )
}

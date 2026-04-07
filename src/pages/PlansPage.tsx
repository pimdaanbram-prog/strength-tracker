import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Play, Pencil, Trash2, Users, Dumbbell, ChevronRight } from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { usePlans } from '../hooks/usePlans'
import { useExercises } from '../hooks/useExercises'
import { useAppStore } from '../store/appStore'

export default function PlansPage() {
  const navigate = useNavigate()
  const { getPlans, deletePlan } = usePlans()
  const { getExercise } = useExercises()
  const profiles = useAppStore(s => s.profiles)

  const [plans, setPlans] = useState(() => getPlans())

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" verwijderen?`)) return
    deletePlan(id)
    setPlans(getPlans())
  }

  const handleStartSolo = (planId: string) => {
    navigate('/workout', { state: { planId } })
  }

  const handleStartSamen = (planId: string) => {
    navigate('/workout', { state: { planId, samen: true } })
  }

  return (
    <>
      <Header title="MIJN TRAININGEN" />
      <PageWrapper>
        {/* Create new */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('/plans/new')}
          className="w-full flex items-center gap-3 p-4 mb-6 bg-accent/10 border border-accent/30 rounded-xl hover:border-accent transition-colors cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Plus size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary m-0">Nieuw trainingsplan</p>
            <p className="text-xs text-text-muted m-0 mt-0.5">Stel zelf oefeningen samen</p>
          </div>
          <ChevronRight size={16} className="text-text-muted ml-auto" />
        </motion.button>

        {/* Plans list */}
        {plans.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📋</span>
            <h3 className="text-xl tracking-wider mb-2">GEEN PLANNEN</h3>
            <p className="text-text-secondary text-sm mb-6">
              Maak je eerste trainingsplan — kies oefeningen en sla op voor later
            </p>
            <button
              onClick={() => navigate('/plans/new')}
              className="px-6 py-3 bg-accent text-white rounded-xl font-semibold cursor-pointer"
            >
              Plan maken
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-text-muted tracking-wider mb-2">OPGESLAGEN PLANNEN ({plans.length})</p>
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Plan header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-primary m-0 truncate">{plan.name}</h3>
                      <p className="text-xs text-text-muted m-0 mt-0.5">
                        {plan.exercises.length} oefeningen
                        {plan.lastUsedAt && (
                          <span> · Laatst: {new Date(plan.lastUsedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => navigate(`/plans/${plan.id}/edit`)}
                        className="p-1.5 text-text-muted hover:text-text-secondary transition-colors cursor-pointer bg-transparent border-0"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id, plan.name)}
                        className="p-1.5 text-danger/50 hover:text-danger transition-colors cursor-pointer bg-transparent border-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Exercise previews */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {plan.exercises.slice(0, 5).map(pe => {
                      const ex = getExercise(pe.exerciseId)
                      return ex ? (
                        <span key={pe.exerciseId} className="text-xs px-2 py-0.5 bg-bg-input rounded text-text-secondary">
                          {ex.nameNL}
                        </span>
                      ) : null
                    })}
                    {plan.exercises.length > 5 && (
                      <span className="text-xs text-text-muted">+{plan.exercises.length - 5} meer</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartSolo(plan.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Play size={13} /> Solo starten
                    </button>
                    {profiles.length >= 2 && (
                      <button
                        onClick={() => handleStartSamen(plan.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-bg-input hover:bg-white/10 text-text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-border"
                      >
                        <Users size={13} /> Samen
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/plans/${plan.id}/edit`)}
                      className="p-2 bg-bg-input hover:bg-white/10 text-text-muted rounded-lg transition-colors cursor-pointer border border-border"
                    >
                      <Dumbbell size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </PageWrapper>
    </>
  )
}

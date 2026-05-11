import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Play, Pencil, Trash2, Users, BookMarked, ChevronRight } from 'lucide-react'
import Header from '@/app/layout/Header'
import PageWrapper from '@/app/layout/PageWrapper'
import { usePlans } from '@/features/workouts/hooks/usePlans'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { useAppStore } from '@/shared/lib/store'
import { useLanguage } from '@/shared/hooks/useLanguage'

const PLAN_GRADIENTS = [
  'gradient-workout-a',
  'gradient-workout-b',
  'gradient-workout-c',
  'gradient-workout-d',
  'gradient-workout-e',
  'gradient-workout-f',
]

export default function PlansPage() {
  const navigate = useNavigate()
  const { getPlans, deletePlan } = usePlans()
  const { getExercise } = useExercises()
  const profiles = useAppStore(s => s.profiles)
  const { exName } = useLanguage()

  const [plans, setPlans] = useState(() => getPlans())

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" verwijderen?`)) return
    deletePlan(id)
    setPlans(getPlans())
  }

  return (
    <>
      <Header title="MIJN PLANNEN" />
      <PageWrapper>

        {/* ─── Create new CTA ──────────────────────── */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/plans/new')}
          className="w-full flex items-center gap-3 p-4 mb-6 rounded-2xl cursor-pointer border-0 text-left relative overflow-hidden"
          style={{ background: 'rgba(255,85,0,0.08)', border: '1px solid rgba(255,85,0,0.2)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-accent), transparent)' }} />
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--theme-accent-muted)', border: '1px solid var(--theme-accent-glow)' }}
          >
            <Plus size={20} style={{ color: 'var(--theme-accent)' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold m-0" style={{ color: 'var(--theme-text-primary)' }}>Nieuw Trainingsplan</p>
            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>Stel zelf oefeningen samen</p>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--theme-text-muted)' }} />
        </motion.button>

        {/* ─── Plans list ──────────────────────────── */}
        {plans.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 18 }}
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl tracking-wider mb-2">GEEN PLANNEN</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--theme-text-secondary)' }}>
                Maak je eerste plan — kies oefeningen en sla op voor later
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/plans/new')}
                className="px-6 py-3 text-white rounded-2xl font-semibold cursor-pointer border-0"
                style={{ background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))', boxShadow: '0 8px 24px var(--theme-accent-glow)' }}
              >
                Plan Maken
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest m-0 mb-1" style={{ color: 'var(--theme-text-muted)', letterSpacing: '0.12em' }}>
              Opgeslagen plannen — {plans.length}
            </p>

            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', damping: 24 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
              >
                {/* Gradient hero strip */}
                <div className={`relative h-24 ${PLAN_GRADIENTS[i % PLAN_GRADIENTS.length]}`}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2))' }} />
                  <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: 'linear-gradient(to top, var(--theme-bg-card), transparent)' }} />

                  <div className="absolute inset-0 flex items-center px-4 gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                    >
                      <BookMarked size={18} style={{ color: '#fff' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold m-0 text-white truncate">{plan.name}</h3>
                      <p className="text-xs m-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {plan.exercises.length} oefeningen
                        {plan.lastUsedAt && ` · ${new Date(plan.lastUsedAt).toLocaleDateString('nl-NL',{day:'numeric',month:'short'})}`}
                      </p>
                    </div>
                    {/* Edit + delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => navigate(`/plans/${plan.id}/edit`)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-0 transition-all"
                        style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                        title="Bewerken"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id, plan.name)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-0 transition-all"
                        style={{ background: 'rgba(255,59,59,0.15)', color: 'rgba(255,59,59,0.85)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,59,59,0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,59,59,0.15)')}
                        title="Verwijderen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exercise tags */}
                <div className="px-4 pt-3 pb-3">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {plan.exercises.slice(0, 5).map(pe => {
                      const ex = getExercise(pe.exerciseId)
                      return ex ? (
                        <span
                          key={pe.exerciseId}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }}
                        >
                          {exName(ex)}
                        </span>
                      ) : null
                    })}
                    {plan.exercises.length > 5 && (
                      <span className="text-xs px-2 py-1" style={{ color: 'var(--theme-text-muted)' }}>
                        +{plan.exercises.length - 5} meer
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/workout', { state: { planId: plan.id } })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-white text-xs font-bold rounded-xl cursor-pointer border-0"
                      style={{ background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))', boxShadow: '0 4px 12px var(--theme-accent-glow)' }}
                    >
                      <Play size={13} fill="#fff" strokeWidth={0} />
                      Solo starten
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => profiles.length >= 2
                        ? navigate('/workout', { state: { planId: plan.id, samen: true } })
                        : navigate('/profiles/new')
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl cursor-pointer border-0"
                      style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }}
                      title={profiles.length < 2 ? 'Voeg een tweede profiel toe' : 'Samen trainen'}
                    >
                      <Users size={13} />
                      {profiles.length >= 2 ? 'Samen' : '+ Profiel'}
                    </motion.button>
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

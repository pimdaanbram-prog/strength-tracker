import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Info, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useExercises } from '../hooks/useExercises'
import { useWorkouts } from '../hooks/useWorkouts'
import { useProfiles } from '../hooks/useProfiles'
import { useLanguage } from '../hooks/useLanguage'
import { calculateRecommendedWeight } from '../utils/weightCalculator'

type Tab = 'instructies' | 'tips' | 'fouten' | 'geschiedenis'

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getExercise } = useExercises()
  const { getExerciseHistory } = useWorkouts()
  const { activeProfile } = useProfiles()
  const { exName } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>('instructies')

  const exercise = getExercise(id || '')
  if (!exercise) {
    return (
      <>
        <Header title="OEFENING" showBack />
        <PageWrapper>
          <p className="text-text-muted text-center py-12">Oefening niet gevonden</p>
        </PageWrapper>
      </>
    )
  }

  const history = getExerciseHistory(exercise.id)
  const recommended = activeProfile ? calculateRecommendedWeight(exercise, activeProfile) : null

  const tabs: { key: Tab; label: string; icon: typeof Info }[] = [
    { key: 'instructies', label: 'Instructies', icon: Info },
    { key: 'tips', label: 'Tips', icon: Lightbulb },
    { key: 'fouten', label: 'Fouten', icon: AlertTriangle },
    { key: 'geschiedenis', label: 'Geschiedenis', icon: TrendingUp },
  ]

  return (
    <>
      <Header title={exName(exercise).toUpperCase()} showBack />
      <PageWrapper>
        {/* Header Info */}
        <div className="bg-bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-2xl tracking-wider m-0">{exName(exercise).toUpperCase()}</h2>
              <p className="text-sm text-text-muted mt-1 m-0">{exercise.name}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              exercise.difficulty === 'beginner' ? 'bg-success/15 text-success' :
              exercise.difficulty === 'intermediate' ? 'bg-warning/15 text-warning' :
              'bg-danger/15 text-danger'
            }`}>
              {exercise.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent">{exercise.category}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-bg-input text-text-muted">{exercise.equipment}</span>
            {exercise.isCompound && (
              <span className="text-xs px-2 py-1 rounded-full bg-warning/15 text-warning">Compound</span>
            )}
          </div>

          {/* Muscles */}
          <div className="flex flex-wrap gap-1">
            {exercise.musclesWorked.map(m => (
              <span key={m} className="text-xs px-2 py-0.5 rounded bg-bg-input text-text-secondary">{m}</span>
            ))}
          </div>
        </div>

        {/* Recommended Weight */}
        {recommended !== null && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-4">
            <p className="text-accent text-sm font-medium m-0">Aanbevolen gewicht voor jou</p>
            <p className="text-2xl font-heading tracking-wider text-text-primary m-0 mt-1">{recommended} KG</p>
            <p className="text-xs text-text-muted mt-1 m-0">
              {exercise.defaultSets}×{exercise.defaultReps} · {exercise.restSeconds}s rust
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs shrink-0 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-accent text-white'
                  : 'bg-bg-card text-text-muted border border-border'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'instructies' && (
            <div className="space-y-3">
              {exercise.instructions.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-text-secondary m-0">{step}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-2">
              {exercise.tips.map((tip, i) => (
                <div key={i} className="flex gap-2 p-3 bg-bg-card border border-border rounded-xl">
                  <Lightbulb size={14} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary m-0">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'fouten' && (
            <div className="space-y-2">
              {exercise.commonMistakes.map((mistake, i) => (
                <div key={i} className="flex gap-2 p-3 bg-danger/5 border border-danger/10 rounded-xl">
                  <AlertTriangle size={14} className="text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary m-0">{mistake}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'geschiedenis' && (
            <div>
              {history.length > 0 ? (
                <>
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: '#6B7280', fontSize: 10 }}
                          tickFormatter={v => v.slice(5)}
                        />
                        <YAxis
                          tick={{ fill: '#6B7280', fontSize: 10 }}
                          width={40}
                        />
                        <Tooltip
                          contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                          labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="maxWeight"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ fill: '#3B82F6', r: 3 }}
                          name="Max Gewicht (kg)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1">
                    {history.slice().reverse().map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2 text-sm">
                        <span className="text-text-muted">{h.date}</span>
                        <span className="text-text-primary">{h.maxWeight}kg × {h.maxReps}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-muted text-sm">Nog geen geschiedenis voor deze oefening</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Start Exercise */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/workout', { state: { addExercise: exercise.id } })}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={18} /> Start Oefening
          </button>
        </div>
      </PageWrapper>
    </>
  )
}

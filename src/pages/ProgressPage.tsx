import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'

export default function ProgressPage() {
  const { getProfileSessions, getExerciseHistory, getPersonalRecords } = useWorkouts()
  const { exercises, getExercise } = useExercises()

  const sessions = getProfileSessions()
  const prs = getPersonalRecords()

  const [selectedExercise, setSelectedExercise] = useState<string>('')

  // Volume per week
  const weeklyVolume = useMemo(() => {
    const volumeMap: Record<string, number> = {}
    for (const session of sessions) {
      const key = `${session.year}-W${session.weekNumber.toString().padStart(2, '0')}`
      let vol = 0
      for (const ex of session.exercises) {
        for (const set of ex.sets) {
          if (set.completed && set.weight && set.reps) {
            vol += set.weight * set.reps
          }
        }
      }
      volumeMap[key] = (volumeMap[key] || 0) + vol
    }
    return Object.entries(volumeMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, volume]) => {
        const [, week] = key.split('-')
        return { week, volume: Math.round(volume) }
      })
  }, [sessions])

  // Body part frequency
  const bodyPartFrequency = useMemo(() => {
    const freq: Record<string, number> = {}
    for (const session of sessions) {
      for (const ex of session.exercises) {
        const exercise = getExercise(ex.exerciseId)
        if (exercise) {
          freq[exercise.category] = (freq[exercise.category] || 0) + 1
        }
      }
    }
    return Object.entries(freq)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  }, [sessions, getExercise])

  const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1']

  // Exercise-specific history
  const exerciseHistory = useMemo(() => {
    if (!selectedExercise) return []
    return getExerciseHistory(selectedExercise)
  }, [selectedExercise, getExerciseHistory])

  // Find exercises that have been used
  const usedExercises = useMemo(() => {
    const ids = new Set<string>()
    sessions.forEach(s => s.exercises.forEach(e => ids.add(e.exerciseId)))
    return exercises.filter(e => ids.has(e.id))
  }, [sessions, exercises])

  return (
    <>
      <Header title="VOORTGANG" />
      <PageWrapper>
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📊</span>
            <h3 className="text-xl tracking-wider mb-2">GEEN DATA</h3>
            <p className="text-text-secondary text-sm">
              Start met trainen om je voortgang bij te houden
            </p>
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-bg-card border border-border rounded-xl p-4">
                <Activity size={16} className="text-accent mb-2" />
                <p className="text-2xl font-heading tracking-wider text-text-primary m-0">{sessions.length}</p>
                <p className="text-xs text-text-muted m-0">Totaal trainingen</p>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-4">
                <TrendingUp size={16} className="text-success mb-2" />
                <p className="text-2xl font-heading tracking-wider text-text-primary m-0">{prs.length}</p>
                <p className="text-xs text-text-muted m-0">Persoonlijke records</p>
              </div>
            </div>

            {/* Weekly Volume Chart */}
            {weeklyVolume.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg tracking-wider mb-3 m-0">WEKELIJKS VOLUME</h3>
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyVolume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} width={50} />
                        <Tooltip
                          contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                          labelStyle={{ color: '#9CA3AF' }}
                          formatter={(value) => [`${value} kg`, 'Volume']}
                        />
                        <Bar dataKey="volume" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Body Part Frequency */}
            {bodyPartFrequency.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg tracking-wider mb-3 m-0">SPIERGROEP FREQUENTIE</h3>
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bodyPartFrequency} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 10 }} />
                        <YAxis dataKey="category" type="category" tick={{ fill: '#6B7280', fontSize: 10 }} width={80} />
                        <Tooltip
                          contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                          labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {bodyPartFrequency.map((_, i) => (
                            <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Exercise Progress */}
            {usedExercises.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg tracking-wider mb-3 m-0">OEFENING PROGRESSIE</h3>
                <select
                  value={selectedExercise}
                  onChange={e => setSelectedExercise(e.target.value)}
                  className="w-full bg-bg-input border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none mb-3 cursor-pointer"
                >
                  <option value="">Kies een oefening...</option>
                  {usedExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.nameNL}</option>
                  ))}
                </select>

                {selectedExercise && exerciseHistory.length > 0 && (
                  <div className="bg-bg-card border border-border rounded-xl p-4">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={exerciseHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            tickFormatter={v => v.slice(5)}
                          />
                          <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} width={40} />
                          <Tooltip
                            contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                            labelStyle={{ color: '#9CA3AF' }}
                          />
                          <Line type="monotone" dataKey="maxWeight" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Max kg" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {selectedExercise && exerciseHistory.length === 0 && (
                  <p className="text-text-muted text-sm text-center py-4">Nog geen data voor deze oefening</p>
                )}
              </div>
            )}

            {/* PR List */}
            {prs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg tracking-wider mb-3 m-0">PERSOONLIJKE RECORDS</h3>
                <div className="space-y-2">
                  {prs.map(pr => {
                    const exercise = getExercise(pr.exerciseId)
                    return (
                      <motion.div
                        key={pr.exerciseId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl"
                      >
                        <span className="text-warning">🏆</span>
                        <div className="flex-1">
                          <p className="text-sm text-text-primary m-0">{exercise?.nameNL || pr.exerciseId}</p>
                          <p className="text-xs text-text-muted m-0 mt-0.5">{pr.date}</p>
                        </div>
                        <span className="text-sm font-bold text-warning">{pr.weight}kg × {pr.reps}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </PageWrapper>
    </>
  )
}

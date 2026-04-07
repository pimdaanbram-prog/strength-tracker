import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, RefreshCw } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { useSync } from '../hooks/useSync'

const CATEGORY_NL: Record<string, string> = {
  'Chest': 'Borst',
  'Back': 'Rug',
  'Shoulders': 'Schouders',
  'Arms - Biceps': 'Biceps',
  'Arms - Triceps': 'Triceps',
  'Core': 'Core / Buik',
  'Legs': 'Benen',
  'Glutes': 'Billen',
  'Full Body': 'Full Body',
}

const FRONT_CATS = ['Shoulders', 'Chest', 'Arms - Biceps', 'Core', 'Glutes', 'Legs']
const BACK_CATS = ['Shoulders', 'Back', 'Arms - Triceps', 'Glutes', 'Legs']

export default function ProgressPage() {
  const { getProfileSessions, getExerciseHistory, getPersonalRecords } = useWorkouts()
  const { exercises, getExercise } = useExercises()
  const { pullFromCloud } = useSync()

  const sessions = getProfileSessions()
  const prs = getPersonalRecords()

  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [bodyView, setBodyView] = useState<'front' | 'back'>('front')
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Sessions per week
  const weeklyFrequency = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of sessions) {
      const key = `${s.year}-W${s.weekNumber.toString().padStart(2, '0')}`
      map[key] = (map[key] || 0) + 1
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, count]) => ({ week: key.split('-')[1], count }))
  }, [sessions])

  // Category frequency
  const categoryFreq = useMemo(() => {
    const freq: Record<string, number> = {}
    for (const session of sessions) {
      for (const ex of session.exercises) {
        const exercise = getExercise(ex.exerciseId)
        if (exercise?.category) {
          freq[exercise.category] = (freq[exercise.category] || 0) + 1
        }
      }
    }
    return freq
  }, [sessions, getExercise])

  // Exercise history for selected exercise
  const exerciseHistory = useMemo(() => {
    if (!selectedExercise) return []
    return getExerciseHistory(selectedExercise)
  }, [selectedExercise, getExerciseHistory])

  // Used exercises (for dropdown)
  const usedExercises = useMemo(() => {
    const ids = new Set<string>()
    sessions.forEach(s => s.exercises.forEach(e => ids.add(e.exerciseId)))
    return exercises.filter(e => ids.has(e.id))
  }, [sessions, exercises])

  // Sessions for selected muscle group (last 5)
  const muscleGroupSessions = useMemo(() => {
    if (!selectedMuscle) return []
    return sessions
      .filter(s => s.exercises.some(e => getExercise(e.exerciseId)?.category === selectedMuscle))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  }, [selectedMuscle, sessions, getExercise])

  const handleSync = async () => {
    setSyncing(true)
    await pullFromCloud()
    setSyncing(false)
  }

  // Body diagram helpers
  function bodyFill(cat: string): string {
    const count = categoryFreq[cat] || 0
    if (selectedMuscle === cat) return 'rgba(59,130,246,0.92)'
    if (count === 0) return '#252535'
    const intensity = Math.min(count / 8, 1)
    return `rgba(59,130,246,${0.22 + intensity * 0.6})`
  }
  function bodyStroke(cat: string): string {
    return selectedMuscle === cat ? '#60a5fa' : '#3d3d58'
  }
  function gp(cat: string) {
    return {
      fill: bodyFill(cat),
      stroke: bodyStroke(cat),
      strokeWidth: 1.5 as number,
      style: { cursor: 'pointer' as const, transition: 'fill 0.25s' },
      onClick: () => setSelectedMuscle(selectedMuscle === cat ? null : cat),
    }
  }

  return (
    <>
      <Header title="VOORTGANG" />
      <PageWrapper>
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📊</span>
            <h3 className="text-xl tracking-wider mb-2">GEEN DATA</h3>
            <p className="text-text-secondary text-sm mb-4">
              Start met trainen om je voortgang bij te houden
            </p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent text-white rounded-xl text-sm cursor-pointer border-0"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync met cloud'}
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
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

            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 text-xs text-text-muted mb-6 cursor-pointer bg-transparent border-0 p-0 hover:text-text-secondary transition-colors"
            >
              <RefreshCw size={11} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync met cloud'}
            </button>

            {/* Trainingen per week */}
            {weeklyFrequency.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg tracking-wider mb-3 m-0">TRAININGEN PER WEEK</h3>
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyFrequency}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} width={24} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                          labelStyle={{ color: '#9CA3AF' }}
                          formatter={(value) => [`${value}×`, 'Trainingen']}
                        />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Body Diagram */}
            <div className="mb-6">
              <h3 className="text-lg tracking-wider mb-3 m-0">SPIERGROEPEN</h3>
              <div className="bg-bg-card border border-border rounded-xl p-4">
                {/* Toggle front/back */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setBodyView('front')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-0 ${bodyView === 'front' ? 'bg-accent text-white' : 'bg-bg-input text-text-muted'}`}
                  >
                    Voorkant
                  </button>
                  <button
                    onClick={() => setBodyView('back')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-0 ${bodyView === 'back' ? 'bg-accent text-white' : 'bg-bg-input text-text-muted'}`}
                  >
                    Achterkant
                  </button>
                </div>

                <div className="flex gap-4 items-start">
                  {/* Human body SVG */}
                  <div className="shrink-0">
                    <svg width="100" height="220" viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
                      {/* Head */}
                      <circle cx="50" cy="15" r="12" fill="#2d2d45" stroke="#3d3d58" strokeWidth="1" />
                      {/* Neck */}
                      <rect x="44" y="26" width="12" height="7" rx="3" fill="#2d2d45" stroke="#3d3d58" strokeWidth="1" />

                      {bodyView === 'front' ? (
                        <>
                          {/* Shoulders */}
                          <g {...gp('Shoulders')}>
                            <ellipse cx="26" cy="40" rx="12" ry="8" />
                            <ellipse cx="74" cy="40" rx="12" ry="8" />
                          </g>
                          {/* Chest */}
                          <g {...gp('Chest')}>
                            <rect x="35" y="32" width="14" height="24" rx="3" />
                            <rect x="51" y="32" width="14" height="24" rx="3" />
                          </g>
                          {/* Biceps + forearms */}
                          <g {...gp('Arms - Biceps')}>
                            <rect x="15" y="32" width="12" height="32" rx="5" />
                            <rect x="73" y="32" width="12" height="32" rx="5" />
                            <rect x="16" y="66" width="10" height="24" rx="4" />
                            <rect x="74" y="66" width="10" height="24" rx="4" />
                          </g>
                          {/* Core */}
                          <g {...gp('Core')}>
                            <rect x="37" y="56" width="11" height="10" rx="2" />
                            <rect x="52" y="56" width="11" height="10" rx="2" />
                            <rect x="37" y="68" width="11" height="10" rx="2" />
                            <rect x="52" y="68" width="11" height="10" rx="2" />
                          </g>
                          {/* Glutes/hip front */}
                          <g {...gp('Glutes')}>
                            <rect x="35" y="80" width="30" height="15" rx="5" />
                          </g>
                          {/* Quads + calves */}
                          <g {...gp('Legs')}>
                            <rect x="35" y="95" width="13" height="46" rx="5" />
                            <rect x="52" y="95" width="13" height="46" rx="5" />
                            <rect x="36" y="143" width="11" height="32" rx="4" />
                            <rect x="53" y="143" width="11" height="32" rx="4" />
                          </g>
                        </>
                      ) : (
                        <>
                          {/* Shoulders back */}
                          <g {...gp('Shoulders')}>
                            <ellipse cx="26" cy="40" rx="12" ry="8" />
                            <ellipse cx="74" cy="40" rx="12" ry="8" />
                          </g>
                          {/* Back / lats */}
                          <g {...gp('Back')}>
                            <rect x="35" y="32" width="30" height="18" rx="3" />
                            <rect x="20" y="40" width="15" height="26" rx="4" />
                            <rect x="65" y="40" width="15" height="26" rx="4" />
                            <rect x="38" y="58" width="24" height="16" rx="3" />
                          </g>
                          {/* Triceps + forearms */}
                          <g {...gp('Arms - Triceps')}>
                            <rect x="15" y="32" width="12" height="32" rx="5" />
                            <rect x="73" y="32" width="12" height="32" rx="5" />
                            <rect x="16" y="66" width="10" height="24" rx="4" />
                            <rect x="74" y="66" width="10" height="24" rx="4" />
                          </g>
                          {/* Glutes back */}
                          <g {...gp('Glutes')}>
                            <rect x="35" y="76" width="13" height="20" rx="5" />
                            <rect x="52" y="76" width="13" height="20" rx="5" />
                          </g>
                          {/* Hamstrings + calves */}
                          <g {...gp('Legs')}>
                            <rect x="35" y="96" width="13" height="46" rx="5" />
                            <rect x="52" y="96" width="13" height="46" rx="5" />
                            <rect x="36" y="144" width="11" height="32" rx="4" />
                            <rect x="53" y="144" width="11" height="32" rx="4" />
                          </g>
                        </>
                      )}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 flex flex-col gap-1.5 pt-1">
                    {(bodyView === 'front' ? FRONT_CATS : BACK_CATS).map(cat => {
                      const count = categoryFreq[cat] || 0
                      const isSelected = selectedMuscle === cat
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedMuscle(isSelected ? null : cat)}
                          className={`flex items-center gap-2 text-xs text-left rounded-lg px-1.5 py-1 cursor-pointer bg-transparent border-0 transition-colors ${isSelected ? 'bg-accent/10' : ''}`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ background: count === 0 ? '#252535' : `rgba(59,130,246,${0.22 + Math.min(count / 8, 1) * 0.6})`, border: '1px solid #3d3d58' }}
                          />
                          <span className={`flex-1 ${isSelected ? 'text-accent font-semibold' : 'text-text-secondary'}`}>
                            {CATEGORY_NL[cat] || cat}
                          </span>
                          <span className="text-text-muted">{count}×</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Selected muscle group detail */}
                {selectedMuscle && (
                  <motion.div
                    key={selectedMuscle}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <p className="text-xs font-semibold text-accent mb-2 m-0">
                      {CATEGORY_NL[selectedMuscle] || selectedMuscle} — {categoryFreq[selectedMuscle] || 0}× getraind
                    </p>
                    {muscleGroupSessions.length > 0 ? (
                      <div className="space-y-2">
                        {muscleGroupSessions.map(s => {
                          const relevant = s.exercises.filter(e => getExercise(e.exerciseId)?.category === selectedMuscle)
                          return (
                            <div key={s.id} className="flex items-start gap-3">
                              <span className="text-xs text-text-muted shrink-0 w-14">{s.date.slice(5).replace('-', '/')}</span>
                              <div className="flex-1">
                                {relevant.map(e => {
                                  const ex = getExercise(e.exerciseId)
                                  const done = e.sets.filter(set => set.completed)
                                  const maxW = done.filter(s => s.weight).reduce((m, s) => Math.max(m, s.weight!), 0)
                                  return (
                                    <p key={e.exerciseId} className="text-xs text-text-secondary m-0">
                                      {ex?.nameNL} · {done.length} sets{maxW > 0 ? ` · ${maxW}kg` : ''}
                                    </p>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted m-0">Nog niet getraind</p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Oefening Progressie */}
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

                {selectedExercise && exerciseHistory.length > 1 && (
                  <div className="bg-bg-card border border-border rounded-xl p-4">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={exerciseHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            tickFormatter={v => v.slice(5).replace('-', '/')}
                          />
                          <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} width={40} unit="kg" />
                          <Tooltip
                            contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                            labelStyle={{ color: '#9CA3AF' }}
                            formatter={(value) => [`${value}kg`, 'Max gewicht']}
                          />
                          <Line
                            type="monotone"
                            dataKey="maxWeight"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#3B82F6' }}
                            activeDot={{ r: 6 }}
                            name="Max kg"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {selectedExercise && exerciseHistory.length === 1 && (
                  <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-xs text-text-muted m-0">
                      Eerste sessie: {exerciseHistory[0].maxWeight}kg × {exerciseHistory[0].maxReps} reps
                    </p>
                    <p className="text-xs text-text-muted mt-1 m-0">Train nog een keer voor een progressiegrafiek</p>
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

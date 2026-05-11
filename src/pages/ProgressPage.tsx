import { useState, useMemo, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Activity, RefreshCw, AlertCircle, Trophy } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AmbientBackground from '../components/ui/AmbientBackground'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { useSync } from '../hooks/useSync'
import { useLanguage } from '../hooks/useLanguage'

const MuscleFigure3D = lazy(() => import('../components/ui/MuscleFigure3D'))

const CATEGORY_NL: Record<string, string> = {
  'Chest': 'Borst', 'Back': 'Rug', 'Shoulders': 'Schouders',
  'Arms - Biceps': 'Biceps', 'Arms - Triceps': 'Triceps',
  'Core': 'Core', 'Legs': 'Benen', 'Glutes': 'Billen', 'Full Body': 'Full Body',
}

interface TooltipPayloadEntry { value: number | string; unit?: string }
interface TooltipProps { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--theme-bg-input)', border: '1px solid var(--theme-border-subtle)', borderRadius: 12, padding: '8px 12px' }}>
      <p style={{ color: 'var(--theme-text-secondary)', fontSize: 11, margin: 0 }}>{label}</p>
      {payload.map((p, i: number) => (
        <p key={i} style={{ color: 'var(--theme-accent)', fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>
          {p.value}{p.unit || ''}
        </p>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const { getProfileSessions, getExerciseHistory, getPersonalRecords } = useWorkouts()
  const { exercises, getExercise } = useExercises()
  const { pullFromCloud, diagnoseSyncIssue, syncError, isSyncing, lastSyncAt } = useSync()
  const { exName } = useLanguage()

  const sessions  = getProfileSessions()
  const prs       = getPersonalRecords()

  const [selectedExercise, setSelectedExercise] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<string|null>(null)
  const [diagnosisResult, setDiagnosisResult] = useState<string|null>(null)
  const [diagnosing, setDiagnosing] = useState(false)

  const weeklyFrequency = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of sessions) {
      const key = `${s.year}-W${s.weekNumber.toString().padStart(2,'0')}`
      map[key] = (map[key] || 0) + 1
    }
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).slice(-12)
      .map(([key, count]) => ({ week: key.split('-')[1], count }))
  }, [sessions])

  const categoryFreq = useMemo(() => {
    const freq: Record<string, number> = {}
    for (const session of sessions)
      for (const ex of session.exercises) {
        const exercise = getExercise(ex.exerciseId)
        if (exercise?.category) freq[exercise.category] = (freq[exercise.category] || 0) + 1
      }
    return freq
  }, [sessions, getExercise])

  const exerciseHistory = useMemo(() => {
    if (!selectedExercise) return []
    return getExerciseHistory(selectedExercise)
  }, [selectedExercise, getExerciseHistory])

  const usedExercises = useMemo(() => {
    const ids = new Set<string>()
    sessions.forEach(s => s.exercises.forEach(e => ids.add(e.exerciseId)))
    return exercises.filter(e => ids.has(e.id))
  }, [sessions, exercises])

  const muscleGroupSessions = useMemo(() => {
    if (!selectedMuscle) return []
    return sessions
      .filter(s => s.exercises.some(e => getExercise(e.exerciseId)?.category === selectedMuscle))
      .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  }, [selectedMuscle, sessions, getExercise])

  const handleDiagnose = async () => {
    setDiagnosing(true); setDiagnosisResult(null)
    const result = await diagnoseSyncIssue()
    setDiagnosisResult(result); setDiagnosing(false)
  }

  if (sessions.length === 0) {
    return (
      <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
        <AmbientBackground intensity={0.6} />
        <div className="relative z-10">
          <div className="sticky top-0 z-40 px-4 py-3.5 flex items-center gap-3"
            style={{ background: 'rgba(6,6,10,0.6)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--theme-glass-border)' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Voortgang</span>
          </div>
          <div className="max-w-lg mx-auto px-4 py-16 text-center">
            <div style={{ fontSize: 60, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Geen data</div>
            <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)', marginBottom: 24 }}>Start met trainen om je voortgang bij te houden</p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={pullFromCloud} disabled={isSyncing}
              className="flex items-center gap-2 mx-auto cursor-pointer border-0 text-white font-bold rounded-2xl text-sm"
              style={{ padding: '13px 24px', background: 'var(--theme-accent-grad)', boxShadow: '0 8px 24px var(--theme-accent-glow)' }}>
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync met cloud'}
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: 'var(--theme-bg-primary)' }}>
      <AmbientBackground intensity={0.6} />
      <div className="relative z-10">

        {/* ── Sticky header ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-40 px-4 py-3.5 flex items-center justify-between"
          style={{ background: 'rgba(6,6,10,0.6)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--theme-glass-border)' }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Voortgang</span>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={pullFromCloud} disabled={isSyncing}
              className="flex items-center gap-1.5 cursor-pointer border-0 bg-transparent text-xs"
              style={{ color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)' }}>
              <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : lastSyncAt ? lastSyncAt.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}) : 'Sync'}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleDiagnose} disabled={diagnosing}
              className="flex items-center gap-1 cursor-pointer border-0 bg-transparent text-xs"
              style={{ color: syncError ? 'var(--theme-error)' : 'var(--theme-text-muted)' }}>
              <AlertCircle size={11} />
            </motion.button>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-4"
          style={{ paddingBottom: 'calc(max(4.5rem, env(safe-area-inset-bottom)) + 4rem)' }}>

          {diagnosisResult && (
            <div className={`mb-4 text-xs rounded-xl p-3 ${diagnosisResult.startsWith('OK') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {diagnosisResult}
            </div>
          )}

          {/* ─── Top stats ─────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { icon: Activity, value: sessions.length, label: 'Trainingen', color: 'var(--theme-accent)' },
              { icon: Trophy,   value: prs.length,       label: 'Records',    color: 'var(--theme-warning)' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} style={{ position: 'relative', borderRadius: 18, padding: '16px 14px', overflow: 'hidden', background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
                <Icon size={16} style={{ color, marginBottom: 8 }} />
                <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--theme-text-muted)', marginTop: 6, fontFamily: 'var(--theme-font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </motion.div>

          {/* ─── Weekly frequency bar chart ────────────────────────────── */}
          {weeklyFrequency.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', damping: 24 }}
              style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 3, height: 12, background: 'var(--theme-accent-grad)', borderRadius: 2, boxShadow: '0 0 10px var(--theme-accent-glow)' }} />
                <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Trainingen per week</span>
              </div>
              <div style={{ background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)', borderRadius: 18, padding: 16 }}>
                <div style={{ height: 176 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyFrequency} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity={1} />
                          <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-glass-border)" />
                      <XAxis dataKey="week" tick={{ fill: 'var(--theme-text-muted)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--theme-text-muted)', fontSize: 10 }} width={24} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="url(#barGrad)" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── 3D Muscle Figure ──────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', damping: 24 }}
            style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 3, height: 12, background: 'linear-gradient(to bottom, #818CF8, #C084FC)', borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Spiergroepen</span>
              <span style={{ fontSize: 10, color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)', marginLeft: 'auto' }}>Draaien · Klikken</span>
            </div>

            <div style={{ background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)', borderRadius: 18, overflow: 'hidden' }}>
              <Suspense fallback={
                <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-text-muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--theme-font-mono)' }}>
                  Loading anatomy…
                </div>
              }>
                <MuscleFigure3D categoryFreq={categoryFreq} selectedCategory={selectedMuscle}
                  onCategorySelect={(cat) => setSelectedMuscle(cat === selectedMuscle ? null : cat)} height={380} />
              </Suspense>

              {/* Category chips */}
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.keys(CATEGORY_NL).map(cat => {
                    const count = categoryFreq[cat] || 0
                    const isSelected = selectedMuscle === cat
                    const intensity = Math.min(count / 8, 1)
                    const dotColor = count === 0 ? 'var(--theme-glass-border)' : `rgba(255,122,31,${0.25 + intensity * 0.65})`
                    return (
                      <button key={cat} onClick={() => setSelectedMuscle(isSelected ? null : cat)}
                        className="flex items-center gap-1.5 cursor-pointer border-0 transition-all"
                        style={{ padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: isSelected ? 600 : 400, background: isSelected ? 'var(--theme-accent-muted)' : 'var(--theme-glass)', border: `1px solid ${isSelected ? 'var(--theme-accent)' : 'var(--theme-glass-border)'}`, color: isSelected ? 'var(--theme-accent)' : 'var(--theme-text-secondary)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0, display: 'inline-block' }} />
                        {CATEGORY_NL[cat]}
                        {count > 0 && <span style={{ color: isSelected ? 'var(--theme-accent)' : 'var(--theme-text-muted)' }}> {count}×</span>}
                      </button>
                    )
                  })}
                </div>

                {selectedMuscle && (
                  <motion.div key={selectedMuscle} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--theme-glass-border)' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, margin: '0 0 8px', color: 'var(--theme-accent)' }}>
                      {CATEGORY_NL[selectedMuscle] || selectedMuscle} — {categoryFreq[selectedMuscle] || 0}× getraind
                    </p>
                    {muscleGroupSessions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {muscleGroupSessions.map(s => {
                          const relevant = s.exercises.filter(e => getExercise(e.exerciseId)?.category === selectedMuscle)
                          return (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <span style={{ fontSize: 11, flexShrink: 0, width: 44, color: 'var(--theme-text-muted)' }}>{s.date.slice(5).replace('-','/')}</span>
                              <div style={{ flex: 1 }}>
                                {relevant.map(e => {
                                  const ex = getExercise(e.exerciseId)
                                  const done = e.sets.filter(set => set.completed)
                                  const maxW = done.filter(s => s.weight).reduce((m, s) => Math.max(m, s.weight!), 0)
                                  return (
                                    <p key={e.exerciseId} style={{ fontSize: 11, margin: 0, color: 'var(--theme-text-secondary)' }}>
                                      {exName(ex)} · {done.length} sets{maxW > 0 ? ` · ${maxW}kg` : ''}
                                    </p>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: 11, margin: 0, color: 'var(--theme-text-muted)' }}>Nog niet getraind</p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─── Exercise progress ─────────────────────────────────────── */}
          {usedExercises.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', damping: 24 }}
              style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 3, height: 12, background: 'linear-gradient(to bottom, #00E5A0, #00B4D8)', borderRadius: 2 }} />
                <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Oefening progressie</span>
              </div>
              <div style={{ background: 'var(--theme-glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--theme-glass-border)', borderRadius: 18, overflow: 'hidden' }}>
                <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}
                  className="w-full outline-none cursor-pointer"
                  style={{ padding: '14px 16px', fontSize: 13, background: 'transparent', color: 'var(--theme-text-primary)', fontFamily: 'inherit', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid var(--theme-glass-border)' }}>
                  <option value="">Kies een oefening...</option>
                  {usedExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{exName(ex)}</option>
                  ))}
                </select>

                {selectedExercise && exerciseHistory.length > 1 && (
                  <div style={{ padding: 16 }}>
                    <div style={{ height: 176 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={exerciseHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-glass-border)" />
                          <XAxis dataKey="date" tick={{ fill: 'var(--theme-text-muted)', fontSize: 10 }} tickFormatter={v => v.slice(5).replace('-','/')} />
                          <YAxis tick={{ fill: 'var(--theme-text-muted)', fontSize: 10 }} width={36} unit="kg" />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="maxWeight" stroke="#00E5A0" strokeWidth={2} fill="url(#progressGrad)" dot={{ fill: '#00E5A0', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                {selectedExercise && exerciseHistory.length === 1 && (
                  <div style={{ padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 11, margin: 0, color: 'var(--theme-text-secondary)' }}>Eerste sessie: {exerciseHistory[0].maxWeight}kg × {exerciseHistory[0].maxReps} reps</p>
                    <p style={{ fontSize: 11, marginTop: 4, margin: 0, color: 'var(--theme-text-muted)' }}>Train nog een keer voor een grafiek</p>
                  </div>
                )}
                {selectedExercise && exerciseHistory.length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 11, margin: 0, color: 'var(--theme-text-muted)' }}>Nog geen data voor deze oefening</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── PR List ───────────────────────────────────────────────── */}
          {prs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', damping: 24 }}
              style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 3, height: 12, background: 'linear-gradient(to bottom, #FFB300, #FF8C00)', borderRadius: 2 }} />
                <span style={{ fontSize: 10, fontFamily: 'var(--theme-font-mono)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--theme-text-secondary)' }}>Persoonlijke records</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prs.map((pr, i) => {
                  const exercise = getExercise(pr.exerciseId)
                  return (
                    <motion.div key={pr.exerciseId}
                      initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ type: 'spring', damping: 24, delay: i * 0.04 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.12)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,179,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Trophy size={16} style={{ color: 'var(--theme-warning)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {exName(exercise) || pr.exerciseId}
                        </p>
                        <p style={{ fontSize: 10, margin: '2px 0 0', color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-font-mono)' }}>{pr.date}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, color: 'var(--theme-warning)' }}>
                        {pr.weight}kg × {pr.reps}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

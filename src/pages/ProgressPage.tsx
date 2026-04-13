import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, RefreshCw, AlertCircle, Trophy } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { useSync } from '../hooks/useSync'
import { useLanguage } from '../hooks/useLanguage'

const CATEGORY_NL: Record<string, string> = {
  'Chest': 'Borst', 'Back': 'Rug', 'Shoulders': 'Schouders',
  'Arms - Biceps': 'Biceps', 'Arms - Triceps': 'Triceps',
  'Core': 'Core', 'Legs': 'Benen', 'Glutes': 'Billen', 'Full Body': 'Full Body',
}
const FRONT_CATS = ['Shoulders','Chest','Arms - Biceps','Core','Glutes','Legs']
const BACK_CATS  = ['Shoulders','Back','Arms - Triceps','Glutes','Legs']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--theme-bg-input)', border: '1px solid var(--theme-border-subtle)', borderRadius: 12, padding: '8px 12px' }}>
      <p style={{ color: 'var(--theme-text-secondary)', fontSize: 11, margin: 0 }}>{label}</p>
      {payload.map((p: any, i: number) => (
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
  const [bodyView, setBodyView]     = useState<'front'|'back'>('front')
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

  function bodyFill(cat: string) {
    const count = categoryFreq[cat] || 0
    if (selectedMuscle === cat) return 'var(--theme-accent)'
    if (count === 0) return 'var(--theme-border)'
    const intensity = Math.min(count / 8, 1)
    return `rgba(255,85,0,${0.2 + intensity * 0.65})`
  }
  function bodyStroke(cat: string) {
    return selectedMuscle === cat ? 'var(--theme-accent)' : 'var(--theme-border-subtle)'
  }
  function gp(cat: string) {
    return {
      style: { fill: bodyFill(cat), stroke: bodyStroke(cat), strokeWidth: 1.5 as number, cursor: 'pointer' as const, transition: 'fill 0.25s' },
      onClick: () => setSelectedMuscle(selectedMuscle === cat ? null : cat),
    }
  }

  if (sessions.length === 0) {
    return (
      <>
        <Header title="VOORTGANG" />
        <PageWrapper>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl tracking-wider mb-2">GEEN DATA</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--theme-text-secondary)' }}>Start met trainen om je voortgang bij te houden</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={pullFromCloud}
              disabled={isSyncing}
              className="flex items-center gap-2 mx-auto px-5 py-3 text-white rounded-2xl text-sm cursor-pointer border-0 font-semibold"
              style={{ background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync met cloud'}
            </motion.button>
          </div>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <Header title="VOORTGANG" />
      <PageWrapper>

        {/* ─── Top stats ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          {[
            { icon: Activity,  value: sessions.length, label: 'Trainingen',   color: '#FF5500',  gradient: 'rgba(255,85,0,0.08)' },
            { icon: Trophy,    value: prs.length,       label: 'Records',      color: '#FFB300',  gradient: 'rgba(255,179,0,0.08)' },
          ].map(({ icon: Icon, value, label, color, gradient }) => (
            <div
              key={label}
              className="relative rounded-2xl p-4 overflow-hidden"
              style={{ background: gradient, border: `1px solid ${color}20` }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
              <Icon size={18} className="mb-2" style={{ color }} />
              <p className="text-3xl font-heading tracking-wider m-0">{value}</p>
              <p className="text-xs m-0 mt-0.5 uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)', letterSpacing: '0.08em' }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Sync row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={pullFromCloud}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs cursor-pointer bg-transparent border-0 p-0 transition-colors"
            style={{ color: 'var(--theme-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
          >
            <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : lastSyncAt ? `Gesync ${lastSyncAt.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}` : 'Sync met cloud'}
          </button>
          {syncError && (
            <button onClick={handleDiagnose} disabled={diagnosing} className="flex items-center gap-1 text-xs cursor-pointer bg-transparent border-0 p-0" style={{ color: 'var(--theme-error)' }}>
              <AlertCircle size={11} />
              {diagnosing ? 'Diagnoseren...' : 'Sync fout — diagnose'}
            </button>
          )}
        </div>
        {diagnosisResult && (
          <div className={`mb-4 text-xs rounded-xl p-3 ${diagnosisResult.startsWith('OK') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {diagnosisResult}
          </div>
        )}

        {/* ─── Weekly frequency bar chart ────────────────── */}
        {weeklyFrequency.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', damping: 24 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--theme-accent), var(--theme-gradient-text-to))' }} />
              <h3 className="text-base tracking-wider m-0">TRAININGEN PER WEEK</h3>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyFrequency} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--theme-gradient-text-to)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
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

        {/* ─── Body heatmap ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ type: 'spring', damping: 24 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #818CF8, #C084FC)' }} />
            <h3 className="text-base tracking-wider m-0">SPIERGROEPEN</h3>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}>
            <div className="flex gap-2 mb-4">
              {['front','back'].map(v => (
                <button key={v} onClick={() => setBodyView(v as 'front'|'back')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-0 transition-all"
                  style={bodyView === v
                    ? { background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))', color: '#fff', boxShadow: 'var(--theme-accent-glow) 0 4px 12px' }
                    : { background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }
                  }
                >
                  {v === 'front' ? 'Voorkant' : 'Achterkant'}
                </button>
              ))}
            </div>

            <div className="flex gap-4 items-start">
              <div className="shrink-0">
                <svg width="100" height="220" viewBox="0 0 100 220">
                  <circle cx="50" cy="15" r="12" style={{ fill: 'var(--theme-border)', stroke: 'var(--theme-border-subtle)' }} strokeWidth="1" />
                  <rect x="44" y="26" width="12" height="7" rx="3" style={{ fill: 'var(--theme-border)', stroke: 'var(--theme-border-subtle)' }} strokeWidth="1" />
                  {bodyView === 'front' ? (
                    <>
                      <g {...gp('Shoulders')}><ellipse cx="26" cy="40" rx="12" ry="8"/><ellipse cx="74" cy="40" rx="12" ry="8"/></g>
                      <g {...gp('Chest')}><rect x="35" y="32" width="14" height="24" rx="3"/><rect x="51" y="32" width="14" height="24" rx="3"/></g>
                      <g {...gp('Arms - Biceps')}><rect x="15" y="32" width="12" height="32" rx="5"/><rect x="73" y="32" width="12" height="32" rx="5"/><rect x="16" y="66" width="10" height="24" rx="4"/><rect x="74" y="66" width="10" height="24" rx="4"/></g>
                      <g {...gp('Core')}><rect x="37" y="56" width="11" height="10" rx="2"/><rect x="52" y="56" width="11" height="10" rx="2"/><rect x="37" y="68" width="11" height="10" rx="2"/><rect x="52" y="68" width="11" height="10" rx="2"/></g>
                      <g {...gp('Glutes')}><rect x="35" y="80" width="30" height="15" rx="5"/></g>
                      <g {...gp('Legs')}><rect x="35" y="95" width="13" height="46" rx="5"/><rect x="52" y="95" width="13" height="46" rx="5"/><rect x="36" y="143" width="11" height="32" rx="4"/><rect x="53" y="143" width="11" height="32" rx="4"/></g>
                    </>
                  ) : (
                    <>
                      <g {...gp('Shoulders')}><ellipse cx="26" cy="40" rx="12" ry="8"/><ellipse cx="74" cy="40" rx="12" ry="8"/></g>
                      <g {...gp('Back')}><rect x="35" y="32" width="30" height="18" rx="3"/><rect x="20" y="40" width="15" height="26" rx="4"/><rect x="65" y="40" width="15" height="26" rx="4"/><rect x="38" y="58" width="24" height="16" rx="3"/></g>
                      <g {...gp('Arms - Triceps')}><rect x="15" y="32" width="12" height="32" rx="5"/><rect x="73" y="32" width="12" height="32" rx="5"/><rect x="16" y="66" width="10" height="24" rx="4"/><rect x="74" y="66" width="10" height="24" rx="4"/></g>
                      <g {...gp('Glutes')}><rect x="35" y="76" width="13" height="20" rx="5"/><rect x="52" y="76" width="13" height="20" rx="5"/></g>
                      <g {...gp('Legs')}><rect x="35" y="96" width="13" height="46" rx="5"/><rect x="52" y="96" width="13" height="46" rx="5"/><rect x="36" y="144" width="11" height="32" rx="4"/><rect x="53" y="144" width="11" height="32" rx="4"/></g>
                    </>
                  )}
                </svg>
              </div>

              <div className="flex-1 flex flex-col gap-1.5 pt-1">
                {(bodyView === 'front' ? FRONT_CATS : BACK_CATS).map(cat => {
                  const count = categoryFreq[cat] || 0
                  const isSelected = selectedMuscle === cat
                  const intensity = Math.min(count / 8, 1)
                  const color = count === 0 ? 'var(--theme-border)' : `rgba(255,85,0,${0.2 + intensity * 0.65})`
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedMuscle(isSelected ? null : cat)}
                      className="flex items-center gap-2 text-xs text-left rounded-xl px-2 py-1.5 cursor-pointer bg-transparent border-0 transition-all"
                      style={isSelected ? { background: 'var(--theme-accent-muted)' } : {}}
                    >
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: color, border: '1px solid var(--theme-border-subtle)' }} />
                      <span className="flex-1" style={{ color: isSelected ? 'var(--theme-accent)' : 'var(--theme-text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                        {CATEGORY_NL[cat] || cat}
                      </span>
                      <span style={{ color: 'var(--theme-text-muted)' }}>{count}×</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedMuscle && (
              <motion.div
                key={selectedMuscle}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4"
                style={{ borderTop: '1px solid var(--theme-border)' }}
              >
                <p className="text-xs font-semibold m-0 mb-2" style={{ color: 'var(--theme-accent)' }}>
                  {CATEGORY_NL[selectedMuscle] || selectedMuscle} — {categoryFreq[selectedMuscle] || 0}× getraind
                </p>
                {muscleGroupSessions.length > 0 ? (
                  <div className="space-y-2">
                    {muscleGroupSessions.map(s => {
                      const relevant = s.exercises.filter(e => getExercise(e.exerciseId)?.category === selectedMuscle)
                      return (
                        <div key={s.id} className="flex items-start gap-3">
                          <span className="text-xs shrink-0 w-12" style={{ color: 'var(--theme-text-muted)' }}>{s.date.slice(5).replace('-','/')}</span>
                          <div className="flex-1">
                            {relevant.map(e => {
                              const ex = getExercise(e.exerciseId)
                              const done = e.sets.filter(set => set.completed)
                              const maxW = done.filter(s => s.weight).reduce((m,s) => Math.max(m,s.weight!),0)
                              return (
                                <p key={e.exerciseId} className="text-xs m-0" style={{ color: 'var(--theme-text-secondary)' }}>
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
                  <p className="text-xs m-0" style={{ color: 'var(--theme-text-muted)' }}>Nog niet getraind</p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ─── Exercise progress ─────────────────────────── */}
        {usedExercises.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', damping: 24 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #00E5A0, #00B4D8)' }} />
              <h3 className="text-base tracking-wider m-0">OEFENING PROGRESSIE</h3>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
            >
              <select
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                className="w-full px-4 py-3.5 text-sm outline-none cursor-pointer"
                style={{ background: 'var(--theme-bg-card)', color: 'var(--theme-text-primary)', borderBottom: '1px solid var(--theme-border)', fontFamily: 'inherit' }}
              >
                <option value="">Kies een oefening...</option>
                {usedExercises.map(ex => (
                  <option key={ex.id} value={ex.id}>{exName(ex)}</option>
                ))}
              </select>

              {selectedExercise && exerciseHistory.length > 1 && (
                <div className="p-4">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={exerciseHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
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
                <div className="p-4 text-center">
                  <p className="text-xs m-0" style={{ color: 'var(--theme-text-secondary)' }}>Eerste sessie: {exerciseHistory[0].maxWeight}kg × {exerciseHistory[0].maxReps} reps</p>
                  <p className="text-xs mt-1 m-0" style={{ color: 'var(--theme-text-muted)' }}>Train nog een keer voor een grafiek</p>
                </div>
              )}
              {selectedExercise && exerciseHistory.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs m-0" style={{ color: 'var(--theme-text-muted)' }}>Nog geen data voor deze oefening</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PR List ───────────────────────────────────── */}
        {prs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', damping: 24 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFB300, #FF8C00)' }} />
              <h3 className="text-base tracking-wider m-0">PERSOONLIJKE RECORDS</h3>
            </div>
            <div className="space-y-2">
              {prs.map((pr, i) => {
                const exercise = getExercise(pr.exerciseId)
                return (
                  <motion.div
                    key={pr.exerciseId}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', damping: 24, delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl relative overflow-hidden"
                    style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.12)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,179,0,0.15)' }}
                    >
                      <Trophy size={16} style={{ color: 'var(--theme-warning)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold m-0 truncate" style={{ color: 'var(--theme-text-primary)' }}>
                        {exName(exercise) || pr.exerciseId}
                      </p>
                      <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{pr.date}</p>
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: 'var(--theme-warning)' }}>
                      {pr.weight}kg × {pr.reps}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </PageWrapper>
    </>
  )
}

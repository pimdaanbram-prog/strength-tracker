import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, AlertTriangle, Lightbulb, TrendingUp, ExternalLink, ChevronRight, Target, Zap } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { useExercises } from '../hooks/useExercises'
import { useWorkouts } from '../hooks/useWorkouts'
import { useProfiles } from '../hooks/useProfiles'
import { useLanguage } from '../hooks/useLanguage'
import { calculateRecommendedWeight } from '../utils/weightCalculator'

type Tab = 'instructies' | 'tips' | 'fouten' | 'geschiedenis'

const CATEGORY_CONFIG: Record<string, { className: string; icon: string }> = {
  'Chest':          { className: 'cat-chest',     icon: '🫁' },
  'Back':           { className: 'cat-back',       icon: '🔙' },
  'Shoulders':      { className: 'cat-shoulders',  icon: '⚡' },
  'Arms - Biceps':  { className: 'cat-arms',       icon: '💪' },
  'Arms - Triceps': { className: 'cat-arms',       icon: '🦾' },
  'Legs':           { className: 'cat-legs',       icon: '🦵' },
  'Glutes':         { className: 'cat-glutes',     icon: '🍑' },
  'Core':           { className: 'cat-core',       icon: '🎯' },
  'Full Body':      { className: 'cat-full',       icon: '⚡' },
}

const DIFFICULTY_STYLE = {
  beginner:     { color: '#00E5A0', bg: 'rgba(0,229,160,0.12)',  label: 'Beginner' },
  intermediate: { color: '#FFB300', bg: 'rgba(255,179,0,0.12)', label: 'Gemiddeld' },
  advanced:     { color: '#FF3B3B', bg: 'rgba(255,59,59,0.12)', label: 'Gevorderd' },
}

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
          <div className="text-center py-16">
            <div className="text-5xl mb-4">❓</div>
            <p style={{ color: '#666' }}>Oefening niet gevonden</p>
          </div>
        </PageWrapper>
      </>
    )
  }

  const history = getExerciseHistory(exercise.id)
  const recommended = activeProfile ? calculateRecommendedWeight(exercise, activeProfile) : null
  const cat = CATEGORY_CONFIG[exercise.category]
  const diff = DIFFICULTY_STYLE[exercise.difficulty]

  const tabs: { key: Tab; label: string; icon: typeof Info }[] = [
    { key: 'instructies', label: 'Instructies', icon: Info },
    { key: 'tips',        label: 'Tips',        icon: Lightbulb },
    { key: 'fouten',      label: 'Fouten',      icon: AlertTriangle },
    { key: 'geschiedenis',label: 'Grafiek',     icon: TrendingUp },
  ]

  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.videoKeyword || exercise.name + ' tutorial form')}`

  return (
    <>
      <Header title="" showBack />

      {/* ─── Hero Banner ──────────────────────────────────────────── */}
      <div className={`relative overflow-hidden ${cat?.className || 'gradient-workout-a'}`} style={{ minHeight: 200 }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(6,6,6,0.95) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)' }} />

        <div className="relative max-w-lg mx-auto px-4 pt-6 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 24 }}>
            <span className="text-5xl block mb-3">{cat?.icon || '🏋️'}</span>
            <h1 className="text-4xl tracking-wider leading-tight m-0" style={{ lineHeight: 1.1 }}>
              {exName(exercise).toUpperCase()}
            </h1>
            <p className="text-sm mt-1 m-0" style={{ color: 'rgba(255,255,255,0.45)' }}>{exercise.name}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.color}30` }}>
                {diff.label}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                {exercise.category}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                {exercise.equipment}
              </span>
              {exercise.isCompound && (
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,179,0,0.15)', color: '#FFB300' }}>
                  Compound
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <PageWrapper>

        {/* ─── Muscles ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#111', border: '1px solid #1C1C1C' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} style={{ color: '#FF5500' }} />
            <p className="text-xs font-semibold uppercase tracking-widest m-0" style={{ color: '#666', letterSpacing: '0.1em' }}>Spiergroepen</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exercise.musclesWorked.map(m => (
              <span key={m} className="text-xs px-2.5 py-1 rounded-full capitalize" style={{ background: '#181818', color: '#888', border: '1px solid #222' }}>
                {m}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ─── Recommended weight ────────────────────────────────────── */}
        {recommended !== null && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-4 mb-4 relative overflow-hidden"
            style={{ background: 'rgba(255,85,0,0.08)', border: '1px solid rgba(255,85,0,0.2)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #FF5500, transparent)' }} />
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} style={{ color: '#FF5500' }} />
              <p className="text-xs font-semibold uppercase tracking-widest m-0" style={{ color: '#FF5500', letterSpacing: '0.1em' }}>Aanbevolen voor jou</p>
            </div>
            <p className="text-4xl font-heading tracking-wider m-0">{recommended} <span className="text-2xl">KG</span></p>
            <p className="text-xs mt-1 m-0" style={{ color: '#666' }}>
              {exercise.defaultSets} sets · {exercise.defaultReps} reps · {exercise.restSeconds}s rust
            </p>
          </motion.div>
        )}

        {/* ─── Video Tutorial ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#444', letterSpacing: '0.1em' }}>Video Tutorial</p>
          <a
            href={youtubeSearch}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden relative cursor-pointer"
            style={{ textDecoration: 'none' }}
          >
            <div
              className={`relative ${cat?.className || 'gradient-workout-a'}`}
              style={{ height: 140 }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2))' }} />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)' }}
                >
                  <Play size={28} fill="#fff" strokeWidth={0} style={{ marginLeft: 3 }} />
                </motion.div>
              </div>

              {/* Label */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold m-0 text-white">Bekijk tutorial</p>
                  <p className="text-xs m-0" style={{ color: 'rgba(255,255,255,0.5)' }}>{exercise.videoKeyword}</p>
                </div>
                <ExternalLink size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </div>
            </div>
          </a>
        </motion.div>

        {/* ─── Tabs ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex gap-1.5 mb-4 overflow-x-auto hide-scrollbar"
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border-0"
              style={activeTab === tab.key
                ? { background: 'linear-gradient(135deg, #FF5500, #FF8833)', color: '#fff', boxShadow: '0 4px 12px rgba(255,85,0,0.3)' }
                : { background: '#111', color: '#555', border: '1px solid #1C1C1C' }
              }
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ─── Tab content ───────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="mb-6"
          >
            {activeTab === 'instructies' && (
              <div className="space-y-3">
                {exercise.instructions.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', damping: 24 }}
                    className="flex gap-3 p-3.5 rounded-2xl"
                    style={{ background: '#111', border: '1px solid #1C1C1C' }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{ background: 'rgba(255,85,0,0.15)', color: '#FF5500', minWidth: 24 }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm m-0 leading-relaxed" style={{ color: '#AAA' }}>{step}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-2.5">
                {exercise.tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 p-3.5 rounded-2xl"
                    style={{ background: 'rgba(255,179,0,0.05)', border: '1px solid rgba(255,179,0,0.12)' }}
                  >
                    <Lightbulb size={16} className="shrink-0 mt-0.5" style={{ color: '#FFB300' }} />
                    <p className="text-sm m-0 leading-relaxed" style={{ color: '#AAA' }}>{tip}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'fouten' && (
              <div className="space-y-2.5">
                {exercise.commonMistakes.map((mistake, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 p-3.5 rounded-2xl"
                    style={{ background: 'rgba(255,59,59,0.05)', border: '1px solid rgba(255,59,59,0.12)' }}
                  >
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: '#FF3B3B' }} />
                    <p className="text-sm m-0 leading-relaxed" style={{ color: '#AAA' }}>{mistake}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'geschiedenis' && (
              <div>
                {history.length > 1 ? (
                  <>
                    <div
                      className="rounded-2xl p-4 mb-3"
                      style={{ background: '#111', border: '1px solid #1C1C1C' }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest mb-3 m-0" style={{ color: '#444', letterSpacing: '0.1em' }}>
                        Gewicht progressie (kg)
                      </p>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF5500" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#FF5500" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1C" />
                            <XAxis dataKey="date" tick={{ fill: '#444', fontSize: 10 }} tickFormatter={v => v.slice(5).replace('-', '/')} />
                            <YAxis tick={{ fill: '#444', fontSize: 10 }} width={36} unit="kg" />
                            <Tooltip
                              contentStyle={{ background: '#181818', border: '1px solid #282828', borderRadius: 12 }}
                              labelStyle={{ color: '#888' }}
                              itemStyle={{ color: '#FF5500' }}
                              formatter={(v) => [`${v}kg`, 'Max gewicht']}
                            />
                            <Area type="monotone" dataKey="maxWeight" stroke="#FF5500" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: '#FF5500', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {history.slice().reverse().map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                          style={{ background: i === 0 ? 'rgba(255,85,0,0.06)' : '#111', border: `1px solid ${i === 0 ? 'rgba(255,85,0,0.15)' : '#1C1C1C'}` }}
                        >
                          <span className="text-xs" style={{ color: '#555' }}>{h.date}</span>
                          <span className="text-sm font-semibold" style={{ color: i === 0 ? '#FF5500' : '#888' }}>
                            {h.maxWeight}kg × {h.maxReps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : history.length === 1 ? (
                  <div className="rounded-2xl p-5 text-center" style={{ background: '#111', border: '1px solid #1C1C1C' }}>
                    <TrendingUp size={28} className="mx-auto mb-3" style={{ color: '#333' }} />
                    <p className="text-sm font-semibold m-0" style={{ color: '#888' }}>Eerste sessie: {history[0].maxWeight}kg × {history[0].maxReps} reps</p>
                    <p className="text-xs mt-1 m-0" style={{ color: '#444' }}>Train nog een keer voor een progressiegrafiek</p>
                  </div>
                ) : (
                  <div className="rounded-2xl p-5 text-center" style={{ background: '#111', border: '1px solid #1C1C1C' }}>
                    <TrendingUp size={28} className="mx-auto mb-3" style={{ color: '#333' }} />
                    <p className="text-sm m-0" style={{ color: '#555' }}>Nog geen geschiedenis voor deze oefening</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── CTA ───────────────────────────────────────────────────── */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/workout', { state: { addExercise: exercise.id } })}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-0 font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #FF5500, #FF8833)',
            boxShadow: '0 8px 24px rgba(255,85,0,0.35)',
            fontSize: 16,
          }}
        >
          <Play size={18} fill="#fff" strokeWidth={0} />
          Start Oefening
          <ChevronRight size={16} />
        </motion.button>
      </PageWrapper>
    </>
  )
}

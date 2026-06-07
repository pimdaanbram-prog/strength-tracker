import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

export type IntensityLevel = 0 | 1 | 2 | 3

interface AnatomicalFigureProps {
  muscleActivation: Record<string, IntensityLevel>
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const LABELS: Record<string, string> = {
  chest: 'Borst',
  front_shoulders: 'Voorste schouders',
  biceps: 'Biceps',
  forearms: 'Onderarmen',
  abs: 'Buik',
  quads: 'Quadriceps',
  hip_flexors: 'Heupbuigers',
  inner_thigh: 'Binnenste dij',
  calves: 'Kuiten',
  traps: 'Trapezius',
  back: 'Rug',
  rear_shoulders: 'Achterste schouders',
  triceps: 'Triceps',
  lower_back: 'Onderrug',
  glutes: 'Billen',
  hamstrings: 'Hamstrings',
  calves_rear: 'Kuiten',
}

function getMuscleColor(intensity: IntensityLevel, accentColor: string): string {
  const opacity = [0, 0.35, 0.65, 0.95][intensity]
  return intensity === 0
    ? 'rgba(128, 128, 128, 0.15)'
    : `${accentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
}

function MusclePath({
  id,
  d,
  activation,
  accent,
  onHover,
}: {
  id: string
  d: string
  activation: Record<string, IntensityLevel>
  accent: string
  onHover: (id: string | null) => void
}) {
  const intensity = activation[id] ?? 0
  return (
    <path
      d={d}
      fill={getMuscleColor(intensity, accent)}
      stroke={intensity > 0 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.16)'}
      strokeWidth={intensity > 0 ? 1.4 : 0.7}
      className={intensity > 0 ? 'muscle-active' : ''}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    />
  )
}

function Anterior({ activation, accent, onHover }: { activation: Record<string, IntensityLevel>; accent: string; onHover: (id: string | null) => void }) {
  return (
    <svg viewBox="0 0 200 500" role="img" aria-label="Anatomisch figuur voorkant" className="h-full w-full">
      <defs>
        <filter id="soft-muscle-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.24" />
        </filter>
      </defs>
      <path d="M82 16c11-13 29-13 40 0 12 15 8 41-8 51-9 6-19 6-28 0-16-10-20-36-4-51Z" fill="rgba(190,190,190,0.22)" stroke="rgba(255,255,255,0.12)" />
      <path d="M91 68h20l5 19 26 13c16 8 26 22 30 42l15 85c2 13-5 24-16 25-10 1-17-5-20-18l-14-67-3 82 20 190c2 19-9 34-25 34-12 0-21-9-24-24l-25-137-25 137c-3 15-12 24-24 24-16 0-27-15-25-34l20-190-3-82-14 67c-3 13-10 19-20 18-11-1-18-12-16-25l15-85c4-20 14-34 30-42l26-13 5-19Z" fill="rgba(180,180,180,0.14)" stroke="rgba(255,255,255,0.12)" filter="url(#soft-muscle-shadow)" />
      <MusclePath id="front_shoulders" activation={activation} accent={accent} onHover={onHover} d="M62 94c12-11 25-8 32 5-10 8-18 17-25 29-10-5-17-15-19-26 3-3 7-6 12-8Zm76 0c-12-11-25-8-32 5 10 8 18 17 25 29 10-5 17-15 19-26-3-3-7-6-12-8Z" />
      <MusclePath id="chest" activation={activation} accent={accent} onHover={onHover} d="M73 105c19-12 38-12 57 0-3 25-12 43-30 53-17-10-27-28-27-53Zm-2 5c-15 8-23 24-23 45 17 3 33-3 48-17-10-9-18-18-25-28Zm58 0c15 8 23 24 23 45-17 3-33-3-48-17 10-9 18-18 25-28Z" />
      <MusclePath id="biceps" activation={activation} accent={accent} onHover={onHover} d="M41 131c15 8 21 24 19 48l-9 46c-10-2-17-10-18-22l-5-42c-2-14 3-25 13-30Zm118 0c-15 8-21 24-19 48l9 46c10-2 17-10 18-22l5-42c2-14-3-25-13-30Z" />
      <MusclePath id="forearms" activation={activation} accent={accent} onHover={onHover} d="M30 213c9 10 16 14 25 13l-7 61c-3 14-12 22-22 18-8-3-11-13-8-27l12-65Zm140 0c-9 10-16 14-25 13l7 61c3 14 12 22 22 18 8-3 11-13 8-27l-12-65Z" />
      <MusclePath id="abs" activation={activation} accent={accent} onHover={onHover} d="M76 156c16 11 33 11 49 0 5 18 5 59 0 85-16 7-33 7-49 0-5-26-5-67 0-85Zm11 13c-4 8-4 17 0 25h26c4-8 4-17 0-25H87Zm-2 35c-3 9-3 17 0 25h30c3-8 3-16 0-25H85Z" />
      <MusclePath id="hip_flexors" activation={activation} accent={accent} onHover={onHover} d="M69 248c20 10 42 10 62 0-2 25-13 43-31 52-18-9-29-27-31-52Z" />
      <MusclePath id="quads" activation={activation} accent={accent} onHover={onHover} d="M56 290c14-12 29-14 43-4l-12 138c-3 16-14 25-27 19-9-4-14-16-12-31l8-122Zm88 0c-14-12-29-14-43-4l12 138c3 16 14 25 27 19 9-4 14-16 12-31l-8-122Z" />
      <MusclePath id="inner_thigh" activation={activation} accent={accent} onHover={onHover} d="M89 294c7 11 11 37 10 78l-18-80c3-2 6-1 8 2Zm22 0c-7 11-11 37-10 78l18-80c-3-2-6-1-8 2Z" />
      <MusclePath id="calves" activation={activation} accent={accent} onHover={onHover} d="M52 401c13 9 25 8 36-2l-3 51c-2 17-10 28-22 28s-18-13-15-30l4-47Zm96 0c-13 9-25 8-36-2l3 51c2 17 10 28 22 28s18-13 15-30l-4-47Z" />
    </svg>
  )
}

function Posterior({ activation, accent, onHover }: { activation: Record<string, IntensityLevel>; accent: string; onHover: (id: string | null) => void }) {
  return (
    <svg viewBox="0 0 200 500" role="img" aria-label="Anatomisch figuur achterkant" className="h-full w-full">
      <path d="M82 16c11-13 29-13 40 0 12 15 8 41-8 51-9 6-19 6-28 0-16-10-20-36-4-51Z" fill="rgba(190,190,190,0.22)" stroke="rgba(255,255,255,0.12)" />
      <path d="M91 68h20l5 19 26 13c16 8 26 22 30 42l15 85c2 13-5 24-16 25-10 1-17-5-20-18l-14-67-3 82 20 190c2 19-9 34-25 34-12 0-21-9-24-24l-25-137-25 137c-3 15-12 24-24 24-16 0-27-15-25-34l20-190-3-82-14 67c-3 13-10 19-20 18-11-1-18-12-16-25l15-85c4-20 14-34 30-42l26-13 5-19Z" fill="rgba(180,180,180,0.14)" stroke="rgba(255,255,255,0.12)" />
      <MusclePath id="traps" activation={activation} accent={accent} onHover={onHover} d="M78 76c14 11 30 11 44 0l14 37c-23 14-49 14-72 0l14-37Z" />
      <MusclePath id="rear_shoulders" activation={activation} accent={accent} onHover={onHover} d="M52 99c19-9 33-6 43 8-7 9-14 17-23 25-14-5-23-15-27-28 2-2 4-4 7-5Zm96 0c-19-9-33-6-43 8 7 9 14 17 23 25 14-5 23-15 27-28-2-2-4-4-7-5Z" />
      <MusclePath id="back" activation={activation} accent={accent} onHover={onHover} d="M64 113c23 14 49 14 72 0 10 34 5 78-36 111-41-33-46-77-36-111Zm-6 19c-13 11-18 30-15 58l7 50c23-14 38-36 46-66-17-7-29-21-38-42Zm84 0c13 11 18 30 15 58l-7 50c-23-14-38-36-46-66 17-7 29-21 38-42Z" />
      <MusclePath id="triceps" activation={activation} accent={accent} onHover={onHover} d="M41 132c15 7 21 23 19 47l-9 47c-11-4-18-13-20-26l-4-37c-2-14 3-25 14-31Zm118 0c-15 7-21 23-19 47l9 47c11-4 18-13 20-26l4-37c2-14-3-25-14-31Z" />
      <MusclePath id="lower_back" activation={activation} accent={accent} onHover={onHover} d="M76 209c16 14 32 14 48 0 8 17 7 34-1 50-15 8-31 8-46 0-8-16-9-33-1-50Z" />
      <MusclePath id="glutes" activation={activation} accent={accent} onHover={onHover} d="M65 257c21-10 35-5 35 26-7 21-22 33-42 34-9-21-7-42 7-60Zm70 0c-21-10-35-5-35 26 7 21 22 33 42 34 9-21 7-42-7-60Z" />
      <MusclePath id="hamstrings" activation={activation} accent={accent} onHover={onHover} d="M56 315c15 8 29 7 42-4l-11 111c-4 18-14 28-27 23-10-4-15-17-12-34l8-96Zm88 0c-15 8-29 7-42-4l11 111c4 18 14 28 27 23 10-4 15-17 12-34l-8-96Z" />
      <MusclePath id="calves_rear" activation={activation} accent={accent} onHover={onHover} d="M51 401c13 10 26 10 38-1l-4 52c-2 16-10 26-22 26-11 0-18-12-15-30l3-47Zm98 0c-13 10-26 10-38-1l4 52c2 16 10 26 22 26 11 0 18-12 15-30l-3-47Z" />
    </svg>
  )
}

export default function AnatomicalFigure({ muscleActivation, size = 'md', interactive = true }: AnatomicalFigureProps) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [hovered, setHovered] = useState<string | null>(null)
  const dimensions = { sm: 'h-[120px]', md: 'h-[360px]', lg: 'h-[520px]' }[size]
  const accent = useMemo(() => {
    if (typeof window === 'undefined') return '#6366f1'
    return getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#6366f1'
  }, [])

  return (
    <div className="relative mx-auto max-w-[360px]">
      {interactive && (
        <div className="mb-3 flex justify-center gap-2">
          {(['front', 'back'] as const).map(next => (
            <button
              key={next}
              onClick={() => setView(next)}
              className="min-h-[36px] rounded-full border px-4 text-xs font-bold"
              style={{
                background: view === next ? 'var(--gradient-card)' : 'var(--bg-glass)',
                borderColor: view === next ? 'var(--border-accent)' : 'var(--border-primary)',
                color: view === next ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              {next === 'front' ? 'Voorkant' : 'Achterkant'}
            </button>
          ))}
        </div>
      )}

      <div className={`${dimensions} perspective-[1200px]`}>
        <motion.div
          animate={{ rotateY: view === 'front' ? 0 : 180 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full preserve-3d"
        >
          <div className="absolute inset-0 backface-hidden">
            <Anterior activation={muscleActivation} accent={accent} onHover={setHovered} />
          </div>
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <Posterior activation={muscleActivation} accent={accent} onHover={setHovered} />
          </div>
        </motion.div>
      </div>

      {interactive && hovered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-14 z-20 -translate-x-1/2 rounded-2xl border px-3 py-2 text-xs font-bold"
          style={{
            background: 'var(--bg-glass)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {LABELS[hovered] ?? hovered} · intensiteit {muscleActivation[hovered] ?? 0}
        </motion.div>
      )}
    </div>
  )
}

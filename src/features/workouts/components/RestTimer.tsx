import { useEffect, useRef } from 'react'
import { useCountdown } from '@/shared/hooks/useTimer'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, X } from 'lucide-react'
import { useAppStore } from '@/shared/lib/store'

interface RestTimerProps {
  duration: number
  onClose: () => void
}

function playFinishBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start()
    osc.stop(ctx.currentTime + 0.8)
  } catch { /* AudioContext niet beschikbaar */ }
}

export default function RestTimer({ duration, onClose }: RestTimerProps) {
  const { isRunning, isFinished, start, pause, reset, addTime, formatTime, progress } = useCountdown(duration)
  const settings = useAppStore(s => s.settings)
  const notifiedRef = useRef(false)

  // Geluid + vibratie zodra de rusttijd voorbij is (volgens instellingen)
  useEffect(() => {
    if (!isFinished) {
      notifiedRef.current = false
      return
    }
    if (notifiedRef.current) return
    notifiedRef.current = true
    if (settings.soundEnabled) playFinishBeep()
    if (settings.hapticEnabled && navigator.vibrate) navigator.vibrate([200, 100, 200])
  }, [isFinished, settings.soundEnabled, settings.hapticEnabled])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ y: 60, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, scale: 0.95 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 text-center relative"
        style={{
          background: 'var(--theme-bg-card)',
          border: '1px solid var(--theme-glass-border)',
          borderBottom: 'none',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--theme-border-subtle)' }} />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl tracking-widest m-0">RUST</h3>
          {/* 44×44 touch target */}
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer border-0"
            style={{ background: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress ring — responsive size */}
        <div className="relative mx-auto mb-6" style={{ width: 176, height: 176 }}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--theme-border)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={isFinished ? 'var(--theme-success)' : 'var(--theme-accent)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-heading tracking-wider"
              style={{ color: isFinished ? 'var(--theme-success)' : 'var(--theme-text-primary)' }}
            >
              {isFinished ? 'KLAAR!' : formatTime()}
            </span>
            {!isFinished && (
              <span className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>seconden</span>
            )}
          </div>
        </div>

        {/* Tijd bijstellen */}
        {!isFinished && (
          <div className="flex justify-center gap-2 mb-4">
            {[
              { label: '−15s', delta: -15 },
              { label: '+30s', delta: 30 },
            ].map(({ label, delta }) => (
              <button
                key={label}
                onClick={() => addTime(delta)}
                aria-label={`Rusttijd ${label}`}
                className="min-h-[40px] px-4 rounded-xl text-xs font-bold cursor-pointer border-0"
                style={{ background: 'var(--theme-bg-input)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-4">
          {!isFinished && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={isRunning ? pause : start}
              className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-0"
              style={{
                background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-gradient-text-to))',
                boxShadow: '0 6px 20px var(--theme-accent-glow)',
              }}
            >
              {isRunning
                ? <Pause size={24} fill="#fff" strokeWidth={0} />
                : <Play size={24} fill="#fff" strokeWidth={0} style={{ marginLeft: 2 }} />
              }
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => reset(duration)}
            className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-0"
            style={{ background: 'var(--theme-border)' }}
          >
            <RotateCcw size={22} style={{ color: 'var(--theme-text-secondary)' }} />
          </motion.button>
          {isFinished && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onClose}
              className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-0 text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #00E5A0, #00B4D8)', boxShadow: '0 6px 20px rgba(0,229,160,0.35)' }}
            >
              <X size={22} />
            </motion.button>
          )}
        </div>

        {isFinished && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm"
            style={{ color: 'var(--theme-success)' }}
          >
            Rusttijd voorbij — pak je volgende set!
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}

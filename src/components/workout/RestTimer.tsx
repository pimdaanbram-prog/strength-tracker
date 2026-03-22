import { useCountdown } from '../../hooks/useTimer'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, X } from 'lucide-react'

interface RestTimerProps {
  duration: number
  onClose: () => void
}

export default function RestTimer({ duration, onClose }: RestTimerProps) {
  const { isRunning, isFinished, start, pause, reset, formatTime, progress } = useCountdown(duration)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-bg-card border border-border rounded-2xl p-8 w-80 text-center">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg tracking-wider text-text-primary m-0">RUST</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#2A2A2A" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={isFinished ? '#10B981' : '#3B82F6'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-heading tracking-wider ${isFinished ? 'text-success' : 'text-text-primary'}`}>
              {isFinished ? 'KLAAR!' : formatTime()}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {!isFinished && (
            <button
              onClick={isRunning ? pause : start}
              className="p-3 rounded-full bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
            >
              {isRunning ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
            </button>
          )}
          <button
            onClick={() => reset(duration)}
            className="p-3 rounded-full bg-bg-input hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw size={24} className="text-text-secondary" />
          </button>
        </div>

        {isFinished && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-success text-sm"
          >
            Rusttijd voorbij — ga door met je volgende set!
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

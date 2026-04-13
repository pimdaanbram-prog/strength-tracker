import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { SetLog } from '../../hooks/useWorkouts'

interface SetLoggerProps {
  set: SetLog
  isTimeBased: boolean
  onChange: (set: SetLog) => void
}

export default function SetLogger({ set, isTimeBased, onChange }: SetLoggerProps) {
  const [editing, setEditing] = useState(false)

  const handleComplete = () => {
    onChange({ ...set, completed: !set.completed })
  }

  return (
    <div
      className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${
        set.completed ? 'bg-success/10' : 'bg-bg-input'
      }`}
    >
      {/* Set label */}
      <span className="text-xs text-text-muted w-8 shrink-0 font-medium">
        S{set.setNumber}
      </span>

      {!isTimeBased ? (
        <>
          {/* Weight input */}
          <div className="flex-1 relative">
            <input
              type="number"
              inputMode="decimal"
              autoComplete="off"
              value={set.weight ?? ''}
              onChange={e => onChange({ ...set, weight: e.target.value ? Number(e.target.value) : null })}
              placeholder="kg"
              className="w-full bg-transparent text-text-primary text-base outline-none placeholder:text-text-muted py-1"
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
            />
          </div>
          <span className="text-text-muted text-sm shrink-0">×</span>
          {/* Reps input */}
          <div className="w-16">
            <input
              type="number"
              inputMode="numeric"
              autoComplete="off"
              value={set.reps ?? ''}
              onChange={e => onChange({ ...set, reps: e.target.value ? Number(e.target.value) : null })}
              placeholder="reps"
              className="w-full bg-transparent text-text-primary text-base outline-none placeholder:text-text-muted py-1"
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
            />
          </div>
        </>
      ) : (
        <div className="flex-1">
          <input
            type="number"
            inputMode="numeric"
            autoComplete="off"
            value={set.seconds ?? ''}
            onChange={e => onChange({ ...set, seconds: e.target.value ? Number(e.target.value) : null })}
            placeholder="seconden"
            className="w-full bg-transparent text-text-primary text-base outline-none placeholder:text-text-muted py-1"
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
          />
        </div>
      )}

      {/* RPE selector — only after completing */}
      {!editing && set.completed && (
        <select
          value={set.rpe ?? ''}
          onChange={e => onChange({ ...set, rpe: e.target.value ? Number(e.target.value) : null })}
          className="bg-transparent text-text-muted text-xs outline-none w-16 cursor-pointer py-1"
        >
          <option value="">RPE</option>
          {[6, 7, 8, 9, 10].map(r => (
            <option key={r} value={r}>RPE {r}</option>
          ))}
        </select>
      )}

      {/* Complete button — 44×44 minimum touch target */}
      <button
        onClick={handleComplete}
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer border-0 shrink-0 ${
          set.completed
            ? 'bg-success text-white'
            : 'bg-bg-card hover:bg-white/10 text-text-muted'
        }`}
        style={set.completed ? { boxShadow: '0 0 12px rgba(0,229,160,0.3)' } : {}}
      >
        {set.completed ? <Check size={18} /> : <X size={16} />}
      </button>
    </div>
  )
}

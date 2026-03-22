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
      className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-colors ${
        set.completed ? 'bg-success/10' : 'bg-bg-input'
      }`}
    >
      <span className="text-xs text-text-muted w-8 shrink-0">Set {set.setNumber}</span>

      {!isTimeBased ? (
        <>
          <div className="flex-1">
            <input
              type="number"
              value={set.weight ?? ''}
              onChange={e => onChange({ ...set, weight: e.target.value ? Number(e.target.value) : null })}
              placeholder="kg"
              className="w-full bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
            />
          </div>
          <span className="text-text-muted text-xs">×</span>
          <div className="w-16">
            <input
              type="number"
              value={set.reps ?? ''}
              onChange={e => onChange({ ...set, reps: e.target.value ? Number(e.target.value) : null })}
              placeholder="reps"
              className="w-full bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
            />
          </div>
        </>
      ) : (
        <div className="flex-1">
          <input
            type="number"
            value={set.seconds ?? ''}
            onChange={e => onChange({ ...set, seconds: e.target.value ? Number(e.target.value) : null })}
            placeholder="seconden"
            className="w-full bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
          />
        </div>
      )}

      {/* RPE */}
      {!editing && set.completed && (
        <select
          value={set.rpe ?? ''}
          onChange={e => onChange({ ...set, rpe: e.target.value ? Number(e.target.value) : null })}
          className="bg-transparent text-text-muted text-xs outline-none w-14 cursor-pointer"
        >
          <option value="">RPE</option>
          {[6, 7, 8, 9, 10].map(r => (
            <option key={r} value={r}>RPE {r}</option>
          ))}
        </select>
      )}

      <button
        onClick={handleComplete}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          set.completed
            ? 'bg-success text-white'
            : 'bg-bg-card hover:bg-white/10 text-text-muted'
        }`}
      >
        {set.completed ? <Check size={14} /> : <X size={14} />}
      </button>
    </div>
  )
}

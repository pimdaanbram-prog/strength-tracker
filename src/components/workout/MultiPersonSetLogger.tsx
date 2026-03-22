import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { SetLog } from '../../hooks/useWorkouts'

interface MultiPersonSetLoggerProps {
  set: SetLog
  isTimeBased: boolean
  onChange: (set: SetLog) => void
  accentColor: string
}

export default function MultiPersonSetLogger({
  set,
  isTimeBased,
  onChange,
  accentColor,
}: MultiPersonSetLoggerProps) {
  const [editing, setEditing] = useState(false)

  const handleComplete = () => {
    onChange({ ...set, completed: !set.completed })
  }

  return (
    <div
      className={`flex items-center gap-2 py-2 px-2.5 rounded-xl transition-colors ${
        set.completed ? 'bg-success/10' : 'bg-bg-input'
      }`}
    >
      <span className="text-xs text-text-muted w-6 shrink-0">S{set.setNumber}</span>

      {!isTimeBased ? (
        <>
          <div className="flex-1 min-w-0">
            <input
              type="number"
              value={set.weight ?? ''}
              onChange={e =>
                onChange({
                  ...set,
                  weight: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="kg"
              className="w-full bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
            />
          </div>
          <span className="text-text-muted text-xs">x</span>
          <div className="w-12">
            <input
              type="number"
              value={set.reps ?? ''}
              onChange={e =>
                onChange({
                  ...set,
                  reps: e.target.value ? Number(e.target.value) : null,
                })
              }
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
            onChange={e =>
              onChange({
                ...set,
                seconds: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="sec"
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
          onChange={e =>
            onChange({
              ...set,
              rpe: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="bg-transparent text-text-muted text-xs outline-none w-14 cursor-pointer"
        >
          <option value="">RPE</option>
          {[6, 7, 8, 9, 10].map(r => (
            <option key={r} value={r}>
              RPE {r}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={handleComplete}
        className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
          set.completed
            ? 'text-white'
            : 'bg-bg-card hover:bg-white/10 text-text-muted'
        }`}
        style={set.completed ? { backgroundColor: accentColor } : undefined}
      >
        {set.completed ? <Check size={12} /> : <X size={12} />}
      </button>
    </div>
  )
}

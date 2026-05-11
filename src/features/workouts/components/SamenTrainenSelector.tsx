import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Users, Check } from 'lucide-react'
import type { UserProfile } from '@/shared/store/appStore'

interface SamenTrainenSelectorProps {
  profiles: UserProfile[]
  onStart: (selectedProfileIds: string[]) => void
  onClose: () => void
}

export default function SamenTrainenSelector({
  profiles,
  onStart,
  onClose,
}: SamenTrainenSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleProfile = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const fitnessLevelNL: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Gemiddeld',
    advanced: 'Gevorderd',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-bg-secondary w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Users size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-heading tracking-wider text-text-primary m-0">
                SAMEN TRAINEN
              </h3>
              <p className="text-xs text-text-muted m-0">
                Selecteer wie er meetrainen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-text-muted"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile grid */}
        <div className="space-y-2 mb-6">
          {profiles.map(profile => {
            const isSelected = selectedIds.includes(profile.id)
            return (
              <motion.button
                key={profile.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleProfile(profile.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-bg-card hover:border-border-light'
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: profile.color + '30' }}
                >
                  {profile.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary m-0 truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-text-muted m-0">
                    {fitnessLevelNL[profile.fitnessLevel] || profile.fitnessLevel}
                  </p>
                </div>

                {/* Checkmark */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-accent text-white'
                      : 'bg-bg-input text-transparent'
                  }`}
                >
                  <Check size={14} />
                </div>
              </motion.button>
            )
          })}
        </div>

        {profiles.length < 2 && (
          <p className="text-xs text-text-muted text-center mb-4">
            Je hebt minimaal 2 profielen nodig om samen te trainen.
          </p>
        )}

        {/* Start button */}
        <button
          onClick={() => onStart(selectedIds)}
          disabled={selectedIds.length < 2}
          className={`w-full py-3 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            selectedIds.length >= 2
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-bg-input text-text-muted cursor-not-allowed'
          }`}
        >
          <Users size={18} />
          {selectedIds.length >= 2
            ? `Start Training (${selectedIds.length} personen)`
            : 'Selecteer minimaal 2 personen'}
        </button>
      </motion.div>
    </motion.div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useProfiles } from '../../hooks/useProfiles'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile } = useProfiles()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!activeProfile) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl
                   bg-bg-card border border-border hover:border-border-light
                   transition-colors cursor-pointer"
      >
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ backgroundColor: `${activeProfile.color}20` }}
        >
          {activeProfile.avatar}
        </span>
        <span className="text-sm font-medium text-text-primary max-w-[100px] truncate">
          {activeProfile.name}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-56
                       bg-bg-card border border-border rounded-xl
                       shadow-xl overflow-hidden z-50"
          >
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  setActiveProfile(profile.id)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3
                           hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: `${profile.color}20` }}
                >
                  {profile.avatar}
                </span>
                <span className="text-sm text-text-primary truncate flex-1 text-left">
                  {profile.name}
                </span>
                {profile.id === activeProfile.id && (
                  <Check size={14} className="text-accent shrink-0" />
                )}
              </button>
            ))}

            <div className="border-t border-border">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/profiles')
                }}
                className="w-full px-4 py-3 text-sm text-text-muted
                           hover:text-text-primary hover:bg-white/5
                           transition-colors text-left cursor-pointer"
              >
                Profielen beheren
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

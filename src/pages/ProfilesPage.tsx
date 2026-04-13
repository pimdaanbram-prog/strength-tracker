import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '../hooks/useProfiles'
import { motion } from 'framer-motion'
import { Plus, Users, CheckCircle, Trash2, Settings, Wrench, Ruler, Trophy } from 'lucide-react'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import Modal from '../components/ui/Modal'
import type { UserProfile } from '../store/appStore'

const LEVEL_CONFIG = {
  beginner:     { label: 'Beginner',   color: '#00E5A0', bg: 'rgba(0,229,160,0.1)' },
  intermediate: { label: 'Gemiddeld',  color: '#FFB300', bg: 'rgba(255,179,0,0.1)' },
  advanced:     { label: 'Gevorderd',  color: '#FF5500', bg: 'rgba(255,85,0,0.1)' },
}

function PremiumProfileCard({
  profile,
  isActive,
  onSelect,
  onDelete,
}: {
  profile: UserProfile
  isActive: boolean
  onSelect: () => void
  onDelete?: () => void
}) {
  const lvl = LEVEL_CONFIG[profile.fitnessLevel] || LEVEL_CONFIG.beginner
  const color = profile.color || '#FF5500'

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="relative rounded-3xl p-5 overflow-hidden cursor-pointer"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`
          : '#111',
        border: `1px solid ${isActive ? color + '40' : '#1C1C1C'}`,
        boxShadow: isActive ? `0 8px 32px ${color}20` : 'none',
      }}
    >
      {/* Top accent line when active */}
      {isActive && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      )}

      {/* Active badge */}
      {isActive && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: `${color}20`, color }}
        >
          <CheckCircle size={10} />
          ACTIEF
        </div>
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="absolute bottom-3 right-3 p-1.5 rounded-xl cursor-pointer bg-transparent border-0 transition-colors"
          style={{ color: 'rgba(255,59,59,0.3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#FF3B3B')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,59,59,0.3)')}
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
        style={{ background: `${color}15`, border: `1px solid ${color}20` }}
      >
        {profile.avatar}
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold m-0 mb-1" style={{ color: '#FAFAFA' }}>{profile.name}</h3>

      {/* Level badge */}
      <span
        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
        style={{ background: lvl.bg, color: lvl.color, letterSpacing: '0.08em' }}
      >
        {lvl.label}
      </span>

      {/* Stats */}
      <div className="flex items-center gap-3 mt-3">
        {[
          { label: 'kg', value: profile.weight },
          { label: 'cm', value: profile.height },
          { label: 'jr', value: profile.age },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-sm font-semibold m-0" style={{ color: '#888' }}>{value}</p>
            <p className="text-[9px] m-0" style={{ color: '#444' }}>{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function ProfilesPage() {
  const { profiles, activeProfileId, setActiveProfile, deleteProfile } = useProfiles()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const profileToDelete = profiles.find(p => p.id === deleteTarget)

  const handleDelete = () => {
    if (deleteTarget) { deleteProfile(deleteTarget); setDeleteTarget(null) }
  }

  return (
    <>
      <Header title="PROFIELEN" />
      <PageWrapper>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.2)' }}
          >
            <Users size={22} style={{ color: '#FF5500' }} />
          </div>
          <div>
            <h2 className="text-2xl tracking-wider m-0">PROFIELEN</h2>
            <p className="text-xs m-0 mt-0.5" style={{ color: '#555' }}>
              {profiles.length} {profiles.length === 1 ? 'profiel' : 'profielen'} aangemaakt
            </p>
          </div>
        </motion.div>

        {/* Profile grid */}
        {profiles.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-3 mb-5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {profiles.map(profile => (
              <motion.div
                key={profile.id}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.97 },
                  show:   { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              >
                <PremiumProfileCard
                  profile={profile}
                  isActive={profile.id === activeProfileId}
                  onSelect={() => setActiveProfile(profile.id)}
                  onDelete={() => setDeleteTarget(profile.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💪</div>
            <h2 className="text-2xl tracking-wider mb-2">GEEN PROFIELEN</h2>
            <p className="text-sm mb-6" style={{ color: '#555' }}>Maak je eerste profiel aan om te beginnen</p>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { to: '/measurements', icon: Ruler,   label: 'Metingen',    sub: 'Gewicht & lichaam', color: '#4A8FFF' },
            { to: '/tools',        icon: Wrench,  label: 'Tools',       sub: 'Calculators',       color: '#00E5A0' },
            { to: '/achievements', icon: Trophy,  label: 'Achievements', sub: 'XP & badges',      color: '#FFB300' },
            { to: '/settings',     icon: Settings, label: 'Instellingen', sub: 'App & data',      color: '#888' },
          ].map(({ to, icon: Icon, label, sub, color }) => (
            <motion.button
              key={to}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(to)}
              className="flex items-center gap-3 p-5 rounded-2xl text-left cursor-pointer border-0"
              style={{ background: '#111', border: '1px solid #1C1C1C' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold m-0 text-white truncate">{label}</p>
                <p className="text-xs m-0 mt-0.5 truncate" style={{ color: '#555' }}>{sub}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/profiles/new')}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-0 font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #FF5500, #FF8833)',
            boxShadow: '0 8px 24px rgba(255,85,0,0.3)',
            fontSize: 15,
          }}
        >
          <Plus size={18} />
          Nieuw Profiel Aanmaken
        </motion.button>

        {/* Delete modal */}
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Profiel Verwijderen">
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#888' }}>
            Weet je zeker dat je het profiel van{' '}
            <strong style={{ color: '#FAFAFA' }}>{profileToDelete?.name}</strong>{' '}
            wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 rounded-2xl font-semibold cursor-pointer border-0"
              style={{ background: '#181818', color: '#888', border: '1px solid #1C1C1C' }}
            >
              Annuleren
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 rounded-2xl font-semibold cursor-pointer border-0 text-white"
              style={{ background: 'rgba(255,59,59,0.15)', color: '#FF3B3B', border: '1px solid rgba(255,59,59,0.2)' }}
            >
              Verwijderen
            </button>
          </div>
        </Modal>
      </PageWrapper>
    </>
  )
}

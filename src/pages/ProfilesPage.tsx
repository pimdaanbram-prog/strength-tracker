import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '../hooks/useProfiles'
import ProfileCard from '../components/profile/ProfileCard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Plus, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilesPage() {
  const { profiles, activeProfileId, setActiveProfile, deleteProfile } = useProfiles()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const profileToDelete = profiles.find((p) => p.id === deleteTarget)

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProfile(deleteTarget)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-heading tracking-wide text-text-primary">
                Profielen
              </h1>
              <p className="text-xs text-text-muted">
                {profiles.length} {profiles.length === 1 ? 'profiel' : 'profielen'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile grid */}
        {profiles.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {profiles.map((profile) => (
              <motion.div
                key={profile.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ProfileCard
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
            <div className="text-5xl mb-4">💪</div>
            <h2 className="text-xl font-heading text-text-primary mb-2">
              Geen Profielen
            </h2>
            <p className="text-sm text-text-muted mb-6">
              Maak je eerste profiel aan om te beginnen
            </p>
          </div>
        )}

        {/* Add button */}
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/profiles/new')}
        >
          <Plus size={18} />
          Nieuw Profiel
        </Button>

        {/* Delete confirmation modal */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Profiel Verwijderen"
        >
          <p className="text-sm text-text-secondary mb-6">
            Weet je zeker dat je het profiel van{' '}
            <span className="font-semibold text-text-primary">
              {profileToDelete?.name}
            </span>{' '}
            wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDeleteTarget(null)}
            >
              Annuleren
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>
              Verwijderen
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}

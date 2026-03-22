import type { UserProfile } from '../../store/appStore'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { Trash2, CheckCircle } from 'lucide-react'

const levelLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Gemiddeld',
  advanced: 'Gevorderd',
}

const levelVariants: Record<string, 'success' | 'warning' | 'accent'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'accent',
}

interface ProfileCardProps {
  profile: UserProfile
  isActive: boolean
  onSelect: () => void
  onDelete?: () => void
}

export default function ProfileCard({
  profile,
  isActive,
  onSelect,
  onDelete,
}: ProfileCardProps) {
  return (
    <Card
      hover
      active={isActive}
      accentColor={profile.color}
      className="relative p-5"
      onClick={onSelect}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 right-3">
          <CheckCircle size={18} style={{ color: profile.color || 'var(--color-accent)' }} />
        </div>
      )}

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute bottom-3 right-3 p-1.5 rounded-lg
                     text-text-muted hover:text-danger hover:bg-danger/10
                     transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3"
        style={{ backgroundColor: `${profile.color}20` }}
      >
        {profile.avatar}
      </div>

      {/* Info */}
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {profile.name}
      </h3>

      <Badge variant={levelVariants[profile.fitnessLevel]} size="sm">
        {levelLabels[profile.fitnessLevel]}
      </Badge>

      <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
        <span>{profile.weight} kg</span>
        <span className="w-1 h-1 rounded-full bg-text-muted" />
        <span>{profile.height} cm</span>
        <span className="w-1 h-1 rounded-full bg-text-muted" />
        <span>{profile.age} jaar</span>
      </div>
    </Card>
  )
}

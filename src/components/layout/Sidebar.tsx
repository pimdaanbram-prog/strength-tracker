import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Dumbbell,
  Gauge,
  Home,
  Palette,
  Ruler,
  Settings,
  User,
  Wrench,
} from 'lucide-react'
import { useAppStore } from '@/shared/lib/store'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/exercises', label: 'Oefeningen', icon: Gauge },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/measurements', label: 'Metingen', icon: Ruler },
  { to: '/tools', label: 'Tools', icon: Wrench },
  { to: '/profiles', label: 'Profielen', icon: User },
  { to: '/settings', label: 'Instellingen', icon: Settings },
] as const

function getLevel(xp = 0) {
  return Math.floor(xp / 500) + 1
}

function getLevelProgress(xp = 0) {
  return Math.min(100, Math.round((xp % 500) / 5))
}

export default function Sidebar() {
  const navigate = useNavigate()
  const activeProfile = useAppStore(s => s.getActiveProfile())
  const level = getLevel(activeProfile?.xp)
  const progress = getLevelProgress(activeProfile?.xp)

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 z-40 hidden h-[100dvh] w-[280px] flex-col px-4 py-5 lg:flex"
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderRight: '1px solid var(--border-primary)',
      }}
    >
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            background: 'var(--theme-accent-grad)',
            boxShadow: '0 10px 28px var(--accent-glow)',
          }}
        >
          <Dumbbell size={20} color="#fff" />
        </div>
        <div>
          <div
            className="text-lg font-bold leading-none"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            StrengthTracker
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
            Training log
          </div>
        </div>
      </button>

      <div
        className="mb-5 rounded-2xl p-4"
        style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
            style={{ background: activeProfile?.color ?? 'var(--theme-accent-grad)' }}
          >
            {activeProfile?.avatar || activeProfile?.name?.slice(0, 1).toUpperCase() || 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {activeProfile?.name || 'Geen profiel'}
            </p>
            <p className="m-0 mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
              Level {level} · {activeProfile?.xp ?? 0} XP
            </p>
          </div>
          <div
            className="rounded-full px-2 py-1 text-[10px] font-bold"
            style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
          >
            LVL {level}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: 'var(--theme-accent-grad)', boxShadow: '0 0 18px var(--accent-glow)' }}
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="group relative flex min-h-[48px] items-center gap-3 overflow-hidden rounded-2xl px-3 text-sm font-bold no-underline"
            style={({ isActive }) => ({
              background: isActive ? 'var(--gradient-card)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: isActive ? 'inset 0 0 20px var(--accent-glow)' : 'none',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate('/themes')}
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl border text-xs font-bold"
          style={{
            background: 'var(--bg-glass)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
          }}
        >
          <Palette size={15} />
          Thema
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl border text-xs font-bold"
          style={{
            background: 'var(--bg-glass)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
          }}
        >
          <Settings size={15} />
          Settings
        </button>
      </div>
    </motion.aside>
  )
}

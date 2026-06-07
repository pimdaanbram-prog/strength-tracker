import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Dumbbell,
  Gauge,
  Home,
  MoreHorizontal,
  Palette,
  Ruler,
  Settings,
  User,
  Wrench,
  X,
} from 'lucide-react'

const PRIMARY_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/exercises', label: 'Oefeningen', icon: Gauge },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
] as const

const MORE_ITEMS = [
  { to: '/measurements', label: 'Metingen', icon: Ruler },
  { to: '/tools', label: 'Tools', icon: Wrench },
  { to: '/profiles', label: 'Profielen', icon: User },
  { to: '/themes', label: "Thema's", icon: Palette },
  { to: '/settings', label: 'Instellingen', icon: Settings },
] as const

function isRouteActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname.startsWith(to)
}

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)
  const isMoreActive = MORE_ITEMS.some(item => isRouteActive(location.pathname, item.to))

  function go(to: string) {
    setShowMore(false)
    navigate(to)
  }

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              key="mobile-more-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
              onClick={() => setShowMore(false)}
            />
            <motion.div
              key="mobile-more-sheet"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-3 right-3 z-50 rounded-3xl p-3 lg:hidden"
              style={{
                bottom: 'calc(88px + env(safe-area-inset-bottom))',
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(28px) saturate(160%)',
                WebkitBackdropFilter: 'blur(28px) saturate(160%)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
                  Meer
                </span>
                <button
                  onClick={() => setShowMore(false)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                >
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MORE_ITEMS.map(({ to, label, icon: Icon }) => {
                  const active = isRouteActive(location.pathname, to)
                  return (
                    <motion.button
                      key={to}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => go(to)}
                      className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border px-3 text-left text-sm font-bold"
                      style={{
                        background: active ? 'var(--gradient-card)' : 'var(--bg-tertiary)',
                        borderColor: active ? 'var(--border-accent)' : 'var(--border-primary)',
                        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <Icon size={18} />
                      {label}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 lg:hidden"
        style={{
          height: 'calc(72px + env(safe-area-inset-bottom))',
          padding: '8px 10px calc(8px + env(safe-area-inset-bottom))',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderTop: '1px solid var(--border-primary)',
          boxShadow: '0 -10px 32px rgba(0,0,0,0.28)',
        }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)' }}
        />
        {PRIMARY_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isRouteActive(location.pathname, to)
          return (
            <motion.button
              key={to}
              whileTap={{ scale: 0.88 }}
              animate={{ scale: active ? 1.06 : 1 }}
              transition={{ type: 'spring', damping: 16, stiffness: 360 }}
              onClick={() => go(to)}
              className="relative flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-0 bg-transparent"
              style={{ color: active ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-x-1 top-1 bottom-1 rounded-2xl"
                  style={{ background: 'var(--gradient-card)', boxShadow: '0 0 18px var(--accent-glow)' }}
                  transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                />
              )}
              <Icon className="relative z-10" size={19} strokeWidth={active ? 2.4 : 1.8} />
              <span
                className="relative z-10 max-w-full truncate text-[9px] font-bold"
                style={{
                  opacity: active ? 1 : 0,
                  color: 'var(--accent-primary)',
                }}
              >
                {label}
              </span>
              {!active && <span className="relative z-10 h-[10px]" />}
              {active && (
                <span
                  className="relative z-10 h-1 w-1 rounded-full"
                  style={{ background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }}
                />
              )}
            </motion.button>
          )
        })}
        <motion.button
          whileTap={{ scale: 0.88 }}
          animate={{ scale: showMore || isMoreActive ? 1.06 : 1 }}
          transition={{ type: 'spring', damping: 16, stiffness: 360 }}
          onClick={() => setShowMore(v => !v)}
          className="relative flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-0 bg-transparent"
          style={{ color: showMore || isMoreActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        >
          {(showMore || isMoreActive) && (
            <motion.div
              layoutId="mobile-nav-active"
              className="absolute inset-x-1 top-1 bottom-1 rounded-2xl"
              style={{ background: 'var(--gradient-card)', boxShadow: '0 0 18px var(--accent-glow)' }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            />
          )}
          <MoreHorizontal className="relative z-10" size={19} />
          <span
            className="relative z-10 text-[9px] font-bold"
            style={{ opacity: showMore || isMoreActive ? 1 : 0 }}
          >
            Meer
          </span>
          {!(showMore || isMoreActive) && <span className="relative z-10 h-[10px]" />}
          {(showMore || isMoreActive) && (
            <span
              className="relative z-10 h-1 w-1 rounded-full"
              style={{ background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }}
            />
          )}
        </motion.button>
      </nav>
    </>
  )
}

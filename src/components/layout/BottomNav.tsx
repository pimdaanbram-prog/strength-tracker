import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Dumbbell, Search, BarChart3, MoreHorizontal, X,
  Users, Clock, Trophy, Wrench, Ruler, Settings, Palette,
  BookMarked, CalendarDays,
} from 'lucide-react'

// ─── Main tabs (always visible) ───────────────────────────────────────────────
const MAIN_TABS = [
  { to: '/',          icon: Home,          label: 'Home'      },
  { to: '/workout',   icon: Dumbbell,      label: 'Training'  },
  { to: '/exercises', icon: Search,        label: 'Oefeningen' },
  { to: '/progress',  icon: BarChart3,     label: 'Stats'     },
] as const

// ─── Meer-sheet items ─────────────────────────────────────────────────────────
const MORE_ITEMS = [
  { to: '/profiles',     icon: Users,        label: 'Profielen',    color: '#FF5500' },
  { to: '/history',      icon: Clock,        label: 'Historie',     color: '#4A8FFF' },
  { to: '/plans',        icon: BookMarked,   label: 'Plannen',      color: '#00E5A0' },
  { to: '/week-feedback',icon: CalendarDays, label: 'Weekfeedback', color: '#818CF8' },
  { to: '/achievements', icon: Trophy,       label: 'Achievements', color: '#FFB300' },
  { to: '/measurements', icon: Ruler,        label: 'Metingen',     color: '#06b6d4' },
  { to: '/tools',        icon: Wrench,       label: 'Tools',        color: '#00C060' },
  { to: '/themes',       icon: Palette,      label: "Thema's",      color: '#A855F7' },
  { to: '/settings',     icon: Settings,     label: 'Instellingen', color: '#888888' },
] as const

export default function BottomNav() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const [showMore, setShowMore] = useState(false)

  // Index of the active main tab (-1 if we're on a secondary page)
  const activeIndex = MAIN_TABS.findIndex(item => {
    if (item.to === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.to)
  })

  // True when current page is NOT one of the 4 main tabs
  const onSecondaryPage = activeIndex === -1

  const handleMainTab = (to: string) => {
    setShowMore(false)
    navigate(to)
  }

  const handleMoreItem = (to: string) => {
    setShowMore(false)
    navigate(to)
  }

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowMore(false)}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Meer sheet ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            key="meer-sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="fixed left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              bottom: 0,
              background: 'var(--theme-bg-secondary)',
              borderTop: '1px solid var(--theme-border)',
              boxShadow: '0 -16px 48px rgba(0,0,0,0.6)',
              paddingBottom: 'max(7rem, calc(env(safe-area-inset-bottom) + 7rem))',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--theme-border-subtle)' }} />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h3
                className="text-base font-heading tracking-widest m-0"
                style={{ color: 'var(--theme-text-muted)', letterSpacing: '0.12em' }}
              >
                MEER
              </h3>
              <button
                onClick={() => setShowMore(false)}
                className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-bg-input)', border: '1px solid var(--theme-border)' }}
              >
                <X size={16} style={{ color: 'var(--theme-text-muted)' }} />
              </button>
            </div>

            {/* 3-column grid */}
            <div className="grid grid-cols-3 gap-3 px-4 pb-2">
              {MORE_ITEMS.map(({ to, icon: Icon, label, color }) => {
                const isActive = location.pathname.startsWith(to)
                return (
                  <motion.button
                    key={to}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleMoreItem(to)}
                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-2xl cursor-pointer border-0"
                    style={{
                      background: isActive ? `${color}15` : 'var(--theme-bg-input)',
                      border: `1px solid ${isActive ? color + '35' : 'var(--theme-border)'}`,
                      boxShadow: isActive ? `0 4px 16px ${color}20` : 'none',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}20` }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <span
                      className="text-[10px] font-semibold text-center leading-tight"
                      style={{ color: isActive ? color : 'var(--theme-text-secondary)' }}
                    >
                      {label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom nav bar ───────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260, delay: 0.1 }}
          className="relative flex items-center gap-1 px-2 py-2 rounded-full"
          style={{
            background: 'var(--theme-nav-bg, rgba(14,14,14,0.92))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--theme-glass-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Main tabs */}
          {MAIN_TABS.map(({ to, icon: Icon, label }, i) => {
            const isActive = i === activeIndex

            return (
              <button
                key={to}
                onClick={() => handleMainTab(to)}
                className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer border-0 bg-transparent p-0"
                style={{ minWidth: 58, minHeight: 52 }}
              >
                {/* Active pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'var(--theme-accent-muted)',
                        border: '1px solid var(--theme-accent)',
                        opacity: 0.7,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.7, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="relative z-10"
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ color: isActive ? 'var(--theme-accent)' : '#555555' }}
                  />
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.45 }}
                  className="relative z-10 text-[9px] font-semibold tracking-wide uppercase"
                  style={{
                    letterSpacing: '0.06em',
                    color: isActive ? 'var(--theme-accent)' : '#555555',
                  }}
                >
                  {label}
                </motion.span>

                {/* Active dot */}
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--theme-accent)' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  />
                )}
              </button>
            )
          })}

          {/* Meer button */}
          <button
            onClick={() => setShowMore(prev => !prev)}
            className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer border-0 bg-transparent p-0"
            style={{ minWidth: 58, minHeight: 52 }}
          >
            {/* Active pill when on secondary page OR sheet is open */}
            <AnimatePresence>
              {(onSecondaryPage || showMore) && !showMore && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'var(--theme-accent-muted)',
                    border: '1px solid var(--theme-accent)',
                    opacity: 0.7,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
              {showMore && (
                <motion.div
                  key="meer-active"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'var(--theme-accent-muted)',
                    border: '1px solid var(--theme-accent)',
                    opacity: 0.7,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{
                scale: showMore ? 1.1 : 1,
                rotate: showMore ? 90 : 0,
                y: showMore ? -1 : 0,
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative z-10"
            >
              {showMore ? (
                <X
                  size={20}
                  strokeWidth={2}
                  style={{ color: 'var(--theme-accent)' }}
                />
              ) : (
                <MoreHorizontal
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: (onSecondaryPage) ? 'var(--theme-accent)' : '#555555' }}
                />
              )}
            </motion.div>

            <motion.span
              className="relative z-10 text-[9px] font-semibold tracking-wide uppercase"
              style={{
                letterSpacing: '0.06em',
                color: (onSecondaryPage || showMore) ? 'var(--theme-accent)' : '#555555',
                opacity: (onSecondaryPage || showMore) ? 1 : 0.45,
              }}
            >
              Meer
            </motion.span>

            {/* Active dot when on secondary page */}
            {onSecondaryPage && !showMore && (
              <motion.div
                layoutId="nav-dot"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: 'var(--theme-accent)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              />
            )}
          </button>
        </motion.nav>
      </div>
    </>
  )
}

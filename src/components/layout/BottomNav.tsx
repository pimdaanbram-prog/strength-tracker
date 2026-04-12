import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Dumbbell, Clock, BarChart3, User,
  MoreHorizontal, Palette, Trophy, Settings, Wrench, Ruler,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Training' },
  { to: '/history', icon: Clock, label: 'Historie' },
  { to: '/progress', icon: BarChart3, label: 'Stats' },
  { to: '/profiles', icon: User, label: 'Profiel' },
]

const MORE_ROUTES = ['/themes', '/achievements', '/settings', '/tools', '/measurements']

const moreItems = [
  { to: '/settings', icon: Settings, label: 'Instellingen', color: '#888888' },
  { to: '/themes', icon: Palette, label: "Thema's", color: '#818CF8' },
  { to: '/achievements', icon: Trophy, label: 'Achievements', color: '#FFB300' },
  { to: '/tools', icon: Wrench, label: 'Tools', color: '#00E5A0' },
  { to: '/measurements', icon: Ruler, label: 'Metingen', color: '#FF5500' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)

  const isMoreActive = MORE_ROUTES.some(r => location.pathname.startsWith(r))
  const isMoreTabActive = isMoreActive || showMore

  const activeIndex = navItems.findIndex(item => {
    if (isMoreActive) return false
    if (item.to === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.to)
  })

  return (
    <>
      {/* ── More bottom sheet ───────────────────────────── */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[55]"
              style={{
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
              onClick={() => setShowMore(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[56] rounded-t-3xl px-6 pt-4"
              style={{
                background: 'rgba(12, 12, 12, 0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderBottom: 'none',
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
              }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#2a2a2a' }} />

              <p className="text-[10px] font-bold uppercase tracking-widest mb-4 text-center" style={{ color: '#444', letterSpacing: '0.14em' }}>
                Meer
              </p>

              <div className="grid grid-cols-3 gap-3">
                {moreItems.map(({ to, icon: Icon, label, color }) => {
                  const isCurrentRoute = location.pathname.startsWith(to)
                  return (
                    <motion.button
                      key={to}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => { navigate(to); setShowMore(false) }}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer border-0 text-center"
                      style={{
                        background: isCurrentRoute ? `${color}18` : '#111111',
                        border: `1px solid ${isCurrentRoute ? color + '35' : '#1C1C1C'}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}18` }}
                      >
                        <Icon size={19} style={{ color }} />
                      </div>
                      <span
                        className="text-[11px] font-semibold leading-tight"
                        style={{ color: isCurrentRoute ? color : '#777' }}
                      >
                        {label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom nav pill ─────────────────────────────── */}
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
            background: 'rgba(14, 14, 14, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Regular nav tabs */}
          {navItems.map(({ to, icon: Icon, label }, i) => {
            const isActive = i === activeIndex

            return (
              <button
                key={to}
                onClick={() => { navigate(to); setShowMore(false) }}
                className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer border-0 bg-transparent p-0"
                style={{ minWidth: 54, minHeight: 52 }}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'rgba(255, 85, 0, 0.15)',
                        border: '1px solid rgba(255, 85, 0, 0.3)',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="relative z-10"
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ color: isActive ? '#FF5500' : '#555555' }}
                  />
                </motion.div>

                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.5, color: isActive ? '#FF5500' : '#555555' }}
                  className="relative z-10 text-[9px] font-semibold tracking-wide uppercase"
                  style={{ letterSpacing: '0.06em' }}
                >
                  {label}
                </motion.span>

                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#FF5500' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  />
                )}
              </button>
            )
          })}

          {/* Meer tab */}
          <button
            onClick={() => setShowMore(v => !v)}
            className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer border-0 bg-transparent p-0"
            style={{ minWidth: 54, minHeight: 52 }}
          >
            <AnimatePresence>
              {isMoreTabActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'rgba(255, 85, 0, 0.15)',
                    border: '1px solid rgba(255, 85, 0, 0.3)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{ scale: isMoreTabActive ? 1.1 : 1, y: isMoreTabActive ? -1 : 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative z-10"
            >
              <MoreHorizontal
                size={20}
                strokeWidth={isMoreTabActive ? 2 : 1.5}
                style={{ color: isMoreTabActive ? '#FF5500' : '#555555' }}
              />
            </motion.div>

            <motion.span
              animate={{ opacity: isMoreTabActive ? 1 : 0.5, color: isMoreTabActive ? '#FF5500' : '#555555' }}
              className="relative z-10 text-[9px] font-semibold tracking-wide uppercase"
              style={{ letterSpacing: '0.06em' }}
            >
              Meer
            </motion.span>

            {isMoreTabActive && (
              <motion.div
                layoutId="nav-dot"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: '#FF5500' }}
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

import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Dumbbell, Clock, BarChart3, User } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Training' },
  { to: '/history', icon: Clock, label: 'Historie' },
  { to: '/progress', icon: BarChart3, label: 'Stats' },
  { to: '/profiles', icon: User, label: 'Profiel' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeIndex = navItems.findIndex(item => {
    if (item.to === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.to)
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4"
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
        {navItems.map(({ to, icon: Icon, label }, i) => {
          const isActive = i === activeIndex

          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer border-0 bg-transparent p-0"
              style={{ minWidth: 58, minHeight: 52 }}
            >
              {/* Active background pill */}
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

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="relative z-10"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? '#FF5500' : '#555555' }}
                />
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.5,
                  color: isActive ? '#FF5500' : '#555555',
                }}
                className="relative z-10 text-[9px] font-semibold tracking-wide uppercase"
                style={{ letterSpacing: '0.06em' }}
              >
                {label}
              </motion.span>

              {/* Active dot indicator */}
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
      </motion.nav>
    </div>
  )
}

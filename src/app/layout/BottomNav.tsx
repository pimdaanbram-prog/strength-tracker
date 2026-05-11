import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Dumbbell, BarChart3, Clock, Settings,
  MoreHorizontal, X, Users, Trophy, Wrench,
  Ruler, Palette, BookMarked, CalendarDays, Sparkles,
} from 'lucide-react'

// ─── 5 primary tabs ───────────────────────────────────────────────────────────
const MAIN_TABS = [
  { to: '/',         icon: Home,      label: 'Home'     },
  { to: '/workout',  icon: Dumbbell,  label: 'Training' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/history',  icon: Clock,     label: 'Historie' },
  { to: '/settings', icon: Settings,  label: 'Instellingen' },
] as const

// ─── Secondary sheet items ────────────────────────────────────────────────────
const MORE_ITEMS = [
  { to: '/plan-generator', icon: Sparkles,  label: 'Plan Generator', color: '#FF7A1F' },
  { to: '/exercises',   icon: Dumbbell,     label: 'Oefeningen',   color: '#4A8FFF' },
  { to: '/profiles',    icon: Users,        label: 'Profielen',    color: '#FF5500' },
  { to: '/history',     icon: Clock,        label: 'Historie',     color: '#4A8FFF' },
  { to: '/plans',       icon: BookMarked,   label: 'Plannen',      color: '#00E5A0' },
  { to: '/week-feedback', icon: CalendarDays, label: 'Weekfeedback', color: '#818CF8' },
  { to: '/achievements',icon: Trophy,       label: 'Achievements', color: '#FFB300' },
  { to: '/measurements',icon: Ruler,        label: 'Metingen',     color: '#06b6d4' },
  { to: '/tools',       icon: Wrench,       label: 'Tools',        color: '#00C060' },
  { to: '/themes',      icon: Palette,      label: "Thema's",      color: '#A855F7' },
] as const

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)

  const activeIndex = MAIN_TABS.findIndex(item => {
    if (item.to === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.to)
  })

  const handleTab = (to: string) => {
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
              background: 'rgba(12,12,18,0.92)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              borderTop: '1px solid var(--theme-glass-border)',
              boxShadow: '0 -16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
              paddingBottom: 'max(7.5rem, calc(env(safe-area-inset-bottom) + 7.5rem))',
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--theme-border-subtle)' }} />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <h3 className="text-xs font-bold tracking-widest uppercase m-0" style={{ color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-mono)', letterSpacing: '0.14em' }}>
                Meer
              </h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMore(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-0"
                style={{ background: 'var(--theme-glass)', border: '1px solid var(--theme-glass-border)' }}
              >
                <X size={14} style={{ color: 'var(--theme-text-muted)' }} />
              </motion.button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 px-4 pb-2">
              {MORE_ITEMS.map(({ to, icon: Icon, label, color }) => {
                const isActive = location.pathname.startsWith(to)
                return (
                  <motion.button
                    key={to}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { setShowMore(false); navigate(to) }}
                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-2xl cursor-pointer border-0"
                    style={{
                      background: isActive ? `${color}18` : 'var(--theme-glass)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: `1px solid ${isActive ? color + '40' : 'var(--theme-glass-border)'}`,
                      boxShadow: isActive ? `0 4px 16px ${color}22` : 'none',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <span className="text-[9.5px] font-semibold text-center leading-tight" style={{ color: isActive ? color : 'var(--theme-text-secondary)', fontFamily: 'var(--theme-font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating nav pill ────────────────────────────────────────────────── */}
      <div
        className="fixed left-0 right-0 z-50 flex justify-center"
        style={{
          bottom: 'max(16px, env(safe-area-inset-bottom))',
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260, delay: 0.1 }}
          className="w-full flex items-center"
          style={{
            gap: 2,
            padding: 6,
            background: 'rgba(12,12,18,0.55)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: '1px solid var(--theme-glass-border)',
            borderRadius: 28,
            boxShadow: '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          {/* Main tabs */}
          {MAIN_TABS.map(({ to, icon: Icon, label }, i) => {
            const isActive = i === activeIndex
            return (
              <motion.button
                key={to}
                onClick={() => handleTab(to)}
                whileTap={{ scale: 0.92 }}
                className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer border-0 bg-transparent flex-1"
                style={{ minHeight: 52, padding: '10px 0' }}
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-[20px]"
                    style={{
                      background: 'var(--theme-accent-muted)',
                      border: '1px solid color-mix(in srgb, var(--theme-accent) 44%, transparent)',
                      boxShadow: 'inset 0 0 20px var(--theme-accent-glow)',
                    }}
                    initial={false}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}

                <motion.div
                  className="relative z-10"
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.5}
                    style={{ color: isActive ? 'var(--theme-accent)' : 'var(--theme-text-muted)' }}
                  />
                </motion.div>
                <span
                  className="relative z-10 text-[8.5px] font-bold uppercase tracking-wide"
                  style={{
                    color: isActive ? 'var(--theme-accent)' : 'var(--theme-text-muted)',
                    letterSpacing: '0.04em',
                    fontFamily: 'var(--theme-font-mono)',
                  }}
                >
                  {label}
                </span>
              </motion.button>
            )
          })}

          {/* Meer button */}
          <motion.button
            onClick={() => setShowMore(p => !p)}
            whileTap={{ scale: 0.92 }}
            className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer border-0 bg-transparent flex-1"
            style={{ minHeight: 52, padding: '10px 0' }}
          >
            {showMore && (
              <motion.div
                className="absolute inset-0 rounded-[20px]"
                style={{
                  background: 'var(--theme-accent-muted)',
                  border: '1px solid color-mix(in srgb, var(--theme-accent) 44%, transparent)',
                  boxShadow: 'inset 0 0 20px var(--theme-accent-glow)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              />
            )}
            <motion.div
              className="relative z-10"
              animate={{ rotate: showMore ? 90 : 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              {showMore
                ? <X size={18} strokeWidth={2.2} style={{ color: 'var(--theme-accent)' }} />
                : <MoreHorizontal size={18} strokeWidth={1.5} style={{ color: 'var(--theme-text-muted)' }} />
              }
            </motion.div>
            <span className="relative z-10 text-[8.5px] font-bold uppercase tracking-wide" style={{
              color: showMore ? 'var(--theme-accent)' : 'var(--theme-text-muted)',
              letterSpacing: '0.04em',
              fontFamily: 'var(--theme-font-mono)',
            }}>
              Meer
            </span>
          </motion.button>
        </motion.nav>
      </div>
    </>
  )
}

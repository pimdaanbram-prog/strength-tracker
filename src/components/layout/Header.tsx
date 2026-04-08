import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, LogOut, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileSwitcher from '../profile/ProfileSwitcher'
import { useAuthContext } from '../../contexts/AuthContext'
import { useLanguage } from '../../hooks/useLanguage'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showProfile?: boolean
}

export default function Header({ title, showBack = false, showProfile = true }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuthContext()
  const { language, setLanguage } = useLanguage()
  const [showMenu, setShowMenu] = useState(false)

  const isHome = location.pathname === '/'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(6, 6, 6, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: back or logo */}
        <div className="flex items-center gap-3">
          {showBack && (
            <motion.button
              onClick={() => navigate(-1)}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <ArrowLeft size={18} style={{ color: '#FAFAFA' }} />
            </motion.button>
          )}
          {title ? (
            <h1 className="text-xl tracking-wider m-0" style={{ color: '#FAFAFA' }}>{title}</h1>
          ) : isHome ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF5500, #FF8833)', boxShadow: '0 0 16px rgba(255,85,0,0.4)' }}
              >
                <Zap size={16} fill="#FFFFFF" strokeWidth={0} />
              </div>
              <h1 className="text-xl tracking-widest m-0 font-heading" style={{ color: '#FAFAFA', letterSpacing: '0.15em' }}>
                STRENGTH
              </h1>
            </motion.div>
          ) : null}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(language === 'nl' ? 'en' : 'nl')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border-0"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#666666',
              letterSpacing: '0.08em',
            }}
            title="Switch language / Wissel taal"
          >
            {language === 'nl' ? 'EN' : 'NL'}
          </motion.button>

          {showProfile && <ProfileSwitcher />}

          {/* Logout menu (home only) */}
          {isHome && (
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer bg-transparent border-0"
                style={{ color: '#444444' }}
              >
                <LogOut size={16} />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -8 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden"
                      style={{
                        background: '#181818',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                        minWidth: 160,
                      }}
                    >
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer bg-transparent border-0 text-left transition-colors hover:bg-white/5"
                        style={{ color: '#FF3B3B' }}
                      >
                        <LogOut size={14} />
                        {language === 'nl' ? 'Uitloggen' : 'Sign out'}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

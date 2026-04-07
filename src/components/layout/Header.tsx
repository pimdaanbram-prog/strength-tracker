import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
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
    <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-lg border-b border-border">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
          )}
          {title ? (
            <h1 className="text-xl tracking-wider text-text-primary m-0">{title}</h1>
          ) : isHome ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">💪</span>
              <h1 className="text-xl tracking-wider text-text-primary m-0">STRENGTH</h1>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'nl' ? 'en' : 'nl')}
            className="px-2 py-1 rounded-lg text-xs font-bold border border-border bg-bg-card text-text-muted hover:text-text-primary hover:border-border-light transition-colors cursor-pointer"
            title="Switch language / Wissel taal"
          >
            {language === 'nl' ? 'EN' : 'NL'}
          </button>
          {showProfile && <ProfileSwitcher />}
          {isHome && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-0"
              >
                <LogOut size={18} className="text-text-muted" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-0 text-left"
                    >
                      <LogOut size={14} />
                      {language === 'nl' ? 'Uitloggen' : 'Sign out'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

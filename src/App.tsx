import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import WorkoutPage from './pages/WorkoutPage'
import ExercisesPage from './pages/ExercisesPage'
import ExerciseDetail from './pages/ExerciseDetail'
import HistoryPage from './pages/HistoryPage'
import ProgressPage from './pages/ProgressPage'
import ProfilesPage from './pages/ProfilesPage'
import ProfileNew from './pages/ProfileNew'
import WeekFeedback from './pages/WeekFeedback'
import PlansPage from './pages/PlansPage'
import PlanEditPage from './pages/PlanEditPage'
import { useSync } from './hooks/useSync'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function MainApp() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  // Sync data with Supabase on login
  useSync()

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      const dismissed = localStorage.getItem('pwa-banner-dismissed')
      if (!dismissed) setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      setInstallPrompt(null)
    }
  }

  const dismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }

  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      {/* Install Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-accent p-3 px-4 flex items-center gap-3 safe-top"
          >
            <Download size={18} className="text-white shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium m-0">Installeer Strength Tracker</p>
              <p className="text-white/70 text-xs m-0">Als app op je telefoon of computer</p>
            </div>
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-white text-accent text-xs font-bold rounded-lg cursor-pointer border-0 shrink-0"
            >
              Installeer
            </button>
            <button
              onClick={dismissBanner}
              className="p-1 cursor-pointer bg-transparent border-0"
            >
              <X size={16} className="text-white/70" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetail />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/profiles/new" element={<ProfileNew />} />
          <Route path="/week-feedback" element={<WeekFeedback />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/new" element={<PlanEditPage />} />
          <Route path="/plans/:id/edit" element={<PlanEditPage />} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

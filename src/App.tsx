import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/layout/BottomNav'
import { useSync } from './hooks/useSync'

// Route-level code splitting — each page gets its own chunk
const Dashboard = lazy(() => import('./pages/Dashboard'))
const WorkoutPage = lazy(() => import('./pages/WorkoutPage'))
const ExercisesPage = lazy(() => import('./pages/ExercisesPage'))
const ExerciseDetail = lazy(() => import('./pages/ExerciseDetail'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const ProfilesPage = lazy(() => import('./pages/ProfilesPage'))
const ProfileNew = lazy(() => import('./pages/ProfileNew'))
const WeekFeedback = lazy(() => import('./pages/WeekFeedback'))
const PlansPage = lazy(() => import('./pages/PlansPage'))
const PlanEditPage = lazy(() => import('./pages/PlanEditPage'))
const ThemePage = lazy(() => import('./pages/ThemePage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const ToolsPage = lazy(() => import('./pages/ToolsPage'))
const MeasurementsPage = lazy(() => import('./pages/MeasurementsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const PlanGeneratorPage = lazy(() => import('./pages/PlanGeneratorPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function PageLoader() {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center"
      style={{ background: 'var(--theme-bg-primary)' }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

function MainApp() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

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
    <div className="min-h-[100dvh]" style={{ background: 'var(--theme-bg-primary)' }}>
      {/* Install Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] p-3 px-4 flex items-center gap-3 safe-top"
            style={{ background: 'var(--theme-accent)' }}
          >
            <Download size={18} className="text-white shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium m-0">Installeer Strength Tracker</p>
              <p className="text-white/70 text-xs m-0">Als app op je telefoon of computer</p>
            </div>
            <button
              onClick={handleInstall}
              className="px-3 py-2 bg-white text-xs font-bold rounded-xl cursor-pointer border-0 shrink-0 min-h-[44px]"
              style={{ color: 'var(--theme-accent)' }}
            >
              Installeer
            </button>
            <button
              onClick={dismissBanner}
              className="w-11 h-11 flex items-center justify-center cursor-pointer bg-transparent border-0 shrink-0"
            >
              <X size={16} className="text-white/70" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={<PageLoader />}>
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
            <Route path="/themes" element={<ThemePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/measurements" element={<MeasurementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/plan-generator" element={<PlanGeneratorPage />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

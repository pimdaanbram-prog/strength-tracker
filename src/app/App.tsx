import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { QueryClientProvider } from '@tanstack/react-query'
import { Download, X } from 'lucide-react'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ThemeProvider } from '@/features/themes/context/ThemeContext'
import { ToastProvider } from '@/shared/contexts/ToastContext'
import ProtectedRoute from '@/app/ProtectedRoute'
import BottomNav from '@/app/layout/BottomNav'
import { useSync } from '@/shared/hooks/useSync'
import { queryClient } from '@/shared/lib/queryClient'

// Route-level code splitting — each page gets its own chunk
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'))
const WorkoutPage = lazy(() => import('@/features/workouts/pages/WorkoutPage'))
const ExercisesPage = lazy(() => import('@/features/exercises/pages/ExercisesPage'))
const ExerciseDetail = lazy(() => import('@/features/exercises/pages/ExerciseDetail'))
const HistoryPage = lazy(() => import('@/features/workouts/pages/HistoryPage'))
const ProgressPage = lazy(() => import('@/features/stats/pages/ProgressPage'))
const ProfilesPage = lazy(() => import('@/features/profiles/pages/ProfilesPage'))
const ProfileNew = lazy(() => import('@/features/profiles/pages/ProfileNew'))
const WeekFeedback = lazy(() => import('@/features/stats/pages/WeekFeedback'))
const PlansPage = lazy(() => import('@/features/workouts/pages/PlansPage'))
const PlanEditPage = lazy(() => import('@/features/workouts/pages/PlanEditPage'))
const ThemePage = lazy(() => import('@/features/themes/pages/ThemePage'))
const AchievementsPage = lazy(() => import('@/features/gamification/pages/AchievementsPage'))
const ToolsPage = lazy(() => import('@/features/tools/pages/ToolsPage'))
const MeasurementsPage = lazy(() => import('@/features/measurements/pages/MeasurementsPage'))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))
const PlanGeneratorPage = lazy(() => import('@/features/workouts/pages/PlanGeneratorPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))

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
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
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
      </MotionConfig>
    </BrowserRouter>
    </QueryClientProvider>
  )
}

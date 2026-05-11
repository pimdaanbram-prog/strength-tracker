import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/shared/lib/queryClient'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ThemeProvider } from '@/app/ThemeContext'
import { ToastProvider } from '@/app/ToastContext'
import ProtectedRoute from '@/app/ProtectedRoute'
import BottomNav from '@/shared/components/layout/BottomNav'
import Dashboard from '@/features/dashboard/pages/Dashboard'
import WorkoutPage from '@/features/workouts/pages/WorkoutPage'
import ExercisesPage from '@/features/exercises/pages/ExercisesPage'
import ExerciseDetail from '@/features/exercises/pages/ExerciseDetail'
import HistoryPage from '@/features/workouts/pages/HistoryPage'
import ProgressPage from '@/features/stats/pages/ProgressPage'
import ProfilesPage from '@/features/profiles/pages/ProfilesPage'
import ProfileNew from '@/features/profiles/pages/ProfileNew'
import WeekFeedback from '@/features/feedback/pages/WeekFeedback'
import PlansPage from '@/features/plans/pages/PlansPage'
import PlanEditPage from '@/features/plans/pages/PlanEditPage'
import ThemePage from '@/features/themes/pages/ThemePage'
import AchievementsPage from '@/features/gamification/pages/AchievementsPage'
import ToolsPage from '@/features/tools/pages/ToolsPage'
import MeasurementsPage from '@/features/measurements/pages/MeasurementsPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import PlanGeneratorPage from '@/features/plans/pages/PlanGeneratorPage'
import { useSync } from '@/shared/lib/useSync'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
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
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
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
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

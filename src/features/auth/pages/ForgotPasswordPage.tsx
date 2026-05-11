import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuthContext } from '@/features/auth/context/AuthContext'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthContext()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await resetPassword(email)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-bg-primary flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <span className="text-5xl block mb-4">📬</span>
          <h2 className="text-3xl tracking-wider mb-2">E-MAIL VERSTUURD</h2>
          <p className="text-text-secondary text-sm mb-6">
            Als er een account bestaat met <strong className="text-text-primary">{email}</strong>,
            ontvang je een link om je wachtwoord te resetten.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors"
          >
            Terug naar inloggen
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-bg-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/login" className="inline-flex items-center gap-1 text-text-muted text-sm mb-6 hover:text-text-secondary">
          <ArrowLeft size={14} />
          Terug naar inloggen
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl tracking-wider mb-1">WACHTWOORD VERGETEN</h1>
          <p className="text-text-muted text-sm">
            Voer je e-mailadres in en we sturen je een resetlink
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl p-3">
              <p className="text-danger text-sm m-0">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.com"
                required
                className="w-full bg-bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="animate-pulse">Versturen...</span>
            ) : (
              'Verstuur resetlink'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

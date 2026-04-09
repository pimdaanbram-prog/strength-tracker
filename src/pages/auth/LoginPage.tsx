import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

function AnimatedBlob({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none blob-drift"
      style={{ filter: 'blur(80px)', ...style }}
    />
  )
}

export default function LoginPage() {
  const { signIn, user, loading } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-bg-primary flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FF5500, #FF8833)' }}
        >
          <Zap size={28} fill="#fff" strokeWidth={0} />
        </motion.div>
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Onjuist e-mailadres of wachtwoord'
          : error.message
      )
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-[100dvh] bg-bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <AnimatedBlob style={{ width: 400, height: 400, background: 'rgba(255,85,0,0.08)', top: '-10%', right: '-15%', animationDelay: '0s' }} />
      <AnimatedBlob style={{ width: 300, height: 300, background: 'rgba(100,60,255,0.06)', bottom: '-5%', left: '-10%', animationDelay: '-4s' }} />
      <AnimatedBlob style={{ width: 200, height: 200, background: 'rgba(255,179,0,0.05)', top: '50%', left: '50%', animationDelay: '-8s' }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 200 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 20 }}
          className="text-center mb-10"
        >
          <motion.div
            className="mx-auto mb-5 w-18 h-18 rounded-3xl flex items-center justify-center"
            style={{
              width: 72, height: 72,
              background: 'linear-gradient(135deg, #FF5500, #FF8833)',
              boxShadow: '0 0 48px rgba(255,85,0,0.45)',
            }}
            animate={{ boxShadow: ['0 0 32px rgba(255,85,0,0.35)', '0 0 64px rgba(255,85,0,0.55)', '0 0 32px rgba(255,85,0,0.35)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap size={32} fill="#fff" strokeWidth={0} />
          </motion.div>
          <h1 className="text-4xl tracking-widest mb-1" style={{ letterSpacing: '0.15em' }}>STRENGTH</h1>
          <p className="text-sm" style={{ color: '#555' }}>Log in om je trainingen te synchroniseren</p>
        </motion.div>

        {/* Glass card */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-3.5"
                style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.2)' }}
              >
                <p className="text-sm m-0" style={{ color: '#FF3B3B' }}>{error}</p>
              </motion.div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#555', letterSpacing: '0.1em' }}>E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#444' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jouw@email.com"
                  required
                  className="input-premium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#555', letterSpacing: '0.1em' }}>Wachtwoord</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#444' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-premium"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-0 p-0"
                  style={{ color: '#555' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-right -mt-1">
              <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#FF5500' }}>
                Wachtwoord vergeten?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="w-full text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 mt-2"
              style={{
                background: submitting ? '#444' : 'linear-gradient(135deg, #FF5500, #FF8833)',
                boxShadow: submitting ? 'none' : '0 8px 24px rgba(255,85,0,0.35)',
                fontSize: 15,
              }}
            >
              {submitting ? (
                <span className="opacity-70">Inloggen...</span>
              ) : (
                <><LogIn size={18} /> Inloggen</>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#444' }}>
          Nog geen account?{' '}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: '#FF5500' }}>
            Registreer gratis
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

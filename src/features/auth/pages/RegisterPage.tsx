import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react'
import { useAuthContext } from '@/features/auth/AuthContext'

function AnimatedBlob({ style }: { style: React.CSSProperties }) {
  return <div className="absolute rounded-full pointer-events-none blob-drift" style={{ filter: 'blur(80px)', ...style }} />
}

export default function RegisterPage() {
  const { signUp, user, loading } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
    if (password !== confirmPassword) { setError('Wachtwoorden komen niet overeen'); return }
    if (password.length < 6) { setError('Wachtwoord moet minimaal 6 tekens zijn'); return }
    setSubmitting(true)
    const { error } = await signUp(email, password)
    if (error) setError(error.message)
    else setSuccess(true)
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-bg-primary flex items-center justify-center px-4 relative overflow-hidden">
        <AnimatedBlob style={{ width: 400, height: 400, background: 'rgba(0,229,160,0.06)', top: '-10%', right: '-15%' }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-sm text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.3)' }}
          >
            <CheckCircle2 size={40} style={{ color: '#00E5A0' }} />
          </motion.div>
          <h2 className="text-4xl tracking-wider mb-3">CHECK JE EMAIL</h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: '#666' }}>
            We hebben een bevestigingslink gestuurd naar<br />
            <strong style={{ color: '#FAFAFA' }}>{email}</strong>
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3.5 text-white font-semibold rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #FF5500, #FF8833)', boxShadow: '0 8px 24px rgba(255,85,0,0.35)' }}
          >
            Naar inloggen
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBlob style={{ width: 400, height: 400, background: 'rgba(255,85,0,0.07)', top: '-10%', right: '-15%', animationDelay: '0s' }} />
      <AnimatedBlob style={{ width: 300, height: 300, background: 'rgba(100,60,255,0.05)', bottom: '-5%', left: '-10%', animationDelay: '-4s' }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 200 }}
        className="w-full max-w-sm relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 20 }}
          className="text-center mb-8"
        >
          <div
            className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF5500, #FF8833)', boxShadow: '0 0 40px rgba(255,85,0,0.4)', width: 64, height: 64 }}
          >
            <Zap size={28} fill="#fff" strokeWidth={0} />
          </div>
          <h1 className="text-3xl tracking-widest mb-1" style={{ letterSpacing: '0.12em' }}>JOIN STRENGTH</h1>
          <p className="text-sm" style={{ color: '#555' }}>Sync je trainingen over al je apparaten</p>
        </motion.div>

        <div
          className="rounded-3xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
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

            {[
              { label: 'E-mail', type: email ? (showPassword ? 'text' : 'email') : 'email', value: email, setter: setEmail, placeholder: 'jouw@email.com', icon: Mail, hasToggle: false },
            ].map(({ label, value, setter, placeholder, icon: Icon }) => (
              <div key={label} className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#555', letterSpacing: '0.1em' }}>{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#444' }} />
                  <input
                    type="email"
                    value={value}
                    onChange={e => setter(e.target.value)}
                    placeholder={placeholder}
                    required
                    className="input-premium"
                  />
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#555', letterSpacing: '0.1em' }}>Wachtwoord</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#444' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimaal 6 tekens"
                  required minLength={6}
                  className="input-premium"
                  style={{ paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-0 p-0" style={{ color: '#555' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#555', letterSpacing: '0.1em' }}>Bevestig wachtwoord</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#444' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Herhaal wachtwoord"
                  required minLength={6}
                  className="input-premium"
                />
              </div>
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
              {submitting ? <span className="opacity-70">Aanmaken...</span> : <><UserPlus size={18} /> Registreer</>}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#444' }}>
          Heb je al een account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: '#FF5500' }}>Log in</Link>
        </p>
      </motion.div>
    </div>
  )
}

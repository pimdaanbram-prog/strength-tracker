import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { User, Session, AuthError, AuthResponse, AuthTokenResponsePassword } from '@supabase/supabase-js'

type ResetPasswordResponse = Promise<
  { data: Record<string, never>; error: null } | { data: null; error: AuthError }
>

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthTokenResponsePassword>
  signUp: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => ResetPasswordResponse
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')
  return context
}

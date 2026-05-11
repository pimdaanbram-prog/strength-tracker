import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    // Clear all local data on sign out
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith('strength-tracker')) {
        localStorage.removeItem(key)
      }
    }
    return supabase.auth.signOut()
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    })
  }, [])

  return { user, session, loading, signIn, signUp, signOut, resetPassword }
}

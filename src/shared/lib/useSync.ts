import { useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { queryClient } from '@/shared/lib/queryClient'
import { qk } from '@/shared/lib/queryKeys'
import { useProfilesQuery, useSessionsQuery, usePlansQuery } from '@/shared/lib/supabaseQueries'

// useSync bootstraps all Supabase data into the app via React Query.
// On sign-in or window focus, React Query automatically re-fetches.
// Individual push/delete operations live in supabaseQueries.ts.
export function useSync() {
  // Boot all three primary queries — React Query handles caching, deduplication,
  // and background refresh (refetchOnWindowFocus: true in queryClient.ts).
  useProfilesQuery()
  useSessionsQuery()
  usePlansQuery()

  // On SIGNED_IN (new device or re-auth), force a full cache invalidation
  // so fresh data is pulled even if the cache hasn't expired yet.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: qk.profiles.all })
        queryClient.invalidateQueries({ queryKey: qk.sessions.all })
        queryClient.invalidateQueries({ queryKey: qk.plans.all })
        queryClient.invalidateQueries({ queryKey: qk.weekLogs.all })
      }
      if (event === 'SIGNED_OUT') {
        queryClient.clear()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Realtime subscription for cross-device updates: invalidate the relevant
  // React Query cache when another device makes changes.
  useEffect(() => {
    const channel = supabase
      .channel('db-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: qk.profiles.all })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_sessions' }, () => {
        queryClient.invalidateQueries({ queryKey: qk.sessions.all })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_plans' }, () => {
        queryClient.invalidateQueries({ queryKey: qk.plans.all })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'week_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: qk.weekLogs.all })
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [])
}

// Expose the diagnostic helper for SettingsPage
export async function diagnoseSyncIssue(): Promise<string> {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    return 'Supabase env vars ontbreken (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Voeg ze toe in Netlify → Site settings → Environment variables.'
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError ?? !user) {
    return `Niet ingelogd of auth mislukt: ${authError?.message ?? 'geen gebruiker'}`
  }

  const { data, error: readError } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('account_id', user.id)
    .limit(1)

  if (readError) {
    if (readError.message.includes('relation') || readError.message.includes('does not exist')) {
      return "Tabel 'workout_sessions' bestaat niet in Supabase. Maak de tabellen aan via het SQL script."
    }
    if (readError.code === 'PGRST301' || readError.message.includes('JWT')) {
      return 'Authenticatie mislukt bij lezen. Controleer de anon key in Supabase dashboard.'
    }
    if (readError.code === '42501' || readError.message.includes('policy')) {
      return "RLS policy blokkeert lezen. Voeg een SELECT policy toe in Supabase → Authentication → Policies voor tabel 'workout_sessions'."
    }
    return `Leesfout: ${readError.message} (code: ${readError.code})`
  }

  return `OK — Supabase verbinding werkt correct. ${data?.length ?? 0} sessies gevonden in cloud.`
}

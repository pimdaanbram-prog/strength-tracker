import type { AuthError } from '@supabase/supabase-js'

/**
 * Maps a Supabase auth error to a friendly Dutch message. `status` is
 * `undefined` specifically for network-level failures (the request never
 * reached the server) — most commonly the Supabase project waking up from
 * its free-tier auto-pause, which otherwise surfaces as a raw browser
 * message like "Failed to fetch" or Safari's "Load failed".
 */
export function getFriendlyAuthError(error: AuthError | null): string {
  if (!error) return ''

  if (error.message === 'Invalid login credentials') {
    return 'Onjuist e-mailadres of wachtwoord'
  }

  if (error.status === undefined) {
    return 'Kan geen verbinding maken met de server. Die kan even opstarten na een periode van inactiviteit — probeer het over 30 seconden nog eens.'
  }

  return error.message
}

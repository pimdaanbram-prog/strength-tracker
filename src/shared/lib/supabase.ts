import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars:', { supabaseUrl, supabaseAnonKey })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Wraps any Supabase query and logs errors in development.
// Returns { data, error } — callers should always check error.
export async function safeQuery<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await queryFn()
    if (error) {
      if (import.meta.env.DEV) console.error('[supabase]', error.message)
      return { data: null, error: error.message }
    }
    return { data, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (import.meta.env.DEV) console.error('[supabase] unexpected:', message)
    return { data: null, error: message }
  }
}

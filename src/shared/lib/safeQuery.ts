import type { PostgrestSingleResponse } from '@supabase/supabase-js'

export type SafeResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function safeQuery<T>(
  query: PromiseLike<PostgrestSingleResponse<T>>,
  context?: string
): Promise<SafeResult<T>> {
  try {
    const { data, error } = await query
    if (error) {
      const msg = context ? `${context}: ${error.message}` : error.message
      console.error('[safeQuery]', msg, { code: error.code })
      return { data: null, error: msg }
    }
    return { data: data as T, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const full = context ? `${context}: ${msg}` : msg
    console.error('[safeQuery] unexpected error', full)
    return { data: null, error: full }
  }
}

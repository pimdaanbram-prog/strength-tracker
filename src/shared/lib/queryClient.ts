import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min — Supabase data changes via sync, not polling
      gcTime: 1000 * 60 * 30,         // 30 min cache retention
      retry: 2,
      refetchOnWindowFocus: false,     // we handle this via visibilitychange in useSync
    },
    mutations: {
      retry: 1,
    },
  },
})

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      // Keep inactive queries in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Don't retry on 4xx errors
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('JWT')) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

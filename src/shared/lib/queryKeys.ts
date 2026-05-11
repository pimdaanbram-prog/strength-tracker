// Centralized query key factory — ensures consistent cache invalidation
// Usage: queryClient.invalidateQueries({ queryKey: qk.sessions.byProfile(id) })

export const qk = {
  profiles: {
    all: ['profiles'] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    byProfile: (profileId: string) => ['sessions', profileId] as const,
  },
  plans: {
    all: ['plans'] as const,
  },
  weekLogs: {
    all: ['week-logs'] as const,
    byProfile: (profileId: string) => ['week-logs', profileId] as const,
  },
} as const

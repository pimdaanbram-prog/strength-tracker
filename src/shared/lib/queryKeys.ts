export const qk = {
  profiles: {
    all: ['profiles'] as const,
    byId: (id: string) => ['profiles', id] as const,
  },
  workouts: {
    all: ['workouts'] as const,
    sessions: (profileId: string) => ['workouts', 'sessions', profileId] as const,
    session: (id: string) => ['workouts', 'session', id] as const,
    week: (profileId: string, week: number, year: number) =>
      ['workouts', 'week', profileId, week, year] as const,
  },
  plans: {
    all: ['plans'] as const,
    byId: (id: string) => ['plans', id] as const,
  },
  weekLogs: {
    all: ['weekLogs'] as const,
    byProfile: (profileId: string) => ['weekLogs', profileId] as const,
    byWeek: (profileId: string, week: number, year: number) =>
      ['weekLogs', profileId, week, year] as const,
  },
  exercises: {
    all: ['exercises'] as const,
    history: (profileId: string, exerciseId: string) =>
      ['exercises', 'history', profileId, exerciseId] as const,
    prs: (profileId: string) => ['exercises', 'prs', profileId] as const,
  },
} as const

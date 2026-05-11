import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { queryClient } from '@/shared/lib/queryClient'
import { qk } from '@/shared/lib/queryKeys'
import { useAppStore } from '@/shared/store/appStore'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/shared/utils/localStorage'
import type { UserProfile } from '@/shared/store/appStore'
import type { WorkoutSession, WeekLog } from '@/features/workouts/hooks/useWorkouts'
import type { WorkoutPlan } from '@/features/plans/hooks/usePlans'

// ── DB ↔ App type converters ───────────────────────────────────────────────

export function dbToProfile(d: Record<string, unknown>): UserProfile {
  return {
    id: d.id as string,
    name: d.name as string,
    gender: d.gender as 'male' | 'female',
    age: d.age as number,
    weight: d.weight as number,
    height: d.height as number,
    fitnessLevel: d.fitness_level as 'beginner' | 'intermediate' | 'advanced',
    goals: (d.goals ?? []) as UserProfile['goals'],
    availableEquipment: (d.available_equipment ?? []) as string[],
    createdAt: d.created_at as string,
    avatar: d.avatar as string,
    color: d.color as string,
  }
}

export function profileToDb(p: UserProfile, accountId: string) {
  return {
    id: p.id,
    account_id: accountId,
    name: p.name,
    gender: p.gender,
    age: p.age,
    weight: p.weight,
    height: p.height,
    fitness_level: p.fitnessLevel,
    goals: p.goals,
    available_equipment: p.availableEquipment,
    created_at: p.createdAt,
    avatar: p.avatar,
    color: p.color,
  }
}

export function dbToSession(d: Record<string, unknown>): WorkoutSession {
  return {
    id: d.id as string,
    profileId: d.profile_id as string,
    date: d.date as string,
    weekNumber: d.week_number as number,
    year: d.year as number,
    dayLabel: d.day_label as string,
    workoutName: d.workout_name as string,
    exercises: (d.exercises ?? []) as WorkoutSession['exercises'],
    durationMinutes: d.duration_minutes as number,
    notes: (d.notes ?? '') as string,
    completedAt: d.completed_at as string,
  }
}

export function sessionToDb(s: WorkoutSession, accountId: string) {
  return {
    id: s.id,
    account_id: accountId,
    profile_id: s.profileId,
    date: s.date,
    week_number: s.weekNumber,
    year: s.year,
    day_label: s.dayLabel,
    workout_name: s.workoutName,
    exercises: s.exercises,
    duration_minutes: s.durationMinutes,
    notes: s.notes,
    completed_at: s.completedAt,
  }
}

export function dbToPlan(d: Record<string, unknown>): WorkoutPlan {
  return {
    id: d.id as string,
    name: d.name as string,
    exercises: (d.exercises ?? []) as WorkoutPlan['exercises'],
    createdAt: d.created_at as string,
    lastUsedAt: (d.last_used_at as string | null) ?? null,
  }
}

export function planToDb(p: WorkoutPlan, accountId: string) {
  return {
    id: p.id,
    account_id: accountId,
    name: p.name,
    exercises: p.exercises,
    created_at: p.createdAt,
    last_used_at: p.lastUsedAt,
  }
}

async function getAccountId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ── Profiles ───────────────────────────────────────────────────────────────

export function useProfilesQuery() {
  return useQuery({
    queryKey: qk.profiles.all,
    queryFn: async () => {
      const accountId = await getAccountId()
      if (!accountId) return []
      const { data, error } = await supabase
        .from('training_profiles')
        .select('*')
        .eq('account_id', accountId)
      if (error) throw new Error(error.message)
      return (data ?? []).map(dbToProfile)
    },
    // Sync fetched profiles into Zustand on success
    select: (profiles) => {
      const store = useAppStore.getState()
      const cloudIds = new Set(profiles.map(p => p.id))
      const localOnly = store.profiles.filter(p => !cloudIds.has(p.id))
      const merged = [...profiles, ...localOnly]
      const activeStillValid = merged.some(p => p.id === store.activeProfileId)
      useAppStore.setState({
        profiles: merged,
        activeProfileId: activeStillValid ? store.activeProfileId : (profiles[0]?.id ?? store.activeProfileId),
      })
      return merged
    },
  })
}

export function useSaveProfileMutation() {
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const accountId = await getAccountId()
      if (!accountId) throw new Error('Not authenticated')
      const { error } = await supabase.from('training_profiles').upsert(profileToDb(profile, accountId))
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.profiles.all }),
  })
}

export function useDeleteProfileMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('training_profiles').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.profiles.all }),
  })
}

// ── Sessions ───────────────────────────────────────────────────────────────

export function useSessionsQuery() {
  return useQuery({
    queryKey: qk.sessions.all,
    queryFn: async () => {
      const accountId = await getAccountId()
      if (!accountId) return []
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('account_id', accountId)
      if (error) throw new Error(error.message)
      const sessions = (data ?? []).map(dbToSession)
      // Merge with any local-only sessions and persist to localStorage
      const localSessions = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
      const cloudIds = new Set(sessions.map(s => s.id))
      const localOnly = localSessions.filter(s => !cloudIds.has(s.id))
      const merged = [...sessions, ...localOnly]
      setToStorage(STORAGE_KEYS.SESSIONS, merged)
      useAppStore.getState().bumpSessionVersion()
      return merged
    },
  })
}

export function useSaveSessionMutation() {
  return useMutation({
    mutationFn: async (session: WorkoutSession) => {
      const accountId = await getAccountId()
      if (!accountId) throw new Error('Not authenticated')
      const { error } = await supabase.from('workout_sessions').upsert(sessionToDb(session, accountId))
      if (error) throw new Error(error.message)
    },
    // Optimistic update: update localStorage immediately, then re-fetch from cloud
    onMutate: async (session) => {
      const prev = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
      const updated = prev.some(s => s.id === session.id)
        ? prev.map(s => s.id === session.id ? session : s)
        : [...prev, session]
      setToStorage(STORAGE_KEYS.SESSIONS, updated)
      useAppStore.getState().bumpSessionVersion()
      return { prev }
    },
    onError: (_err, _session, context) => {
      if (context?.prev) {
        setToStorage(STORAGE_KEYS.SESSIONS, context.prev)
        useAppStore.getState().bumpSessionVersion()
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.sessions.all }),
  })
}

export function useDeleteSessionMutation() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId)
      if (error) throw new Error(error.message)
    },
    onMutate: async (sessionId) => {
      const prev = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
      setToStorage(STORAGE_KEYS.SESSIONS, prev.filter(s => s.id !== sessionId))
      useAppStore.getState().bumpSessionVersion()
      return { prev }
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        setToStorage(STORAGE_KEYS.SESSIONS, context.prev)
        useAppStore.getState().bumpSessionVersion()
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.sessions.all }),
  })
}

// ── Plans ──────────────────────────────────────────────────────────────────

export function usePlansQuery() {
  return useQuery({
    queryKey: qk.plans.all,
    queryFn: async () => {
      const accountId = await getAccountId()
      if (!accountId) return []
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('account_id', accountId)
      if (error) throw new Error(error.message)
      const plans = (data ?? []).map(dbToPlan)
      const localPlans = getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, [])
      const cloudIds = new Set(plans.map(p => p.id))
      const localOnly = localPlans.filter(p => !cloudIds.has(p.id))
      const merged = [...plans, ...localOnly]
      setToStorage(STORAGE_KEYS.PLANS, merged)
      useAppStore.getState().bumpPlanVersion()
      return merged
    },
  })
}

export function useSavePlanMutation() {
  return useMutation({
    mutationFn: async (plan: WorkoutPlan) => {
      const accountId = await getAccountId()
      if (!accountId) throw new Error('Not authenticated')
      const { error } = await supabase.from('workout_plans').upsert(planToDb(plan, accountId))
      if (error) throw new Error(error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.plans.all }),
  })
}

export function useDeletePlanMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workout_plans').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.plans.all }),
  })
}

// ── Week logs ──────────────────────────────────────────────────────────────

export function useSaveWeekLogMutation() {
  return useMutation({
    mutationFn: async (log: WeekLog) => {
      const accountId = await getAccountId()
      if (!accountId) throw new Error('Not authenticated')
      const { error } = await supabase.from('week_logs').upsert({
        account_id: accountId,
        profile_id: log.profileId,
        week_number: log.weekNumber,
        year: log.year,
        sessions: log.sessions,
        feedback_generated: log.feedbackGenerated,
        feedback: log.feedback,
      }, { onConflict: 'profile_id,week_number,year' })
      if (error) throw new Error(error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.weekLogs.all }),
  })
}

// Invalidate all Supabase queries — call after sign-in or force refresh
export function invalidateAllQueries() {
  return queryClient.invalidateQueries()
}

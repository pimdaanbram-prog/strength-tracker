import { useEffect, useCallback, useRef, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAppStore } from '../store/appStore'
import type { UserProfile } from '../store/appStore'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/localStorage'
import type { WorkoutSession, WeekLog } from './useWorkouts'
import type { WorkoutPlan } from './usePlans'

// Convert between camelCase (frontend) and snake_case (database)
function profileToDb(p: UserProfile, accountId: string) {
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

function dbToProfile(d: Record<string, unknown>): UserProfile {
  return {
    id: d.id as string,
    name: d.name as string,
    gender: d.gender as 'male' | 'female',
    age: d.age as number,
    weight: d.weight as number,
    height: d.height as number,
    fitnessLevel: d.fitness_level as 'beginner' | 'intermediate' | 'advanced',
    goals: (d.goals || []) as UserProfile['goals'],
    availableEquipment: (d.available_equipment || []) as string[],
    createdAt: d.created_at as string,
    avatar: d.avatar as string,
    color: d.color as string,
  }
}

function sessionToDb(s: WorkoutSession, accountId: string) {
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

function planToDb(p: WorkoutPlan, accountId: string) {
  return {
    id: p.id,
    account_id: accountId,
    name: p.name,
    exercises: p.exercises,
    created_at: p.createdAt,
    last_used_at: p.lastUsedAt,
  }
}

function dbToPlan(d: Record<string, unknown>): WorkoutPlan {
  return {
    id: d.id as string,
    name: d.name as string,
    exercises: (d.exercises || []) as WorkoutPlan['exercises'],
    createdAt: d.created_at as string,
    lastUsedAt: (d.last_used_at as string | null) ?? null,
  }
}

function dbToSession(d: Record<string, unknown>): WorkoutSession {
  return {
    id: d.id as string,
    profileId: d.profile_id as string,
    date: d.date as string,
    weekNumber: d.week_number as number,
    year: d.year as number,
    dayLabel: d.day_label as string,
    workoutName: d.workout_name as string,
    exercises: (d.exercises || []) as WorkoutSession['exercises'],
    durationMinutes: d.duration_minutes as number,
    notes: (d.notes || '') as string,
    completedAt: d.completed_at as string,
  }
}

export function useSync() {
  const syncing = useRef(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)

  const getAccountId = useCallback(async (): Promise<string | null> => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Auth error:', error)
      return null
    }
    return user?.id ?? null
  }, [])

  // Run a diagnostic to identify the sync problem
  const diagnoseSyncIssue = useCallback(async (): Promise<string> => {
    // 1. Check env vars
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) {
      return `Supabase env vars ontbreken (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Voeg ze toe in Netlify → Site settings → Environment variables.`
    }

    // 2. Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return `Niet ingelogd of auth mislukt: ${authError?.message || 'geen gebruiker'}`
    }

    // 3. Test read from workout_sessions
    const { data, error: readError } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('account_id', user.id)
      .limit(1)

    if (readError) {
      if (readError.message.includes('relation') || readError.message.includes('does not exist')) {
        return `Tabel 'workout_sessions' bestaat niet in Supabase. Maak de tabellen aan via het SQL script.`
      }
      if (readError.code === 'PGRST301' || readError.message.includes('JWT')) {
        return `Authenticatie mislukt bij lezen. Controleer de anon key in Supabase dashboard.`
      }
      if (readError.code === '42501' || readError.message.includes('policy')) {
        return `RLS policy blokkeert lezen. Voeg een SELECT policy toe in Supabase → Authentication → Policies voor tabel 'workout_sessions'.`
      }
      return `Leesfout: ${readError.message} (code: ${readError.code})`
    }

    // 4. Test write to workout_sessions
    const testId = `__sync_test_${user.id}`
    const { error: writeError } = await supabase
      .from('workout_sessions')
      .upsert({
        id: testId,
        account_id: user.id,
        profile_id: 'test',
        date: new Date().toISOString().split('T')[0],
        week_number: 1,
        year: 2024,
        day_label: 'test',
        workout_name: '__sync_test__',
        exercises: [],
        duration_minutes: 0,
        notes: '',
        completed_at: new Date().toISOString(),
      })

    if (writeError) {
      if (writeError.code === '42501' || writeError.message.includes('policy')) {
        return `RLS policy blokkeert schrijven. Voeg een INSERT/UPDATE policy toe in Supabase → Authentication → Policies voor 'workout_sessions'.`
      }
      return `Schrijffout: ${writeError.message} (code: ${writeError.code})`
    }

    // Clean up test row
    await supabase.from('workout_sessions').delete().eq('id', testId)

    return `OK — Supabase verbinding werkt correct. ${data?.length ?? 0} sessies gevonden in cloud. Controleer of je op beide apparaten met hetzelfde account bent ingelogd.`
  }, [])

  // Pull all data from Supabase into localStorage + Zustand
  const pullFromCloud = useCallback(async () => {
    if (syncing.current) return
    syncing.current = true
    setIsSyncing(true)
    setSyncError(null)

    try {
      const accountId = await getAccountId()
      if (!accountId) {
        setSyncError('Niet ingelogd')
        return
      }

      // Pull profiles
      const { data: dbProfiles, error: profileError } = await supabase
        .from('training_profiles')
        .select('*')
        .eq('account_id', accountId)

      if (profileError) {
        setSyncError(`Profiel sync mislukt: ${profileError.message}`)
        return
      }

      if (dbProfiles) {
        const profiles = dbProfiles.map(dbToProfile)
        const store = useAppStore.getState()
        const cloudIds = new Set(profiles.map(p => p.id))
        const localOnly = store.profiles.filter(p => !cloudIds.has(p.id))
        const merged = [...profiles, ...localOnly]

        // If activeProfileId is null or no longer valid, switch to first cloud profile
        const activeStillValid = merged.some(p => p.id === store.activeProfileId)
        useAppStore.setState({
          profiles: merged,
          activeProfileId: activeStillValid ? store.activeProfileId : (profiles[0]?.id ?? store.activeProfileId),
        })

        for (const p of localOnly) {
          await supabase.from('training_profiles').upsert(profileToDb(p, accountId))
        }
      }

      // Pull sessions
      const { data: dbSessions, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('account_id', accountId)

      if (sessionError) {
        setSyncError(`Sessie sync mislukt: ${sessionError.message}`)
        return
      }

      if (dbSessions) {
        const cloudSessions = dbSessions.map(dbToSession)
        const localSessions = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
        const cloudIds = new Set(cloudSessions.map(s => s.id))
        const localOnly = localSessions.filter(s => !cloudIds.has(s.id))
        const merged = [...cloudSessions, ...localOnly]
        setToStorage(STORAGE_KEYS.SESSIONS, merged)
        useAppStore.getState().bumpSessionVersion()
        for (const s of localOnly) {
          await supabase.from('workout_sessions').upsert(sessionToDb(s, accountId))
        }
      }

      // Pull week logs
      const { data: dbWeekLogs, error: weekError } = await supabase
        .from('week_logs')
        .select('*')
        .eq('account_id', accountId)

      if (!weekError && dbWeekLogs) {
        const cloudLogs: WeekLog[] = dbWeekLogs.map(d => ({
          profileId: d.profile_id as string,
          weekNumber: d.week_number as number,
          year: d.year as number,
          sessions: (d.sessions || []) as string[],
          feedbackGenerated: d.feedback_generated as boolean,
          feedback: d.feedback as WeekLog['feedback'],
        }))
        const localLogs = getFromStorage<WeekLog[]>(STORAGE_KEYS.WEEK_LOGS, [])
        const cloudKeys = new Set(cloudLogs.map(l => `${l.profileId}-${l.weekNumber}-${l.year}`))
        const localOnly = localLogs.filter(l => !cloudKeys.has(`${l.profileId}-${l.weekNumber}-${l.year}`))
        const merged = [...cloudLogs, ...localOnly]
        setToStorage(STORAGE_KEYS.WEEK_LOGS, merged)
      }

      // Pull plans
      const { data: dbPlans, error: plansError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('account_id', accountId)

      if (!plansError && dbPlans) {

        const cloudPlans = dbPlans.map(dbToPlan)
        const localPlans = getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, [])
        const cloudIds = new Set(cloudPlans.map(p => p.id))
        const localOnly = localPlans.filter(p => !cloudIds.has(p.id))
        const merged = [...cloudPlans, ...localOnly]
        setToStorage(STORAGE_KEYS.PLANS, merged)
        useAppStore.getState().bumpPlanVersion()
        for (const p of localOnly) {
          await supabase.from('workout_plans').upsert(planToDb(p, accountId))
        }
      }

      setLastSyncAt(new Date())
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setSyncError(`Sync fout: ${msg}`)
      console.error('Sync pull failed:', e)
    } finally {
      syncing.current = false
      setIsSyncing(false)
    }
  }, [getAccountId])

  // Push a profile to cloud
  const pushProfile = useCallback(async (profile: UserProfile) => {
    try {
      const accountId = await getAccountId()
      if (!accountId) return
      const { error } = await supabase.from('training_profiles').upsert(profileToDb(profile, accountId))
      if (error) console.error('Push profile failed:', error)
    } catch (e) {
      console.error('Push profile failed:', e)
    }
  }, [getAccountId])

  // Delete a profile from cloud
  const deleteProfileFromCloud = useCallback(async (id: string) => {
    try {
      await supabase.from('training_profiles').delete().eq('id', id)
    } catch (e) {
      console.error('Delete profile failed:', e)
    }
  }, [])

  // Push a session to cloud
  const pushSession = useCallback(async (session: WorkoutSession) => {
    try {
      const accountId = await getAccountId()
      if (!accountId) return
      const { error } = await supabase.from('workout_sessions').upsert(sessionToDb(session, accountId))
      if (error) console.error('Push session failed:', error.message, error.code)
    } catch (e) {
      console.error('Push session failed:', e)
    }
  }, [getAccountId])

  // Delete a session from cloud
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await supabase.from('workout_sessions').delete().eq('id', sessionId)
    } catch (e) {
      console.error('Delete session from cloud failed:', e)
    }
  }, [])

  // Push a plan to cloud
  const pushPlan = useCallback(async (plan: WorkoutPlan) => {
    try {
      const accountId = await getAccountId()
      if (!accountId) return
      const { error } = await supabase.from('workout_plans').upsert(planToDb(plan, accountId))
      if (error) console.error('Push plan failed:', error)
    } catch (e) {
      console.error('Push plan failed:', e)
    }
  }, [getAccountId])

  // Delete a plan from cloud
  const deletePlanFromCloud = useCallback(async (id: string) => {
    try {
      await supabase.from('workout_plans').delete().eq('id', id)
    } catch (e) {
      console.error('Delete plan from cloud failed:', e)
    }
  }, [])

  // Push week feedback to cloud
  const pushWeekLog = useCallback(async (log: WeekLog) => {
    try {
      const accountId = await getAccountId()
      if (!accountId) return
      const { error } = await supabase.from('week_logs').upsert({
        account_id: accountId,
        profile_id: log.profileId,
        week_number: log.weekNumber,
        year: log.year,
        sessions: log.sessions,
        feedback_generated: log.feedbackGenerated,
        feedback: log.feedback,
      }, { onConflict: 'profile_id,week_number,year' })
      if (error) console.error('Push week log failed:', error)
    } catch (e) {
      console.error('Push week log failed:', e)
    }
  }, [getAccountId])

  // Initial sync on mount + re-sync when app becomes visible + re-sync on sign-in
  useEffect(() => {
    pullFromCloud()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') pullFromCloud()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Also sync when user signs in (important for first open on new device)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        syncing.current = false // reset guard so auth-triggered sync can run
        pullFromCloud()
      }
    })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      subscription.unsubscribe()
    }
  }, [pullFromCloud])

  // Realtime subscriptions
  useEffect(() => {
    let accountId: string | null = null

    const setupRealtime = async () => {
      accountId = await getAccountId()
      if (!accountId) return

      const channel = supabase
        .channel('db-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'training_profiles',
          filter: `account_id=eq.${accountId}`,
        }, (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const profile = dbToProfile(payload.new)
            const store = useAppStore.getState()
            const exists = store.profiles.some(p => p.id === profile.id)
            if (exists) {
              useAppStore.setState({
                profiles: store.profiles.map(p => p.id === profile.id ? profile : p),
              })
            } else {
              useAppStore.setState({ profiles: [...store.profiles, profile] })
            }
          }
          if (payload.eventType === 'DELETE') {
            const store = useAppStore.getState()
            useAppStore.setState({
              profiles: store.profiles.filter(p => p.id !== payload.old.id),
            })
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'workout_sessions',
          filter: `account_id=eq.${accountId}`,
        }, (payload) => {
          const sessions = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const session = dbToSession(payload.new)
            const idx = sessions.findIndex(s => s.id === session.id)
            if (idx >= 0) sessions[idx] = session
            else sessions.push(session)
            setToStorage(STORAGE_KEYS.SESSIONS, sessions)
            useAppStore.getState().bumpSessionVersion()
          }
          if (payload.eventType === 'DELETE') {
            setToStorage(STORAGE_KEYS.SESSIONS, sessions.filter(s => s.id !== payload.old.id))
            useAppStore.getState().bumpSessionVersion()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'workout_plans',
          filter: `account_id=eq.${accountId}`,
        }, (payload) => {
          const plans = getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, [])
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {

            const plan = dbToPlan(payload.new)
            const idx = plans.findIndex(p => p.id === plan.id)
            if (idx >= 0) plans[idx] = plan
            else plans.push(plan)
            setToStorage(STORAGE_KEYS.PLANS, plans)
            useAppStore.getState().bumpPlanVersion()
          }
          if (payload.eventType === 'DELETE') {
            setToStorage(STORAGE_KEYS.PLANS, plans.filter(p => p.id !== payload.old.id))
            useAppStore.getState().bumpPlanVersion()
          }
        })
        .subscribe()

      return channel
    }

    let channel: ReturnType<typeof supabase.channel> | undefined
    setupRealtime().then(ch => { channel = ch })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [getAccountId])

  return {
    pullFromCloud,
    pushProfile,
    deleteProfileFromCloud,
    pushSession,
    deleteSession,
    pushWeekLog,
    pushPlan,
    deletePlanFromCloud,
    diagnoseSyncIssue,
    syncError,
    isSyncing,
    lastSyncAt,
  }
}

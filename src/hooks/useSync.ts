import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { useAppStore } from '../store/appStore'
import type { UserProfile } from '../store/appStore'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/localStorage'
import type { WorkoutSession, WeekLog } from './useWorkouts'

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

  const getAccountId = useCallback(async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
  }, [])

  // Pull all data from Supabase into localStorage + Zustand
  const pullFromCloud = useCallback(async () => {
    if (syncing.current) return
    syncing.current = true

    try {
      const accountId = await getAccountId()
      if (!accountId) return

      // Pull profiles
      const { data: dbProfiles, error: profileError } = await supabase
        .from('training_profiles')
        .select('*')
        .eq('account_id', accountId)

      if (!profileError && dbProfiles) {
        const profiles = dbProfiles.map(dbToProfile)
        const store = useAppStore.getState()

        // Merge: cloud profiles win, but keep local-only ones
        const cloudIds = new Set(profiles.map(p => p.id))
        const localOnly = store.profiles.filter(p => !cloudIds.has(p.id))
        const merged = [...profiles, ...localOnly]

        useAppStore.setState({ profiles: merged })

        // Push local-only profiles to cloud
        for (const p of localOnly) {
          await supabase.from('training_profiles').upsert(profileToDb(p, accountId))
        }
      }

      // Pull sessions
      const { data: dbSessions, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('account_id', accountId)

      if (!sessionError && dbSessions) {
        const cloudSessions = dbSessions.map(dbToSession)
        const localSessions = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, [])

        // Merge: combine unique sessions
        const cloudIds = new Set(cloudSessions.map(s => s.id))
        const localOnly = localSessions.filter(s => !cloudIds.has(s.id))
        const merged = [...cloudSessions, ...localOnly]

        setToStorage(STORAGE_KEYS.SESSIONS, merged)

        // Push local-only sessions to cloud
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

        // Merge by unique key (profileId + weekNumber + year)
        const cloudKeys = new Set(cloudLogs.map(l => `${l.profileId}-${l.weekNumber}-${l.year}`))
        const localOnly = localLogs.filter(l => !cloudKeys.has(`${l.profileId}-${l.weekNumber}-${l.year}`))
        const merged = [...cloudLogs, ...localOnly]

        setToStorage(STORAGE_KEYS.WEEK_LOGS, merged)
      }
    } catch (e) {
      console.warn('Sync pull failed (offline?):', e)
    } finally {
      syncing.current = false
    }
  }, [getAccountId])

  // Push a profile to cloud
  const pushProfile = useCallback(async (profile: UserProfile) => {
    try {
      const accountId = await getAccountId()
      if (!accountId) return
      await supabase.from('training_profiles').upsert(profileToDb(profile, accountId))
    } catch (e) {
      console.warn('Push profile failed:', e)
    }
  }, [getAccountId])

  // Delete a profile from cloud
  const deleteProfileFromCloud = useCallback(async (id: string) => {
    try {
      await supabase.from('training_profiles').delete().eq('id', id)
    } catch (e) {
      console.warn('Delete profile failed:', e)
    }
  }, [])

  // Push a session to cloud
  const pushSession = useCallback(async (session: WorkoutSession) => {
    try {
      const accountId = await getAccountId()
      if (!accountId) return
      await supabase.from('workout_sessions').upsert(sessionToDb(session, accountId))
    } catch (e) {
      console.warn('Push session failed:', e)
    }
  }, [getAccountId])

  // Push week feedback to cloud
  const pushWeekLog = useCallback(async (log: WeekLog) => {
    try {
      const accountId = await getAccountId()
      if (!accountId) return
      await supabase.from('week_logs').upsert({
        account_id: accountId,
        profile_id: log.profileId,
        week_number: log.weekNumber,
        year: log.year,
        sessions: log.sessions,
        feedback_generated: log.feedbackGenerated,
        feedback: log.feedback,
      }, { onConflict: 'profile_id,week_number,year' })
    } catch (e) {
      console.warn('Push week log failed:', e)
    }
  }, [getAccountId])

  // Initial sync on mount
  useEffect(() => {
    pullFromCloud()
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
              useAppStore.setState({
                profiles: [...store.profiles, profile],
              })
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
            if (idx >= 0) {
              sessions[idx] = session
            } else {
              sessions.push(session)
            }
            setToStorage(STORAGE_KEYS.SESSIONS, sessions)
          }
          if (payload.eventType === 'DELETE') {
            setToStorage(STORAGE_KEYS.SESSIONS, sessions.filter(s => s.id !== payload.old.id))
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
    pushWeekLog,
  }
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UnlockedAchievement } from '../data/achievements'

export interface UserProfile {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number
  weight: number
  height: number
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: ('strength' | 'muscle' | 'endurance' | 'weightloss' | 'general')[]
  availableEquipment: string[]
  createdAt: string
  avatar: string
  color: string
  // Gamification (per profile)
  xp?: number
  unlockedAchievements?: UnlockedAchievement[]
}

export interface BodyWeight {
  date: string   // YYYY-MM-DD
  weight: number // kg
  note?: string
}

export interface BodyMeasurement {
  date: string
  chest?: number
  waist?: number
  hips?: number
  leftArm?: number
  rightArm?: number
  leftThigh?: number
  rightThigh?: number
  leftCalf?: number
  rightCalf?: number
  neck?: number
  bodyFatPercent?: number
  note?: string
}

export interface PlateEntry {
  weight: number
  count: number   // total plates of this type (must be even to use as pairs)
}

export interface WeightSettings {
  enabled: boolean
  barbellWeight: number      // bar weight, default 20
  plates: PlateEntry[]       // plate inventory for barbell combos
  dumbbells: number[]        // list of available dumbbell weights (kg)
  machineStep: number        // machine weight increment, default 5
  machineMax: number         // machine max weight, default 200
}

export const DEFAULT_WEIGHT_SETTINGS: WeightSettings = {
  enabled: false,
  barbellWeight: 20,
  plates: [
    { weight: 25, count: 0 },
    { weight: 20, count: 2 },
    { weight: 15, count: 0 },
    { weight: 10, count: 4 },
    { weight: 5,  count: 4 },
    { weight: 2.5, count: 4 },
    { weight: 1.25, count: 4 },
    { weight: 0.5,  count: 0 },
  ],
  dumbbells: [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 40, 45, 50],
  machineStep: 5,
  machineMax: 200,
}

// App-wide settings (not per-profile)
export interface AppSettings {
  defaultRestSeconds: number      // 90
  weightStep: number              // 2.5
  weightUnit: 'kg' | 'lbs'
  soundEnabled: boolean
  hapticEnabled: boolean
  weightSettings: WeightSettings
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultRestSeconds: 90,
  weightStep: 2.5,
  weightUnit: 'kg',
  soundEnabled: true,
  hapticEnabled: true,
  weightSettings: DEFAULT_WEIGHT_SETTINGS,
}

interface AppState {
  profiles: UserProfile[]
  activeProfileId: string | null
  sessionVersion: number
  planVersion: number
  language: 'nl' | 'en'
  settings: AppSettings

  // Computed
  getActiveProfile: () => UserProfile | null

  // Actions
  addProfile: (profile: UserProfile) => void
  updateProfile: (id: string, updates: Partial<UserProfile>) => void
  deleteProfile: (id: string) => void
  setActiveProfile: (id: string | null) => void
  bumpSessionVersion: () => void
  bumpPlanVersion: () => void
  setLanguage: (lang: 'nl' | 'en') => void
  updateSettings: (updates: Partial<AppSettings>) => void

  // Gamification
  addXP: (profileId: string, amount: number) => void
  unlockAchievement: (profileId: string, achievementId: string) => boolean  // returns true if newly unlocked
  getProfileXP: (profileId: string) => number
  getProfileAchievements: (profileId: string) => UnlockedAchievement[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      sessionVersion: 0,
      planVersion: 0,
      language: 'nl',
      settings: DEFAULT_SETTINGS,

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find((p) => p.id === activeProfileId) ?? null
      },

      addProfile: (profile) =>
        set((state) => ({
          profiles: [...state.profiles, profile],
          activeProfileId: state.activeProfileId ?? profile.id,
        })),

      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteProfile: (id) =>
        set((state) => {
          const remaining = state.profiles.filter((p) => p.id !== id)
          return {
            profiles: remaining,
            activeProfileId:
              state.activeProfileId === id
                ? (remaining[0]?.id ?? null)
                : state.activeProfileId,
          }
        }),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      bumpSessionVersion: () =>
        set((state) => ({ sessionVersion: state.sessionVersion + 1 })),

      bumpPlanVersion: () =>
        set((state) => ({ planVersion: state.planVersion + 1 })),

      setLanguage: (lang) => set({ language: lang }),

      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),

      // Gamification
      addXP: (profileId, amount) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId
              ? { ...p, xp: (p.xp ?? 0) + amount }
              : p
          ),
        })),

      unlockAchievement: (profileId, achievementId) => {
        const profile = get().profiles.find(p => p.id === profileId)
        if (!profile) return false
        const already = (profile.unlockedAchievements ?? []).some(a => a.id === achievementId)
        if (already) return false
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  unlockedAchievements: [
                    ...(p.unlockedAchievements ?? []),
                    { id: achievementId, unlockedAt: new Date().toISOString() },
                  ],
                }
              : p
          ),
        }))
        return true
      },

      getProfileXP: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId)
        return profile?.xp ?? 0
      },

      getProfileAchievements: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId)
        return profile?.unlockedAchievements ?? []
      },
    }),
    {
      name: 'strength-tracker-profiles',
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        language: state.language,
        settings: state.settings,
      }),
      // Deep-merge so newly added fields (like weightSettings) always have defaults
      // even when loading an older localStorage entry that doesn't have them.
      merge: (persisted, current) => {
        const p = persisted as Partial<typeof current>
        return {
          ...current,
          ...p,
          settings: {
            ...current.settings,
            ...(p.settings ?? {}),
            weightSettings: {
              ...current.settings.weightSettings,
              ...(p.settings?.weightSettings ?? {}),
            },
          },
        }
      },
    }
  )
)

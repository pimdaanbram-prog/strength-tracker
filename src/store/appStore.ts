import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

interface AppState {
  profiles: UserProfile[]
  activeProfileId: string | null

  // Computed
  getActiveProfile: () => UserProfile | null

  // Actions
  addProfile: (profile: UserProfile) => void
  updateProfile: (id: string, updates: Partial<UserProfile>) => void
  deleteProfile: (id: string) => void
  setActiveProfile: (id: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

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
    }),
    {
      name: 'strength-tracker-profiles',
    }
  )
)

import { useAppStore } from '@/shared/lib/store'
import type { UserProfile } from '@/shared/lib/store'
import { useSync } from '@/shared/hooks/useSync'

export function useProfiles() {
  const profiles = useAppStore((s) => s.profiles)
  const activeProfileId = useAppStore((s) => s.activeProfileId)
  const getActiveProfile = useAppStore((s) => s.getActiveProfile)
  const addProfileAction = useAppStore((s) => s.addProfile)
  const updateProfileAction = useAppStore((s) => s.updateProfile)
  const deleteProfileAction = useAppStore((s) => s.deleteProfile)
  const setActiveProfileAction = useAppStore((s) => s.setActiveProfile)
  const { pushProfile, deleteProfileFromCloud } = useSync()

  const activeProfile = getActiveProfile()
  const isOnboarding = profiles.length === 0

  return {
    profiles,
    activeProfile,
    activeProfileId,
    isOnboarding,
    addProfile: (profile: UserProfile) => {
      addProfileAction(profile)
      pushProfile(profile)
    },
    updateProfile: (id: string, updates: Partial<UserProfile>) => {
      updateProfileAction(id, updates)
      const updated = useAppStore.getState().profiles.find(p => p.id === id)
      if (updated) pushProfile(updated)
    },
    deleteProfile: (id: string) => {
      deleteProfileAction(id)
      deleteProfileFromCloud(id)
    },
    setActiveProfile: setActiveProfileAction,
  }
}

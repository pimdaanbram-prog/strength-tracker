import { useAppStore } from '@/shared/store/appStore'
import type { UserProfile } from '@/shared/store/appStore'
import { useSaveProfileMutation, useDeleteProfileMutation } from '@/shared/lib/supabaseQueries'

export function useProfiles() {
  const profiles = useAppStore((s) => s.profiles)
  const activeProfileId = useAppStore((s) => s.activeProfileId)
  const getActiveProfile = useAppStore((s) => s.getActiveProfile)
  const addProfileAction = useAppStore((s) => s.addProfile)
  const updateProfileAction = useAppStore((s) => s.updateProfile)
  const deleteProfileAction = useAppStore((s) => s.deleteProfile)
  const setActiveProfileAction = useAppStore((s) => s.setActiveProfile)
  const { mutate: saveProfileToCloud } = useSaveProfileMutation()
  const { mutate: deleteProfileFromCloud } = useDeleteProfileMutation()

  const activeProfile = getActiveProfile()
  const isOnboarding = profiles.length === 0

  return {
    profiles,
    activeProfile,
    activeProfileId,
    isOnboarding,
    addProfile: (profile: UserProfile) => {
      addProfileAction(profile)
      saveProfileToCloud(profile)
    },
    updateProfile: (id: string, updates: Partial<UserProfile>) => {
      updateProfileAction(id, updates)
      const updated = useAppStore.getState().profiles.find(p => p.id === id)
      if (updated) saveProfileToCloud(updated)
    },
    deleteProfile: (id: string) => {
      deleteProfileAction(id)
      deleteProfileFromCloud(id)
    },
    setActiveProfile: setActiveProfileAction,
  }
}

import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/shared/lib/queryKeys'
import { diagnoseSyncIssue } from '@/shared/lib/useSync'

// Provides sync UI state derived from React Query — replaces the old
// manual isSyncing/syncError/pullFromCloud pattern.
export function useSyncStatus() {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching()
  const isSyncing = isFetching > 0

  // Get the latest error from any of the main queries
  const profilesState = queryClient.getQueryState(qk.profiles.all)
  const sessionsState = queryClient.getQueryState(qk.sessions.all)
  const plansState = queryClient.getQueryState(qk.plans.all)
  const firstError = profilesState?.error ?? sessionsState?.error ?? plansState?.error
  const syncError = firstError instanceof Error ? firstError.message : null

  // Timestamp of the last successful sync (most recent of the three)
  const updatedAts = [
    profilesState?.dataUpdatedAt ?? 0,
    sessionsState?.dataUpdatedAt ?? 0,
    plansState?.dataUpdatedAt ?? 0,
  ]
  const latestUpdatedAt = Math.max(...updatedAts)
  const lastSyncAt = latestUpdatedAt > 0 ? new Date(latestUpdatedAt) : null

  const pullFromCloud = () => {
    void queryClient.invalidateQueries({ queryKey: qk.profiles.all })
    void queryClient.invalidateQueries({ queryKey: qk.sessions.all })
    void queryClient.invalidateQueries({ queryKey: qk.plans.all })
    void queryClient.invalidateQueries({ queryKey: qk.weekLogs.all })
  }

  return { isSyncing, syncError, lastSyncAt, pullFromCloud, diagnoseSyncIssue }
}

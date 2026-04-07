export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('Failed to remove from localStorage:', e)
  }
}

export const STORAGE_KEYS = {
  PROFILES: 'strength-tracker-profiles',
  ACTIVE_PROFILE: 'strength-tracker-active-profile',
  WORKOUTS: 'strength-tracker-workouts',
  WEEK_LOGS: 'strength-tracker-week-logs',
  SESSIONS: 'strength-tracker-sessions',
  PLANS: 'strength-tracker-plans',
} as const

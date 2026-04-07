import { useCallback } from 'react'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/localStorage'

export interface PlanExercise {
  exerciseId: string
  sets: number
}

export interface WorkoutPlan {
  id: string
  name: string
  exercises: PlanExercise[]
  createdAt: string
  lastUsedAt: string | null
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function usePlans() {
  const getPlans = useCallback((): WorkoutPlan[] => {
    return getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, [])
  }, [])

  const getPlan = useCallback((id: string): WorkoutPlan | null => {
    return getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, []).find(p => p.id === id) ?? null
  }, [])

  const savePlan = useCallback((plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'lastUsedAt'>): WorkoutPlan => {
    const newPlan: WorkoutPlan = {
      ...plan,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    }
    const plans = getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, [])
    plans.push(newPlan)
    setToStorage(STORAGE_KEYS.PLANS, plans)
    return newPlan
  }, [])

  const updatePlan = useCallback((id: string, updates: Partial<Omit<WorkoutPlan, 'id' | 'createdAt'>>): void => {
    const plans = getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, [])
    const idx = plans.findIndex(p => p.id === id)
    if (idx !== -1) {
      plans[idx] = { ...plans[idx], ...updates }
      setToStorage(STORAGE_KEYS.PLANS, plans)
    }
  }, [])

  const deletePlan = useCallback((id: string): void => {
    const plans = getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, []).filter(p => p.id !== id)
    setToStorage(STORAGE_KEYS.PLANS, plans)
  }, [])

  const markPlanUsed = useCallback((id: string): void => {
    const plans = getFromStorage<WorkoutPlan[]>(STORAGE_KEYS.PLANS, [])
    const idx = plans.findIndex(p => p.id === id)
    if (idx !== -1) {
      plans[idx].lastUsedAt = new Date().toISOString()
      setToStorage(STORAGE_KEYS.PLANS, plans)
    }
  }, [])

  return { getPlans, getPlan, savePlan, updatePlan, deletePlan, markPlanUsed }
}

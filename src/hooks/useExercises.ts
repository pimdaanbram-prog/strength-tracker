import { useMemo } from 'react'
import { exercises, getExerciseById, getExercisesByCategory, categories } from '../data/exercises'
import type { Exercise } from '../data/exercises'

export function useExercises() {
  const allExercises = exercises
  const allCategories = categories

  const exercisesByCategory = useMemo(() => {
    const map: Record<string, Exercise[]> = {}
    for (const cat of allCategories) {
      map[cat] = getExercisesByCategory(cat)
    }
    return map
  }, [allCategories])

  const searchExercises = (query: string): Exercise[] => {
    const q = query.toLowerCase()
    return allExercises.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.nameNL.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.musclesWorked.some(m => m.toLowerCase().includes(q))
    )
  }

  const getExercise = (id: string) => getExerciseById(id)

  const exerciseNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const e of allExercises) {
      map[e.id] = e.nameNL
    }
    return map
  }, [allExercises])

  return {
    exercises: allExercises,
    categories: allCategories,
    exercisesByCategory,
    searchExercises,
    getExercise,
    exerciseNameMap,
  }
}

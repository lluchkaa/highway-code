import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import type { CategorySummary } from '@/lib/quiz-schema'
import { categoryStats, progressSummary } from '@/stores/progress/statistics'
import { progressStore, type ProgressStore } from '@/stores/progress/store'

export function useProgress<Value>(selector: (state: ProgressStore) => Value) {
  return useStore(progressStore, selector)
}

export function useCategoryProgress(categoryId: number) {
  return useProgress(
    useShallow((state) => ({
      ...categoryStats(state.answers, categoryId),
      resume: state.lastVisited[categoryId],
    })),
  )
}

export function useProgressSummary(categories: CategorySummary[]) {
  return useProgress(
    useShallow((state) => progressSummary(state.answers, categories)),
  )
}

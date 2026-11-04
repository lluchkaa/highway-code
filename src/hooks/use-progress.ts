import { useStore } from 'zustand'

import type { CategorySummary } from '@/lib/quiz-schema'
import { progressStore } from '@/stores/progress-store'

export function useProgress() {
  const answers = useStore(progressStore, (state) => state.answers)
  const lastVisited = useStore(progressStore, (state) => state.lastVisited)
  const storageNotice = useStore(progressStore, (state) => state.storageNotice)
  const answer = useStore(progressStore, (state) => state.answer)
  const visit = useStore(progressStore, (state) => state.visit)
  const resetCategory = useStore(progressStore, (state) => state.resetCategory)
  const resetAll = useStore(progressStore, (state) => state.resetAll)

  function getStats(category: CategorySummary) {
    let answered = 0
    let correct = 0
    for (const saved of Object.values(answers)) {
      if (saved.categoryId === category.id) {
        answered += 1
        if (saved.correct) {
          correct += 1
        }
      }
    }
    return { answered, correct, incorrect: answered - correct }
  }

  return {
    answers,
    lastVisited,
    storageNotice,
    answer,
    visit,
    resetCategory,
    resetAll,
    getStats,
  }
}

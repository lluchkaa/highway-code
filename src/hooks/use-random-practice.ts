import { useStore } from 'zustand'

import { randomPracticeStore } from '@/stores/random-practice-store'

export function useRandomPractice() {
  return useStore(randomPracticeStore)
}

import { useStore } from 'zustand'

import {
  type PracticeStore,
  randomPracticeStore,
} from '@/stores/random-practice/store'

export function useRandomPractice<Value>(
  selector: (state: PracticeStore) => Value,
) {
  return useStore(randomPracticeStore, selector)
}

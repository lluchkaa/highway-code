import type { PracticeSession } from '@/stores/random-practice/store'

export function practiceStats(session: PracticeSession | null) {
  let answered = 0
  let correct = 0
  for (const item of session?.items ?? []) {
    if (item.answer !== null) {
      answered += 1
      correct += Number(item.answer.correct)
    }
  }
  return { answered, correct }
}

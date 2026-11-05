import type { CategorySummary } from '@/lib/quiz-schema'
import type { Progress } from '@/stores/progress/store'

type Stats = { answered: number; correct: number; incorrect: number }

const empty: Stats = { answered: 0, correct: 0, incorrect: 0 }
const summaries = new WeakMap<Progress['answers'], Map<number, Stats>>()

export function categoryStats(
  answers: Progress['answers'],
  categoryId: number,
) {
  let categories = summaries.get(answers)
  if (!categories) {
    categories = new Map()
    for (const answer of Object.values(answers)) {
      const stats = categories.get(answer.categoryId) ?? { ...empty }
      stats.answered += 1
      if (answer.correct) {
        stats.correct += 1
      } else {
        stats.incorrect += 1
      }
      categories.set(answer.categoryId, stats)
    }
    summaries.set(answers, categories)
  }
  return categories.get(categoryId) ?? empty
}

export function progressSummary(
  answers: Progress['answers'],
  categories: CategorySummary[],
) {
  const summary = { ...empty, total: 0 }
  for (const category of categories) {
    const stats = categoryStats(answers, category.id)
    summary.answered += stats.answered
    summary.correct += stats.correct
    summary.incorrect += stats.incorrect
    summary.total += category.questionCount
  }
  return summary
}

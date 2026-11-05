import { generatePath } from 'react-router'
import { z } from 'zod'

import type { Category, CategorySummary } from '@/lib/quiz-schema'

export const routes = {
  home: '/',
  question: '/categories/:categoryId/questions/:questionId',
  practice: '/practice',
}

export function practicePath(position: number) {
  return `${routes.practice}?question=${String(position + 1)}`
}

export const questionRouteSchema = z.object({
  categoryId: z
    .string()
    .regex(/^(0|[1-9]\d*)$/)
    .transform(Number)
    .refine(Number.isSafeInteger),
  questionId: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .refine(Number.isSafeInteger),
})

export function questionPath(categoryId: number, questionId: number) {
  return generatePath(routes.question, {
    categoryId: String(categoryId),
    questionId: String(questionId),
  })
}

export function nextQuestionPath(
  categories: CategorySummary[],
  category: Category,
  position: number,
) {
  const nextQuestion = category.questions[position + 1]
  if (nextQuestion) {
    return questionPath(category.index, nextQuestion.id)
  }
  const categoryIndex = categories.findIndex(
    (item) => item.id === category.index,
  )
  const nextCategory =
    categoryIndex < 0 ? undefined : categories[categoryIndex + 1]
  return nextCategory
    ? questionPath(nextCategory.id, nextCategory.firstQuestionId)
    : routes.home
}

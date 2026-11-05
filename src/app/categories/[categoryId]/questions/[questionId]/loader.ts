import type { LoaderFunctionArgs } from 'react-router'

import { loadCatalog } from '@/lib/catalog'
import { loadCategory } from '@/lib/load-category'
import { questionRouteSchema } from '@/lib/routes'
import { progressStore } from '@/stores/progress'

export async function questionLoader({ params, request }: LoaderFunctionArgs) {
  const parsed = questionRouteSchema.safeParse(params)
  if (!parsed.success) {
    throw new Response('Question not found', { status: 404 })
  }
  const categories = await loadCatalog()
  const summary = categories.find(
    (category) => category.id === parsed.data.categoryId,
  )
  if (!summary) {
    throw new Response('Category not found', { status: 404 })
  }
  const category = await loadCategory(summary, request.signal)
  const position = category.questions.findIndex(
    (question) => question.id === parsed.data.questionId,
  )
  const question = category.questions[position]
  if (!question) {
    throw new Response('Question not found', { status: 404 })
  }
  if (!request.signal.aborted) {
    progressStore.getState().visit(category, summary.revision, question.id)
  }
  return { category, summary, position, question }
}

import { type ActionFunctionArgs, redirect } from 'react-router'

import { loadCatalog } from '@/lib/catalog'
import { learningCategories } from '@/lib/licence-categories'
import { loadCategory } from '@/lib/load-category'
import type {
  Category,
  CategoryGroup,
  CategorySummary,
} from '@/lib/quiz-schema'
import { practicePath } from '@/lib/routes'
import { learningStore } from '@/stores/learning'
import { randomPracticeStore } from '@/stores/random-practice'

function shuffle<T>(values: T[]) {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1))
    const current = result[index]
    const replacement = result[other]
    if (current !== undefined && replacement !== undefined) {
      result[index] = replacement
      result[other] = current
    }
  }
  return result
}

export async function startRandomPractice({ request }: ActionFunctionArgs) {
  const catalog = await loadCatalog()
  const { licences } = learningStore.getState()
  const categories = learningCategories(catalog, licences)
  const pool = shuffle(
    categories.flatMap((summary) =>
      Array.from({ length: summary.questionCount }, (_, position) => ({
        summary,
        position,
      })),
    ),
  )
  const selected: typeof pool = []
  const groups = new Set<CategoryGroup>()
  for (const item of pool) {
    if (!groups.has(item.summary.group)) {
      selected.push(item)
      groups.add(item.summary.group)
    }
  }
  for (const item of pool) {
    if (selected.length === 20) {
      break
    }
    if (!selected.includes(item)) {
      selected.push(item)
    }
  }
  const loaded = new Map<number, Category>()
  const items: {
    summary: CategorySummary
    question: Category['questions'][number]
  }[] = []
  for (const { summary, position } of shuffle(selected)) {
    request.signal.throwIfAborted()
    const category =
      loaded.get(summary.id) ?? (await loadCategory(summary, request.signal))
    loaded.set(summary.id, category)
    const question = category.questions[position]
    if (!question) {
      throw new Error('The random question is missing from its topic')
    }
    items.push({ summary, question })
  }
  request.signal.throwIfAborted()
  randomPracticeStore.getState().start(items, licences)
  return redirect(practicePath(0))
}

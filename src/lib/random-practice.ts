import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from 'react-router'
import { z } from 'zod'

import { loadCatalog } from '@/lib/catalog'
import { learningCategories } from '@/lib/licence-categories'
import { loadCategory } from '@/lib/load-category'
import type {
  Category,
  CategoryGroup,
  CategorySummary,
} from '@/lib/quiz-schema'
import { practicePath } from '@/lib/routes'
import { learningStore } from '@/stores/learning-store'
import { randomPracticeStore } from '@/stores/random-practice-store'

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

export async function randomPracticeLoader({ request }: LoaderFunctionArgs) {
  const catalog = await loadCatalog()
  const { session, clear, visit } = randomPracticeStore.getState()
  if (!session) {
    return null
  }
  const revisions = new Map(
    catalog.map((category) => [category.id, category.revision]),
  )
  if (
    session.items.some(
      (item) => revisions.get(item.summary.id) !== item.summary.revision,
    )
  ) {
    clear()
    return null
  }
  const query = new URL(request.url).searchParams.get('question')
  const parsed = z
    .string()
    .regex(/^(?:[1-9]|1\d|20|21)$/)
    .transform((value) => Number(value) - 1)
    .safeParse(query)
  if (query !== null && !parsed.success) {
    throw new Response('Question not found', { status: 404 })
  }
  const position = parsed.success ? parsed.data : session.position
  if (!request.signal.aborted) {
    visit(position)
  }
  return { position }
}

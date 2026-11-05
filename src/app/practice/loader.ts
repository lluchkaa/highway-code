import type { LoaderFunctionArgs } from 'react-router'
import { z } from 'zod'

import { loadCatalog } from '@/lib/catalog'
import { randomPracticeStore } from '@/stores/random-practice'

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

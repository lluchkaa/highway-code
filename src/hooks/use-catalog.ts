import { useRouteLoaderData } from 'react-router'

import type { CategorySummary } from '@/lib/quiz-schema'

export function useCatalog() {
  const categories = useRouteLoaderData<CategorySummary[]>('catalog')
  if (!categories) {
    throw new Error(
      'The catalog loader must complete before rendering this route',
    )
  }
  return categories
}

import { catalogSchema, type CategorySummary } from '@/lib/quiz-schema'
import { progressStore } from '@/stores/progress'

let pending: Promise<CategorySummary[]> | undefined

export function loadCatalog() {
  pending ??= fetch(`${import.meta.env.BASE_URL}assets/questions/catalog.json`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Unable to load category catalog: ${String(response.status)}`,
        )
      }
      const value: unknown = await response.json()
      const { categories } = catalogSchema.parse(value)
      progressStore.getState().reconcileCatalog(categories)
      return categories
    })
    .catch((error: unknown) => {
      pending = undefined
      throw error
    })
  return pending
}

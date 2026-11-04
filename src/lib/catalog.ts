import {
  catalogSchema,
  type CategoryGroup,
  type CategorySummary,
} from '@/lib/quiz-schema'
import { progressStore } from '@/stores/progress-store'

export const categoryGroups: {
  id: CategoryGroup
  label: string
  description: string
}[] = [
  {
    id: 'general',
    label: 'Основні теми',
    description: 'Правила, знаки та безпека руху',
  },
  { id: 'A', label: 'Категорії A1, A', description: 'Мопеди та мотоцикли' },
  {
    id: 'B',
    label: 'Категорії B1, B',
    description: 'Легкові автомобілі та квадроцикли',
  },
  { id: 'C', label: 'Категорії C1, C', description: 'Вантажні автомобілі' },
  { id: 'D', label: 'Категорії D1, D', description: 'Автобуси' },
  {
    id: 'E',
    label: 'Категорії з причепом',
    description: 'BE, C1E, CE, D1E, DE',
  },
  { id: 'T', label: 'Категорія T', description: 'Трамваї та тролейбуси' },
]

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

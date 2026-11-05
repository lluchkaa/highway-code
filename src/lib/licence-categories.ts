import { z } from 'zod'

import type { CategoryGroup, CategorySummary } from '@/lib/quiz-schema'

export const licenceSchema = z.enum([
  'A1',
  'A',
  'B1',
  'B',
  'C1',
  'C',
  'D1',
  'D',
  'BE',
  'C1E',
  'CE',
  'D1E',
  'DE',
  'T',
])

export type Licence = z.infer<typeof licenceSchema>

export const licenceGroups: Record<Licence, CategoryGroup[]> = {
  A1: ['A'],
  A: ['A'],
  B1: ['B'],
  B: ['B'],
  C1: ['C'],
  C: ['C'],
  D1: ['D'],
  D: ['D'],
  BE: ['B', 'E'],
  C1E: ['C', 'E'],
  CE: ['C', 'E'],
  D1E: ['D', 'E'],
  DE: ['D', 'E'],
  T: ['T'],
}

export function learningCategories(
  catalog: CategorySummary[],
  licences: Licence[],
) {
  const groups = new Set<CategoryGroup>([
    'general',
    ...licences.flatMap((licence) => licenceGroups[licence]),
  ])
  return catalog.filter((category) => groups.has(category.group))
}

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

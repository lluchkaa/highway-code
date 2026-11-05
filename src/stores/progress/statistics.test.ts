import { describe, expect, it } from 'vitest'

import { catalogSchema, categorySchema } from '@/lib/quiz-schema'
import { createProgressStore } from '@/stores/progress'
import { categoryStats, progressSummary } from '@/stores/progress/statistics'
import { memoryStorage } from '@/test/storage'

import categoryData from '../../../public/assets/questions/0-category.json'
import otherData from '../../../public/assets/questions/1-category.json'
import catalogData from '../../../public/assets/questions/catalog.json'

const category = categorySchema.parse(categoryData)
const other = categorySchema.parse(otherData)
const catalog = catalogSchema.parse(catalogData).categories
const first = catalog[0]
const second = catalog[1]
if (!first || !second) {
  throw new Error('Missing test topics')
}

describe('progress summaries', () => {
  it('counts selected topics without including answers from other topics', () => {
    const store = createProgressStore(memoryStorage())
    store.getState().answer(category, first.revision, 1, 2)
    store.getState().answer(other, second.revision, 608, 0)
    expect(categoryStats(store.getState().answers, first.id)).toEqual({
      answered: 1,
      correct: 1,
      incorrect: 0,
    })
    expect(progressSummary(store.getState().answers, [first])).toEqual({
      answered: 1,
      correct: 1,
      incorrect: 0,
      total: first.questionCount,
    })
    expect(
      progressSummary(store.getState().answers, [first, second]),
    ).toMatchObject({
      answered: 2,
      correct: 1,
      incorrect: 1,
    })
  })

  it('updates after retries and resets while preserving prior snapshots', () => {
    const store = createProgressStore(memoryStorage())
    store.getState().answer(category, first.revision, 1, 0)
    const previous = store.getState().answers
    expect(categoryStats(previous, first.id).incorrect).toBe(1)
    store.getState().answer(category, first.revision, 1, 2)
    expect(categoryStats(store.getState().answers, first.id)).toEqual({
      answered: 1,
      correct: 1,
      incorrect: 0,
    })
    expect(categoryStats(previous, first.id).incorrect).toBe(1)
    store.getState().resetCategory(first.id)
    expect(categoryStats(store.getState().answers, first.id).answered).toBe(0)
  })

  it('handles an empty selection', () => {
    expect(progressSummary({}, [])).toEqual({
      answered: 0,
      correct: 0,
      incorrect: 0,
      total: 0,
    })
  })
})

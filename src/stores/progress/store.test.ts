import { describe, expect, it } from 'vitest'

import { catalogSchema, categorySchema } from '@/lib/quiz-schema'
import { createProgressStore, progressStorageKey } from '@/stores/progress'
import { memoryStorage } from '@/test/storage'

import categoryAData from '../../../public/assets/questions/0-category.json'
import categoryBData from '../../../public/assets/questions/1-category.json'
import catalogData from '../../../public/assets/questions/catalog.json'

const categoryA = categorySchema.parse(categoryAData)
const categoryB = categorySchema.parse(categoryBData)
const categories = catalogSchema.parse(catalogData).categories
const summaryA = categories[0]
const summaryB = categories[1]
if (!summaryA || !summaryB) {
  throw new Error('Test categories are missing')
}
const revisionA = summaryA.revision
const revisionB = summaryB.revision

function savedProgress(
  answers: Record<string, unknown>,
  lastVisited: Record<string, unknown> = {},
) {
  return JSON.stringify({ version: 1, state: { answers, lastVisited } })
}

describe('persistent quiz progress', () => {
  it('starts unanswered and ignores scraped account status', () => {
    const store = createProgressStore(memoryStorage())
    store.getState().reconcileCatalog(categories)
    store.getState().reconcileCategory(categoryA, categories[0] ?? summaryA)
    expect(store.getState().answers).toEqual({})
    expect(categoryAData.questions[0]?.status).toBe('correct')
    expect(categoryA.questions[0]).not.toHaveProperty('status')
  })

  it('persists an answer, restores it, and replaces it on retry', () => {
    const storage = memoryStorage()
    const store = createProgressStore(storage)
    store.getState().answer(categoryA, revisionA, 1, 0)
    expect(store.getState().answers[1]?.correct).toBe(false)

    const restored = createProgressStore(storage)
    expect(restored.getState().answers[1]?.optionIndex).toBe(0)
    restored.getState().answer(categoryA, revisionA, 1, 2)
    expect(restored.getState().answers[1]?.correct).toBe(true)
    expect(Object.keys(restored.getState().answers)).toEqual(['1'])
    expect(
      createProgressStore(storage).getState().answers[1]?.optionIndex,
    ).toBe(2)
    expect(storage.getItem(progressStorageKey)).not.toContain('storageNotice')
  })

  it('remembers the last visited question without counting it as answered', () => {
    const storage = memoryStorage()
    const store = createProgressStore(storage)
    store.getState().visit(categoryA, revisionA, 7)
    const restored = createProgressStore(storage)
    expect(restored.getState().lastVisited[0]?.questionId).toBe(7)
    expect(restored.getState().answers).toEqual({})
  })

  it('rejects unknown questions and out-of-range answers', () => {
    const store = createProgressStore(memoryStorage())
    for (const option of [-1, 3, 1.5, Number.NaN]) {
      store.getState().answer(categoryA, revisionA, 1, option)
    }
    store.getState().answer(categoryA, revisionA, 99999, 0)
    store.getState().visit(categoryA, revisionA, 99999)
    expect(store.getState().answers).toEqual({})
    expect(store.getState().lastVisited).toEqual({})
  })

  it('resets one category while preserving other categories and unrelated storage', () => {
    const storage = memoryStorage()
    storage.setItem('another-app', 'keep me')
    const store = createProgressStore(storage)
    store.getState().answer(categoryA, revisionA, 1, 2)
    store.getState().answer(categoryB, revisionB, 608, 1)
    store.getState().visit(categoryA, revisionA, 1)
    store.getState().visit(categoryB, revisionB, 608)
    store.getState().resetCategory(0)
    const restored = createProgressStore(storage)
    expect(restored.getState().answers[1]).toBeUndefined()
    expect(restored.getState().answers[608]?.correct).toBe(true)
    expect(restored.getState().lastVisited[0]).toBeUndefined()
    expect(restored.getState().lastVisited[1]?.questionId).toBe(608)
    expect(storage.getItem('another-app')).toBe('keep me')
  })

  it('resets all quiz progress without clearing unrelated localStorage keys', () => {
    const storage = memoryStorage()
    storage.setItem('another-app', 'keep me')
    const store = createProgressStore(storage)
    store.getState().answer(categoryA, revisionA, 1, 2)
    store.getState().visit(categoryB, revisionB, 608)
    store.getState().resetAll()
    const restored = createProgressStore(storage)
    expect(restored.getState().answers).toEqual({})
    expect(restored.getState().lastVisited).toEqual({})
    expect(storage.getItem('another-app')).toBe('keep me')
  })

  it.each(['{broken json', 'null', '{"version":99,"state":{}}'])(
    'recovers from invalid saved data: %s',
    (raw) => {
      const store = createProgressStore(
        memoryStorage({ [progressStorageKey]: raw }),
      )
      expect(store.getState().answers).toEqual({})
      expect(store.getState().storageNotice).not.toBeNull()
      store.getState().answer(categoryA, revisionA, 1, 2)
      expect(store.getState().answers[1]?.correct).toBe(true)
    },
  )

  it('preserves valid entries when neighboring entries are malformed', () => {
    const store = createProgressStore(
      memoryStorage({
        [progressStorageKey]: savedProgress(
          {
            1: {
              categoryId: 0,
              revision: revisionA,
              optionIndex: 2,
              correct: true,
            },
            2: {
              categoryId: 0,
              revision: revisionA,
              optionIndex: '2',
              correct: true,
            },
            3: {
              categoryId: 0,
              revision: revisionA,
              optionIndex: 10,
              correct: false,
            },
            invalid: {
              categoryId: 0,
              revision: revisionA,
              optionIndex: 0,
              correct: false,
            },
          },
          { 0: { questionId: 1, revision: revisionA }, 1: 'broken' },
        ),
      }),
    )
    expect(Object.keys(store.getState().answers)).toEqual(['1'])
    expect(Object.keys(store.getState().lastVisited)).toEqual(['0'])
    expect(store.getState().storageNotice).not.toBeNull()
  })

  it('invalidates only categories whose content revision changed', () => {
    const store = createProgressStore(memoryStorage())
    store.getState().answer(categoryA, revisionA, 1, 2)
    store.getState().answer(categoryB, revisionB, 608, 1)
    store.getState().visit(categoryA, revisionA, 1)
    store
      .getState()
      .reconcileCatalog(
        categories.map((category) =>
          category.id === 0
            ? { ...category, revision: '0000000000000000' }
            : category,
        ),
      )
    expect(store.getState().answers[1]).toBeUndefined()
    expect(store.getState().answers[608]?.correct).toBe(true)
    expect(store.getState().lastVisited[0]).toBeUndefined()
  })

  it('reconciles saved answers and resume positions against loaded question data', () => {
    const store = createProgressStore(
      memoryStorage({
        [progressStorageKey]: savedProgress(
          {
            1: {
              categoryId: 0,
              revision: revisionA,
              optionIndex: 2,
              correct: false,
            },
            99999: {
              categoryId: 0,
              revision: revisionA,
              optionIndex: 0,
              correct: true,
            },
          },
          { 0: { questionId: 99999, revision: revisionA } },
        ),
      }),
    )
    const summary = categories[0]
    if (!summary) {
      throw new Error('Missing test category')
    }
    store.getState().reconcileCategory(categoryA, summary)
    expect(store.getState().answers[1]?.correct).toBe(true)
    expect(store.getState().answers[99999]).toBeUndefined()
    expect(store.getState().lastVisited[0]).toBeUndefined()
  })

  it('keeps the quiz usable when storage is blocked', () => {
    const store = createProgressStore(null)
    store.getState().answer(categoryA, revisionA, 1, 2)
    expect(store.getState().answers[1]?.correct).toBe(true)
    expect(store.getState().storageNotice).not.toBeNull()
  })

  it('handles read failures without losing the ability to answer', () => {
    const storage = memoryStorage()
    storage.getItem = () => {
      throw new Error('Storage access denied')
    }
    const store = createProgressStore(storage)
    expect(store.getState().storageNotice).not.toBeNull()
    expect(() => {
      store.getState().answer(categoryA, revisionA, 1, 2)
    }).not.toThrow()
  })

  it('keeps answers in memory and reports quota failures', async () => {
    const storage = memoryStorage()
    storage.setItem = () => {
      throw new Error('Quota exceeded')
    }
    const store = createProgressStore(storage)
    store.getState().answer(categoryA, revisionA, 1, 2)
    await Promise.resolve()
    expect(store.getState().answers[1]?.correct).toBe(true)
    expect(store.getState().storageNotice).not.toBeNull()
  })
})

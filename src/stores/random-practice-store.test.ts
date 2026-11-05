import { describe, expect, it } from 'vitest'

import { catalogSchema, categorySchema } from '@/lib/quiz-schema'
import { createRandomPracticeStore } from '@/stores/random-practice-store'

import categoryData from '../../public/assets/questions/0-category.json'
import catalogData from '../../public/assets/questions/catalog.json'

const category = categorySchema.parse(categoryData)
const summary = catalogSchema.parse(catalogData).categories[0]
if (!summary) {
  throw new Error('Missing test category')
}
const items = category.questions
  .slice(0, 20)
  .map((question) => ({ question, summary }))
const first = items[0]
if (!first) {
  throw new Error('Missing test question')
}
const key = 'highway-code:random-practice'

function memoryStorage(raw?: string) {
  const values = new Map<string, string>(raw === undefined ? [] : [[key, raw]])
  return {
    getItem: (name: string) => values.get(name) ?? null,
    setItem: (name: string, value: string) => {
      values.set(name, value)
    },
    removeItem: (name: string) => {
      values.delete(name)
    },
  }
}

describe('random practice session', () => {
  it('persists the question set, answer, and resume position and replaces answers on retry', () => {
    const storage = memoryStorage()
    const store = createRandomPracticeStore(storage)
    store.getState().start(items, ['B', 'BE'])
    store.getState().answer(first.question.id, first.question.correct_answer)
    store.getState().visit(7)
    const restored = createRandomPracticeStore(storage)
    expect(restored.getState().session).toEqual(store.getState().session)
    expect(restored.getState().session?.position).toBe(7)
    expect(restored.getState().session?.items[0]?.answer?.correct).toBe(true)
    restored
      .getState()
      .answer(
        first.question.id,
        (first.question.correct_answer + 1) % first.question.options.length,
      )
    expect(
      createRandomPracticeStore(storage).getState().session?.items[0]?.answer
        ?.correct,
    ).toBe(false)
    expect(storage.getItem(key)).not.toContain('storageNotice')
  })

  it('starts a fresh session and preserves unrelated storage', () => {
    const storage = memoryStorage()
    storage.setItem('another-app', 'keep')
    const store = createRandomPracticeStore(storage)
    store.getState().start(items, ['B'])
    const firstId = store.getState().session?.id
    store.getState().answer(first.question.id, 0)
    store.getState().visit(20)
    store.getState().start([...items].reverse(), ['A'])
    expect(store.getState().session?.id).not.toBe(firstId)
    expect(store.getState().session?.licences).toEqual(['A'])
    expect(store.getState().session?.position).toBe(0)
    expect(
      store.getState().session?.items.every((item) => item.answer === null),
    ).toBe(true)
    expect(storage.getItem('another-app')).toBe('keep')
  })

  it('rejects duplicate questions and incomplete sets without replacing the current session', () => {
    const store = createRandomPracticeStore(memoryStorage())
    store.getState().start(items, [])
    const saved = store.getState().session
    expect(() => {
      store.getState().start(items.slice(1), [])
    }).toThrow()
    expect(() => {
      store.getState().start(
        Array.from({ length: 20 }, () => first),
        [],
      )
    }).toThrow()
    expect(store.getState().session).toBe(saved)
  })

  it('ignores invalid answers and positions', () => {
    const store = createRandomPracticeStore(memoryStorage())
    store.getState().start(items, [])
    const saved = store.getState().session
    for (const index of [-1, 1.5, first.question.options.length, Number.NaN]) {
      store.getState().answer(first.question.id, index)
    }
    store.getState().answer(999999, 0)
    for (const position of [-1, 1.5, 21, Number.NaN]) {
      store.getState().visit(position)
    }
    expect(store.getState().session).toBe(saved)
  })

  it.each(['{invalid', 'null', '{"version":99,"state":{}}'])(
    'recovers from malformed session storage: %s',
    (raw) => {
      const store = createRandomPracticeStore(memoryStorage(raw))
      expect(store.getState().session).toBeNull()
      expect(store.getState().storageNotice).toContain('пошкоджено')
      store.getState().start(items, [])
      expect(store.getState().session?.items).toHaveLength(20)
    },
  )

  it('keeps practice usable when storage is unavailable or full', async () => {
    const blocked = createRandomPracticeStore(null)
    blocked.getState().start(items, [])
    blocked.getState().answer(first.question.id, 0)
    expect(blocked.getState().session?.items[0]?.answer).not.toBeNull()
    expect(blocked.getState().storageNotice).not.toBeNull()

    const storage = memoryStorage()
    storage.setItem = () => {
      throw new Error('Quota exceeded')
    }
    const full = createRandomPracticeStore(storage)
    full.getState().start(items, [])
    await Promise.resolve()
    expect(full.getState().session?.items).toHaveLength(20)
    expect(full.getState().storageNotice).not.toBeNull()
  })
})

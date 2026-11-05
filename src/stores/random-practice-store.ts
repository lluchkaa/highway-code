import { z } from 'zod'
import { persist, type PersistStorage } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { type Licence, licenceSchema } from '@/lib/licence-categories'
import {
  type CategorySummary,
  categorySummarySchema,
  type Question,
  questionSchema,
} from '@/lib/quiz-schema'

const answerSchema = z.object({
  optionIndex: z.number().int().nonnegative(),
  correct: z.boolean(),
})
const itemSchema = z
  .object({
    summary: categorySummarySchema,
    question: questionSchema,
    answer: answerSchema.nullable(),
  })
  .refine(
    (item) =>
      item.answer === null ||
      item.answer.optionIndex < item.question.options.length,
  )
  .transform((item) => ({
    ...item,
    answer:
      item.answer === null
        ? null
        : {
            ...item.answer,
            correct: item.answer.optionIndex === item.question.correct_answer,
          },
  }))
const sessionSchema = z
  .object({
    id: z.uuid(),
    licences: z.array(licenceSchema),
    items: z.array(itemSchema).length(20),
    position: z.number().int().min(0).max(20),
  })
  .refine(
    (session) =>
      new Set(session.items.map((item) => item.question.id)).size === 20,
  )
const stateSchema = z.object({ session: sessionSchema.nullable() })
const envelopeSchema = z.object({ version: z.literal(1), state: stateSchema })
type PracticeState = z.infer<typeof stateSchema>
type PracticeStore = PracticeState & {
  storageNotice: string | null
  start: (
    items: { summary: CategorySummary; question: Question }[],
    licences: Licence[],
  ) => void
  answer: (questionId: number, optionIndex: number) => void
  visit: (position: number) => void
  clear: () => void
}

const unavailableNotice =
  'Не вдалося зберегти тест у вкладці. Можна продовжувати, але після оновлення набір може зникнути.'
const recoveredNotice =
  'Збережений тест пошкоджено. Почни новий набір із 20 питань.'

export function createRandomPracticeStore(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null,
) {
  let storageNotice: string | null = storage === null ? unavailableNotice : null
  const persistedStorage: PersistStorage<PracticeState> = {
    getItem: (key) => {
      const fallback = { version: 1, state: { session: null } }
      let raw: string | null | undefined
      try {
        raw = storage?.getItem(key)
      } catch {
        storageNotice = unavailableNotice
        return fallback
      }
      try {
        if (raw === null || raw === undefined) {
          return fallback
        }
        const parsed = envelopeSchema.safeParse(JSON.parse(raw))
        if (!parsed.success) {
          storageNotice = recoveredNotice
        }
        return parsed.success ? parsed.data : fallback
      } catch {
        storageNotice = recoveredNotice
        return fallback
      }
    },
    setItem: (key, value) => {
      try {
        storage?.setItem(key, JSON.stringify(value))
      } catch {
        reportStorageFailure()
      }
    },
    removeItem: (key) => {
      try {
        storage?.removeItem(key)
      } catch {
        reportStorageFailure()
      }
    },
  }
  function reportStorageFailure() {
    queueMicrotask(() => {
      if (store.getState().storageNotice !== unavailableNotice) {
        store.setState({ storageNotice: unavailableNotice })
      }
    })
  }
  const store = createStore<PracticeStore>()(
    persist(
      (set) => ({
        session: null,
        storageNotice,
        start: (items, licences) => {
          const session = sessionSchema.parse({
            id: crypto.randomUUID(),
            licences,
            items: items.map((item) => ({ ...item, answer: null })),
            position: 0,
          })
          set((state) => ({
            session,
            storageNotice:
              state.storageNotice === recoveredNotice
                ? null
                : state.storageNotice,
          }))
        },
        answer: (questionId, optionIndex) => {
          set((state) => {
            const item = state.session?.items.find(
              (entry) => entry.question.id === questionId,
            )
            if (
              !state.session ||
              !item ||
              !Number.isInteger(optionIndex) ||
              optionIndex < 0 ||
              optionIndex >= item.question.options.length
            ) {
              return state
            }
            return {
              session: {
                ...state.session,
                items: state.session.items.map((entry) =>
                  entry === item
                    ? {
                        ...entry,
                        answer: {
                          optionIndex,
                          correct:
                            optionIndex === entry.question.correct_answer,
                        },
                      }
                    : entry,
                ),
              },
            }
          })
        },
        visit: (position) => {
          set((state) =>
            state.session &&
            Number.isInteger(position) &&
            position >= 0 &&
            position <= 20 &&
            state.session.position !== position
              ? { session: { ...state.session, position } }
              : state,
          )
        },
        clear: () => {
          set({ session: null })
        },
      }),
      {
        name: 'highway-code:random-practice',
        version: 1,
        storage: persistedStorage,
        partialize: ({ session }) => ({ session }),
        merge: (persisted, current) => ({
          ...current,
          ...stateSchema.parse(persisted),
          storageNotice,
        }),
      },
    ),
  )
  return store
}

function browserSessionStorage() {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

export const randomPracticeStore = createRandomPracticeStore(
  browserSessionStorage(),
)

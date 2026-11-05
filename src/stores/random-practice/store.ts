import { z } from 'zod'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { type Licence, licenceSchema } from '@/lib/licence-categories'
import {
  type CategorySummary,
  categorySummarySchema,
  type Question,
  questionSchema,
} from '@/lib/quiz-schema'
import {
  createStorage,
  type StorageAdapter,
} from '@/stores/persistence/storage'

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
export type PracticeSession = z.infer<typeof sessionSchema>
type PracticeState = z.infer<typeof stateSchema>
export type PracticeStore = PracticeState & {
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
  storage: StorageAdapter | null | 'session' = 'session',
) {
  const persistence = createStorage<PracticeState>({
    storage,
    defaultValue: () => ({ version: 1, state: { session: null } }),
    schema: envelopeSchema,
    notices: { unavailable: unavailableNotice, recovered: recoveredNotice },
  })
  const store = createStore<PracticeStore>()(
    persist(
      (set) => ({
        session: null,
        storageNotice: persistence.notice,
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
        storage: persistence.storage,
        partialize: ({ session }) => ({ session }),
        merge: (persisted, current) => ({
          ...current,
          ...stateSchema.parse(persisted),
          storageNotice: persistence.notice,
        }),
      },
    ),
  )
  persistence.subscribe((storageNotice) => {
    store.setState({ storageNotice })
  })
  return store
}

export const randomPracticeStore = createRandomPracticeStore()

import { z } from 'zod'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import type { Category, CategorySummary } from '@/lib/quiz-schema'
import {
  createStorage,
  type StorageAdapter,
} from '@/stores/persistence/storage'

const revisionSchema = z.string().regex(/^[a-f0-9]{16}$/)
const savedAnswerSchema = z.object({
  categoryId: z.number().int().nonnegative(),
  optionIndex: z.number().int().min(0).max(4),
  correct: z.boolean(),
  revision: revisionSchema,
})
const visitedSchema = z.object({
  questionId: z.number().int().positive(),
  revision: revisionSchema,
})
const progressSchema = z.object({
  answers: z.record(z.string(), savedAnswerSchema),
  lastVisited: z.record(z.string(), visitedSchema),
})
const envelopeSchema = z
  .object({
    version: z.literal(1),
    state: z.object({
      answers: z.record(z.string(), z.unknown()),
      lastVisited: z.record(z.string(), z.unknown()),
    }),
  })
  .transform((envelope) => {
    const progress = emptyProgress()
    let recovered = false
    for (const [id, candidate] of Object.entries(envelope.state.answers)) {
      const answer = savedAnswerSchema.safeParse(candidate)
      if (/^[1-9]\d*$/.test(id) && answer.success) {
        progress.answers[id] = answer.data
      } else {
        recovered = true
      }
    }
    for (const [id, candidate] of Object.entries(envelope.state.lastVisited)) {
      const visited = visitedSchema.safeParse(candidate)
      if (/^(0|[1-9]\d*)$/.test(id) && visited.success) {
        progress.lastVisited[id] = visited.data
      } else {
        recovered = true
      }
    }
    return { version: 1, state: progress, recovered }
  })

export type Progress = z.infer<typeof progressSchema>
export type ProgressStore = Progress & {
  storageNotice: string | null
  answer: (
    category: Category,
    revision: string,
    questionId: number,
    optionIndex: number,
  ) => void
  visit: (category: Category, revision: string, questionId: number) => void
  reconcileCatalog: (categories: CategorySummary[]) => void
  reconcileCategory: (category: Category, summary: CategorySummary) => void
  resetCategory: (categoryId: number) => void
  resetAll: () => void
}

export const progressStorageKey = 'highway-code:progress'
const unavailableNotice =
  'Не вдалося зберегти прогрес у браузері. Ви можете продовжувати, але зміни можуть зникнути після закриття сторінки.'
const recoveredNotice =
  'Частину збереженого прогресу не вдалося відновити або дані питань змінилися. Решта відповідей збережена.'

function emptyProgress(): Progress {
  return { answers: {}, lastVisited: {} }
}

export function createProgressStore(
  storage: StorageAdapter | null | 'local' = 'local',
) {
  const persistence = createStorage<Progress>({
    storage,
    defaultValue: () => ({ version: 1, state: emptyProgress() }),
    schema: envelopeSchema,
    notices: { unavailable: unavailableNotice, recovered: recoveredNotice },
  })
  const store = createStore<ProgressStore>()(
    persist(
      (set, get) => ({
        ...emptyProgress(),
        storageNotice: persistence.notice,
        answer: (category, revision, questionId, optionIndex) => {
          const question = category.questions.find(
            (item) => item.id === questionId,
          )
          if (
            !question ||
            !revisionSchema.safeParse(revision).success ||
            !Number.isInteger(optionIndex) ||
            optionIndex < 0 ||
            optionIndex >= question.options.length
          ) {
            return
          }
          set((state) => ({
            answers: {
              ...state.answers,
              [questionId]: {
                categoryId: category.index,
                optionIndex,
                correct: optionIndex === question.correct_answer,
                revision,
              },
            },
          }))
        },
        visit: (category, revision, questionId) => {
          if (
            get().lastVisited[category.index]?.questionId === questionId ||
            !revisionSchema.safeParse(revision).success ||
            !category.questions.some((question) => question.id === questionId)
          ) {
            return
          }
          set((state) => ({
            lastVisited: {
              ...state.lastVisited,
              [category.index]: { questionId, revision },
            },
          }))
        },
        reconcileCatalog: (categories) => {
          const versions = new Map(
            categories.map((category) => [category.id, category.revision]),
          )
          const current = get()
          const answers = Object.fromEntries(
            Object.entries(current.answers).filter(
              ([_id, answer]) =>
                versions.get(answer.categoryId) === answer.revision,
            ),
          )
          const lastVisited = Object.fromEntries(
            Object.entries(current.lastVisited).filter(
              ([id, visited]) => versions.get(Number(id)) === visited.revision,
            ),
          )
          if (
            Object.keys(answers).length !==
              Object.keys(current.answers).length ||
            Object.keys(lastVisited).length !==
              Object.keys(current.lastVisited).length
          ) {
            set({ answers, lastVisited, storageNotice: recoveredNotice })
          }
        },
        reconcileCategory: (category, summary) => {
          const current = get()
          const questions = new Map(
            category.questions.map((question) => [
              String(question.id),
              question,
            ]),
          )
          let changed = false
          const answers: Progress['answers'] = {}
          for (const [id, answer] of Object.entries(current.answers)) {
            if (answer.categoryId !== category.index) {
              answers[id] = answer
              continue
            }
            const question = questions.get(id)
            if (
              !question ||
              answer.optionIndex >= question.options.length ||
              answer.revision !== summary.revision
            ) {
              changed = true
            } else {
              const correct = answer.optionIndex === question.correct_answer
              answers[id] = { ...answer, correct }
              if (answer.correct !== correct) {
                changed = true
              }
            }
          }
          const lastVisited = Object.fromEntries(
            Object.entries(current.lastVisited).filter(([id, visited]) => {
              const keep =
                id !== String(category.index) ||
                questions.has(String(visited.questionId))
              if (!keep) {
                changed = true
              }
              return keep
            }),
          )
          if (changed) {
            set({ answers, lastVisited, storageNotice: recoveredNotice })
          }
        },
        resetCategory: (categoryId) => {
          set((state) => ({
            answers: Object.fromEntries(
              Object.entries(state.answers).filter(
                ([_id, answer]) => answer.categoryId !== categoryId,
              ),
            ),
            lastVisited: Object.fromEntries(
              Object.entries(state.lastVisited).filter(
                ([id]) => id !== String(categoryId),
              ),
            ),
          }))
        },
        resetAll: () => {
          set(emptyProgress())
        },
      }),
      {
        name: progressStorageKey,
        version: 1,
        storage: persistence.storage,
        partialize: ({ answers, lastVisited }) => ({ answers, lastVisited }),
        merge: (persisted, current) => ({
          ...current,
          ...progressSchema.parse(persisted),
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

export const progressStore = createProgressStore()

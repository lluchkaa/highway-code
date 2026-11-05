import { z } from 'zod'
import { persist, type PersistStorage } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { type Licence, licenceSchema } from '@/lib/licence-categories'

const learningStateSchema = z.object({
  licences: z.array(licenceSchema).transform((values) => [...new Set(values)]),
})
const savedLearningSchema = z.object({
  version: z.literal(1),
  state: learningStateSchema,
})
type LearningState = z.infer<typeof learningStateSchema>
type LearningStore = LearningState & {
  setLicences: (licences: Licence[]) => void
}

const storage: PersistStorage<LearningState> = {
  getItem: (key) => {
    const fallback = { version: 1, state: { licences: [] } }
    try {
      const raw = window.localStorage.getItem(key)
      const parsed = savedLearningSchema.safeParse(
        raw === null ? null : JSON.parse(raw),
      )
      return parsed.success ? parsed.data : fallback
    } catch {
      return fallback
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The selection still works for this session when storage is unavailable.
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Unavailable storage falls back to the general topics on reload.
    }
  },
}

export const learningStore = createStore<LearningStore>()(
  persist(
    (set) => ({
      licences: [],
      setLicences: (licences) => {
        set(learningStateSchema.parse({ licences }))
      },
    }),
    {
      name: 'highway-code:learning',
      version: 1,
      storage,
      partialize: ({ licences }) => ({ licences }),
      merge: (persisted, current) => ({
        ...current,
        ...learningStateSchema.parse(persisted),
      }),
    },
  ),
)

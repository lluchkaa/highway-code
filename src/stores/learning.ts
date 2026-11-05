import { z } from 'zod'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { type Licence, licenceSchema } from '@/lib/licence-categories'
import { createStorage } from '@/stores/persistence/storage'

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

const persistence = createStorage<LearningState>({
  storage: 'local',
  defaultValue: () => ({ version: 1, state: { licences: [] } }),
  schema: savedLearningSchema,
})

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
      storage: persistence.storage,
      partialize: ({ licences }) => ({ licences }),
      merge: (persisted, current) => ({
        ...current,
        ...learningStateSchema.parse(persisted),
      }),
    },
  ),
)

import { z } from 'zod'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { createStorage } from '@/stores/persistence/storage'

const themeSchema = z.enum(['system', 'light', 'dark'])
const themeStateSchema = z.object({ theme: themeSchema })
const savedThemeSchema = z.object({
  version: z.literal(1),
  state: themeStateSchema,
})
type ThemeState = z.infer<typeof themeStateSchema>
type ThemeStore = ThemeState & { setTheme: (value: unknown) => void }

const persistence = createStorage<ThemeState>({
  storage: 'local',
  defaultValue: () => ({ version: 1, state: { theme: 'system' } }),
  schema: savedThemeSchema,
})

export const themeStore = createStore<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (value) => {
        const parsed = themeSchema.safeParse(value)
        if (parsed.success) {
          set({ theme: parsed.data })
        }
      },
    }),
    {
      name: 'highway-code:theme',
      version: 1,
      storage: persistence.storage,
      partialize: ({ theme }) => ({ theme }),
      merge: (persisted, current) => ({
        ...current,
        ...themeStateSchema.parse(persisted),
      }),
    },
  ),
)

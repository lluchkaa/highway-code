import { z } from 'zod'
import { persist, type PersistStorage } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

const themeSchema = z.enum(['system', 'light', 'dark'])
const themeStateSchema = z.object({ theme: themeSchema })
const savedThemeSchema = z.object({
  version: z.literal(1),
  state: themeStateSchema,
})
type ThemeState = z.infer<typeof themeStateSchema>
type ThemeStore = ThemeState & { setTheme: (value: unknown) => void }

const storage: PersistStorage<ThemeState> = {
  getItem: (key) => {
    const fallback = { version: 1, state: { theme: 'system' as const } }
    try {
      const raw = window.localStorage.getItem(key)
      const parsed = savedThemeSchema.safeParse(
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
      // Theme changes still apply to the current session when storage is blocked.
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // A blocked store already falls back to the system preference on reload.
    }
  },
}

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
      storage,
      partialize: ({ theme }) => ({ theme }),
      merge: (persisted, current) => ({
        ...current,
        ...themeStateSchema.parse(persisted),
      }),
    },
  ),
)

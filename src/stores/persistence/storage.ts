import type { z } from 'zod'
import type { PersistStorage, StorageValue } from 'zustand/middleware'

export type StorageAdapter = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

type Options<State> = {
  storage: 'local' | 'session' | StorageAdapter | null
  defaultValue: () => StorageValue<State>
  schema: z.ZodType<StorageValue<State> & { recovered?: boolean }>
  notices?: { unavailable: string; recovered: string }
}

export function createStorage<State>({
  storage: target,
  defaultValue,
  schema,
  notices,
}: Options<State>) {
  let source: StorageAdapter | null
  try {
    source =
      typeof target === 'string'
        ? typeof window === 'undefined'
          ? null
          : window[target === 'local' ? 'localStorage' : 'sessionStorage']
        : target
  } catch {
    source = null
  }

  let notice = source ? null : (notices?.unavailable ?? null)
  const listeners = new Set<(notice: string | null) => void>()
  let pending = false

  function report(issue: 'unavailable' | 'recovered') {
    const next = notices?.[issue] ?? null
    if (notice === next) {
      return
    }
    notice = next
    if (listeners.size === 0) {
      return
    }
    // Hydration reads the notice synchronously; write failures notify after the
    // current Zustand update so subscribers cannot recursively persist a failure.
    if (!pending) {
      pending = true
      queueMicrotask(() => {
        pending = false
        for (const listener of listeners) {
          listener(notice)
        }
      })
    }
  }

  const storage: PersistStorage<State> = {
    getItem: (key) => {
      if (!source) {
        return defaultValue()
      }
      let raw: string | null
      try {
        raw = source.getItem(key)
      } catch {
        report('unavailable')
        return defaultValue()
      }
      if (raw === null) {
        return defaultValue()
      }
      try {
        const value: unknown = JSON.parse(raw)
        const parsed = schema.safeParse(value)
        if (!parsed.success) {
          report('recovered')
          return defaultValue()
        }
        if (parsed.data.recovered) {
          report('recovered')
        }
        const { state, version } = parsed.data
        return { state, ...(version === undefined ? {} : { version }) }
      } catch {
        report('recovered')
        return defaultValue()
      }
    },
    setItem: (key, value) => {
      try {
        source?.setItem(key, JSON.stringify(value))
      } catch {
        report('unavailable')
      }
    },
    removeItem: (key) => {
      try {
        source?.removeItem(key)
      } catch {
        report('unavailable')
      }
    },
  }

  return {
    storage,
    get notice() {
      return notice
    },
    subscribe(listener: (notice: string | null) => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

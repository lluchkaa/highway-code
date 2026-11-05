import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  createStorage,
  type StorageAdapter,
} from '@/stores/persistence/storage'
import { memoryStorage } from '@/test/storage'

const schema = z.object({
  version: z.literal(1),
  state: z.object({ count: z.number() }),
})
const notices = { unavailable: 'Unavailable', recovered: 'Recovered' }

function persistence(storage: StorageAdapter | null | 'local' | 'session') {
  return createStorage({
    storage,
    defaultValue: () => ({ version: 1, state: { count: 0 } }),
    schema,
    notices,
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('validated browser persistence', () => {
  it('keeps local and session lifetimes separate and preserves envelopes', () => {
    const localStorage = memoryStorage()
    const sessionStorage = memoryStorage()
    vi.stubGlobal('window', { localStorage, sessionStorage })
    const local = persistence('local')
    const session = persistence('session')
    local.storage.setItem('key', { version: 1, state: { count: 7 } })
    session.storage.setItem('key', { version: 1, state: { count: 2 } })
    expect(local.storage.getItem('key')).toEqual({
      version: 1,
      state: { count: 7 },
    })
    expect(session.storage.getItem('key')).toEqual({
      version: 1,
      state: { count: 2 },
    })
    local.storage.removeItem('key')
    expect(localStorage.getItem('key')).toBeNull()
    expect(sessionStorage.getItem('key')).not.toBeNull()
  })

  it('returns fresh defaults for missing values without reporting corruption', () => {
    const saved = persistence(memoryStorage())
    expect(saved.storage.getItem('key')).toEqual({
      version: 1,
      state: { count: 0 },
    })
    expect(saved.storage.getItem('key')).not.toBe(saved.storage.getItem('key'))
    expect(saved.notice).toBeNull()
  })

  it.each([
    '{broken',
    'null',
    '{"version":2,"state":{"count":7}}',
    '{"version":1,"state":{"count":"7"}}',
  ])('recovers from invalid envelopes: %s', (raw) => {
    const saved = persistence(memoryStorage({ key: raw }))
    expect(saved.storage.getItem('key')).toEqual({
      version: 1,
      state: { count: 0 },
    })
    expect(saved.notice).toBe(notices.recovered)
  })

  it('handles denied storage getters and non-browser environments', () => {
    vi.stubGlobal('window', undefined)
    expect(persistence('local').notice).toBe(notices.unavailable)
    vi.stubGlobal('window', {
      get sessionStorage() {
        throw new Error('Denied')
      },
    })
    const saved = persistence('session')
    expect(saved.notice).toBe(notices.unavailable)
    expect(() =>
      saved.storage.setItem('key', { state: { count: 1 } }),
    ).not.toThrow()
    expect(saved.storage.getItem('key')).toEqual({
      version: 1,
      state: { count: 0 },
    })
  })

  it.each(['getItem', 'setItem', 'removeItem'] as const)(
    'reports %s failures once after the current update',
    async (method) => {
      const source = memoryStorage()
      source[method] = () => {
        throw new Error('Denied')
      }
      const saved = persistence(source)
      const listener = vi.fn(() => {
        saved.storage.setItem('key', { state: { count: 1 }, version: 1 })
      })
      const unsubscribe = saved.subscribe(listener)
      if (method === 'getItem') {
        void saved.storage.getItem('key')
      } else if (method === 'setItem') {
        saved.storage.setItem('key', { state: { count: 1 }, version: 1 })
      } else {
        saved.storage.removeItem('key')
      }
      expect(listener).not.toHaveBeenCalled()
      expect(saved.notice).toBe(notices.unavailable)
      await Promise.resolve()
      await Promise.resolve()
      expect(listener).toHaveBeenCalledExactlyOnceWith(notices.unavailable)
      unsubscribe()
    },
  )
})

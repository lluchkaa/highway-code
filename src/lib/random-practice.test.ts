import { RouterContextProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Licence } from '@/lib/licence-categories'
import { routes } from '@/lib/routes'
import { memoryStorage } from '@/test/storage'

import manifestData from '../../public/assets/questions/asset-manifest.json'
import catalogData from '../../public/assets/questions/catalog.json'

const categoryFiles = import.meta.glob<unknown>(
  '../../public/assets/questions/*-category.json',
  { import: 'default' },
)

function loaderArgs(
  url = 'http://localhost/highway-code/practice',
  signal?: AbortSignal,
) {
  return {
    params: {},
    request: new Request(url, signal ? { signal } : {}),
    url: new URL(url),
    pattern: routes.practice,
    context: new RouterContextProvider(),
  }
}

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('BASE_URL', '/highway-code/')
  const storage = memoryStorage()
  vi.stubGlobal('window', { sessionStorage: storage, localStorage: storage })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const file = input.split('/').at(-1)
      const load = categoryFiles[`../../public/assets/questions/${file ?? ''}`]
      const data =
        file === 'catalog.json'
          ? catalogData
          : file === 'asset-manifest.json'
            ? manifestData
            : await load?.()
      return data === undefined
        ? new Response(null, { status: 404 })
        : Response.json(data)
    }),
  )
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('random practice routing', () => {
  it.each<{ licences: Licence[]; groups: string[] }>([
    { licences: [], groups: ['general'] },
    {
      licences: ['A1', 'A', 'BE', 'C'],
      groups: ['general', 'A', 'B', 'C', 'E'],
    },
    { licences: ['D1E', 'T'], groups: ['general', 'D', 'E', 'T'] },
  ])(
    'draws 20 unique questions only from the selected groups: $licences',
    async ({ licences, groups }) => {
      const { learningStore } = await import('@/stores/learning')
      const { randomPracticeStore } = await import('@/stores/random-practice')
      const { progressStore } = await import('@/stores/progress')
      const { startRandomPractice } = await import('@/app/practice/action')
      learningStore.getState().setLicences(licences)
      const result = await startRandomPractice(loaderArgs())
      expect(result.headers.get('Location')).toBe('/practice?question=1')
      const session = randomPracticeStore.getState().session
      expect(session?.items).toHaveLength(20)
      expect(new Set(session?.items.map((item) => item.question.id)).size).toBe(
        20,
      )
      expect(new Set(session?.items.map((item) => item.summary.group))).toEqual(
        new Set(groups),
      )
      expect(session?.items.every((item) => item.answer === null)).toBe(true)
      expect(progressStore.getState().answers).toEqual({})
      const categories = new Set(session?.items.map((item) => item.summary.id))
      const fetchMock = vi.mocked(fetch)
      const questionFetches = fetchMock.mock.calls.filter(
        ([url]) => typeof url === 'string' && url.endsWith('-category.json'),
      )
      expect(questionFetches).toHaveLength(categories.size)
      expect(
        fetchMock.mock.calls.filter(
          ([url]) =>
            typeof url === 'string' && url.endsWith('asset-manifest.json'),
        ).length,
      ).toBeLessThanOrEqual(1)
    },
  )

  it('redraws questions on restart and keeps the previous set if generation is cancelled', async () => {
    const { randomPracticeStore } = await import('@/stores/random-practice')
    const { startRandomPractice } = await import('@/app/practice/action')
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    await startRandomPractice(loaderArgs())
    const original = randomPracticeStore.getState().session
    random.mockReturnValue(0.9)
    await startRandomPractice(loaderArgs())
    const restarted = randomPracticeStore.getState().session
    expect(restarted?.items.map((item) => item.question.id)).not.toEqual(
      original?.items.map((item) => item.question.id),
    )
    expect(restarted?.id).not.toBe(original?.id)
    const controller = new AbortController()
    controller.abort()
    await expect(
      startRandomPractice(loaderArgs(undefined, controller.signal)),
    ).rejects.toThrow()
    expect(randomPracticeStore.getState().session).toBe(restarted)
  })

  it('resumes the saved position, remembers the result page, and validates question links', async () => {
    const { randomPracticeStore } = await import('@/stores/random-practice')
    const { startRandomPractice } = await import('@/app/practice/action')
    const { randomPracticeLoader } = await import('@/app/practice/loader')
    expect(await randomPracticeLoader(loaderArgs())).toBeNull()
    await startRandomPractice(loaderArgs())
    expect(
      await randomPracticeLoader(
        loaderArgs('http://localhost/practice?question=8'),
      ),
    ).toEqual({ position: 7 })
    expect(await randomPracticeLoader(loaderArgs())).toEqual({ position: 7 })
    expect(
      await randomPracticeLoader(
        loaderArgs('http://localhost/practice?question=21'),
      ),
    ).toEqual({ position: 20 })
    expect(randomPracticeStore.getState().session?.position).toBe(20)
    expect(await randomPracticeLoader(loaderArgs())).toEqual({ position: 20 })
    for (const value of ['0', '22', '-1', '1.5', '01', '']) {
      await expect(
        randomPracticeLoader(
          loaderArgs(`http://localhost/practice?question=${value}`),
        ),
      ).rejects.toMatchObject({ status: 404 })
    }
  })

  it('invalidates a session if its source content revision has changed', async () => {
    const { randomPracticeStore } = await import('@/stores/random-practice')
    const { startRandomPractice } = await import('@/app/practice/action')
    const { randomPracticeLoader } = await import('@/app/practice/loader')
    await startRandomPractice(loaderArgs())
    const session = randomPracticeStore.getState().session
    if (!session) {
      throw new Error('Missing test session')
    }
    randomPracticeStore.setState({
      session: {
        ...session,
        items: session.items.map((item, index) =>
          index === 0
            ? {
                ...item,
                summary: { ...item.summary, revision: '0000000000000000' },
              }
            : item,
        ),
      },
    })
    expect(await randomPracticeLoader(loaderArgs())).toBeNull()
    expect(randomPracticeStore.getState().session).toBeNull()
  })
})

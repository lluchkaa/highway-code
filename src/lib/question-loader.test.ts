import { RouterContextProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { catalogSchema, categorySchema } from '@/lib/quiz-schema'
import { nextQuestionPath, questionPath, routes } from '@/lib/routes'

import categoryData from '../../public/assets/questions/0-category.json'
import lastCategoryData from '../../public/assets/questions/70-category.json'
import catalogData from '../../public/assets/questions/catalog.json'

const manifest = {
  complete: true,
  assets: categoryData.questions.flatMap((question, index) =>
    question.image_url
      ? [
          {
            category: 0,
            questionId: question.id,
            questionNumber: index + 1,
            originalUrl: question.image_url,
            file: `images/0-category/${String(index + 1)}_1.jpg`,
          },
        ]
      : [],
  ),
}

function mockFiles(overrides: Record<string, unknown> = {}) {
  const files: Record<string, unknown> = {
    'catalog.json': catalogData,
    '0-category.json': categoryData,
    'asset-manifest.json': manifest,
    ...overrides,
  }
  const fetchMock = vi.fn((input: string) => {
    const file = input.split('/').at(-1) ?? ''
    return Promise.resolve(
      file in files
        ? Response.json(files[file])
        : new Response(null, { status: 404 }),
    )
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function loaderArgs(categoryId = '0', questionId = '1') {
  return {
    params: { categoryId, questionId },
    request: new Request('http://localhost/highway-code/'),
    url: new URL('http://localhost/highway-code/'),
    pattern: routes.question,
    context: new RouterContextProvider(),
  }
}

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('BASE_URL', '/highway-code/')
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('route data loading', () => {
  it('loads only category metadata for the homepage and caches it', async () => {
    const fetchMock = mockFiles()
    const { loadCatalog } = await import('@/lib/catalog')
    const categories = await loadCatalog()
    expect(categories).toHaveLength(71)
    expect(categories[0]).not.toHaveProperty('questions')
    await loadCatalog()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/highway-code/assets/questions/catalog.json',
    )
  })

  it('preloads a question, maps its local image, and preserves source answer order', async () => {
    const fetchMock = mockFiles()
    const { questionLoader } =
      await import('@/app/categories/[categoryId]/questions/[questionId]/loader')
    const data = await questionLoader(loaderArgs())
    expect(data.question.options).toEqual(categoryData.questions[0]?.options)
    expect(data.question.image_url).toBe('images/0-category/1_1.jpg')
    expect(data.question).not.toHaveProperty('status')
    expect(data.position).toBe(0)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    await questionLoader(loaderArgs('0', '2'))
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it.each([
    ['999', '1'],
    ['0', '99999'],
    ['-1', '1'],
    ['0', '1.5'],
    ['00', '1'],
  ])(
    'rejects invalid route parameters %s / %s',
    async (categoryId, questionId) => {
      mockFiles()
      const { questionLoader } =
        await import('@/app/categories/[categoryId]/questions/[questionId]/loader')
      await expect(
        questionLoader(loaderArgs(categoryId, questionId)),
      ).rejects.toMatchObject({ status: 404 })
    },
  )

  it('rejects malformed question JSON through the category schema', async () => {
    mockFiles({
      '0-category.json': {
        ...categoryData,
        questions: [{ ...categoryData.questions[0], correct_answer: 99 }],
      },
    })
    const { questionLoader } =
      await import('@/app/categories/[categoryId]/questions/[questionId]/loader')
    await expect(questionLoader(loaderArgs())).rejects.toThrow()
  })

  it('rejects valid-looking question data with a stale catalog revision', async () => {
    mockFiles({
      '0-category.json': {
        ...categoryData,
        questions: categoryData.questions.map((question) =>
          question.id === 1
            ? { ...question, question_text: 'Changed question' }
            : question,
        ),
      },
    })
    const { questionLoader } =
      await import('@/app/categories/[categoryId]/questions/[questionId]/loader')
    await expect(questionLoader(loaderArgs())).rejects.toThrow('does not match')
  })

  it('allows retrying after a failed catalog request', async () => {
    const fetchMock = mockFiles()
    fetchMock.mockRejectedValueOnce(new Error('Offline'))
    const { loadCatalog } = await import('@/lib/catalog')
    await expect(loadCatalog()).rejects.toThrow('Offline')
    expect(await loadCatalog()).toHaveLength(71)
  })

  it('fails clearly when an image mapping is missing', async () => {
    mockFiles({ 'asset-manifest.json': { complete: true, assets: [] } })
    const { questionLoader } =
      await import('@/app/categories/[categoryId]/questions/[questionId]/loader')
    await expect(questionLoader(loaderArgs())).rejects.toThrow(
      'Missing local image',
    )
  })
})

describe('question navigation', () => {
  const categories = catalogSchema.parse(catalogData).categories
  const category = categorySchema.parse(categoryData)

  it('uses global question IDs in links and source order when advancing', () => {
    expect(questionPath(1, 608)).toBe('/categories/1/questions/608')
    expect(nextQuestionPath(categories, category, 0)).toBe(
      '/categories/0/questions/2',
    )
  })

  it('advances from the last numbered question to the next category', () => {
    expect(
      nextQuestionPath(categories, category, category.questions.length - 1),
    ).toBe('/categories/1/questions/608')
  })

  it('returns to the category list after the final category', () => {
    const last = categorySchema.parse(lastCategoryData)
    expect(nextQuestionPath(categories, last, last.questions.length - 1)).toBe(
      routes.home,
    )
  })
})

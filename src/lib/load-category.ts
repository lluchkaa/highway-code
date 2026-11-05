import {
  assetManifestSchema,
  type Category,
  categorySchema,
  type CategorySummary,
  localCategorySchema,
} from '@/lib/quiz-schema'
import { progressStore } from '@/stores/progress'

const cache = new Map<number, { revision: string; category: Category }>()
let imagePaths: Map<string, string> | undefined

async function loadImagePaths(signal: AbortSignal) {
  if (imagePaths) {
    return imagePaths
  }
  const response = await fetch(
    `${import.meta.env.BASE_URL}assets/questions/asset-manifest.json`,
    { signal },
  )
  if (!response.ok) {
    throw new Error(`Unable to load image paths: ${String(response.status)}`)
  }
  const value: unknown = await response.json()
  const manifest = assetManifestSchema.parse(value)
  imagePaths = new Map(
    manifest.assets.map((asset) => [
      `${String(asset.category)}:${String(asset.questionId)}`,
      asset.file,
    ]),
  )
  return imagePaths
}

export async function loadCategory(
  summary: CategorySummary,
  signal: AbortSignal,
) {
  const cached = cache.get(summary.id)
  if (cached?.revision === summary.revision) {
    return cached.category
  }
  const response = await fetch(
    `${import.meta.env.BASE_URL}assets/questions/${String(summary.id)}-category.json`,
    { signal },
  )
  if (!response.ok) {
    throw new Error(`Unable to load category: ${String(response.status)}`)
  }
  const value: unknown = await response.json()
  const category = categorySchema.parse(value)
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(category)),
  )
  const revision = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  )
    .join('')
    .slice(0, 16)
  if (
    revision !== summary.revision ||
    category.index !== summary.id ||
    category.category !== summary.title ||
    category.questions.length !== summary.questionCount ||
    category.questions[0]?.id !== summary.firstQuestionId
  ) {
    throw new Error('Category data does not match the catalog')
  }
  const paths = category.questions.some((question) => question.image_url)
    ? await loadImagePaths(signal)
    : new Map<string, string>()
  const resolved = localCategorySchema(paths).parse(category)
  progressStore.getState().reconcileCategory(resolved, summary)
  cache.set(summary.id, { category: resolved, revision: summary.revision })
  return resolved
}

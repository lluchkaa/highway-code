import { createHash } from 'node:crypto'
import { access, readdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { format, resolveConfig } from 'prettier'

import {
  assetManifestSchema,
  catalogSchema,
  type CategoryGroup,
  categorySchema,
} from '../src/lib/quiz-schema.ts'

const root = new URL('../', import.meta.url)
const directory = new URL('public/assets/questions/', root)
const output = new URL('catalog.json', directory)

function getGroup(index: number): CategoryGroup {
  if (index < 47) {
    return 'general'
  }
  const groups: CategoryGroup[] = ['A', 'B', 'C', 'D', 'E', 'T']
  const group = groups[Math.floor((index - 47) / 4)]
  if (!group) {
    throw new Error(`No license group is defined for category ${String(index)}`)
  }
  return group
}

const manifest = assetManifestSchema.parse(
  JSON.parse(await readFile(new URL('asset-manifest.json', directory), 'utf8')),
)
const assets = new Map(
  manifest.assets.map((asset) => [
    `${String(asset.category)}:${String(asset.questionId)}`,
    asset,
  ]),
)
if (assets.size !== manifest.assets.length) {
  throw new Error('The asset manifest contains duplicate question mappings')
}
const usedAssets = new Set<string>()
const questionIds = new Set<number>()
const files = (await readdir(directory))
  .filter((file) => /^\d+-category\.json$/.test(file))
  .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

const categories = await Promise.all(
  files.map(async (file, index) => {
    const category = categorySchema.parse(
      JSON.parse(await readFile(new URL(file, directory), 'utf8')),
    )
    if (category.index !== index || file !== `${String(index)}-category.json`) {
      throw new Error(
        `Category indexes must be contiguous and match filenames: ${file}`,
      )
    }
    await Promise.all(
      category.questions.map(async (question, position) => {
        if (questionIds.has(question.id)) {
          throw new Error(
            `Duplicate global question ID: ${String(question.id)}`,
          )
        }
        questionIds.add(question.id)
        const key = `${String(index)}:${String(question.id)}`
        const asset = assets.get(key)
        if (question.image_url) {
          if (
            !asset ||
            asset.originalUrl !== question.image_url ||
            asset.questionNumber !== position + 1
          ) {
            throw new Error(`Missing or inconsistent image mapping: ${key}`)
          }
          await access(new URL(asset.file, directory))
          usedAssets.add(key)
        } else if (asset) {
          throw new Error(`Unexpected image mapping: ${key}`)
        }
      }),
    )
    return {
      id: category.index,
      title: category.category,
      group: getGroup(category.index),
      questionCount: category.questions.length,
      firstQuestionId: category.questions[0]?.id,
      revision: createHash('sha256')
        .update(JSON.stringify(category))
        .digest('hex')
        .slice(0, 16),
    }
  }),
)
if (usedAssets.size !== assets.size) {
  throw new Error('The asset manifest contains unused images')
}
const catalog = catalogSchema.parse({ version: 1, categories })
const content = await format(JSON.stringify(catalog), {
  ...(await resolveConfig(fileURLToPath(output))),
  filepath: fileURLToPath(output),
})
if (process.argv.includes('--check')) {
  if ((await readFile(output, 'utf8')) !== content) {
    throw new Error('The category catalog is stale. Run pnpm catalog:generate.')
  }
} else {
  await writeFile(output, content)
}
console.info(
  `Validated ${String(categories.length)} categories, ${String(questionIds.size)} questions, and ${String(usedAssets.size)} images.`,
)

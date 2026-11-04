import { z } from 'zod'

const textSchema = z.string().trim().min(1)
const idSchema = z.number().int().positive()
const titleSchema = textSchema.transform((title) =>
  title.replace(/^\d+(?:\.\d+)?\.?\s+/, ''),
)

const questionSchema = z
  .object({
    id: idSchema,
    question_text: textSchema,
    options: z.array(textSchema).min(2).max(5),
    image_url: textSchema.nullable(),
    explanation: textSchema.nullable(),
    correct_answer: z.number().int().nonnegative(),
  })
  .refine((question) => question.correct_answer < question.options.length, {
    message: 'The correct answer must refer to an existing option',
    path: ['correct_answer'],
  })
  .refine(
    (question) => new Set(question.options).size === question.options.length,
    {
      message: 'Answer options must be distinct',
      path: ['options'],
    },
  )

export const categorySchema = z
  .object({
    index: z.number().int().nonnegative(),
    category: titleSchema,
    total: idSchema,
    available: idSchema,
    answerable_count: idSchema,
    questions: z.array(questionSchema).min(1),
  })
  .refine(
    (category) =>
      category.total === category.questions.length &&
      category.available === category.total &&
      category.answerable_count === category.total,
    { message: 'Category counts must match the available questions' },
  )
  .refine(
    (category) =>
      new Set(category.questions.map((question) => question.id)).size ===
      category.questions.length,
    { message: 'Question IDs must be unique within a category' },
  )

const groupSchema = z.enum(['general', 'A', 'B', 'C', 'D', 'E', 'T'])

export const catalogSchema = z
  .object({
    version: z.literal(1),
    categories: z
      .array(
        z.object({
          id: z.number().int().nonnegative(),
          title: titleSchema,
          group: groupSchema,
          questionCount: idSchema,
          firstQuestionId: idSchema,
          revision: z.string().regex(/^[a-f0-9]{16}$/),
        }),
      )
      .min(1),
  })
  .refine(
    (catalog) =>
      new Set(catalog.categories.map((category) => category.id)).size ===
      catalog.categories.length,
    { message: 'Category IDs must be unique' },
  )

export const assetManifestSchema = z.object({
  complete: z.literal(true),
  assets: z.array(
    z.object({
      category: z.number().int().nonnegative(),
      questionId: idSchema,
      questionNumber: idSchema,
      originalUrl: textSchema,
      file: z.string().regex(/^images\/[\w-]+\/[\w.-]+$/),
    }),
  ),
})

export function localCategorySchema(imagePaths: Map<string, string>) {
  return categorySchema.transform((category, context) => ({
    ...category,
    questions: category.questions.map((question, index) => {
      const image = imagePaths.get(
        `${String(category.index)}:${String(question.id)}`,
      )
      if (question.image_url && !image) {
        context.addIssue({
          code: 'custom',
          message: `Missing local image for question ${String(question.id)}`,
          path: ['questions', index, 'image_url'],
        })
      }
      return {
        ...question,
        image_url: question.image_url ? (image ?? null) : null,
      }
    }),
  }))
}

export type Question = z.infer<typeof questionSchema>
export type Category = z.infer<typeof categorySchema>
export type CategorySummary = z.infer<
  typeof catalogSchema
>['categories'][number]
export type CategoryGroup = z.infer<typeof groupSchema>

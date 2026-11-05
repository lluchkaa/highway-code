import { ArrowLeft } from 'lucide-react'
import type * as React from 'react'
import { Link, useLoaderData } from 'react-router'

import { TopicHeader } from '@/app/categories/[categoryId]/questions/[questionId]/components/topic-header'
import { TopicQuestion } from '@/app/categories/[categoryId]/questions/[questionId]/components/topic-question'
import type { questionLoader } from '@/app/categories/[categoryId]/questions/[questionId]/loader'
import { PageHead } from '@/components/page-head'
import { QuestionNavigation } from '@/components/question-navigation'
import { questionPath, routes } from '@/lib/routes'
import { useProgress } from '@/stores/progress'

export const QuestionPage: React.FC = () => {
  const { category, summary, position, question } =
    useLoaderData<typeof questionLoader>()
  const answers = useProgress((state) => state.answers)
  const title = summary.title
  return (
    <main className="mx-auto max-w-6xl px-4 pt-7 sm:px-6 sm:pt-9">
      <PageHead
        title={`Питання ${String(position + 1)} — ${title}`}
        description={question.question_text}
      />
      <Link
        to={routes.home}
        className="mb-6 inline-flex items-center gap-2 rounded-md text-xs text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Усі теми
      </Link>
      <TopicHeader summary={summary} />
      <QuestionNavigation
        key={category.index}
        items={category.questions.map((item) => ({
          to: questionPath(category.index, item.id),
          correct: answers[item.id]?.correct,
        }))}
        position={position}
      />
      <TopicQuestion
        key={question.id}
        category={category}
        summary={summary}
        question={question}
        position={position}
      />
      <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
        Можна переходити між питаннями в будь-якому порядку. Відповіді
        зберігаються автоматично.
      </p>
    </main>
  )
}

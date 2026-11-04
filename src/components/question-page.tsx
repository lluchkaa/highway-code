import { ArrowLeft, Check, X } from 'lucide-react'
import { Link } from 'react-router'

import { PageHead } from '@/components/page-head'
import { QuestionNavigation } from '@/components/question-navigation'
import { QuestionView } from '@/components/question-view'
import { ResetProgressDialog } from '@/components/reset-progress-dialog'
import { Progress } from '@/components/uikit/progress'
import { useProgress } from '@/hooks/use-progress'
import { useQuestion } from '@/hooks/use-question'
import { routes } from '@/lib/routes'

export function QuestionPage() {
  const { category, summary, position, question } = useQuestion()
  const { getStats, resetCategory, lastVisited } = useProgress()
  const { answered, correct, incorrect } = getStats(summary)
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
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
            Тема {String(summary.id + 1).padStart(2, '0')}
          </p>
          <h2 className="max-w-3xl text-lg leading-snug font-semibold tracking-tight sm:text-xl">
            {title}
          </h2>
        </div>
        <ResetProgressDialog
          scope="category"
          disabled={answered === 0 && !lastVisited[summary.id]}
          onReset={() => {
            resetCategory(summary.id)
          }}
        />
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex min-w-48 flex-1 items-center gap-3">
          <Progress
            value={answered}
            max={summary.questionCount}
            aria-label={`Пройдено ${String(answered)} із ${String(summary.questionCount)} питань`}
            className="max-w-48 flex-1 [&_[data-slot=progress-track]]:h-1.5"
          />
          <span className="text-[11px] whitespace-nowrap text-muted-foreground">
            <span className="font-medium text-foreground">{answered}</span> із{' '}
            {summary.questionCount} пройдено
          </span>
        </div>
        <div className="flex gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-success">
            <Check className="size-3.5" aria-hidden="true" />
            {correct} правильно
          </span>
          <span className="flex items-center gap-1 text-destructive">
            <X className="size-3.5" aria-hidden="true" />
            {incorrect} з помилкою
          </span>
        </div>
      </div>
      <QuestionNavigation
        key={category.index}
        category={category}
        position={position}
      />
      <QuestionView
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

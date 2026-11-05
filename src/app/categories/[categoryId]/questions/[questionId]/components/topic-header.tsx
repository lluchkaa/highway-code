import { Check, X } from 'lucide-react'
import type * as React from 'react'

import { ResetProgressDialog } from '@/components/reset-progress-dialog'
import { Progress } from '@/components/uikit'
import type { CategorySummary } from '@/lib/quiz-schema'
import { useCategoryProgress, useProgress } from '@/stores/progress'

type Props = { summary: CategorySummary }

export const TopicHeader: React.FC<Props> = ({ summary }) => {
  const { answered, correct, incorrect, resume } = useCategoryProgress(
    summary.id,
  )
  const resetCategory = useProgress((state) => state.resetCategory)
  const title = summary.title
  return (
    <>
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
          disabled={answered === 0 && !resume}
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
    </>
  )
}

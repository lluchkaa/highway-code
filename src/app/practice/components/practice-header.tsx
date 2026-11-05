import { Check, X } from 'lucide-react'
import type * as React from 'react'

import { RandomPracticeActions } from '@/components/random-practice-actions'
import { Progress } from '@/components/uikit'
import type { Licence } from '@/lib/licence-categories'

type Props = { licences: Licence[]; answered: number; correct: number }

export const PracticeHeader: React.FC<Props> = ({
  licences,
  answered,
  correct,
}) => {
  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
            Практика у своєму темпі
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Випадкові 20 питань
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {licences.length > 0
              ? `Категорії: ${licences.join(', ')}`
              : 'Основні теми'}{' '}
            · Збережено в цій вкладці
          </p>
        </div>
        <RandomPracticeActions showContinue={false} />
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Progress
          value={answered}
          max={20}
          aria-label={`Відповідей: ${String(answered)} із 20`}
          className="w-40 [&_[data-slot=progress-track]]:h-1.5"
        />
        <span className="text-xs text-muted-foreground">
          {answered} із 20 пройдено
        </span>
        <span className="flex items-center gap-1 text-xs text-success">
          <Check className="size-3.5" aria-hidden="true" />
          {correct} правильно
        </span>
        <span className="flex items-center gap-1 text-xs text-destructive">
          <X className="size-3.5" aria-hidden="true" />
          {answered - correct} з помилкою
        </span>
      </div>
    </>
  )
}

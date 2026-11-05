import { cn } from 'cn'
import { Check, X } from 'lucide-react'
import type * as React from 'react'

import { Button } from '@/components/uikit'

type Props = {
  option: string
  index: number
  correct: boolean
  incorrect: boolean
  answered: boolean
  onAnswer: () => void
}

export const AnswerOption: React.FC<Props> = ({
  option,
  index,
  correct,
  incorrect,
  answered,
  onAnswer,
}) => {
  return (
    <li>
      <Button
        variant="outline"
        type="button"
        disabled={answered}
        onClick={onAnswer}
        className={cn(
          'flex h-auto min-h-14 w-full items-start justify-start gap-3 rounded-xl border p-4 text-left text-sm leading-relaxed whitespace-normal transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-100',
          correct
            ? 'border-success/45 bg-success/7'
            : incorrect
              ? 'border-destructive/40 bg-destructive/6'
              : answered
                ? 'border-border/70 bg-muted/30 text-muted-foreground'
                : 'border-border bg-card hover:border-primary/50 hover:bg-primary/4',
        )}
      >
        <span
          className={cn(
            'mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border text-[11px] font-semibold tabular-nums',
            correct
              ? 'border-success bg-success text-card'
              : incorrect
                ? 'border-destructive bg-destructive text-card'
                : 'border-border bg-muted/60 text-muted-foreground',
          )}
        >
          {correct ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : incorrect ? (
            <X className="size-3.5" aria-hidden="true" />
          ) : (
            index + 1
          )}
        </span>
        <span className="min-w-0">
          {option}
          {correct && <span className="sr-only"> — правильна відповідь</span>}
          {incorrect && (
            <span className="sr-only"> — твоя відповідь, неправильна</span>
          )}
        </span>
      </Button>
    </li>
  )
}

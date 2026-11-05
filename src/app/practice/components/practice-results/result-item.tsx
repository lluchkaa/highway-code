import { Check, Circle, X } from 'lucide-react'
import type * as React from 'react'
import { Link } from 'react-router'

import { practicePath } from '@/lib/routes'
import type { PracticeSession } from '@/stores/random-practice'

type Props = { entry: PracticeSession['items'][number]; index: number }

export const ResultItem: React.FC<Props> = ({ entry, index }) => {
  return (
    <li>
      <Link
        to={practicePath(index)}
        className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm transition-colors hover:border-primary/40"
      >
        <span className="mt-0.5 shrink-0">
          {entry.answer === null ? (
            <Circle
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          ) : entry.answer.correct ? (
            <Check className="size-4 text-success" aria-hidden="true" />
          ) : (
            <X className="size-4 text-destructive" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0">
          <span className="mb-1 block text-xs text-muted-foreground">
            Питання {index + 1} ·{' '}
            {entry.answer === null
              ? 'Без відповіді'
              : entry.answer.correct
                ? 'Правильно'
                : 'З помилкою'}
          </span>
          <span className="line-clamp-2">{entry.question.question_text}</span>
        </span>
      </Link>
    </li>
  )
}

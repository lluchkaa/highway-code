import { cn } from 'cn'
import { Check, CornerDownLeft, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'

import { Button } from '@/components/uikit/button'
import { Input } from '@/components/uikit/input'
import { useProgress } from '@/hooks/use-progress'
import type { Category } from '@/lib/quiz-schema'
import { questionPath } from '@/lib/routes'

export function QuestionNavigation({
  category,
  position,
}: {
  category: Category
  position: number
}) {
  const { answers } = useProgress()
  const activeRef = useRef<HTMLAnchorElement>(null)
  const [jump, setJump] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [position])
  return (
    <nav
      aria-label="Перехід між питаннями"
      className="sticky top-0 z-20 -mx-4 mb-7 border-y border-border/80 bg-background/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Питання{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {position + 1}
          </span>{' '}
          із {category.questions.length}
        </p>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const number = z.coerce
              .number()
              .int()
              .min(1)
              .max(category.questions.length)
              .safeParse(jump)
            const question = number.success
              ? category.questions[number.data - 1]
              : undefined
            if (question) {
              void navigate(questionPath(category.index, question.id))
              setJump('')
            }
          }}
        >
          <label
            htmlFor="jump-to-question"
            className="text-[11px] text-muted-foreground"
          >
            До питання
          </label>
          <Input
            id="jump-to-question"
            type="number"
            inputMode="numeric"
            min={1}
            max={category.questions.length}
            step={1}
            required
            value={jump}
            onChange={(event) => {
              setJump(event.target.value)
            }}
            className="h-8 w-16 bg-card text-center text-xs"
          />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            aria-label="Перейти до питання"
          >
            <CornerDownLeft className="size-3.5" aria-hidden="true" />
          </Button>
        </form>
      </div>
      <ol className="flex [scrollbar-width:thin] gap-2 overflow-x-auto px-0.5 pt-1 pb-2">
        {category.questions.map((question, index) => {
          const saved = answers[question.id]
          const current = index === position
          const status = saved
            ? saved.correct
              ? 'правильно'
              : 'з помилкою'
            : 'без відповіді'
          return (
            <li key={question.id} className="shrink-0">
              <Link
                ref={current ? activeRef : undefined}
                to={questionPath(category.index, question.id)}
                aria-label={`Питання ${String(index + 1)}: ${status}`}
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'relative grid size-10 place-items-center rounded-lg border text-xs font-medium tabular-nums transition-colors',
                  current
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : saved
                      ? saved.correct
                        ? 'border-success/25 bg-success/8 text-success hover:bg-success/15'
                        : 'border-destructive/25 bg-destructive/8 text-destructive hover:bg-destructive/15'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {index + 1}
                {saved && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 grid size-3.5 place-items-center rounded-full border border-background',
                      saved.correct
                        ? 'bg-success text-card'
                        : 'bg-destructive text-card',
                    )}
                  >
                    {saved.correct ? (
                      <Check className="size-2.5" aria-hidden="true" />
                    ) : (
                      <X className="size-2.5" aria-hidden="true" />
                    )}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

import { cn } from 'cn'
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { AnswerExplanation } from '@/components/answer-explanation'
import { QuestionImage } from '@/components/question-image'
import { Button, buttonVariants } from '@/components/uikit/button'
import { useCatalog } from '@/hooks/use-catalog'
import { useProgress } from '@/hooks/use-progress'
import type { Category, CategorySummary, Question } from '@/lib/quiz-schema'
import { nextQuestionPath, questionPath, routes } from '@/lib/routes'

export function QuestionView({
  category,
  summary,
  question,
  position,
}: {
  category: Category
  summary: CategorySummary
  question: Question
  position: number
}) {
  const categories = useCatalog()
  const { answers, answer } = useProgress()
  const [retrying, setRetrying] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const saved = retrying ? undefined : answers[question.id]
  const last = position === category.questions.length - 1
  const lastCategory = summary.id === categories.at(-1)?.id
  const previous = category.questions[position - 1]

  useEffect(() => {
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_3px_16px_-12px_rgba(0,0,0,0.15)] sm:p-8">
      <div
        className={cn(
          'grid gap-7',
          question.image_url
            ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10'
            : 'mx-auto max-w-3xl',
        )}
      >
        <div>
          <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
            Питання {position + 1}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-xl leading-snug font-semibold tracking-tight outline-none sm:text-2xl"
          >
            {question.question_text}
          </h1>
          {question.image_url && (
            <QuestionImage path={question.image_url} number={position + 1} />
          )}
        </div>
        <div>
          <p className="mb-3 text-xs text-muted-foreground">
            {saved
              ? 'Твоя відповідь збережена'
              : retrying
                ? 'Спробуй ще раз. Обери одну відповідь.'
                : 'Обери одну відповідь'}
          </p>
          <ol aria-label="Варіанти відповіді" className="space-y-3">
            {question.options.map((option, index) => {
              const correct = saved && index === question.correct_answer
              const incorrect =
                saved && index === saved.optionIndex && !saved.correct
              return (
                <li key={index}>
                  <button
                    type="button"
                    disabled={Boolean(saved)}
                    onClick={() => {
                      answer(category, summary.revision, question.id, index)
                      setRetrying(false)
                    }}
                    className={cn(
                      'flex min-h-14 w-full items-start gap-3 rounded-xl border p-4 text-left text-sm leading-relaxed transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default',
                      correct
                        ? 'border-success/45 bg-success/7'
                        : incorrect
                          ? 'border-destructive/40 bg-destructive/6'
                          : saved
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
                      {correct && (
                        <span className="sr-only"> — правильна відповідь</span>
                      )}
                      {incorrect && (
                        <span className="sr-only">
                          {' '}
                          — твоя відповідь, неправильна
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          {saved && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 h-9 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-primary"
              onClick={() => {
                setRetrying(true)
              }}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Спробувати ще раз
            </Button>
          )}
        </div>
      </div>
      {saved && (
        <AnswerExplanation question={question} correct={saved.correct} />
      )}
      <nav
        aria-label="Навігація питання"
        className="pointer-events-none sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mt-7 flex flex-wrap items-center justify-between gap-3"
      >
        <Link
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'pointer-events-auto h-11 rounded-xl bg-card px-3 shadow-lg shadow-black/15 sm:px-4 dark:bg-card dark:shadow-black/35',
          )}
          to={previous ? questionPath(summary.id, previous.id) : routes.home}
        >
          <ArrowLeft aria-hidden="true" />
          <span className="max-[360px]:sr-only">
            {previous ? 'Назад' : 'До тем'}
          </span>
        </Link>
        <Link
          className={cn(
            buttonVariants(),
            'pointer-events-auto h-11 rounded-xl px-3 shadow-lg shadow-black/15 sm:px-5 dark:shadow-black/35',
          )}
          to={nextQuestionPath(categories, category, position)}
        >
          {last
            ? lastCategory
              ? 'До списку тем'
              : 'Наступна категорія'
            : saved
              ? 'Далі'
              : 'Пропустити'}
          <ArrowRight aria-hidden="true" />
        </Link>
      </nav>
    </section>
  )
}

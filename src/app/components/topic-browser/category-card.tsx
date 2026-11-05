import { ArrowRight, BookOpen, CheckCheck, Play } from 'lucide-react'
import type * as React from 'react'
import { Link } from 'react-router'

import { Badge, buttonVariants, Progress } from '@/components/uikit'
import type { CategorySummary } from '@/lib/quiz-schema'
import { questionPath } from '@/lib/routes'
import { useCategoryProgress } from '@/stores/progress'

type Props = { category: CategorySummary }

export const CategoryCard: React.FC<Props> = ({ category }) => {
  const { answered, correct, resume } = useCategoryProgress(category.id)
  const complete = answered === category.questionCount
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
      <Link
        to={questionPath(category.id, category.firstQuestionId)}
        className="flex flex-1 flex-col rounded-t-2xl p-5 pb-0"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-secondary/70 text-primary">
            {complete ? (
              <CheckCheck className="size-5" aria-hidden="true" />
            ) : (
              <BookOpen className="size-5" aria-hidden="true" />
            )}
          </span>
          <Badge
            variant="outline"
            className="h-6 border-border/70 px-2 text-[11px] font-normal text-muted-foreground"
          >
            Питань: {category.questionCount}
          </Badge>
        </div>
        <span className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Тема {String(category.id + 1).padStart(2, '0')}
        </span>
        <h4 className="min-h-14 text-base leading-snug font-semibold tracking-tight transition-colors group-hover:text-primary">
          {category.title}
        </h4>
        <div className="mt-5 mb-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            {answered
              ? `${String(answered)} із ${String(category.questionCount)} пройдено`
              : 'Ще не розпочато'}
          </span>
          {answered > 0 && (
            <span className="text-success">{correct} правильно</span>
          )}
        </div>
        <Progress
          value={answered}
          max={category.questionCount}
          aria-label={`Прогрес теми: ${String(answered)} із ${String(category.questionCount)}`}
          className="[&_[data-slot=progress-track]]:h-1"
        />
      </Link>
      <div className="mt-4 flex min-h-14 items-center justify-between gap-2 px-5 pb-4">
        <Link
          to={questionPath(category.id, category.firstQuestionId)}
          className={buttonVariants({
            variant: 'link',
            size: 'sm',
            className: 'h-9 px-0 text-xs',
          })}
        >
          {answered ? 'З першого питання' : 'Почати тему'}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        {resume && (
          <Link
            aria-label={`Продовжити: ${category.title}`}
            to={questionPath(category.id, resume.questionId)}
            className={buttonVariants({
              variant: 'secondary',
              size: 'sm',
              className: 'h-9 px-2.5 text-xs',
            })}
          >
            <Play className="size-3" aria-hidden="true" />
            Продовжити
          </Link>
        )}
      </div>
    </article>
  )
}

import { Check, Circle, HardDrive, X } from 'lucide-react'

import { ResetProgressDialog } from '@/components/reset-progress-dialog'
import { useProgress } from '@/hooks/use-progress'
import type { CategorySummary } from '@/lib/quiz-schema'

export function ProgressOverview({
  categories,
}: {
  categories: CategorySummary[]
}) {
  const { answers, lastVisited, resetAll } = useProgress()
  const categoryIds = new Set(categories.map((category) => category.id))
  const total = categories.reduce(
    (count, category) => count + category.questionCount,
    0,
  )
  const saved = Object.values(answers).filter((answer) =>
    categoryIds.has(answer.categoryId),
  )
  const correct = saved.filter((answer) => answer.correct).length
  const percentage = Math.round((saved.length / total) * 100)
  const circumference = 2 * Math.PI * 45
  return (
    <aside
      className="relative overflow-hidden rounded-3xl border border-primary/15 bg-secondary/50 p-6 sm:p-7"
      aria-label="Прогрес обраних тем"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Прогрес обраних тем</h2>
        <span className="rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-medium text-primary">
          У своєму темпі
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div
          className="relative size-28 shrink-0"
          role="img"
          aria-label={`Відповіді на ${String(percentage)}% питань`}
        >
          <svg
            viewBox="0 0 104 104"
            className="size-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="52"
              cy="52"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              className="text-primary/10"
            />
            <circle
              cx="52"
              cy="52"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={
                circumference * (1 - Math.min(saved.length / total, 1))
              }
              className="text-primary transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {percentage}%
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              пройдено
            </span>
          </div>
        </div>
        <div className="space-y-2.5 text-xs">
          <p className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-success/10 text-success">
              <Check className="size-3" aria-hidden="true" />
            </span>
            <span className="font-semibold tabular-nums">{correct}</span>
            <span className="text-muted-foreground">правильно</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-destructive/10 text-destructive">
              <X className="size-3" aria-hidden="true" />
            </span>
            <span className="font-semibold tabular-nums">
              {saved.length - correct}
            </span>
            <span className="text-muted-foreground">з помилкою</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-primary/5 text-muted-foreground">
              <Circle className="size-2.5" aria-hidden="true" />
            </span>
            <span className="font-semibold tabular-nums">
              {total - saved.length}
            </span>
            <span className="text-muted-foreground">попереду</span>
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-primary/10 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <HardDrive className="size-3" aria-hidden="true" /> Зберігається
          автоматично
        </span>
        <ResetProgressDialog
          scope="all"
          disabled={
            Object.keys(answers).length === 0 &&
            Object.keys(lastVisited).length === 0
          }
          onReset={resetAll}
        />
      </div>
    </aside>
  )
}

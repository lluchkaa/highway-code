import { Check, Circle, HardDrive, X } from 'lucide-react'
import type * as React from 'react'
import { lazy, Suspense } from 'react'

import { ResetProgressDialog } from '@/components/reset-progress-dialog'
import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Spinner,
} from '@/components/uikit'
import type { CategorySummary } from '@/lib/quiz-schema'
import { useProgress, useProgressSummary } from '@/stores/progress'

const ProgressRing = lazy(async () => {
  const { ProgressRing } =
    await import('@/app/components/progress-overview/progress-ring')
  return { default: ProgressRing }
})

type Props = {
  categories: CategorySummary[]
}

export const ProgressOverview: React.FC<Props> = ({ categories }) => {
  const { answered, correct, incorrect, total } = useProgressSummary(categories)
  const resetAll = useProgress((state) => state.resetAll)
  const canReset = useProgress(
    (state) =>
      Object.keys(state.answers).length > 0 ||
      Object.keys(state.lastVisited).length > 0,
  )
  return (
    <aside className="relative min-w-0" aria-label="Прогрес обраних тем">
      <Card className="gap-5 rounded-3xl border border-primary/15 bg-secondary/50 ring-0 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(7)]">
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle>
            <h2 className="text-sm font-semibold">Прогрес обраних тем</h2>
          </CardTitle>
          <Badge
            variant="secondary"
            className="rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-medium text-primary"
          >
            У своєму темпі
          </Badge>
        </CardHeader>
        <CardContent className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Suspense
            fallback={
              <div className="grid size-24 shrink-0 place-items-center sm:size-28">
                <Spinner aria-label="Завантажуємо прогрес" />
              </div>
            }
          >
            <ProgressRing value={answered} total={total} />
          </Suspense>
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
              <span className="font-semibold tabular-nums">{incorrect}</span>
              <span className="text-muted-foreground">з помилкою</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-primary/5 text-muted-foreground">
                <Circle className="size-2.5" aria-hidden="true" />
              </span>
              <span className="font-semibold tabular-nums">
                {total - answered}
              </span>
              <span className="text-muted-foreground">попереду</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-x-2 gap-y-1 border-primary/10 bg-transparent py-3">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <HardDrive className="size-3" aria-hidden="true" /> Зберігається
            автоматично
          </span>
          <ResetProgressDialog
            scope="all"
            disabled={!canReset}
            onReset={resetAll}
          />
        </CardFooter>
      </Card>
    </aside>
  )
}

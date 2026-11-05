import { Check, Circle, HardDrive, X } from 'lucide-react'
import type * as React from 'react'

import { ProgressRing } from '@/app/components/progress-overview/progress-ring'
import { ResetProgressDialog } from '@/components/reset-progress-dialog'
import type { CategorySummary } from '@/lib/quiz-schema'
import { useProgress, useProgressSummary } from '@/stores/progress'

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
        <ProgressRing value={answered} total={total} />
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
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-primary/10 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <HardDrive className="size-3" aria-hidden="true" /> Зберігається
          автоматично
        </span>
        <ResetProgressDialog
          scope="all"
          disabled={!canReset}
          onReset={resetAll}
        />
      </div>
    </aside>
  )
}

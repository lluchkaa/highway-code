import { Shuffle } from 'lucide-react'
import type * as React from 'react'

import { RandomPracticeActions } from '@/components/random-practice-actions'

export const PracticeEmptyState: React.FC = () => {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-2xl border border-border bg-card px-5 py-12 text-center">
      <Shuffle className="size-9 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-semibold">Немає активного тесту</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Створи набір із 20 випадкових питань з основних тем та обраних
        категорій.
      </p>
      <RandomPracticeActions showContinue={false} />
    </section>
  )
}

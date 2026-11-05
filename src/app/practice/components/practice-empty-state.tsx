import { Shuffle } from 'lucide-react'
import type * as React from 'react'

import { RandomPracticeActions } from '@/components/random-practice-actions'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/uikit'

export const PracticeEmptyState: React.FC = () => {
  return (
    <Empty className="mx-auto max-w-lg border border-border bg-card py-12">
      <EmptyHeader>
        <EmptyMedia>
          <Shuffle className="size-8 text-primary" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>
          <h1 className="text-2xl font-semibold">Немає активного тесту</h1>
        </EmptyTitle>
        <EmptyDescription>
          Створи набір із 20 випадкових питань з основних тем та обраних
          категорій.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <RandomPracticeActions showContinue={false} />
      </EmptyContent>
    </Empty>
  )
}

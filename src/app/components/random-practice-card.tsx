import { Shuffle } from 'lucide-react'
import type * as React from 'react'

import { RandomPracticeActions } from '@/components/random-practice-actions'
import { practiceStats, useRandomPractice } from '@/stores/random-practice'

export const RandomPracticeCard: React.FC = () => {
  const session = useRandomPractice((state) => state.session)
  const { answered } = practiceStats(session)
  return (
    <section
      aria-labelledby="random-practice-heading"
      className="mb-9 flex flex-col justify-between gap-5 rounded-2xl border border-primary/20 bg-secondary/40 p-5 sm:p-6 lg:flex-row lg:items-center"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Shuffle className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2
            id="random-practice-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Випадкові 20 питань
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Основні теми та обрані спеціальні категорії. Без таймера, з
            поясненнями.
          </p>
          <p
            className="mt-2 text-xs leading-relaxed text-muted-foreground"
            role="status"
          >
            {session
              ? `Поточний набір: ${session.licences.length > 0 ? session.licences.join(', ') : 'основні теми'}. Відповідей: ${String(answered)} із 20.`
              : 'Набір і відповіді зберігаються в цій вкладці до її закриття.'}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <RandomPracticeActions />
      </div>
    </section>
  )
}

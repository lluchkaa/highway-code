import { ArrowRight, SearchX } from 'lucide-react'
import type * as React from 'react'

import { Button } from '@/components/uikit'

type Props = { onReset: () => void }

export const NoTopics: React.FC<Props> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
      <SearchX
        className="mb-4 size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <h3 className="font-semibold">Такої теми не знайшли</h3>
      <p className="mt-2 px-4 text-sm text-muted-foreground">
        Спробуй іншу назву, зміни фільтр або обрані категорії посвідчення.
      </p>
      <Button variant="link" className="mt-4" onClick={onReset}>
        Скинути пошук і фільтр
        <ArrowRight aria-hidden="true" />
      </Button>
    </div>
  )
}

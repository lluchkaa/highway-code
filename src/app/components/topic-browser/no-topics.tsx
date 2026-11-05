import { ArrowRight, SearchX } from 'lucide-react'
import type * as React from 'react'

import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/uikit'

type Props = { onReset: () => void }

export const NoTopics: React.FC<Props> = ({ onReset }) => {
  return (
    <Empty className="border border-border py-16">
      <EmptyHeader>
        <EmptyMedia>
          <SearchX className="size-8 text-primary" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>
          <h3 className="font-semibold">Такої теми не знайшли</h3>
        </EmptyTitle>
        <EmptyDescription>
          Спробуй іншу назву, зміни фільтр або обрані категорії посвідчення.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="link" onClick={onReset}>
          Скинути пошук і фільтр
          <ArrowRight aria-hidden="true" />
        </Button>
      </EmptyContent>
    </Empty>
  )
}

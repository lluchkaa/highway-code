import type * as React from 'react'

import { CategoryCard } from '@/app/components/topic-browser/category-card'
import type { categoryGroups } from '@/lib/licence-categories'
import type { CategorySummary } from '@/lib/quiz-schema'

type Props = {
  group: (typeof categoryGroups)[number]
  items: CategorySummary[]
}

export const TopicGroup: React.FC<Props> = ({ group, items }) => {
  return (
    <section aria-label={group.label}>
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-sm font-semibold">{group.label}</h3>
        <span className="text-xs text-muted-foreground">
          {group.description}
        </span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {items.length}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  )
}

import { Search } from 'lucide-react'
import type * as React from 'react'

import { Button, Input } from '@/components/uikit'

export type TopicFilter = 'all' | 'general' | 'extra'

type Props = {
  search: string
  filter: TopicFilter
  count: number
  onSearch: (search: string) => void
  onFilter: (filter: TopicFilter) => void
}

export const TopicFilters: React.FC<Props> = ({
  search,
  filter,
  count,
  onSearch,
  onFilter,
}) => {
  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
            Практика за темами
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            З чого почнемо?
          </h2>
        </div>
        <div className="relative w-full sm:max-w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => {
              onSearch(event.target.value)
            }}
            placeholder="Знайти тему…"
            aria-label="Знайти тему"
            className="h-11 rounded-xl bg-card pr-3 pl-10"
          />
        </div>
      </div>
      <div className="mt-6 mb-9 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" aria-label="Фільтр тем">
          {(
            [
              { id: 'all', label: 'Усі теми' },
              { id: 'general', label: 'Основні теми' },
              { id: 'extra', label: 'Додаткові категорії' },
            ] as const
          ).map((item) => (
            <Button
              key={item.id}
              variant={filter === item.id ? 'default' : 'outline'}
              className="h-9 rounded-full px-4 text-xs"
              aria-pressed={filter === item.id}
              onClick={() => {
                onFilter(item.id)
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground" role="status">
          Знайдено тем:{' '}
          <span className="font-medium text-foreground">{count}</span>
        </p>
      </div>
    </>
  )
}

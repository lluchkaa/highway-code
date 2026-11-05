import { Search } from 'lucide-react'
import type * as React from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/uikit'

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
        <InputGroup className="h-11 w-full rounded-xl bg-card sm:max-w-72">
          <InputGroupInput
            type="search"
            value={search}
            onChange={(event) => {
              onSearch(event.target.value)
            }}
            placeholder="Знайти тему…"
            aria-label="Знайти тему"
            className="h-full"
          />
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="mt-6 mb-9 flex flex-wrap items-center justify-between gap-4">
        <ToggleGroup
          aria-label="Фільтр тем"
          value={[filter]}
          onValueChange={(values: unknown[]) => {
            const [next] = values
            if (next === 'all' || next === 'general' || next === 'extra') {
              onFilter(next)
            }
          }}
          variant="outline"
          className="flex-wrap"
        >
          {(
            [
              { id: 'all', label: 'Усі теми' },
              { id: 'general', label: 'Основні теми' },
              { id: 'extra', label: 'Додаткові категорії' },
            ] as const
          ).map((item) => (
            <ToggleGroupItem
              key={item.id}
              className="h-9 rounded-full px-4 text-xs data-pressed:bg-primary data-pressed:text-primary-foreground"
              value={item.id}
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground" role="status">
          Знайдено тем:{' '}
          <span className="font-medium text-foreground">{count}</span>
        </p>
      </div>
    </>
  )
}

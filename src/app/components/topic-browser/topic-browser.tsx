import type * as React from 'react'
import { useState } from 'react'

import { NoTopics } from '@/app/components/topic-browser/no-topics'
import {
  type TopicFilter,
  TopicFilters,
} from '@/app/components/topic-browser/topic-filters'
import { TopicGroup } from '@/app/components/topic-browser/topic-group'
import { categoryGroups } from '@/lib/licence-categories'
import type { CategorySummary } from '@/lib/quiz-schema'

type Props = { categories: CategorySummary[] }

export const TopicBrowser: React.FC<Props> = ({ categories }) => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TopicFilter>('all')
  const query = search.trim().toLocaleLowerCase('uk')
  const visible = categories.filter((category) => {
    const group = categoryGroups.find((item) => item.id === category.group)
    return (
      (filter === 'all' ||
        (filter === 'general'
          ? category.group === 'general'
          : category.group !== 'general')) &&
      `${category.title} ${group?.label ?? ''} ${group?.description ?? ''}`
        .toLocaleLowerCase('uk')
        .includes(query)
    )
  })

  return (
    <>
      <TopicFilters
        search={search}
        filter={filter}
        count={visible.length}
        onSearch={setSearch}
        onFilter={setFilter}
      />
      <div className="space-y-10">
        {categoryGroups.map((group) => {
          const items = visible.filter(
            (category) => category.group === group.id,
          )
          return (
            items.length > 0 && (
              <TopicGroup key={group.id} group={group} items={items} />
            )
          )
        })}
        {visible.length === 0 && (
          <NoTopics
            onReset={() => {
              setSearch('')
              setFilter('all')
            }}
          />
        )}
      </div>
    </>
  )
}

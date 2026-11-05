import type * as React from 'react'

import { LicenceGroup } from '@/app/components/licence-selector/licence-group'
import { Button } from '@/components/uikit'
import {
  categoryGroups,
  type Licence,
  licenceSchema,
} from '@/lib/licence-categories'

type Props = {
  licences: Licence[]
  onChange: (licences: Licence[]) => void
}

export const LicenceSelector: React.FC<Props> = ({ licences, onChange }) => {
  const allSelected = licences.length === licenceSchema.options.length

  return (
    <section
      aria-labelledby="licence-heading"
      className="mb-9 rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="licence-heading"
            className="text-base font-semibold tracking-tight"
          >
            Які категорії вивчаєш?
          </h3>
          <p
            id="licence-description"
            className="mt-1.5 text-xs leading-relaxed text-muted-foreground"
          >
            Обери одну або кілька. Основні теми доступні завжди.
          </p>
        </div>
        <Button
          variant="ghost"
          className="h-8 px-2 text-xs text-primary"
          onClick={() => {
            onChange(allSelected ? [] : licenceSchema.options)
          }}
        >
          {allSelected ? 'Скинути вибір' : 'Обрати всі'}
        </Button>
      </div>
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        role="group"
        aria-labelledby="licence-heading"
        aria-describedby="licence-description"
      >
        {categoryGroups.map((group) => {
          if (group.id === 'general') {
            return null
          }
          return (
            <LicenceGroup
              key={group.id}
              group={{ ...group, id: group.id }}
              licences={licences}
              onChange={onChange}
            />
          )
        })}
      </div>
      <p
        className="mt-4 text-xs leading-relaxed text-muted-foreground"
        role="status"
      >
        {licences.length > 0
          ? `Обрано: ${licences.join(', ')}. Показуємо основні та відповідні додаткові теми.`
          : 'Зараз показуємо основні теми. Обери категорії, щоб додати спеціальні теми.'}
      </p>
    </section>
  )
}

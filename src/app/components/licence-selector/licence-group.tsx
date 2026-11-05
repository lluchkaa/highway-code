import { cn } from 'cn'
import {
  Bike,
  Bus,
  Caravan,
  CarFront,
  Check,
  TramFront,
  Truck,
} from 'lucide-react'
import type * as React from 'react'

import { Button } from '@/components/uikit'
import {
  type Licence,
  licenceGroups,
  licenceSchema,
} from '@/lib/licence-categories'
import type { CategoryGroup } from '@/lib/quiz-schema'

const icons = {
  A: Bike,
  B: CarFront,
  C: Truck,
  D: Bus,
  E: Caravan,
  T: TramFront,
}

type Props = {
  group: { id: Exclude<CategoryGroup, 'general'>; description: string }
  licences: Licence[]
  onChange: (licences: Licence[]) => void
}

export const LicenceGroup: React.FC<Props> = ({
  group,
  licences,
  onChange,
}) => {
  const Icon = icons[group.id]
  const options = licenceSchema.options.filter(
    (licence) => licenceGroups[licence].at(-1) === group.id,
  )
  return (
    <div className="rounded-xl bg-muted/50 p-3.5">
      <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
        {group.id === 'E' ? 'Транспорт із причепом' : group.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((licence) => {
          const selected = licences.includes(licence)
          return (
            <Button
              key={licence}
              aria-label={`Категорія ${licence}`}
              aria-pressed={selected}
              variant={selected ? 'default' : 'outline'}
              className={cn(
                'h-11 min-w-16 gap-2 rounded-lg px-3 text-sm',
                !selected && 'bg-card',
              )}
              onClick={() => {
                onChange(
                  selected
                    ? licences.filter((item) => item !== licence)
                    : [...licences, licence],
                )
              }}
            >
              <span className="grid size-3.5 place-items-center rounded-sm border border-current/40">
                {selected && <Check className="size-3" aria-hidden="true" />}
              </span>
              {licence}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

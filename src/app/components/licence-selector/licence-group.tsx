import { cn } from 'cn'
import { Bike, Bus, Caravan, CarFront, TramFront, Truck } from 'lucide-react'
import type * as React from 'react'

import { Checkbox } from '@/components/uikit'
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
            <label
              key={licence}
              className={cn(
                'flex min-h-11 min-w-16 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-card hover:bg-muted',
              )}
            >
              <Checkbox
                aria-label={`Категорія ${licence}`}
                checked={selected}
                onCheckedChange={(checked) => {
                  onChange(
                    checked
                      ? [...licences, licence]
                      : licences.filter((item) => item !== licence),
                  )
                }}
                className="data-checked:border-primary-foreground/60"
              />
              {licence}
            </label>
          )
        })}
      </div>
    </div>
  )
}

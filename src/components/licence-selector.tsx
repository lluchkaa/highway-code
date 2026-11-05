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

import { Button } from '@/components/uikit/button'
import { categoryGroups } from '@/lib/catalog'
import {
  type Licence,
  licenceGroups,
  licenceSchema,
} from '@/lib/licence-categories'

const icons = {
  A: Bike,
  B: CarFront,
  C: Truck,
  D: Bus,
  E: Caravan,
  T: TramFront,
}

export function LicenceSelector({
  licences,
  onChange,
}: {
  licences: Licence[]
  onChange: (licences: Licence[]) => void
}) {
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
          const Icon = icons[group.id]
          const options = licenceSchema.options.filter(
            (licence) => licenceGroups[licence].at(-1) === group.id,
          )
          return (
            <div key={group.id} className="rounded-xl bg-muted/50 p-3.5">
              <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Icon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
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
                        {selected && (
                          <Check className="size-3" aria-hidden="true" />
                        )}
                      </span>
                      {licence}
                    </Button>
                  )
                })}
              </div>
            </div>
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

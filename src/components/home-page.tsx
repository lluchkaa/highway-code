import {
  ArrowDown,
  ArrowRight,
  Check,
  Search,
  SearchX,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { CategoryCard } from '@/components/category-card'
import { LicenceSelector } from '@/components/licence-selector'
import { PageHead } from '@/components/page-head'
import { ProgressOverview } from '@/components/progress-overview'
import { RandomPracticeCard } from '@/components/random-practice-card'
import { Badge } from '@/components/uikit/badge'
import { Button } from '@/components/uikit/button'
import { Input } from '@/components/uikit/input'
import { useLearningCategories } from '@/hooks/use-learning-categories'
import { categoryGroups } from '@/lib/catalog'

export function HomePage() {
  const { categories, licences, setLicences } = useLearningCategories()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const total = categories.reduce(
    (count, category) => count + category.questionCount,
    0,
  )
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
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHead
        title="Вивчай правила у своєму темпі"
        description={`${String(categories.length)} тема та ${String(total)} питань з правил дорожнього руху України. Практикуйся з поясненнями та зберігай прогрес у браузері.`}
      />
      <section className="grid items-center gap-9 pb-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:pb-16">
        <div>
          <Badge
            variant="secondary"
            className="mb-5 h-7 gap-1.5 px-3 text-[10px] font-semibold tracking-wider uppercase"
          >
            <Sparkles className="size-3" aria-hidden="true" /> Твій шлях до
            впевненого водіння
          </Badge>
          <h1 className="text-[clamp(2.1rem,4.5vw,3.5rem)] leading-[1.13] font-semibold tracking-[-0.045em]">
            Вивчай правила.
            <br />
            <span className="text-primary">Відчувай впевненість.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Розбирай дорожні ситуації, вчися на помилках і рухайся вперед. Одне
            питання за раз.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" aria-hidden="true" />{' '}
              {total.toLocaleString('uk')} питань
            </span>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" aria-hidden="true" /> Без
              таймера
            </span>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck
                className="size-3.5 text-primary"
                aria-hidden="true"
              />{' '}
              Без реєстрації
            </span>
          </div>
          <Button
            onClick={() => {
              document
                .getElementById('topics')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="mt-8 h-11 gap-3 rounded-xl px-5"
          >
            Обрати тему
            <ArrowDown className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <ProgressOverview categories={categories} />
      </section>

      <section
        id="topics"
        className="scroll-mt-6 border-t border-border/80 pt-9"
      >
        <LicenceSelector licences={licences} onChange={setLicences} />
        <RandomPracticeCard />
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
                setSearch(event.target.value)
              }}
              placeholder="Знайти тему…"
              aria-label="Знайти тему"
              className="h-11 rounded-xl bg-card pr-3 pl-10"
            />
          </div>
        </div>
        <div className="mt-6 mb-9 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" aria-label="Фільтр тем">
            {[
              { id: 'all', label: 'Усі теми' },
              { id: 'general', label: 'Основні теми' },
              { id: 'extra', label: 'Додаткові категорії' },
            ].map((item) => (
              <Button
                key={item.id}
                variant={filter === item.id ? 'default' : 'outline'}
                className="h-9 rounded-full px-4 text-xs"
                aria-pressed={filter === item.id}
                onClick={() => {
                  setFilter(item.id)
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground" role="status">
            Знайдено тем:{' '}
            <span className="font-medium text-foreground">
              {visible.length}
            </span>
          </p>
        </div>
        <div className="space-y-10">
          {categoryGroups.map((group) => {
            const items = visible.filter(
              (category) => category.group === group.id,
            )
            return (
              items.length > 0 && (
                <section key={group.id} aria-label={group.label}>
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
            )
          })}
          {visible.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
              <SearchX
                className="mb-4 size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <h3 className="font-semibold">Такої теми не знайшли</h3>
              <p className="mt-2 px-4 text-sm text-muted-foreground">
                Спробуй іншу назву, зміни фільтр або обрані категорії
                посвідчення.
              </p>
              <Button
                variant="link"
                className="mt-4"
                onClick={() => {
                  setSearch('')
                  setFilter('all')
                }}
              >
                Скинути пошук і фільтр
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

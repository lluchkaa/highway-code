import { CloudOff, Route } from 'lucide-react'
import type * as React from 'react'
import { Link } from 'react-router'

import { ThemeSelect } from '@/app/components/theme-select'
import { routes } from '@/lib/routes'

export const AppHeader: React.FC = () => {
  return (
    <header className="border-b border-border/70 bg-card/80">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to={routes.home}
          className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="ПДР Практика — головна"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Route className="size-6" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            ПДР
            <span className="ml-1.5 font-normal text-muted-foreground">
              Практика
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <span className="hidden items-center gap-2 sm:flex">
            <CloudOff className="size-4" aria-hidden="true" /> Прогрес у твоєму
            браузері
          </span>
          <ThemeSelect />
        </div>
      </div>
    </header>
  )
}

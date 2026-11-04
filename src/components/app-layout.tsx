import {
  ArrowUpRight,
  CloudOff,
  LoaderCircle,
  Route,
  TriangleAlert,
} from 'lucide-react'
import { Link, Outlet, useNavigation } from 'react-router'

import { ThemeSelect } from '@/components/theme-select'
import { useProgress } from '@/hooks/use-progress'
import { routes } from '@/lib/routes'

export function AppLayout() {
  const { storageNotice } = useProgress()
  const navigation = useNavigation()
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
        className="sr-only z-50 rounded-lg bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Перейти до вмісту
      </a>
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
              <CloudOff className="size-4" aria-hidden="true" /> Прогрес у
              твоєму браузері
            </span>
            <ThemeSelect />
          </div>
        </div>
      </header>
      {navigation.state === 'loading' && (
        <div
          className="fixed top-0 right-0 left-0 z-50 flex items-center justify-center gap-2 bg-primary px-4 py-2 text-xs text-primary-foreground"
          role="status"
        >
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          Завантажуємо питання…
        </div>
      )}
      {storageNotice && (
        <div className="mx-auto mt-5 w-full max-w-6xl px-4 sm:px-6">
          <div
            className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground"
            role="status"
          >
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p>{storageNotice}</p>
          </div>
        </div>
      )}
      <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </div>
      <footer className="mt-16 border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <Route className="size-4" aria-hidden="true" /> Маленькі кроки.
            Впевнене водіння.
          </p>
          <a
            href="https://github.com/lluchkaa/highway-code"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline"
          >
            Highway Code на GitHub
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  )
}

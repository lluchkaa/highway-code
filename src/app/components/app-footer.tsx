import { ArrowUpRight, Route } from 'lucide-react'
import type * as React from 'react'

export const AppFooter: React.FC = () => {
  return (
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
  )
}

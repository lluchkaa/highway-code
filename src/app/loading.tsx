import { LoaderCircle, Route } from 'lucide-react'
import type * as React from 'react'

export const RouteLoading: React.FC = () => {
  return (
    <main className="grid min-h-svh place-items-center px-6" aria-busy="true">
      <div
        className="flex flex-col items-center gap-5 text-center"
        role="status"
      >
        <span className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Route className="size-8" aria-hidden="true" />
        </span>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Готуємо питання…
        </p>
      </div>
    </main>
  )
}

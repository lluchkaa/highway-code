import { LoaderCircle, TriangleAlert } from 'lucide-react'
import type * as React from 'react'
import { Outlet, useNavigation } from 'react-router'

import { AppFooter } from '@/app/components/app-footer'
import { AppHeader } from '@/app/components/app-header'
import { useProgress } from '@/stores/progress'

export const AppLayout: React.FC = () => {
  const storageNotice = useProgress((state) => state.storageNotice)
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
      <AppHeader />
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
      <AppFooter />
    </div>
  )
}

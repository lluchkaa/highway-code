import type * as React from 'react'
import { createHashRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { questionLoader } from '@/app/categories/[categoryId]/questions/[questionId]/loader'
import { RouteError } from '@/app/error'
import { AppLayout } from '@/app/layout'
import { RouteLoading } from '@/app/loading'
import { NotFoundPage } from '@/app/not-found'
import { startRandomPractice } from '@/app/practice/action'
import { randomPracticeLoader } from '@/app/practice/loader'
import { loadCatalog } from '@/lib/catalog'
import { routes } from '@/lib/routes'

// Hosting switch: replace createHashRouter here with createBrowserRouter and
// basename: import.meta.env.BASE_URL when the host supports SPA rewrites.
const router = createHashRouter([
  {
    id: 'catalog',
    path: routes.home,
    loader: loadCatalog,
    Component: AppLayout,
    HydrateFallback: RouteLoading,
    ErrorBoundary: RouteError,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('@/app/page')
          return { Component: HomePage }
        },
      },
      {
        path: routes.practice,
        loader: randomPracticeLoader,
        action: startRandomPractice,
        lazy: async () => {
          const { RandomPracticePage } = await import('@/app/practice/page')
          return { Component: RandomPracticePage }
        },
        ErrorBoundary: RouteError,
      },
      {
        path: routes.question,
        loader: questionLoader,
        lazy: async () => {
          const { QuestionPage } =
            await import('@/app/categories/[categoryId]/questions/[questionId]/page')
          return { Component: QuestionPage }
        },
        ErrorBoundary: RouteError,
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

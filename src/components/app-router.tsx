import { createHashRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { AppLayout } from '@/components/app-layout'
import {
  NotFoundPage,
  RouteError,
  RouteLoading,
} from '@/components/route-state'
import { loadCatalog } from '@/lib/catalog'
import { questionLoader } from '@/lib/question-loader'
import {
  randomPracticeLoader,
  startRandomPractice,
} from '@/lib/random-practice'
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
          const { HomePage } = await import('@/components/home-page')
          return { Component: HomePage }
        },
      },
      {
        path: routes.practice,
        loader: randomPracticeLoader,
        action: startRandomPractice,
        lazy: async () => {
          const { RandomPracticePage } =
            await import('@/components/random-practice-page')
          return { Component: RandomPracticePage }
        },
        ErrorBoundary: RouteError,
      },
      {
        path: routes.question,
        loader: questionLoader,
        lazy: async () => {
          const { QuestionPage } = await import('@/components/question-page')
          return { Component: QuestionPage }
        },
        ErrorBoundary: RouteError,
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

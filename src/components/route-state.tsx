import { ArrowLeft, LoaderCircle, Route, TriangleAlert } from 'lucide-react'
import {
  isRouteErrorResponse,
  Link,
  useRevalidator,
  useRouteError,
} from 'react-router'

import { PageHead } from '@/components/page-head'
import { Button, buttonVariants } from '@/components/uikit/button'
import { routes } from '@/lib/routes'

export function RouteLoading() {
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

export function RouteError() {
  const error = useRouteError()
  const revalidator = useRevalidator()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <PageHead
        title={
          notFound ? 'Сторінку не знайдено' : 'Не вдалося завантажити дані'
        }
        description="Поверніться до тем або спробуйте завантажити сторінку знову."
      />
      <TriangleAlert
        className="size-10 text-muted-foreground"
        aria-hidden="true"
      />
      <h1 className="text-2xl font-semibold">
        {notFound ? 'Такого питання немає' : 'Не вдалося завантажити дані'}
      </h1>
      <p className="text-muted-foreground">
        {notFound
          ? 'Можливо, посилання застаріло. Оберіть питання зі списку тем.'
          : 'Перевірте з’єднання з інтернетом і спробуйте ще раз.'}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to={routes.home}
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          <ArrowLeft /> До списку тем
        </Link>
        {!notFound && (
          <Button
            size="lg"
            disabled={revalidator.state === 'loading'}
            onClick={() => {
              void revalidator.revalidate()
            }}
          >
            Спробувати ще раз
          </Button>
        )}
      </div>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60svh] max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <PageHead
        title="Сторінку не знайдено"
        description="Оберіть тему та продовжуйте вивчати правила дорожнього руху."
      />
      <p className="text-sm font-semibold tracking-widest text-primary">404</p>
      <h1 className="text-3xl font-semibold">Здається, тут поворот не туди</h1>
      <p className="text-muted-foreground">
        Поверніться до тем і продовжуйте свій шлях.
      </p>
      <Link to={routes.home} className={buttonVariants({ size: 'lg' })}>
        <ArrowLeft /> До списку тем
      </Link>
    </main>
  )
}

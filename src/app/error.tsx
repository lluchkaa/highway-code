import { ArrowLeft, TriangleAlert } from 'lucide-react'
import type * as React from 'react'
import {
  isRouteErrorResponse,
  Link,
  useRevalidator,
  useRouteError,
} from 'react-router'

import { PageHead } from '@/components/page-head'
import { Button, buttonVariants } from '@/components/uikit'
import { routes } from '@/lib/routes'

export const RouteError: React.FC = () => {
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

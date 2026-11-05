import { ArrowLeft } from 'lucide-react'
import type * as React from 'react'
import { Link } from 'react-router'

import { PageHead } from '@/components/page-head'
import { buttonVariants } from '@/components/uikit'
import { routes } from '@/lib/routes'

export const NotFoundPage: React.FC = () => {
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

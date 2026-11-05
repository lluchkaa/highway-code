import { ArrowRight, RotateCcw } from 'lucide-react'
import type * as React from 'react'
import { Form, Link, useNavigation } from 'react-router'

import { Button, buttonVariants } from '@/components/uikit'
import { routes } from '@/lib/routes'
import { useRandomPractice } from '@/stores/random-practice'

type Props = {
  showContinue?: boolean
}

export const RandomPracticeActions: React.FC<Props> = ({
  showContinue = true,
}) => {
  const hasSession = useRandomPractice((state) => state.session !== null)
  const complete = useRandomPractice((state) => state.session?.position === 20)
  const navigation = useNavigation()
  const busy = navigation.state !== 'idle'
  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasSession && showContinue && (
        <Link
          to={routes.practice}
          className={buttonVariants({ className: 'h-11 rounded-xl px-4' })}
        >
          {complete ? 'Переглянути результат' : 'Продовжити тест'}
          <ArrowRight aria-hidden="true" />
        </Link>
      )}
      <Form method="post" action={routes.practice}>
        <Button
          type="submit"
          disabled={busy}
          variant={hasSession && showContinue ? 'outline' : 'default'}
          className="h-11 rounded-xl px-4"
        >
          {hasSession && <RotateCcw className="size-4" aria-hidden="true" />}
          {busy
            ? 'Готуємо набір…'
            : hasSession
              ? 'Нові 20 питань'
              : 'Почати 20 питань'}
          {!hasSession && <ArrowRight aria-hidden="true" />}
        </Button>
      </Form>
    </div>
  )
}

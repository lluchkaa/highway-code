import { ArrowRight, RotateCcw } from 'lucide-react'
import { Form, Link, useNavigation } from 'react-router'

import { Button, buttonVariants } from '@/components/uikit/button'
import { useRandomPractice } from '@/hooks/use-random-practice'
import { routes } from '@/lib/routes'

export function RandomPracticeActions({
  showContinue = true,
}: {
  showContinue?: boolean
}) {
  const { session } = useRandomPractice()
  const navigation = useNavigation()
  const busy = navigation.state !== 'idle'
  return (
    <div className="flex flex-wrap items-center gap-3">
      {session && showContinue && (
        <Link
          to={routes.practice}
          className={buttonVariants({ className: 'h-11 rounded-xl px-4' })}
        >
          {session.position === 20
            ? 'Переглянути результат'
            : 'Продовжити тест'}
          <ArrowRight aria-hidden="true" />
        </Link>
      )}
      <Form method="post" action={routes.practice}>
        <Button
          type="submit"
          disabled={busy}
          variant={session && showContinue ? 'outline' : 'default'}
          className="h-11 rounded-xl px-4"
        >
          {session && <RotateCcw className="size-4" aria-hidden="true" />}
          {busy
            ? 'Готуємо набір…'
            : session
              ? 'Нові 20 питань'
              : 'Почати 20 питань'}
          {!session && <ArrowRight aria-hidden="true" />}
        </Button>
      </Form>
    </div>
  )
}

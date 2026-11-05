import { ArrowLeft } from 'lucide-react'
import type * as React from 'react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'

import { ResultItem } from '@/app/practice/components/practice-results/result-item'
import {
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/uikit'
import { routes } from '@/lib/routes'
import type { PracticeSession } from '@/stores/random-practice'

type Props = {
  items: PracticeSession['items']
  answered: number
  correct: number
}

export const PracticeResults: React.FC<Props> = ({
  items,
  answered,
  correct,
}) => {
  const resultRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo({ top: 0 })
    resultRef.current?.focus({ preventScroll: true })
  }, [])
  return (
    <section>
      <Card className="gap-0 rounded-2xl border border-border ring-0 [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(8)]">
        <CardHeader>
          <CardTitle>
            <h1
              ref={resultRef}
              tabIndex={-1}
              className="text-2xl font-semibold tracking-tight outline-none"
            >
              Твій результат
            </h1>
          </CardTitle>
          <CardDescription className="mt-3 text-sm text-muted-foreground">
            Правильних відповідей:{' '}
            <span className="font-semibold text-success">{correct} із 20</span>.
            {answered < 20 &&
              ` Без відповіді: ${String(20 - answered)}. Можна повернутися до будь-якого питання.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol
            aria-label="Результати тесту"
            className="mt-6 grid gap-3 sm:grid-cols-2"
          >
            {items.map((entry, index) => (
              <ResultItem key={entry.question.id} entry={entry} index={index} />
            ))}
          </ol>
        </CardContent>
        <CardFooter className="mt-6 border-0 bg-transparent pt-0">
          <Link
            to={routes.home}
            className={buttonVariants({
              variant: 'outline',
              className: 'h-11 rounded-xl px-4',
            })}
          >
            <ArrowLeft aria-hidden="true" /> До тем
          </Link>
        </CardFooter>
      </Card>
    </section>
  )
}

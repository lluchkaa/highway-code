import { ArrowLeft } from 'lucide-react'
import type * as React from 'react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'

import { ResultItem } from '@/app/practice/components/practice-results/result-item'
import { buttonVariants } from '@/components/uikit'
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
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-8">
      <h1
        ref={resultRef}
        tabIndex={-1}
        className="text-2xl font-semibold tracking-tight outline-none"
      >
        Твій результат
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Правильних відповідей:{' '}
        <span className="font-semibold text-success">{correct} із 20</span>.
        {answered < 20 &&
          ` Без відповіді: ${String(20 - answered)}. Можна повернутися до будь-якого питання.`}
      </p>
      <ol
        aria-label="Результати тесту"
        className="mt-6 grid gap-3 sm:grid-cols-2"
      >
        {items.map((entry, index) => (
          <ResultItem key={entry.question.id} entry={entry} index={index} />
        ))}
      </ol>
      <Link
        to={routes.home}
        className={buttonVariants({
          variant: 'outline',
          className: 'mt-6 h-11 rounded-xl px-4',
        })}
      >
        <ArrowLeft aria-hidden="true" /> До тем
      </Link>
    </section>
  )
}

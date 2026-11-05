import { ArrowLeft, Check, Circle, Shuffle, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useLoaderData } from 'react-router'

import { PageHead } from '@/components/page-head'
import { QuestionNavigation } from '@/components/question-navigation'
import { QuestionPractice } from '@/components/question-practice'
import { RandomPracticeActions } from '@/components/random-practice-actions'
import { buttonVariants } from '@/components/uikit/button'
import { Progress } from '@/components/uikit/progress'
import { useRandomPractice } from '@/hooks/use-random-practice'
import type { randomPracticeLoader } from '@/lib/random-practice'
import { practicePath, routes } from '@/lib/routes'

export function RandomPracticePage() {
  const data = useLoaderData<typeof randomPracticeLoader>()
  const { session, answer, storageNotice } = useRandomPractice()
  const position = data?.position ?? 0
  const item = session?.items[position]
  const answered =
    session?.items.filter((entry) => entry.answer !== null).length ?? 0
  const correct =
    session?.items.filter((entry) => entry.answer?.correct).length ?? 0
  const result = session !== null && position === 20
  const resultRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0 })
      resultRef.current?.focus({ preventScroll: true })
    }
  }, [result])

  return (
    <main className="mx-auto max-w-6xl px-4 pt-7 sm:px-6 sm:pt-9">
      <PageHead
        title={
          !session || !data
            ? 'Випадкові 20 питань'
            : result
              ? 'Результат — випадкові 20 питань'
              : `Випадкові 20 питань — питання ${String(position + 1)}`
        }
        description="Практикуйся на випадкових питаннях з основних тем та обраних категорій посвідчення."
      />
      <Link
        to={routes.home}
        className="mb-6 inline-flex items-center gap-2 rounded-md text-xs text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Усі теми
      </Link>
      {storageNotice && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
        >
          {storageNotice}
        </p>
      )}
      {!session || !data ? (
        <section className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-2xl border border-border bg-card px-5 py-12 text-center">
          <Shuffle className="size-9 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">Немає активного тесту</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Створи набір із 20 випадкових питань з основних тем та обраних
            категорій.
          </p>
          <RandomPracticeActions showContinue={false} />
        </section>
      ) : (
        <>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                Практика у своєму темпі
              </p>
              <h2 className="text-xl font-semibold tracking-tight">
                Випадкові 20 питань
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                {session.licences.length > 0
                  ? `Категорії: ${session.licences.join(', ')}`
                  : 'Основні теми'}{' '}
                · Збережено в цій вкладці
              </p>
            </div>
            <RandomPracticeActions showContinue={false} />
          </div>
          <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Progress
              value={answered}
              max={20}
              aria-label={`Відповідей: ${String(answered)} із 20`}
              className="w-40 [&_[data-slot=progress-track]]:h-1.5"
            />
            <span className="text-xs text-muted-foreground">
              {answered} із 20 пройдено
            </span>
            <span className="flex items-center gap-1 text-xs text-success">
              <Check className="size-3.5" aria-hidden="true" />
              {correct} правильно
            </span>
            <span className="flex items-center gap-1 text-xs text-destructive">
              <X className="size-3.5" aria-hidden="true" />
              {answered - correct} з помилкою
            </span>
          </div>
          {result ? (
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
                <span className="font-semibold text-success">
                  {correct} із 20
                </span>
                .
                {answered < 20 &&
                  ` Без відповіді: ${String(20 - answered)}. Можна повернутися до будь-якого питання.`}
              </p>
              <ol
                aria-label="Результати тесту"
                className="mt-6 grid gap-3 sm:grid-cols-2"
              >
                {session.items.map((entry, index) => (
                  <li key={entry.question.id}>
                    <Link
                      to={practicePath(index)}
                      className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm transition-colors hover:border-primary/40"
                    >
                      <span className="mt-0.5 shrink-0">
                        {entry.answer === null ? (
                          <Circle
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        ) : entry.answer.correct ? (
                          <Check
                            className="size-4 text-success"
                            aria-hidden="true"
                          />
                        ) : (
                          <X
                            className="size-4 text-destructive"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="mb-1 block text-xs text-muted-foreground">
                          Питання {index + 1} ·{' '}
                          {entry.answer === null
                            ? 'Без відповіді'
                            : entry.answer.correct
                              ? 'Правильно'
                              : 'З помилкою'}
                        </span>
                        <span className="line-clamp-2">
                          {entry.question.question_text}
                        </span>
                      </span>
                    </Link>
                  </li>
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
          ) : (
            item && (
              <>
                <QuestionNavigation
                  items={session.items.map((entry, index) => ({
                    to: practicePath(index),
                    correct: entry.answer?.correct,
                  }))}
                  position={position}
                />
                <p className="mb-4 text-xs text-muted-foreground">
                  {item.summary.title}
                </p>
                <QuestionPractice
                  key={`${session.id}:${String(position)}`}
                  question={item.question}
                  position={position}
                  savedAnswer={item.answer ?? undefined}
                  onAnswer={(optionIndex) => {
                    answer(item.question.id, optionIndex)
                  }}
                  backPath={
                    position > 0 ? practicePath(position - 1) : routes.home
                  }
                  backLabel={position > 0 ? 'Назад' : 'До тем'}
                  nextPath={practicePath(position + 1)}
                  {...(position === 19 ? { nextLabel: 'Підсумок' } : {})}
                />
              </>
            )
          )}
          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
            Можна переходити між питаннями в будь-якому порядку. Новий набір
            використовує поточний вибір категорій.
          </p>
        </>
      )}
    </main>
  )
}

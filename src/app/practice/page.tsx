import { ArrowLeft } from 'lucide-react'
import type * as React from 'react'
import { Link, useLoaderData } from 'react-router'

import { PracticeEmptyState } from '@/app/practice/components/practice-empty-state'
import { PracticeHeader } from '@/app/practice/components/practice-header'
import { PracticeQuestion } from '@/app/practice/components/practice-question'
import { PracticeResults } from '@/app/practice/components/practice-results'
import type { randomPracticeLoader } from '@/app/practice/loader'
import { PageHead } from '@/components/page-head'
import { Alert, AlertDescription } from '@/components/uikit'
import { routes } from '@/lib/routes'
import { practiceStats, useRandomPractice } from '@/stores/random-practice'

export const RandomPracticePage: React.FC = () => {
  const data = useLoaderData<typeof randomPracticeLoader>()
  const session = useRandomPractice((state) => state.session)
  const storageNotice = useRandomPractice((state) => state.storageNotice)
  const position = data?.position ?? 0
  const { answered, correct } = practiceStats(session)
  const result = session !== null && position === 20
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
        <Alert
          role="status"
          className="mb-5 rounded-xl border-amber-500/30 bg-amber-500/10 p-4"
        >
          <AlertDescription className="text-foreground">
            {storageNotice}
          </AlertDescription>
        </Alert>
      )}
      {!session || !data ? (
        <PracticeEmptyState />
      ) : (
        <>
          <PracticeHeader
            licences={session.licences}
            answered={answered}
            correct={correct}
          />
          {result ? (
            <PracticeResults
              items={session.items}
              answered={answered}
              correct={correct}
            />
          ) : (
            <PracticeQuestion session={session} position={position} />
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

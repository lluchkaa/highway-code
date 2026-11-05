import type * as React from 'react'

import { QuestionNavigation } from '@/components/question-navigation'
import { QuestionPractice } from '@/components/question-practice'
import { practicePath, routes } from '@/lib/routes'
import {
  type PracticeSession,
  useRandomPractice,
} from '@/stores/random-practice'

type Props = { session: PracticeSession; position: number }

export const PracticeQuestion: React.FC<Props> = ({ session, position }) => {
  const answer = useRandomPractice((state) => state.answer)
  const item = session.items[position]
  if (!item) {
    return null
  }
  return (
    <>
      <QuestionNavigation
        items={session.items.map((entry, index) => ({
          to: practicePath(index),
          correct: entry.answer?.correct,
        }))}
        position={position}
      />
      <p className="mb-4 text-xs text-muted-foreground">{item.summary.title}</p>
      <QuestionPractice
        key={`${session.id}:${String(position)}`}
        question={item.question}
        position={position}
        savedAnswer={item.answer ?? undefined}
        onAnswer={(optionIndex) => {
          answer(item.question.id, optionIndex)
        }}
        backPath={position > 0 ? practicePath(position - 1) : routes.home}
        backLabel={position > 0 ? 'Назад' : 'До тем'}
        nextPath={practicePath(position + 1)}
        {...(position === 19 ? { nextLabel: 'Підсумок' } : {})}
      />
    </>
  )
}

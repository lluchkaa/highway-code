import type * as React from 'react'

import { AnswerOption } from '@/components/question-practice/answer-option'
import type { Question } from '@/lib/quiz-schema'

type Props = {
  question: Question
  saved: { optionIndex: number; correct: boolean } | undefined
  onAnswer: (index: number) => void
}

export const AnswerOptions: React.FC<Props> = ({
  question,
  saved,
  onAnswer,
}) => {
  return (
    <ol aria-label="Варіанти відповіді" className="space-y-3">
      {question.options.map((option, index) => (
        <AnswerOption
          key={index}
          option={option}
          index={index}
          correct={Boolean(saved && index === question.correct_answer)}
          incorrect={Boolean(
            saved && index === saved.optionIndex && !saved.correct,
          )}
          answered={Boolean(saved)}
          onAnswer={() => {
            onAnswer(index)
          }}
        />
      ))}
    </ol>
  )
}

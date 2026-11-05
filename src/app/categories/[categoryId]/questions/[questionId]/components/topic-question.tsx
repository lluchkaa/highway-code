import type * as React from 'react'

import { QuestionPractice } from '@/components/question-practice'
import { useLearningCategories } from '@/hooks/use-learning-categories'
import type { Category, CategorySummary, Question } from '@/lib/quiz-schema'
import { nextQuestionPath, questionPath, routes } from '@/lib/routes'
import { useProgress } from '@/stores/progress'

type Props = {
  category: Category
  summary: CategorySummary
  question: Question
  position: number
}

export const TopicQuestion: React.FC<Props> = ({
  category,
  summary,
  question,
  position,
}) => {
  const { categories } = useLearningCategories()
  const savedAnswer = useProgress((state) => state.answers[question.id])
  const answer = useProgress((state) => state.answer)
  const nextPath = nextQuestionPath(categories, category, position)
  const previous = category.questions[position - 1]
  const last = position === category.questions.length - 1
  return (
    <QuestionPractice
      question={question}
      position={position}
      savedAnswer={savedAnswer}
      onAnswer={(index) => {
        answer(category, summary.revision, question.id, index)
      }}
      backPath={previous ? questionPath(summary.id, previous.id) : routes.home}
      backLabel={previous ? 'Назад' : 'До тем'}
      nextPath={nextPath}
      {...(last
        ? {
            nextLabel:
              nextPath === routes.home ? 'До списку тем' : 'Наступна категорія',
          }
        : {})}
    />
  )
}

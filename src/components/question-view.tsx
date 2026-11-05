import { QuestionPractice } from '@/components/question-practice'
import { useLearningCategories } from '@/hooks/use-learning-categories'
import { useProgress } from '@/hooks/use-progress'
import type { Category, CategorySummary, Question } from '@/lib/quiz-schema'
import { nextQuestionPath, questionPath, routes } from '@/lib/routes'

export function QuestionView({
  category,
  summary,
  question,
  position,
}: {
  category: Category
  summary: CategorySummary
  question: Question
  position: number
}) {
  const { categories } = useLearningCategories()
  const { answers, answer } = useProgress()
  const nextPath = nextQuestionPath(categories, category, position)
  const previous = category.questions[position - 1]
  const last = position === category.questions.length - 1
  return (
    <QuestionPractice
      question={question}
      position={position}
      savedAnswer={answers[question.id]}
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

import { cn } from 'cn'
import { RotateCcw } from 'lucide-react'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'

import { AnswerExplanation } from '@/components/question-practice/answer-explanation'
import { AnswerOptions } from '@/components/question-practice/answer-options'
import { QuestionControls } from '@/components/question-practice/question-controls'
import { QuestionImage } from '@/components/question-practice/question-image'
import { Button, Card, CardContent } from '@/components/uikit'
import type { Question } from '@/lib/quiz-schema'

type Props = {
  question: Question
  position: number
  savedAnswer: { optionIndex: number; correct: boolean } | undefined
  onAnswer: (optionIndex: number) => void
  backPath: string
  backLabel: string
  nextPath: string
  nextLabel?: string
}

export const QuestionPractice: React.FC<Props> = ({
  question,
  position,
  savedAnswer,
  onAnswer,
  backPath,
  backLabel,
  nextPath,
  nextLabel,
}) => {
  const [retrying, setRetrying] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const saved = retrying ? undefined : savedAnswer

  useEffect(() => {
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section>
      <Card className="gap-0 overflow-visible rounded-2xl border border-border p-5 shadow-[0_3px_16px_-12px_rgba(0,0,0,0.15)] ring-0 sm:p-8">
        <CardContent className="px-0">
          <div
            className={cn(
              'grid gap-7',
              question.image_url
                ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10'
                : 'mx-auto max-w-3xl',
            )}
          >
            <div>
              <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                Питання {position + 1}
              </p>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-xl leading-snug font-semibold tracking-tight outline-none sm:text-2xl"
              >
                {question.question_text}
              </h1>
              {question.image_url && (
                <QuestionImage
                  path={question.image_url}
                  number={position + 1}
                />
              )}
            </div>
            <div>
              <p className="mb-3 text-xs text-muted-foreground">
                {saved
                  ? 'Твоя відповідь збережена'
                  : retrying
                    ? 'Спробуй ще раз. Обери одну відповідь.'
                    : 'Обери одну відповідь'}
              </p>
              <AnswerOptions
                question={question}
                saved={saved}
                onAnswer={(index) => {
                  onAnswer(index)
                  setRetrying(false)
                }}
              />
              {saved && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-9 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-primary"
                  onClick={() => {
                    setRetrying(true)
                  }}
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Спробувати ще раз
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        {saved && (
          <AnswerExplanation question={question} correct={saved.correct} />
        )}
        <QuestionControls
          previous={{ to: backPath, label: backLabel }}
          next={{
            to: nextPath,
            label: nextLabel ?? (saved ? 'Далі' : 'Пропустити'),
          }}
        />
      </Card>
    </section>
  )
}

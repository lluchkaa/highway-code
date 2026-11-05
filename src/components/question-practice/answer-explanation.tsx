import { cn } from 'cn'
import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react'
import type * as React from 'react'
import Markdown from 'react-markdown'

import { Alert, AlertDescription, AlertTitle } from '@/components/uikit'
import type { Question } from '@/lib/quiz-schema'

type Props = {
  question: Question
  correct: boolean
}

export const AnswerExplanation: React.FC<Props> = ({ question, correct }) => {
  const text =
    question.explanation ?? 'Пояснення для цього питання поки відсутнє.'
  return (
    <Alert
      aria-label="Результат і пояснення"
      role="status"
      variant={correct ? 'default' : 'destructive'}
      className={cn(
        'mt-7 rounded-xl p-5',
        correct
          ? 'border-success/25 bg-success/5'
          : 'border-destructive/20 bg-destructive/4',
      )}
    >
      {correct ? (
        <CheckCircle2 className="text-success" aria-hidden="true" />
      ) : (
        <XCircle aria-hidden="true" />
      )}
      <AlertTitle className={cn(correct && 'text-success')}>
        <h2>
          {correct
            ? 'Правильно! Так тримати.'
            : `Не зовсім. Правильна відповідь — ${String(question.correct_answer + 1)}.`}
        </h2>
      </AlertTitle>
      <AlertDescription className="col-span-full col-start-1 mt-4 text-foreground/85">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold">
          <Lightbulb className="size-4 text-primary" aria-hidden="true" />
          Пояснення
        </h3>
        <div className="text-sm leading-relaxed break-words text-foreground/85 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h1]:my-3 [&_h1]:font-semibold [&_h2]:my-3 [&_h2]:font-semibold [&_h3]:my-3 [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:whitespace-pre-line [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_strong]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
          <Markdown skipHtml>{text}</Markdown>
        </div>
      </AlertDescription>
    </Alert>
  )
}

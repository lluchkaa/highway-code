import { ArrowUpRight, ImageOff } from 'lucide-react'
import type * as React from 'react'
import { useState } from 'react'

import { Button } from '@/components/uikit'

type Props = {
  path: string
  number: number
}

export const QuestionImage: React.FC<Props> = ({ path, number }) => {
  const [failed, setFailed] = useState(false)
  const src = `${import.meta.env.BASE_URL}assets/questions/${path}`
  return (
    <figure className="mt-6 overflow-hidden rounded-xl border border-border bg-white">
      {failed ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 bg-muted px-5 py-8 text-center text-foreground">
          <ImageOff
            className="size-7 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm">Не вдалося завантажити ілюстрацію.</p>
          <Button
            variant="outline"
            onClick={() => {
              setFailed(false)
            }}
          >
            Спробувати ще раз
          </Button>
        </div>
      ) : (
        <img
          src={src}
          alt={`Ілюстрація дорожньої ситуації до питання ${String(number)}`}
          className="mx-auto max-h-96 w-full object-contain"
          onError={() => {
            setFailed(true)
          }}
        />
      )}
      <figcaption className="border-t border-border bg-card px-4 py-2.5">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary"
        >
          Відкрити зображення
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  )
}

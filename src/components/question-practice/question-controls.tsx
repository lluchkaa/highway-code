import { cn } from 'cn'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type * as React from 'react'
import { Link } from 'react-router'

import { buttonVariants } from '@/components/uikit'

type Props = {
  previous: { to: string; label: string }
  next: { to: string; label: string }
}

export const QuestionControls: React.FC<Props> = ({ previous, next }) => {
  return (
    <nav
      aria-label="Навігація питання"
      className="pointer-events-none sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mt-7 flex flex-wrap items-center justify-between gap-3"
    >
      <Link
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'pointer-events-auto h-11 rounded-xl bg-card px-3 shadow-lg shadow-black/15 sm:px-4 dark:bg-card dark:shadow-black/35',
        )}
        to={previous.to}
      >
        <ArrowLeft aria-hidden="true" />
        <span className="max-[360px]:sr-only">{previous.label}</span>
      </Link>
      <Link
        className={cn(
          buttonVariants(),
          'pointer-events-auto h-11 rounded-xl px-3 shadow-lg shadow-black/15 sm:px-5 dark:shadow-black/35',
        )}
        to={next.to}
      >
        {next.label}
        <ArrowRight aria-hidden="true" />
      </Link>
    </nav>
  )
}

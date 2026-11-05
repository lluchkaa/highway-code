import { cn } from 'cn'
import { Check, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'

export function QuestionNavigation({
  items,
  position,
}: {
  items: { to: string; correct: boolean | undefined }[]
  position: number
}) {
  const activeRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [position])
  return (
    <nav
      aria-label="Перехід між питаннями"
      className="sticky top-0 z-20 -mx-4 mb-7 border-y border-border/80 bg-background/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6"
    >
      <p className="mb-3 text-xs text-muted-foreground">
        Питання{' '}
        <span className="font-semibold text-foreground tabular-nums">
          {position + 1}
        </span>{' '}
        із {items.length}
      </p>
      <ol className="flex [scrollbar-width:thin] gap-2 overflow-x-auto px-0.5 pt-1 pb-2">
        {items.map((item, index) => {
          const saved = item.correct !== undefined
          const current = index === position
          const status = saved
            ? item.correct
              ? 'правильно'
              : 'з помилкою'
            : 'без відповіді'
          return (
            <li key={item.to} className="shrink-0">
              <Link
                ref={current ? activeRef : undefined}
                to={item.to}
                aria-label={`Питання ${String(index + 1)}: ${status}`}
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'relative grid size-10 place-items-center rounded-lg border text-xs font-medium tabular-nums transition-colors',
                  current
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : saved
                      ? item.correct
                        ? 'border-success/25 bg-success/8 text-success hover:bg-success/15'
                        : 'border-destructive/25 bg-destructive/8 text-destructive hover:bg-destructive/15'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {index + 1}
                {saved && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 grid size-3.5 place-items-center rounded-full border border-background',
                      item.correct
                        ? 'bg-success text-card'
                        : 'bg-destructive text-card',
                    )}
                  >
                    {item.correct ? (
                      <Check className="size-2.5" aria-hidden="true" />
                    ) : (
                      <X className="size-2.5" aria-hidden="true" />
                    )}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

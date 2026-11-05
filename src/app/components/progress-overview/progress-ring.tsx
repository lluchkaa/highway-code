import type * as React from 'react'

type Props = { value: number; total: number }

export const ProgressRing: React.FC<Props> = ({ value, total }) => {
  const ratio = total === 0 ? 0 : value / total
  const percentage = Math.round(ratio * 100)
  const circumference = 2 * Math.PI * 45
  return (
    <div
      className="relative size-28 shrink-0"
      role="img"
      aria-label={`Відповіді на ${String(percentage)}% питань`}
    >
      <svg
        viewBox="0 0 104 104"
        className="size-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="52"
          cy="52"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-primary/10"
        />
        <circle
          cx="52"
          cy="52"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(ratio, 1))}
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {percentage}%
        </span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">
          пройдено
        </span>
      </div>
    </div>
  )
}

import type * as React from 'react'
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/uikit'

const chartConfig = { progress: { label: 'Пройдено', color: 'var(--primary)' } }

type Props = { value: number; total: number }

export const ProgressRing: React.FC<Props> = ({ value, total }) => {
  const percentage =
    total === 0 ? 0 : Math.round(Math.min(value / total, 1) * 100)
  return (
    <div
      className="relative size-24 shrink-0 sm:size-28"
      role="img"
      aria-label={`Відповіді на ${String(percentage)}% питань (${String(value)} із ${String(total)})`}
    >
      <ChartContainer
        config={chartConfig}
        className="aspect-square size-24 sm:size-28"
        initialDimension={{ width: 112, height: 112 }}
      >
        <RadialBarChart
          data={[{ progress: percentage, fill: 'var(--color-progress)' }]}
          startAngle={90}
          endAngle={-270}
          innerRadius="78%"
          outerRadius="100%"
          accessibilityLayer={false}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="progress"
            background
            cornerRadius={8}
            isAnimationActive={false}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={() => `${String(value)} із ${String(total)} питань`}
              />
            }
          />
        </RadialBarChart>
      </ChartContainer>
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        aria-hidden="true"
      >
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

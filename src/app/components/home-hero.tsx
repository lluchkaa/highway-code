import { ArrowDown, Check, ShieldCheck, Sparkles } from 'lucide-react'
import type * as React from 'react'

import { Badge, Button } from '@/components/uikit'

type Props = { total: number }

export const HomeHero: React.FC<Props> = ({ total }) => {
  return (
    <div className="min-w-0">
      <Badge
        variant="secondary"
        className="mb-5 h-7 gap-1.5 px-3 text-[10px] font-semibold tracking-wider uppercase"
      >
        <Sparkles className="size-3" aria-hidden="true" /> Твій шлях до
        впевненого водіння
      </Badge>
      <h1 className="text-[clamp(2.1rem,4.5vw,3.5rem)] leading-[1.13] font-semibold tracking-[-0.045em]">
        Вивчай правила.
        <br />
        <span className="text-primary">Відчувай впевненість.</span>
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
        Розбирай дорожні ситуації, вчися на помилках і рухайся вперед. Одне
        питання за раз.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Check className="size-3.5 text-primary" aria-hidden="true" />{' '}
          {total.toLocaleString('uk')} питань
        </span>
        <span aria-hidden="true" className="text-border">
          /
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="size-3.5 text-primary" aria-hidden="true" /> Без
          таймера
        </span>
        <span aria-hidden="true" className="text-border">
          /
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />{' '}
          Без реєстрації
        </span>
      </div>
      <Button
        onClick={() => {
          document
            .getElementById('topics')
            ?.scrollIntoView({ behavior: 'smooth' })
        }}
        className="mt-8 h-11 gap-3 rounded-xl px-5"
      >
        Обрати тему
        <ArrowDown className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}

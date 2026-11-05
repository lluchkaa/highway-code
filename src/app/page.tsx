import type * as React from 'react'

import { HomeHero } from '@/app/components/home-hero'
import { LicenceSelector } from '@/app/components/licence-selector'
import { ProgressOverview } from '@/app/components/progress-overview'
import { RandomPracticeCard } from '@/app/components/random-practice-card'
import { TopicBrowser } from '@/app/components/topic-browser'
import { PageHead } from '@/components/page-head'
import { useLearningCategories } from '@/hooks/use-learning-categories'

export const HomePage: React.FC = () => {
  const { categories, licences, setLicences } = useLearningCategories()
  const total = categories.reduce(
    (count, category) => count + category.questionCount,
    0,
  )
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHead
        title="Вивчай правила у своєму темпі"
        description={`${String(categories.length)} тема та ${String(total)} питань з правил дорожнього руху України. Практикуйся з поясненнями та зберігай прогрес у браузері.`}
      />
      <section className="grid items-center gap-9 pb-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:pb-16">
        <HomeHero total={total} />
        <ProgressOverview categories={categories} />
      </section>

      <section
        id="topics"
        className="scroll-mt-6 border-t border-border/80 pt-9"
      >
        <LicenceSelector licences={licences} onChange={setLicences} />
        <RandomPracticeCard />
        <TopicBrowser categories={categories} />
      </section>
    </main>
  )
}

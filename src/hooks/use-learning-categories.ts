import { useStore } from 'zustand'

import { useCatalog } from '@/hooks/use-catalog'
import { learningCategories } from '@/lib/licence-categories'
import { learningStore } from '@/stores/learning'

export function useLearningCategories() {
  const catalog = useCatalog()
  const licences = useStore(learningStore, (state) => state.licences)
  const setLicences = useStore(learningStore, (state) => state.setLicences)

  return {
    licences,
    setLicences,
    categories: learningCategories(catalog, licences),
  }
}

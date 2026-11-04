import { useLoaderData } from 'react-router'

import type { questionLoader } from '@/lib/question-loader'

export function useQuestion() {
  return useLoaderData<typeof questionLoader>()
}

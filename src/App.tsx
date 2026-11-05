import type * as React from 'react'

import { AppRouter } from '@/app/router'
import { useThemeSync } from '@/stores/theme'

const App: React.FC = () => {
  useThemeSync()
  return <AppRouter />
}

export default App

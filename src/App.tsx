import { AppRouter } from '@/components/app-router'
import { useThemeSync } from '@/hooks/use-theme'

function App() {
  useThemeSync()
  return <AppRouter />
}

export default App

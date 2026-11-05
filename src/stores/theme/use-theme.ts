import { useLayoutEffect } from 'react'
import { useStore } from 'zustand'

import { themeStore } from '@/stores/theme/store'

export function useTheme() {
  const theme = useStore(themeStore, (state) => state.theme)
  const setTheme = useStore(themeStore, (state) => state.setTheme)
  return { theme, setTheme }
}

export function useThemeSync() {
  const { theme } = useTheme()
  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function updateTheme() {
      document.documentElement.dataset.theme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.style.colorScheme =
        theme === 'system' ? 'light dark' : theme
    }
    updateTheme()
    media.addEventListener('change', updateTheme)
    return () => {
      media.removeEventListener('change', updateTheme)
    }
  }, [theme])
}

import { Monitor, Moon, Sun } from 'lucide-react'
import type * as React from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uikit'
import { useTheme } from '@/stores/theme'

const themes = [
  { value: 'system', label: 'Як у системі', icon: Monitor },
  { value: 'light', label: 'Світла', icon: Sun },
  { value: 'dark', label: 'Темна', icon: Moon },
]

export const ThemeSelect: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const Icon = themes.find((item) => item.value === theme)?.icon ?? Monitor
  return (
    <Select value={theme} onValueChange={setTheme} items={themes}>
      <SelectTrigger
        aria-label="Тема оформлення"
        className="h-10 gap-2 rounded-full bg-card px-3 text-xs"
      >
        <Icon className="size-4" aria-hidden="true" />
        <span className="hidden sm:flex">
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false}>
        {themes.map(({ value, label, icon: ItemIcon }) => (
          <SelectItem
            key={value}
            value={value}
            className="min-h-10 px-3 text-xs"
          >
            <ItemIcon aria-hidden="true" />
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

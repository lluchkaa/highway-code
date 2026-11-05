import { RotateCcw } from 'lucide-react'
import type * as React from 'react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@/components/uikit'

type Props = {
  scope: 'category' | 'all'
  disabled?: boolean
  onReset: () => void
}

export const ResetProgressDialog: React.FC<Props> = ({
  scope,
  disabled = false,
  onReset,
}) => {
  const [open, setOpen] = useState(false)
  const all = scope === 'all'
  const label = all ? 'Скинути весь прогрес' : 'Скинути прогрес теми'
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-muted-foreground"
            disabled={disabled}
            aria-label={label}
          />
        }
      >
        <RotateCcw aria-hidden="true" />
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2rem)]">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <RotateCcw aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {all ? 'Скинути весь прогрес?' : 'Почати тему з чистого аркуша?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {all
              ? 'Усі збережені відповіді та позиції в темах буде видалено. Цю дію неможливо скасувати.'
              : 'Відповіді та збережену позицію в цій темі буде видалено. Прогрес в інших темах залишиться.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-10">
            Залишити прогрес
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="min-h-10"
            onClick={() => {
              onReset()
              setOpen(false)
            }}
          >
            Так, скинути
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

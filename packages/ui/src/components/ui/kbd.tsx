import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * An inline label for a keyboard key or shortcut.
 *
 * Renders a native `<kbd>`, so a screen reader can identify it as input the
 * reader types rather than as text to read. Use one element per key.
 */
function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'bg-muted text-muted-foreground pointer-events-none inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none',
        className,
      )}
      {...props}
    />
  )
}

export { Kbd }

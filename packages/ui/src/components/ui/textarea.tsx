import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The multi-line text control.
 *
 * Renders a native `<textarea>` with a minimum height and a vertical resize
 * grip. Like `Input`, it draws the focus ring at full strength and marks an
 * invalid field through `aria-invalid`.
 */
function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input bg-background text-foreground placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] duration-fast ease-out outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }

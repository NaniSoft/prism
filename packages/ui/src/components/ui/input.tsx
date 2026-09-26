import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The single-line text control.
 *
 * Renders a native `<input>`, so it submits, validates and takes focus without
 * extra work. The focus ring is drawn at full strength, and `aria-invalid`
 * switches the border and ring to the destructive token so a failed field is
 * visible as well as announced.
 */
function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input bg-background text-foreground selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] duration-fast ease-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }

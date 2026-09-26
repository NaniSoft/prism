import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent',
        secondary: 'bg-secondary text-secondary-foreground border-transparent',
        destructive: 'bg-destructive text-destructive-foreground border-transparent',
        success: 'bg-success text-success-foreground border-transparent',
        warning: 'bg-warning text-warning-foreground border-transparent',
        outline: 'text-foreground border-border',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

/**
 * A compact status or category label.
 *
 * Renders a `<span>`; `variant` selects the surface treatment and the default
 * is the filled primary style.
 */
function Badge({
  className,
  variant,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }

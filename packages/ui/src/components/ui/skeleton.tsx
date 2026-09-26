import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * A placeholder surface that mirrors the shape of content while it loads.
 *
 * It ships without a shimmer on purpose. Prism authors no keyframes, so the
 * placeholder is a static muted block and the shape, not a pulse, is what tells
 * the reader content is coming. Set its size with `className`, which is layout
 * and therefore permitted.
 */
function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('bg-muted rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }

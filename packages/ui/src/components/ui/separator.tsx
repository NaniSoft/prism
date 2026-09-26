import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * A hairline rule that divides content.
 *
 * `orientation` is `horizontal` (default) or `vertical`. The rule is decorative
 * by default, so it is hidden from assistive technology; pass
 * `decorative={false}` when the rule expresses a real separation in a set of
 * controls, which turns it into an ARIA separator with the matching
 * orientation.
 */
function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }

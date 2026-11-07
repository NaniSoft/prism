import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

/** The gaps a layout background may be drawn at, as authored spacing. */
export type DSStackGap = 'xs' | 'sm' | 'md' | 'lg'

const GAP_CLASS: Record<DSStackGap, string> = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-8',
}

/** The props the DSStack accepts. */
export interface DSStackProps extends ComponentProps<'div'> {
  /** The gap between the children. @defaultValue 'md' */
  gap?: DSStackGap
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A column that holds its own gap.
 *
 * **The gap is a step and not a number.** A caller who can state a pixel gap
 * has a rhythm nobody authored, and CSS that stacks it by hand is the copy the
 * consumer stylesheets grew to hold. Four steps bound the arrangement to the
 * spacing scale, so a stack a consumer draws at 13px is a stack nobody let
 * them draw.
 *
 * It is a server Component. It holds no state and reads nothing, so a page of
 * stacks costs no JavaScript.
 */
function DSStack({ gap = 'md', className, ...props }: DSStackProps) {
  return <div data-slot="ds-stack" className={cn('flex flex-col', GAP_CLASS[gap], className)} {...props} />
}

export { DSStack }

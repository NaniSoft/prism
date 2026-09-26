import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  // The focus ring is `ring-ring` at full strength, not shadcn's stock
  // `focus-visible:ring-ring/50`. The token build pins `--ring` to a step that
  // clears 3:1 against the surface, and half alpha throws that away: 50% of this
  // ring composites to between 1.14:1 and 2.74:1 against every surface in all
  // six themes and clears 3:1 in none of them, which fails WCAG 1.4.11 on the one
  // indicator a keyboard user has. The stock value is kept here deliberately as a
  // deviation from upstream: a consumer's button must not fail the threshold the
  // ring exists to meet.
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium outline-none transition-[color,box-shadow,background-color] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        // `primary` is a surface token, not a text token: in the pastel themes it
        // compiles to a light tint (e.g. #ec88a0) that fails 4.5:1 on the page
        // background. Link text uses the foreground and keeps the underline as its
        // affordance, so emphasis comes from weight rather than a failing colour.
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      // Touch targets are enlarged by input method, not by viewport. The
      // metrics below are the designed desktop sizes and stay untouched for
      // mouse and trackpad; only a coarse pointer — finger or stylus — gets
      // the 44px iOS/Android HIG target. `pointer-coarse:` compiles to
      // `@media (pointer: coarse)` inside `@layer utilities`, which lands
      // after the base utility in the cascade, so it wins without needing
      // `!important` or a specificity fight.
      //
      // `min-w-11` is what makes the second axis safe: an icon-only `default`
      // is `size-4` plus `px-3` = 40px wide and an icon-only `sm` is `size-4`
      // plus `px-2.5` = 36px, so growing the height alone would still leave
      // both under 44px across. The coarse padding step on `default` lifts the
      // common cases clear of the floor outright, and `min-w-11` backstops
      // whatever content a consumer passes.
      size: {
        default:
          'h-9 px-4 py-2 has-[>svg]:px-3 pointer-coarse:h-11 pointer-coarse:min-w-11 pointer-coarse:px-5 pointer-coarse:has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5 pointer-coarse:h-11 pointer-coarse:min-w-11',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4 pointer-coarse:h-11',
        icon: 'size-9 pointer-coarse:size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/**
 * The primary action control.
 *
 * Renders a native `<button>` and takes the standard React button props plus
 * `variant` and `size`. The coarse-pointer media query grows the target to 44px
 * on touch input without changing the desktop metrics.
 */
function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }

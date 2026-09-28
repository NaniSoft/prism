import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/*
 * Why this is a second Component rather than an `as` or `href` prop on `Button`.
 * The design system has already answered this twice, in the two places a trail
 * of links and a list of page links each needed both a non-link slot and a link
 * slot: `BreadcrumbItem` renders an `<li>` and `BreadcrumbLink` renders an
 * `<a>` (`src/components/ui/breadcrumb.tsx`), and `PaginationItem` renders an
 * `<li>` and `PaginationLink` renders an `<a>`
 * (`src/components/ui/pagination.tsx`). Both wrote a second export rather than
 * widening one element into a prop, and both are the shape this Component takes.
 * A polymorphic `as` would make the rendered element a runtime value that only
 * the reader of the call site knows, which is exactly the disagreement between a
 * type and a screen this ticket closes. It also costs nothing: both halves of
 * that pair are server components, so the swap adds no client JavaScript.
 *
 * The recipe is written here rather than imported from `button.tsx`, because
 * `buttonVariants` is module-internal and DESIGN.md keeps a raw variant map off
 * the export surface: "There is no variant recipe on the surface." The base
 * string and every shared variant below are therefore kept deliberately
 * identical to `buttonVariants`, so swapping `Button` for `CtaLink` changes the
 * element and the destination and nothing else on screen. If one recipe moves,
 * the other moves with it.
 */
const ctaLinkVariants = cva(
  // The focus ring is `ring-ring` at full strength, for the reason
  // `button.tsx` states at length: half alpha composites to between 1.14:1 and
  // 2.74:1 against every surface in all six themes and clears 3:1 in none of
  // them, which fails WCAG 1.4.11 on the one indicator a keyboard user has.
  //
  // Two utilities are dropped from the button base, and each is dropped for a
  // reason rather than by omission. `aria-invalid:*` is a form-control state and
  // an anchor has no invalid state. `disabled:*` is likewise a button state: an
  // anchor with a destination always navigates, and a control that should not
  // navigate is not a call to action.
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium outline-none transition-[color,box-shadow,background-color] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      // The desktop metrics and the coarse-pointer 44px step are `Button`'s, for
      // the reason `button.tsx` states: the target grows with the input method
      // and not with the viewport, so a phone-sized metric never ships to a
      // mouse. An `icon` size is absent because a call to action carries a label.
      size: {
        default:
          'h-9 px-4 py-2 has-[>svg]:px-3 pointer-coarse:h-11 pointer-coarse:min-w-11 pointer-coarse:px-5 pointer-coarse:has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5 pointer-coarse:h-11 pointer-coarse:min-w-11',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4 pointer-coarse:h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type CtaLinkProps = Omit<ComponentProps<'a'>, 'href' | 'target'> &
  VariantProps<typeof ctaLinkVariants> & {
    /**
     * The destination. Required, because an anchor without one is not a link: a
     * screen reader announces no destination, the middle-click and open-in-new-tab
     * affordances go quiet, and the control is a button that cannot act.
     */
    href: string
    /**
     * Opens the destination in a new browsing context. This is the only way to
     * ask for one: `target` is not accepted, so the safe relationship below
     * cannot be opted out of by accident.
     *
     * Prism does not decide what counts as external. A destination on another
     * origin is not automatically a new tab, and a destination on this origin is
     * not automatically the same tab, so the caller declares it.
     */
    newTab?: boolean
  }

/**
 * The call to action that goes somewhere.
 *
 * Renders a native `<a>`, so assistive technology announces a link and the
 * browser's own link affordances all work: a status bar showing the destination,
 * a context menu to copy it, middle-click to open a new tab. `Button` cannot
 * offer any of that, and a call to action that is a button is announced as a
 * command that does nothing.
 *
 * It is a Component in its own right rather than a mode of `Button`, which is the
 * answer `BreadcrumbLink` and `PaginationLink` already give twice in this
 * package. The two carry the same visual weight as the button they replace, so
 * the only difference on screen is that this one has a destination.
 *
 * When `newTab` is set, `rel` defaults to `noopener noreferrer`, so the opened
 * document cannot reach back through `window.opener` or read the referrer. A
 * consumer that needs a different relationship passes `rel` and it wins.
 */
function CtaLink({
  className,
  variant,
  size,
  href,
  newTab = false,
  rel,
  ...props
}: CtaLinkProps) {
  return (
    <a
      data-slot="cta-link"
      href={href}
      rel={rel ?? (newTab ? 'noopener noreferrer' : undefined)}
      target={newTab ? '_blank' : undefined}
      className={cn(ctaLinkVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { CtaLink }

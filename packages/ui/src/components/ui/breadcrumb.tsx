import { ChevronRight } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The trail of ancestor links that shows where the current page sits.
 *
 * The root is a `<nav>` with an accessible name so the trail is announced as
 * one region rather than as an unexplained list of links.
 */
function Breadcrumb({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

/** The ordered list that holds the trail's items and separators. */
function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5',
        className,
      )}
      {...props}
    />
  )
}

/** One step in the trail. Holds a link, the current page, or a separator. */
function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
}

/**
 * A link to an ancestor page.
 *
 * Renders a native `<a>`; pass `href`. The consumer owns the destination, so a
 * client router's link is composed here rather than baked in.
 */
function BreadcrumbLink({ className, ...props }: ComponentProps<'a'>) {
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn(
        'hover:text-foreground rounded-sm outline-none transition-colors duration-fast ease-out focus-visible:ring-ring focus-visible:ring-[3px]',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The current page, which is text rather than a link.
 *
 * It carries `aria-current="page"` so assistive technology announces the trail's
 * end instead of reading a dead link.
 */
function BreadcrumbPage({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn('text-foreground font-normal', className)}
      {...props}
    />
  )
}

/**
 * The mark between two steps.
 *
 * Decorative by default, so it is hidden from assistive technology and does not
 * enter the accessible name; pass `children` to replace the chevron.
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}

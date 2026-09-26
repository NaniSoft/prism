import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

type PaginationSize = 'default' | 'sm' | 'lg' | 'icon'

/**
 * The control that moves between pages of a paged collection.
 *
 * The root is a `<nav>` with an accessible name, so the page links are grouped
 * as one navigation region.
 */
function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

/** The list that holds the page links. */
function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
}

/** One slot in the list: a page link, a step control or an ellipsis. */
function PaginationItem({ className, ...props }: ComponentProps<'li'>) {
  return <li data-slot="pagination-item" className={cn(className)} {...props} />
}

/**
 * A link to one page.
 *
 * Renders a native `<a>`; set `isActive` on the current page so it is marked
 * with `aria-current="page"`.
 */
function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: ComponentProps<'a'> & { isActive?: boolean; size?: PaginationSize }) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive ? 'true' : undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap outline-none transition-colors duration-fast ease-out focus-visible:ring-ring focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50',
        size === 'default' && 'h-9 px-4 py-2',
        size === 'sm' && 'h-8 px-3',
        size === 'lg' && 'h-10 px-6',
        size === 'icon' && 'size-9',
        isActive
          ? 'border-border bg-background text-foreground border'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

/** The step back to the previous page, with a hidden label on narrow layouts. */
function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to the previous page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeft />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

/** The step forward to the next page, with a hidden label on narrow layouts. */
function PaginationNext({
  className,
  text = 'Next',
  ...props
}: ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to the next page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRight />
    </PaginationLink>
  )
}

/**
 * A held-back run of page numbers.
 *
 * It is hidden from assistive technology because the page links around it
 * already name the range, and it is not focusable.
 */
function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden="true"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}

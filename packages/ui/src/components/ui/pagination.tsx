import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

type PaginationSize = 'default' | 'sm' | 'lg' | 'icon'

/**
 * The control that moves between pages of a paged collection.
 *
 * The root is a `<nav>` with an accessible name, so the page links are grouped
 * as one navigation region. The name is a prop and the default is the word Prism
 * would have used: a product that calls its paging something else announces the
 * wrong region to a screen reader, and the default is a convenience rather than
 * the right answer for a consumer whose product is not a generic library.
 */
function Pagination({
  className,
  label = 'Pagination',
  ...props
}: ComponentProps<'nav'> & { label?: string }) {
  return (
    <nav
      aria-label={label}
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
 *
 * **The coarse-pointer floor, and it is a step with `min-w-11` beside it, which is
 * the arrangement `button.tsx` states.** Every size here is a height, and the width of
 * a page link is its content: a one-digit link at `h-11` with `px-3` is 20 pixels
 * wide, so growing the height alone would leave it under the floor across. The three
 * sized arms therefore take `pointer-coarse:h-11 pointer-coarse:min-w-11` and the
 * `icon` arm takes `pointer-coarse:size-11`, which is the same split `Button` makes
 * between its content-sized and icon sizes.
 *
 * The consequence worth stating: `PaginationPrevious` and `PaginationNext` pass
 * `size="default"` and override the padding to `px-2.5`, so on a phone they are an
 * icon and a hidden word. Their width comes from the content and is under 44 without
 * `min-w-11`, which is why it is here rather than only on the `icon` arm.
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
        size === 'default' && 'h-9 px-4 py-2 pointer-coarse:h-11 pointer-coarse:min-w-11',
        size === 'sm' && 'h-8 px-3 pointer-coarse:h-11 pointer-coarse:min-w-11',
        size === 'lg' && 'h-10 px-6 pointer-coarse:h-11 pointer-coarse:min-w-11',
        size === 'icon' && 'size-9 pointer-coarse:size-11',
        isActive
          ? 'border-border bg-background text-foreground border'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The step back to the previous page, with a hidden label on narrow layouts.
 *
 * `text` and `label` are separate props and they move together or not at all: a
 * caller that localises the visible word and not the announced one gets a control
 * that looks localised and is half of it, which is the state this shape was
 * written to end. Both default to the word Prism would have used.
 */
function PaginationPrevious({
  className,
  text = 'Previous',
  label = 'Go to the previous page',
  ...props
}: ComponentProps<typeof PaginationLink> & { text?: string; label?: string }) {
  return (
    <PaginationLink
      aria-label={label}
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeft />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

/**
 * The step forward to the next page, with a hidden label on narrow layouts.
 *
 * `text` and `label` move together for the reason `PaginationPrevious` states.
 */
function PaginationNext({
  className,
  text = 'Next',
  label = 'Go to the next page',
  ...props
}: ComponentProps<typeof PaginationLink> & { text?: string; label?: string }) {
  return (
    <PaginationLink
      aria-label={label}
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
 *
 * **The coarse-pointer floor is deliberately absent here, and the reason is worth
 * stating because this element is 36px square and looks like every other finding in
 * this sweep.** It is a `<span aria-hidden="true">`: it is not a target, it takes no
 * focus, it is announced by nothing, and a press on it falls through to the page
 * behind it. Growing it would move the ellipsis three pixels and pay the floor on
 * something no reader is aiming at. The links on either side of it are the targets
 * and they take the floor in `PaginationLink`. The floor is a claim about targets a
 * finger is asked to hit, and this is not one. See DESIGN.md, The coarse-pointer floor.
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

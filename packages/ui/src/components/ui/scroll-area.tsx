'use client'

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** Which axis the region is expected to scroll on. */
export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'

/** The props the ScrollArea accepts. */
export interface ScrollAreaProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * The content the region scrolls through.
   *
   * Ordinary children, not a render prop and not a measured height. A consumer
   * sizes the region from the outside with `className` and puts whatever they like
   * inside, which is the arrangement that lets a region hold a table, a list of
   * anything, or a form.
   */
  children?: ReactNode
  /**
   * Which scrollbars to draw.
   *
   * `both` is the default rather than `vertical` because a region that overflows
   * on an axis nobody asked about is still a region a reader has to be able to
   * scroll on that axis, and a scrollbar that is missing is a scrollbar that has
   * to be found in the browser's own chrome, which is the thing this Component
   * exists to replace. Pass `vertical` when the content is known never to scroll
   * sideways, and the horizontal bar is not drawn at all.
   */
  orientation?: ScrollAreaOrientation
  /**
   * Keeps the scrollbar in the DOM when the region has nothing to scroll.
   *
   * Off by default, and that default is the decision: a region with nothing to
   * scroll has no scroll position, so a bar drawn beside it is a claim that there
   * is something past the edge. Turn it on only where a region is expected to
   * grow and the reader should see the affordance before the content arrives.
   */
  keepMounted?: boolean
  /**
   * The accessible name of the region.
   *
   * Required rather than defaulted. A scroll region with no name is announced as
   * a group of focusable nothing, and a page with three of them is a page where a
   * keyboard reader tabs into a region and cannot tell what is in it or what is
   * past the edge. The name is the caller's word.
   */
  label: string
  /** Layout only. */
  className?: string
}

/**
 * A scrollable region whose scrollbar belongs to this design system.
 *
 * **The browser's scrollbar is the one piece of a page that belongs to no design
 * system at all.** Every other surface a consumer draws is a token from here, and
 * the scrollbar beside it is a rectangle the operating system drew, in a colour
 * chosen for the OS's own background rather than for the card the content is on.
 * It is also the only control on a page that is resized by dragging, and the only
 * one that appears and disappears on a timer, so the browser's version is the one
 * control a design system cannot restyle at all. This is where the package takes
 * it over, and it is worth saying plainly that the native scrollbar is not
 * available to restyle: `::-webkit-scrollbar` is one engine, `scrollbar-width` is
 * two values, and neither can express a track and a thumb in tokens.
 *
 * **The scrolling is still the browser's.** This is the decision that matters most
 * and the one worth arguing with, so here is the argument. The tempting version of
 * this Component is a `div` with `overflow: hidden` whose content is moved by a
 * transform on a wheel handler, with a `div` above it pretending to be a
 * scrollbar. That version has no scroll position at all, so there is nothing for
 * a keyboard to move, nothing for a screen reader to announce, no momentum, no
 * scroll-into-view, and no way for a reader to know how far through they are. A
 * custom scrollbar that is a `div` is worse than the browser's, because the browser
 * gives a reader all of that for free and the `div` version takes it away.
 *
 * So the region here is a real scrollable element in the document: the browser
 * scrolls it, the browser gives it keyboard focus when it overflows, the arrow
 * keys, Page Up, Page Down, Home and End all work because it is a scroll
 * container and not a picture of one. Only the appearance of the bar is taken
 * over, and the bar is a real control layered over the native one rather than a
 * replacement for the scrolling.
 *
 * **A native scrollbar cannot be styled, so this one is a sibling of the scroll
 * container rather than a part of it.** That is the whole reason a consumer cannot
 * assemble this from `overflow-auto` and a coloured box, and it is why the region
 * is a named landmark: a scrollable region that a keyboard reader can tab into and
 * that has no name is a tab stop that says nothing. The name is a prop.
 *
 * **A region with nothing to scroll draws no scrollbar.** Not a disabled one and
 * not a faint one: a bar beside a region with no overflow is a claim that there is
 * something past the edge, and a reader who is told that twice loses trust in the
 * third bar they meet. The bar is absent, and a caller who wants it present before
 * the content arrives says so with `keepMounted`.
 *
 * It is a client Component, because measuring overflow and positioning a thumb is
 * a measurement and a measurement is not something a server can do. Everything it
 * draws is a semantic utility, so a scoped pack boundary restyles the thumb and the
 * track through the cascade exactly as it restyles the text beside them.
 */
function ScrollArea({
  className,
  children,
  orientation = 'both',
  keepMounted = false,
  label,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative', className)}
      {...props}
    >
      {/*
       * The scrollable element itself. `role="group"` with the caller's name is
       * what makes tabbing into it say what is in it, and it is the region rather
       * than the bar that carries the name: the bar is a control over the region,
       * so a name on the bar would name the control and leave the content
       * anonymous.
       */}
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        role="group"
        aria-label={label}
        className={cn(
          'size-full overscroll-contain rounded-[inherit] focus-visible:ring-ring outline-none focus-visible:ring-[3px]',
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {orientation === 'horizontal' ? null : (
        <ScrollAreaPrimitive.Scrollbar
          data-slot="scroll-area-scrollbar"
          orientation="vertical"
          keepMounted={keepMounted}
          /*
           * Transparent until there is something to scroll, then visible on its
           * own, while the pointer is over the region, and while it is being
           * scrolled. The `bg-transparent` is a declared absence rather than a
           * missing class: the track is the surface the content is already on, so
           * drawing one would put a second surface between the reader and the
           * content for no information. The thumb is the only part that carries
           * ink, and it is `bg-border` at rest and the full muted ink on hover and
           * during a scroll, so it is visible against a light card and a dark one
           * without a value that belongs to neither.
           */
          className="flex w-2 touch-none select-none p-px opacity-0 transition-opacity duration-fast ease-out data-[has-overflow-y]:opacity-100 data-[hovering]:opacity-100 data-[scrolling]:opacity-100"
        >
          <ScrollAreaPrimitive.Thumb
            data-slot="scroll-area-thumb"
            className="bg-border relative flex-1 rounded-full transition-colors duration-fast ease-out data-[hovering]:bg-muted-foreground data-[scrolling]:bg-muted-foreground"
          />
        </ScrollAreaPrimitive.Scrollbar>
      )}

      {orientation === 'vertical' ? null : (
        <ScrollAreaPrimitive.Scrollbar
          data-slot="scroll-area-scrollbar"
          orientation="horizontal"
          keepMounted={keepMounted}
          className="flex h-2 touch-none select-none flex-col p-px opacity-0 transition-opacity duration-fast ease-out data-[has-overflow-x]:opacity-100 data-[hovering]:opacity-100 data-[scrolling]:opacity-100"
        >
          <ScrollAreaPrimitive.Thumb
            data-slot="scroll-area-thumb"
            className="bg-border relative flex-1 rounded-full transition-colors duration-fast ease-out data-[hovering]:bg-muted-foreground data-[scrolling]:bg-muted-foreground"
          />
        </ScrollAreaPrimitive.Scrollbar>
      )}
    </ScrollAreaPrimitive.Root>
  )
}

export { ScrollArea }

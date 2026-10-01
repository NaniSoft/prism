'use client'

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import { XIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The edges a Drawer may be anchored to, and why there are three of them.
 *
 * `top` is not on this list and that is a decision rather than an omission. A
 * panel that arrives from above the reader is a shade rather than a task
 * surface, and the gesture that dismisses it is a pull towards the thing the
 * reader was already looking at, which is the opposite of a dismissal. A Sheet
 * carries all four edges because a Sheet has no gesture and the top edge is a
 * legitimate place for a filter set. Exported because the union is the whole of
 * what `DrawerContent` accepts and a caller building a wrapper wants to name it
 * rather than repeat it.
 */
export type DrawerSide = 'bottom' | 'left' | 'right'

/**
 * The props the Drawer root forwards to its Base UI root.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam, which is the same rule `Dialog` states.
 */
export interface DrawerProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled drawer. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /**
   * Whether the drawer is modal.
   *
   * `true` traps focus inside the panel, locks page scroll and makes the rest of
   * the document inert to the pointer. `'trap-focus'` traps focus and leaves the
   * page scrollable, which is the arrangement for a panel the reader has to be
   * able to scroll away from. `false` closes nothing and traps nothing, and is
   * for a panel sitting beside live work on a wide viewport.
   *
   * @defaultValue true
   */
  modal?: boolean | 'trap-focus'
  /** The trigger and the panel. */
  children?: React.ReactNode
}

/** The props the DrawerTrigger forwards to Base UI. */
export interface DrawerTriggerProps extends ComponentProps<'button'> {}

/**
 * The props the DrawerContent forwards to Base UI.
 *
 * `side` is not defaulted, for the reason `SheetContent` does not default
 * `side`: a panel has an edge and the edge is a decision the caller has to make.
 * Base UI's own default is the bottom sheet, which is a good default for Base UI
 * and the wrong one here, because a default nobody chose is how a side panel
 * arrives as a bottom sheet in a product that believes it shipped a drawer on
 * the right.
 */
export interface DrawerContentProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Which edge of the viewport the panel is anchored to. */
  side: DrawerSide
  /**
   * Whether the built-in close control is rendered. @defaultValue true
   *
   * On by default even though the panel can be dismissed by a drag, because the
   * drag is not available to everyone: a reader with a switch device, a keyboard
   * and no pointer gets the grip as a decorative bar, and a panel whose only
   * visible way out is that bar is a panel some readers cannot leave.
   */
  showCloseButton?: boolean
  /**
   * The accessible name of the built-in close control, and required.
   *
   * Required rather than defaulted, on the reasoning `Lightbox` states at
   * length: a hardcoded accessible name is a sentence a consumer cannot
   * localise, so a product in any language but English inherits an English
   * control in the middle of its own interface, and the only fix is a fork. It
   * is required even when `showCloseButton` is false, which looks like friction
   * and is the same friction `Lightbox` accepts: a required prop is a question
   * asked at build time, and an optional one is a question nobody asks. It also
   * keeps the prop set stable, so turning the control on later is not a breaking
   * change.
   */
  closeLabel: string
  /** The panel's own contents. */
  children?: React.ReactNode
}

/** The props DrawerHeader forwards to a plain container. */
export interface DrawerHeaderProps extends ComponentProps<'div'> {}

/** The props DrawerBody forwards to a plain container. */
export interface DrawerBodyProps extends ComponentProps<'div'> {}

/** The props DrawerFooter forwards to a plain container. */
export interface DrawerFooterProps extends ComponentProps<'div'> {}

/** The props DrawerTitle forwards to Base UI. */
export interface DrawerTitleProps extends ComponentProps<'h2'> {}

/** The props DrawerDescription forwards to Base UI. */
export interface DrawerDescriptionProps extends ComponentProps<'p'> {}

/** The props DrawerHandle forwards to a plain container. */
export interface DrawerHandleProps extends ComponentProps<'div'> {}

/** The props DrawerClose forwards to Base UI. */
export interface DrawerCloseProps extends ComponentProps<'button'> {}

/**
 * The layer the panel is placed in, per edge, and the only thing an edge changes
 * about it.
 *
 * A viewport is a fixed inset with a flex alignment, so the panel's own class
 * never has to know how it is centred. That keeps the per-edge record to two
 * facts, an alignment and a direction, and it means a caller adding an edge adds
 * one entry here rather than reasoning about three breakpoints.
 */
const VIEWPORT: Record<DrawerSide, string> = {
  bottom: 'fixed inset-0 z-50 flex items-end justify-center',
  left: 'fixed inset-0 z-50 flex items-stretch',
  right: 'fixed inset-0 z-50 flex items-stretch justify-end',
}

/**
 * The panel's shape and its resting transform, per edge.
 *
 * **The transform reads the swipe movement variable rather than being a fixed
 * offset, because the movement is written by the gesture and the panel has to
 * follow the finger that is moving it.** Base UI writes
 * `--drawer-swipe-movement-y` or `--drawer-swipe-movement-x` as a CSS length on
 * every pointer move while a drag is in progress; a panel whose transform was a
 * constant would stay put under a moving thumb and then jump when the drag
 * released, which is the one behaviour that makes a drag feel like a bug. So the
 * resting value is the movement, and the starting and ending values are the same
 * movement plus one whole panel of travel, which is where the panel is when the
 * reader is not looking at it.
 *
 * The `fallback` on each variable is `0px` rather than `0` because the variable
 * is a length and a transform that adds a percentage to a unitless zero is a
 * different calculation from one that adds a percentage to a length.
 */
const PANEL: Record<DrawerSide, string> = {
  bottom:
    'w-full max-h-[85vh] rounded-t-xl border-x border-t [transform:translateY(calc(var(--drawer-swipe-movement-y,0px)+100%))] data-[starting-style]:[transform:translateY(calc(var(--drawer-swipe-movement-y,0px)+100%))] data-[ending-style]:[transform:translateY(calc(var(--drawer-swipe-movement-y,0px)+100%))]',
  left:
    'h-full w-3/4 max-w-sm rounded-r-xl border-y border-r [transform:translateX(calc(var(--drawer-swipe-movement-x,0px)-100%))] data-[starting-style]:[transform:translateX(calc(var(--drawer-swipe-movement-x,0px)-100%))] data-[ending-style]:[transform:translateX(calc(var(--drawer-swipe-movement-x,0px)-100%))]',
  right:
    'h-full w-3/4 max-w-sm rounded-l-xl border-y border-l [transform:translateX(calc(var(--drawer-swipe-movement-x,0px)+100%))] data-[starting-style]:[transform:translateX(calc(var(--drawer-swipe-movement-x,0px)+100%))] data-[ending-style]:[transform:translateX(calc(var(--drawer-swipe-movement-x,0px)+100%))]',
}

/**
 * The classes every control in this Component draws.
 *
 * One string rather than four, because a control bar where the close control has
 * its own metrics and the rest share another is a bar a reader moving by Tab
 * finds unevenly spaced, and the difference is invisible in review.
 */
const CONTROL =
  'text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-md outline-none transition-colors duration-fast ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * A panel anchored to an edge of the viewport that the reader can push away.
 *
 * **The distinction from `Sheet` is a gesture and nothing else, and it is worth
 * stating plainly because the two read as synonyms.** Prism's `Sheet` is
 * `Dialog` with a named edge: the same focus trap, the same Escape key, the same
 * outside press, the same portal, and a panel the reader leaves by pressing a
 * key, pressing outside, or pressing a control. A Drawer is a panel the reader
 * can also leave by dragging it off the edge with their thumb, and it says so: it
 * draws a grip, its exit is driven by pointer movement, and its own content
 * region is marked so that selecting text with a mouse does not read as the
 * start of a drag. Base UI, which supplies both, draws the same line: a Drawer
 * extends Dialog and adds gesture support, and a panel that slides in from the
 * edge and needs no gesture is a positioned Dialog, which is what `Sheet` is. So
 * the rule for a caller is short. **If the reader can throw it away, use a
 * Drawer. If the reader dismisses it, use a Sheet.**
 *
 * **The gesture is never the only way out.** Every dismissal it offers is also
 * available without a pointer: Escape closes the panel, and the close control is
 * on by default. That is not politeness, it is the accessibility floor. A panel
 * whose grip is the only visible affordance is a panel a switch-device user and a
 * keyboard user cannot leave, and the grip is drawn from `bg-muted`, so it is a
 * grey bar carrying no name and no role.
 *
 * **The focus trap, the Escape key, the scroll lock and the portal are Base UI's,
 * and they are inherited rather than re-derived.** Five behaviours that are
 * already correct and are each wrong more often than right when hand-rolled: an
 * overlay built on a `div` and a `keydown` listener gets Escape and no trap, so a
 * keyboard reader tabs behind the panel into a page they cannot see. `modal`
 * defaults to `true`, which traps focus, locks page scroll and makes the rest of
 * the document inert to the pointer. Focus moves into the panel on open and
 * returns to whatever opened it on close. Escape closes it. There is deliberately
 * no prop that turns any of that off: a panel a reader cannot leave by the
 * keyboard is a trap in both the ordinary and the technical sense, and the case
 * for a panel that refuses a stray press is an `AlertDialog`, which is what
 * `Sheet` says in its own documentation.
 *
 * **A wide viewport gets a narrower panel, not a different Component.** The
 * cross-axis extent is capped, so a side drawer is `w-3/4` bounded by `max-w-sm`
 * and a bottom drawer is full width with `max-h-[85vh]`: at 64rem the panel is a
 * panel beside the work rather than a wall across it. What Prism will not do is
 * swap the Drawer for a Dialog at a breakpoint. A surface that changes shape with
 * the viewport is two Components under one name with a media query deciding
 * which one the reader got, and the caller's own `onOpenChange` cannot tell which
 * fired, so a drawer that became a dialog on a desktop would be a component whose
 * behaviour is a function of somebody else's window size. A product that wants a
 * centred modal on a wide screen and a drawer on a phone renders both and chooses.
 * The cost is real and it is this Component's: that choice is the caller's to
 * write, and a caller who wanted one name for it does not get one here.
 *
 * **Snap points are deliberately left off, and that is the largest omission in
 * this Component.** Base UI's Drawer can stop at preset heights, which is what a
 * half-expanded bottom sheet is, and that is the shape most mobile task panels
 * want. Expressing one honestly takes two numbers that must agree: the snap
 * point, and the panel's own height at that point, because Base UI hands over the
 * offset in pixels and leaves the height to whoever styles the panel. Prism has no
 * token for a height in the world, so the caller's half of the pair would be an
 * arbitrary `h-[...]` in a `className`, kept in step by hand with a prop on the
 * root. Two numbers that have to agree, one of them authored outside the token
 * tier, is a second source of truth, and this package has spent a migration
 * unpicking exactly that. So the feature is off rather than half shipped, and
 * what it costs is named: a half-expanded bottom sheet is not available here, and
 * a consumer who needs one asks for it upstream rather than assembling it from a
 * `className` that only half works. The nested-drawer stack and the indent effect
 * Base UI also adds are left off for the same reason and for a second one: both
 * are about drawers inside drawers, which is a shape no consumer of this package
 * ships.
 *
 * **The entrance is a spatial move and it is under `motion-safe:`.** A panel
 * crossing the whole width of a viewport is the largest movement in the shipped
 * surface, and DESIGN.md's rule is that spatial movement is guarded rather than
 * shortened. A reader who has asked for reduced motion gets the panel already
 * open, with no fade either, because the panel's resting state is its full form
 * and there is nothing to lose. The backdrop is the other half of that decision:
 * it fades rather than travels, so its transition is left unguarded on the
 * shorter token duration, exactly as `Dialog`'s backdrop is.
 *
 * **The release from a flick is not velocity-matched, and that is the price of
 * the token.** Base UI's own examples scale the dismissal duration by the swipe
 * velocity, which is the right feel and is written as a computed millisecond
 * value in the component. Prism names `duration-slow` and nothing else, so a
 * reader who throws the panel off the edge hard watches it complete over the same
 * 280ms as a reader who barely nudged it. A flick that ought to feel like the
 * panel was flicked instead feels like the panel agreed to go. The alternative
 * was a duration computed in a class string, and the compositor rule and the
 * motion law are worth more than the velocity curve.
 *
 * It is a client Component, and the reason is the gesture and the portal rather
 * than the panel: a drag is a stream of pointer events and a portal needs the
 * document.
 */
function Drawer({ ...props }: DrawerProps) {
  return <DrawerPrimitive.Root {...props} />
}

/** The element that opens the drawer. */
function DrawerTrigger({ className, ...props }: DrawerTriggerProps) {
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      className={cn(CONTROL, className)}
      {...props}
    />
  )
}

/**
 * The panel, its backdrop, its layer and its portal, over Base UI's four parts.
 *
 * The parts are internal rather than exported for the reason `Dialog` keeps its
 * backdrop and viewport internal: a consumer who composes them has to know the
 * order they go in, and a panel drawn in the wrong order is a panel that traps
 * focus in an element that is not on screen. `DrawerContent` is the only way in,
 * and the header, body, footer and title are slots inside it.
 */
function DrawerContent({
  className,
  side,
  showCloseButton = true,
  closeLabel,
  children,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop
        data-slot="drawer-backdrop"
        className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-base ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-swiping:transition-none"
      />
      <DrawerPrimitive.Viewport data-slot="drawer-viewport" className={VIEWPORT[side]}>
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          className={cn(
            'bg-background text-foreground shadow-md flex flex-col outline-none',
            'focus-visible:ring-ring focus-visible:ring-[3px]',
            'motion-safe:transition-transform motion-safe:duration-slow motion-safe:ease-out',
            'motion-safe:data-swiping:transition-none',
            PANEL[side],
            className,
          )}
          {...props}
        >
          {/*
           * The grip, drawn on a bottom drawer and not on a side one, because a
           * grip on a side drawer promises a drag along its own axis and the
           * drawer exits on the other one. It is decorative and says so, because
           * it is a grey bar with no name and no role: the reader who can use it
           * already knows what it does from the panel moving under their thumb,
           * and the reader who cannot is owed an announced control rather than an
           * announced rectangle.
           */}
          {side === 'bottom' ? <DrawerHandle /> : null}

          {/*
           * Base UI's own content region, rendered with `contents` so it adds no
           * box of its own. That is not cosmetic: the region is what Base UI
           * excludes from the mouse swipe so a reader can select a word in the
           * panel without the panel moving, and it would stop doing that job the
           * moment it became a flex item sitting between the popup and the body,
           * because the body is the element with the bounded height and the
           * scroll range. `contents` keeps the marker in the DOM, where Base UI's
           * closest lookup finds it, and keeps the flex column one level deep.
           */}
          <DrawerPrimitive.Content data-slot="drawer-content" className="contents">
            {children}
          </DrawerPrimitive.Content>

          {showCloseButton ? (
            <DrawerPrimitive.Close
              data-slot="drawer-close"
              aria-label={closeLabel}
              className={CONTROL}
            >
              <XIcon className="size-4" aria-hidden="true" />
            </DrawerPrimitive.Close>
          ) : null}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

/**
 * The panel's heading area, above the body.
 *
 * Sits above the body rather than inside it, so a reader who has scrolled a long
 * task to its last field still sees what the panel is. The panel's own scroll is
 * the body's, not this element's, which is the difference between a header that
 * travels with the work and one that stays.
 */
function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1.5 px-6 pt-4 pb-4', className)}
      {...props}
    />
  )
}

/**
 * The part of the panel that scrolls.
 *
 * The one element with `min-h-0` and the only one with an overflow, and both are
 * load bearing. The popup is a flex column with a capped height, so the body has
 * to be allowed to be shorter than its content, and `min-h-0` is what makes that
 * possible in a flex column: without it a flex item's automatic minimum size is
 * its content, the body refuses to shrink, and a panel with a long form grows
 * past the cap and off the screen with the footer unreachable. `overscroll-contain`
 * is the other half, because a reader who has reached the end of the task and
 * keeps scrolling should not drag the page behind the panel along with it.
 */
function DrawerBody({ className, ...props }: DrawerBodyProps) {
  return (
    <div
      data-slot="drawer-body"
      className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4', className)}
      {...props}
    />
  )
}

/**
 * The panel's action area, below the body.
 *
 * On the muted surface and above a rule, for the reason a `FilterPanel`'s footer
 * is: it is the one band that does not scroll with the work above it, and a
 * reader part way through a task has to reach the control that commits it without
 * scrolling back to a field they have already filled. Stacked with the caller's
 * first child at the bottom on a narrow screen and beside the rest from `sm` up,
 * which puts the primary action under the same thumb either way.
 */
function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'bg-muted/40 flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

/** The panel's heading. It names the panel for assistive technology. */
function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

/**
 * A supporting line under the title.
 *
 * The panel is named by the title and described by this, and both are the
 * caller's words. A drawer on a narrow screen is read by a reader who has just
 * interrupted something, so the description is where the panel says what will be
 * lost by putting it away, and only the consumer knows that.
 */
function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/**
 * The bar that says the panel can be pushed away.
 *
 * A caller reaching for this is usually a caller who wants a panel on an edge
 * where no drag exits, which is a grip that promises something the panel will not
 * do. It is here so that `DrawerContent` can draw it without inventing a slot,
 * and it takes layout through `className` like every other part.
 */
function DrawerHandle({ className, ...props }: DrawerHandleProps) {
  return (
    <div
      data-slot="drawer-handle"
      aria-hidden="true"
      className={cn('bg-muted mx-auto mt-3 mb-1 h-1 w-10 shrink-0 rounded-full', className)}
      {...props}
    />
  )
}

/** A control that closes the drawer from inside its content. */
function DrawerClose({ className, ...props }: DrawerCloseProps) {
  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      className={cn(CONTROL, className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerHandle,
  DrawerClose,
}
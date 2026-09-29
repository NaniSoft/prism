'use client'

import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the HoverCard root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface HoverCardProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled hover card. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** The trigger and the preview. */
  children?: React.ReactNode
}

/**
 * The props HoverCardTrigger forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface HoverCardTriggerProps extends ComponentProps<'a'> {
  /**
   * How long the pointer must rest on the trigger before the card opens, in
   * milliseconds.
   *
   * A prop and not a fixed number, because the delay is a decision about what
   * counts as intent and a caller whose readers move differently, or whose
   * pointer hardware reports a rest as a hover, has a different answer. What the
   * Component refuses to do is decide that intent is instant, which is the
   * failure a card with no delay always ships: the pointer crossing a line of
   * text opens a surface, and a page of links becomes a page of flashes.
   *
   * @defaultValue 600
   */
  delay?: number
  /**
   * How long the card stays open after the pointer leaves it, in milliseconds.
   *
   * This is the half that is easy to leave at zero and that punishes the reader
   * who was about to get what they wanted. Moving from the trigger to the card
   * crosses a gap, and a card that closes on the first pixel outside the trigger
   * closes in the gap, so the reader who did everything right gets nothing. A
   * generous close delay is what makes a rest on the trigger mean something.
   *
   * @defaultValue 300
   */
  closeDelay?: number
}

/**
 * The props HoverCardContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface HoverCardContentProps extends ComponentProps<'div'> {
  /** Which side of the trigger the card is placed on. @defaultValue bottom */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** How the card aligns against the trigger. @defaultValue center */
  align?: 'start' | 'center' | 'end'
  /** The distance in pixels between the trigger and the card. @defaultValue 8 */
  sideOffset?: number
}

/**
 * A preview of a destination, shown when the reader rests on a link.
 *
 * **The delay is the Component's decision, and the close delay is the half that
 * matters.** A card with no open delay opens as the pointer crosses a line of
 * text, so a page of links becomes a page of flashes and a reader learns that
 * resting is punished. A card with no close delay is worse and quieter: the
 * reader rests, waits, sees the card start to appear, moves toward it, and it
 * vanishes in the gap between the trigger and the card, so the one reader who
 * did everything right is the one who gets nothing. Both are delays here, and
 * both are props, because how long a reader's pointer rests is a fact about the
 * reader and not about the design system.
 *
 * **The preview is never the only copy of what it shows.** The trigger is a real
 * anchor, so everything in the card is reachable at the destination without the
 * card ever appearing, and a touch reader, who has no hover at all, is not
 * missing anything. That is the honest way to express "the reader wants this"
 * without punishing a reader on a slow device: the card is an accelerant for a
 * reader with a pointer, and removing it costs the reader nothing. If a fact
 * lives only in the card, it does not exist for half the people who can see it.
 *
 * The card is not a dialog. It takes no focus, traps nothing, and is not
 * announced, because a screen reader is already moving through the link text and
 * a surface that interrupted that to read a summary of it would be a worse
 * version of the same information. For the same reason, put nothing in the card
 * that is not also on the destination.
 */
function HoverCard({ ...props }: HoverCardProps) {
  return <PreviewCardPrimitive.Root {...props} />
}

/**
 * The link the card previews. It is an anchor, and it navigates on its own.
 *
 * The href is what makes the card safe to add: the destination is reachable
 * whether or not the card ever opens, so the delay can be as long as intent
 * requires without costing a reader anything they cannot already get.
 */
function HoverCardTrigger({ className, delay, closeDelay, ...props }: HoverCardTriggerProps) {
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      {...(delay === undefined ? null : { delay })}
      {...(closeDelay === undefined ? null : { closeDelay })}
      className={cn(
        'hover:decoration-foreground rounded-sm text-foreground underline decoration-muted-foreground underline-offset-2 outline-none',
        'transition-colors duration-fast ease-out',
        'focus-visible:ring-ring focus-visible:ring-[3px]',
        className,
      )}
      {...props}
    />
  )
}

/** The floating preview surface. */
function HoverCardContent({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  ...props
}: HoverCardContentProps) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            'bg-popover text-popover-foreground w-72 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-none',
            'transition-[opacity,transform] duration-fast ease-out',
            'focus-visible:ring-ring focus-visible:ring-[3px]',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }

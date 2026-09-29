'use client'

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { ChevronRightIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Collapsible root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface CollapsibleProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** The controlled open state. */
  open?: boolean
  /** The panel shown initially, for an uncontrolled collapsible. */
  defaultOpen?: boolean
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Whether the section ignores user interaction. @defaultValue false */
  disabled?: boolean
  /**
   * The stable id linking the trigger to the panel.
   *
   * A prop and not a generated one, because a section whose trigger and panel
   * cannot both be found by name is hard to test, hard to restyle from a
   * consumer's stylesheet, and impossible to wire an analytics event to without
   * reaching into the DOM. It is the caller's own name for the section, so it is
   * the caller's string.
   */
  id?: string
}

/** The props CollapsibleTrigger forwards to Base UI. */
export interface CollapsibleTriggerProps extends ComponentProps<'button'> {}

/**
 * The props CollapsibleContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface CollapsibleContentProps extends ComponentProps<'div'> {
  /**
   * Whether the browser's page search may find and expand the closed panel.
   *
   * This is the decision a consumer would otherwise get wrong in the direction
   * that loses content. A panel that unmounts when it closes cannot be found by
   * the reader's own find-in-page, and the reader who searched for a word in a
   * collapsed section is told the word is not on the page. Turning this on hides
   * the panel with `hidden="until-found"` instead, so the browser can open it on
   * a match and the reader lands on the text they searched for.
   *
   * @defaultValue false
   */
  hiddenUntilFound?: boolean
  /** Whether the closed panel stays in the DOM. @defaultValue false */
  keepMounted?: boolean
}

/**
 * A section that shows and hides, in place.
 *
 * **A Collapsible is one section; an Accordion is a stack of them.** The
 * difference is what a reader can do with the result. An accordion lets one
 * section open by closing another, which is right for a set of peers and wrong
 * for a page that needs two things visible at once. A collapsible keeps its own
 * state and touches nothing else, so a reader can have three open, which is
 * usually what a page of settings wants and an accordion forbids.
 *
 * **The trigger and the region are wired by the library, not by the caller.**
 * A consumer who writes the two as siblings with their own `aria-expanded` gets a
 * button that says "collapsed" while the panel is open, or a panel no button
 * controls, and the failure is invisible until a reader meets it. Here the
 * trigger is a real button carrying the expanded state and pointing at the
 * panel, so Enter and Space open it and the announcement is right without the
 * caller writing a line of it. The chevron turns on that same state rather than
 * on a timer: something happened and the reader can see that it did.
 *
 * **A reader who collapses something must be able to find it again.** The
 * trigger is always in the document and always carries its own words, so the way
 * back never depends on the panel that was just closed, and a collapsed section
 * never leaves a heading with nothing under it. Pass `hiddenUntilFound` on the
 * content when the closed section holds text the reader may be searching for.
 */
function Collapsible({ className, ...props }: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      className={cn('flex flex-col', className)}
      {...props}
    />
  )
}

/**
 * The button that shows and hides the panel.
 *
 * It is the way back, so it keeps its own words when the panel is closed, and it
 * is a real button so Enter and Space work and so the reader can find it again
 * with the keyboard after closing the section without their hands.
 */
function CollapsibleTrigger({ className, children, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        'text-foreground group flex w-full items-center justify-between gap-3 rounded-md py-3 text-left text-sm font-medium outline-none',
        'transition-[color,background-color,box-shadow] duration-fast ease-out',
        'hover:bg-accent/60 hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-[3px]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-base ease-out group-data-[panel-open]:rotate-90" />
    </CollapsiblePrimitive.Trigger>
  )
}

/**
 * The region the trigger shows and hides.
 *
 * The height transition is state feedback rather than decoration: the panel is
 * opening or closing and the reader can watch it happen, which is the one motion
 * this system allows on a surface like this.
 */
function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        'h-(--collapsible-panel-height) overflow-hidden text-sm',
        'transition-[height] duration-base ease-out',
        'data-[starting-style]:h-0 data-[ending-style]:h-0',
        '[&[hidden]:not([hidden="until-found"])]:hidden',
        className,
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

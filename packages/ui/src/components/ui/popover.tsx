'use client'

import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Popover root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface PopoverProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled popover. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Whether the popover traps interaction while open. @defaultValue false */
  modal?: boolean | 'trap-focus'
  /** The trigger and content. */
  children?: React.ReactNode
}

/** The props PopoverTrigger forwards to Base UI. */
export interface PopoverTriggerProps extends ComponentProps<'button'> {
  /** Whether the trigger should also open the popover on hover. */
  openOnHover?: boolean
}

/**
 * The props PopoverContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface PopoverContentProps extends ComponentProps<'div'> {
  /** Which side of the trigger the popover is placed on. @defaultValue bottom */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** How the popover aligns against the trigger. @defaultValue center */
  align?: 'start' | 'center' | 'end'
  /** The distance in pixels between the trigger and the popover. @defaultValue 4 */
  sideOffset?: number
  /** The offset in pixels along the alignment axis. @defaultValue 0 */
  alignOffset?: number
}

/**
 * A floating surface opened by a trigger.
 *
 * Use a Popover for content that is richer than a tooltip but not a full
 * screen: a settings form, a filter panel, a small detail view. It is
 * dismissible with Escape and an outside press, and it returns focus to the
 * trigger when it closes. Do not put a required step in a Popover, because an
 * outside press can close it.
 */
function Popover({ ...props }: PopoverProps) {
  return <PopoverPrimitive.Root {...props} />
}

/** The element that opens the popover. */
function PopoverTrigger({ className, ...props }: PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn(
        'bg-background shadow-xs inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/** The floating popover surface. */
function PopoverContent({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  alignOffset = 0,
  children,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-none',
            'transition-[opacity,transform] duration-fast ease-out',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }

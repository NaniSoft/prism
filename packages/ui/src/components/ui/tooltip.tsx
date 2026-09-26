'use client'

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Tooltip root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface TooltipProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled tooltip. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Whether the tooltip is disabled. */
  disabled?: boolean
  /** The trigger and content. */
  children?: React.ReactNode
}

/**
 * The props TooltipTrigger forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface TooltipTriggerProps extends ComponentProps<'button'> {
  /** How long to wait before opening on hover, in milliseconds. @defaultValue 600 */
  delay?: number
  /** How long to wait before closing, in milliseconds. @defaultValue 0 */
  closeDelay?: number
  /** Whether the tooltip does not open from this trigger. */
  disabled?: boolean
}

/**
 * The props TooltipContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface TooltipContentProps extends ComponentProps<'div'> {
  /** Which side of the trigger the tooltip is placed on. @defaultValue top */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** How the tooltip aligns against the trigger. @defaultValue center */
  align?: 'start' | 'center' | 'end'
  /** The distance in pixels between the trigger and the tooltip. @defaultValue 4 */
  sideOffset?: number
}

/**
 * A short label shown on hover or focus.
 *
 * A tooltip names or explains the control it is attached to; it never carries
 * the only copy of information a reader needs, because it is unavailable to
 * touch users. The trigger stays focusable, and the tooltip opens on focus as
 * well as hover. Keep the content to a short phrase, and put anything longer
 * in visible text or a Popover.
 */
function Tooltip({ ...props }: TooltipProps) {
  return <TooltipPrimitive.Root {...props} />
}

/** The element the tooltip is attached to. */
function TooltipTrigger({ className, ...props }: TooltipTriggerProps) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn('outline-none', className)}
      {...props}
    />
  )
}

/** The floating tooltip surface. */
function TooltipContent({
  className,
  side = 'top',
  align = 'center',
  sideOffset = 4,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            'bg-foreground text-background w-fit rounded-md px-3 py-1.5 text-xs text-balance shadow-md',
            'transition-[opacity,transform] duration-fast ease-out',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent }

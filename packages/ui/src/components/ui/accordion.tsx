'use client'

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { ChevronDownIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Accordion root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface AccordionProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** The open item values, when the accordion is controlled. */
  value?: string[]
  /** The item values open initially, for an uncontrolled accordion. */
  defaultValue?: string[]
  /** Called when the open set changes. */
  onValueChange?: (value: string[]) => void
  /** Whether more than one item may be open at once. */
  multiple?: boolean
  /** Whether every item ignores user interaction. */
  disabled?: boolean
  /** Whether the browser's page search may expand a panel. */
  hiddenUntilFound?: boolean
  /** Whether a closed panel stays in the DOM. */
  keepMounted?: boolean
}

/**
 * The props the AccordionItem forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface AccordionItemProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** A stable value identifying this item within the accordion. */
  value?: string
  /** Whether this item ignores user interaction. */
  disabled?: boolean
  /** Called when this item opens or closes. */
  onOpenChange?: (open: boolean) => void
}

/** The props the AccordionTrigger forwards to Base UI. */
export interface AccordionTriggerProps extends ComponentProps<'button'> {}

/** The props the AccordionContent forwards to Base UI. */
export interface AccordionContentProps extends ComponentProps<'div'> {
  /** Whether the browser's page search may expand this panel. */
  hiddenUntilFound?: boolean
  /** Whether the closed panel stays in the DOM. */
  keepMounted?: boolean
}

/**
 * A stack of headers that each reveal a panel.
 *
 * The trigger is a real button and the panel is linked to it by the library,
 * so Enter or Space opens the focused item and the header announces its
 * expanded state. By default one item is open at a time; pass `multiple` to
 * allow several. Use an Accordion to reveal a long answer in place, and a
 * Tabs set when the sections are peers rather than a progression.
 */
function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root<string>
      data-slot="accordion"
      className={cn('w-full', className)}
      {...props}
    />
  )
}

/** One header-and-panel pair inside an Accordion. */
function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-border', className)}
      {...props}
    />
  )
}

/** The button that opens and closes its panel. */
function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none',
          'transition-[color,box-shadow] duration-fast ease-out hover:underline focus-visible:ring-[3px]',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-base ease-out data-[panel-open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/** The panel an AccordionTrigger reveals. */
function AccordionContent({ className, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden text-sm',
        'transition-[height] duration-base ease-out data-[starting-style]:h-0 data-[ending-style]:h-0',
        className,
      )}
      {...props}
    >
      <div className="pt-0 pb-4">{props.children}</div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

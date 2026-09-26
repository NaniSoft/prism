'use client'

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Tabs root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface TabsProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** The active panel's value, when the tabs are controlled. */
  value?: string
  /** The panel shown initially, for uncontrolled tabs. */
  defaultValue?: string
  /** Called when the active panel changes. */
  onValueChange?: (value: string) => void
  /** The direction the tab list flows. @defaultValue horizontal */
  orientation?: 'horizontal' | 'vertical'
}

/** The props TabsList forwards to Base UI. */
export interface TabsListProps extends ComponentProps<'div'> {
  /** Whether arrow-key focus also activates the tab. @defaultValue false */
  activateOnFocus?: boolean
  /** Whether arrow keys wrap at the ends of the list. @defaultValue true */
  loopFocus?: boolean
}

/**
 * The props TabsTrigger forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface TabsTriggerProps extends Omit<ComponentProps<'button'>, 'value'> {
  /** The value of the panel this trigger shows. */
  value: string
  /** Whether the trigger ignores user interaction. */
  disabled?: boolean
}

/**
 * The props TabsContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface TabsContentProps extends Omit<ComponentProps<'div'>, 'value'> {
  /** The tab value this panel belongs to. */
  value: string
  /** Whether the panel stays in the DOM while hidden. @defaultValue false */
  keepMounted?: boolean
}

/**
 * A set of layered panels shown one at a time.
 *
 * The tab list is a single keyboard stop: arrow keys move between triggers
 * and update the active panel, while Tab moves into the panel itself. Every
 * `TabsTrigger` needs a matching `TabsContent` with the same value. Use Tabs
 * to switch between peer views of the same subject, not to order steps in a
 * process.
 */
function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

/** The row or column of tab triggers. */
function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center gap-1 rounded-lg p-1',
        'data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

/** One trigger in the tab list. */
function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        'text-foreground inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'data-[active]:bg-background data-[active]:shadow-xs',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

/** The panel a trigger reveals. */
function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

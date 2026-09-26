'use client'

import { Select as SelectPrimitive } from '@base-ui/react/select'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Select root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface SelectProps {
  /** The selected value, when the select is controlled. */
  value?: string
  /** The value selected initially, for an uncontrolled select. */
  defaultValue?: string
  /** Called when the selected value changes. */
  onValueChange?: (value: string | null) => void
  /** The controlled open state of the popup. */
  open?: boolean
  /** The initially open state of the popup. */
  defaultOpen?: boolean
  /** Called when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** The form field name submitted with the form. */
  name?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** Whether a value must be chosen before the form submits. */
  required?: boolean
  /** Whether the select ignores user interaction. */
  disabled?: boolean
  /** Whether the user may open the popup but not change the value. */
  readOnly?: boolean
  /**
   * The options, keyed by value, so the trigger can render a label before any
   * item has mounted. Without it, `SelectValue` shows the raw value.
   */
  items?:
    | Record<string, React.ReactNode>
    | ReadonlyArray<{ label: React.ReactNode; value: string }>
  /** Converts an item value to the label shown in the trigger. */
  itemToStringLabel?: (value: string) => string
  /** The trigger and the popup content. */
  children?: React.ReactNode
}

/** The props SelectTrigger forwards to Base UI. */
export interface SelectTriggerProps extends ComponentProps<'button'> {
  /** The trigger's height. @defaultValue default */
  size?: 'sm' | 'default'
}

/**
 * The props SelectValue forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface SelectValueProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** Shown when no value is selected. */
  placeholder?: React.ReactNode
  /** Optional render function for the selected value. */
  children?: React.ReactNode | ((value: string | null) => React.ReactNode)
}

/**
 * The props SelectContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface SelectContentProps extends ComponentProps<'div'> {
  /** Which side of the trigger the list is placed on. @defaultValue bottom */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** How the list aligns against the trigger. @defaultValue center */
  align?: 'start' | 'center' | 'end'
  /** The distance in pixels between the trigger and the list. @defaultValue 4 */
  sideOffset?: number
}

/**
 * The props SelectItem forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface SelectItemProps extends Omit<ComponentProps<'div'>, 'value'> {
  /** The value this option contributes to the select. */
  value: string
  /** Whether this option ignores user interaction. */
  disabled?: boolean
  /** A text label used for keyboard typeahead when the option text differs. */
  label?: string
}

/** The props SelectGroup forwards to Base UI. */
export interface SelectGroupProps extends ComponentProps<'div'> {}

/** The props SelectLabel forwards to Base UI. */
export interface SelectLabelProps extends ComponentProps<'div'> {}

/** The props SelectSeparator forwards to Base UI. */
export interface SelectSeparatorProps extends ComponentProps<'div'> {}

/**
 * A control for choosing one option from a list that opens on demand.
 *
 * Use a Select when the option set is long enough that a radio group would
 * overwhelm the form, or when only the chosen value needs to stay visible.
 * The trigger is a button with a combobox role, and the popup supports
 * typeahead, arrow-key navigation and Enter to choose. Always pair it with a
 * `FieldLabel`; the selected value shows in the trigger, so the label names
 * the field rather than the choice.
 */
function Select({ ...props }: SelectProps) {
  return <SelectPrimitive.Root<string> {...props} />
}

/** The button that shows the selected value and opens the list. */
function SelectTrigger({ className, size = 'default', children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'border-input bg-background shadow-xs flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm outline-none',
        'transition-[color,box-shadow,border-color] duration-fast ease-out',
        'data-[popup-open]:border-ring focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[placeholder]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
        size === 'sm' ? 'h-8' : 'h-9',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-muted-foreground">
        <ChevronDownIcon className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/** The selected value, or a placeholder while none is chosen. */
function SelectValue({ className, ...props }: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn(className)} {...props} />
}

/** The popup list of options. */
function SelectContent({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  children,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'bg-popover text-popover-foreground relative max-h-(--available-height) w-(--anchor-width) min-w-36 overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none',
            'transition-[opacity,transform] duration-fast ease-out',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

/** One option in the list. */
function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none',
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

/** A labelled set of related options. */
function SelectGroup({ className, ...props }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn(className)}
      {...props}
    />
  )
}

/** The label for a SelectGroup. */
function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs font-medium', className)}
      {...props}
    />
  )
}

/** A rule between groups of options. */
function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
}

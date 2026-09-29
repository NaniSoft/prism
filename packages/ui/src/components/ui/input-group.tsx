import type { ComponentProps } from 'react'

import { Input } from './input'
import { cn } from '../../lib/utils'

/**
 * Where an addon sits in the group, and what its border does about it.
 *
 * The addon keeps its own border on the outer edge only, because the group
 * already draws the edge it shares with the control. Two borders on the same line
 * read as a seam down the middle of one field, which is the opposite of what
 * joining them was for.
 */
const ADDON_POSITION = {
  prefix: 'rounded-s-md border-e-0',
  suffix: 'rounded-e-md border-s-0',
} as const

/** The props the Input group accepts. */
export interface InputGroupProps extends ComponentProps<'div'> {
  /**
   * Whether the group ignores interaction.
   *
   * Drawn rather than set: the group's own `disabled` attribute would disable the
   * control in the middle of it without the reader's pointer ever touching it, and
   * a `<div>` cannot be disabled. Put `disabled` on the control and the group dims
   * itself.
   */
  disabled?: boolean
}

/** The props the Input group addon accepts. */
export interface InputGroupAddonProps extends ComponentProps<'div'> {
  /** Which end of the group the addon sits on. @defaultValue prefix */
  position?: keyof typeof ADDON_POSITION
}

/** The props the Input group input accepts. */
export type InputGroupInputProps = ComponentProps<typeof Input>

/** The props the Input group button accepts. */
export interface InputGroupButtonProps extends ComponentProps<'button'> {
  /** Which end of the group the button sits on. @defaultValue suffix */
  position?: keyof typeof ADDON_POSITION
}

/**
 * Related controls drawn as one field: a prefix, a suffix, a unit, an action.
 *
 * **The addons are part of the field, not beside it.** They share one border, one
 * height, one corner radius and one focus colour, because the thing they decorate
 * is the field and a reader who sees three boxes has been given three things to
 * reason about where they were given one. A currency symbol and the number it
 * belongs to are one field with two parts, and the Component draws them as one
 * field.
 *
 * **The frame answers the focus, the control draws the ring.** The group is a
 * `div`: it is never focused and it has nothing to ring. It turns its border to the
 * ring token when anything inside it has focus, and the control, which is the
 * element that actually has focus, keeps `Input`'s own full-strength ring. Two
 * indicators would be two things to read, and putting the ring on a wrapper that
 * is not the thing being operated is how a focus indicator ends up drawn around
 * the wrong box.
 *
 * **Use `InputGroupInput` inside it rather than `Input`.** A bordered `Input`
 * inside a bordered group draws a second border inside the first, and the caller
 * should not have to know that `border-0 shadow-none` is the fix. The rest of the
 * surface is plain divs and buttons, so a caller can put any control in the middle
 * once they know they have to take its border off.
 *
 * It is presentational: it renders no state of its own, has no hooks and no event
 * handlers, so it is a server Component and a consumer's field costs no client
 * JavaScript for the frame. Pair it with a `Label` above it and the control inside
 * is the only thing that needs a name.
 */
function InputGroup({ className, disabled = false, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        'border-input bg-background focus-within:border-ring flex w-full items-stretch rounded-md border shadow-xs',
        'transition-[color,box-shadow] duration-fast ease-out',
        'has-[input:disabled]:opacity-50',
        disabled && 'opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/**
 * A static run of words or an icon inside the group: a unit, a prefix, a currency
 * symbol, a field name.
 *
 * It carries no accessible name of its own and none is needed: the text inside it
 * is read in place, and the control it belongs to is named by the label above the
 * group. Use `InputGroupButton` when the part has to be operated, so it gets a
 * name and a focus ring of its own.
 */
function InputGroupAddon({ className, position = 'prefix', ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-position={position}
      className={cn(
        'bg-muted text-muted-foreground border-input flex shrink-0 items-center border px-2.5 text-sm',
        ADDON_POSITION[position],
        className,
      )}
      {...props}
    />
  )
}

/**
 * The control in the middle of the group, without a border of its own.
 *
 * A thin composition over `Input` rather than a variant of it, so the field keeps
 * every behaviour a plain `Input` has, including its focus ring, its `aria-invalid`
 * border and its disabled state. Only the border and the shadow are dropped,
 * because the group already draws both.
 */
function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-input"
      className={cn('flex-1 border-0 shadow-none focus-visible:border-0', className)}
      {...props}
    />
  )
}

/**
 * An operable part inside the group: clear the field, reveal a password, open a
 * picker.
 *
 * A button rather than an addon, because the moment the part can be operated it
 * needs its own accessible name, its own focus ring and its own press feedback,
 * and an addon has none of the three. The name is a prop, as it is everywhere:
 * "Clear" is a word this package does not get to choose for a consumer's product.
 */
function InputGroupButton({
  className,
  position = 'suffix',
  type = 'button',
  ...props
}: InputGroupButtonProps) {
  return (
    <button
      type={type}
      data-slot="input-group-button"
      data-position={position}
      className={cn(
        'border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground flex shrink-0 items-center justify-center border px-2.5 text-sm outline-none',
        'transition-[color,background-color] duration-fast ease-out',
        'focus-visible:ring-ring focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        ADDON_POSITION[position],
        className,
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput }

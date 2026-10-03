'use client'

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/** How large a Toggle is drawn. */
export type ToggleSize = 'sm' | 'default'

/**
 * The props the Toggle forwards to its Base UI root.
 *
 * Declared here rather than re-exported from Base UI so no upstream type crosses
 * the package seam (ticket 07 section 6).
 */
/**
 * The props the Toggle accepts.
 *
 * `value` is omitted from what it forwards, because the native button attribute
 * and the toggle's own `value` are different things. The native one is the value
 * submitted with a form, and the toggle's is the identifier a `ToggleGroup` uses to
 * hold the pressed set; a single prop cannot be both. A standalone Toggle submits
 * nothing, so the attribute is not the one a caller is reaching for here, and a
 * caller who wants it wraps the Toggle in a form control of its own.
 */
export interface ToggleProps extends Omit<ComponentProps<'button'>, 'onChange' | 'value'> {
  /** The pressed state, when the control is controlled. */
  pressed?: boolean
  /** The pressed state to start in, for an uncontrolled toggle. */
  defaultPressed?: boolean
  /** Called when the pressed state changes. */
  onPressedChange?: (pressed: boolean) => void
  /** Whether the control ignores user interaction. */
  disabled?: boolean
  /**
   * The control's accessible name.
   *
   * Optional rather than required only because a Toggle whose visible label is its
   * own text takes its name from that text. Pass it for the icon-only case, which
   * is common: a bold, an italic and an underline row are three glyphs, and a
   * screen reader that says "button, button, button" for them is three controls
   * nobody can tell apart.
   */
  'aria-label'?: string
  /** The control's height. @defaultValue 'default' */
  size?: ToggleSize
  /** Layout only. */
  className?: string
}

/**
 * A two-state button: it is pressed or it is not.
 *
 * **A Toggle is not a Switch, and the difference is the whole of it.** A Switch
 * takes effect the moment it is flipped: notifications are on, a panel is showing,
 * a feature is enabled, and there is no save step. A Toggle is *pressed*, which is
 * a state the caller holds and decides what to do with, usually on submit. Turning
 * on a feature the moment a reader presses a word is a change made without a save
 * and without a confirmation, and a reader who pressed the wrong one has to know
 * what was undone. So: flipping a Switch changes the application, pressing a
 * Toggle changes a value.
 *
 * Between the two, use a Switch when the change applies at once and a Toggle when
 * it is part of a larger form. A Checkbox is the third answer and the one most
 * often confused with both: a Checkbox is an independent yes-or-no that submits
 * with the form and has no pressed styling to suggest it is currently on.
 *
 * **The pressed state is an attribute and not only a surface.** Base UI renders a
 * native `<button>` with `aria-pressed`, which is what makes it a toggle rather
 * than a button that happens to change colour, and the surface follows it with
 * `data-[pressed]:`. The order is the same everywhere in this package: the
 * attribute is the fact and the colour is the reminder, so a reader who cannot
 * separate the two inks still knows which way the control is.
 *
 * It is a client Component, because a toggle that cannot be pressed is a label and
 * because the pressed state is what the whole control is.
 */
function Toggle({
  className,
  size = 'default',
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      // The focus ring is `ring-ring` at full strength, for the reason `Button`
      // states: half alpha of this ring clears 3:1 against no surface in any pack.
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:opacity-50',
        // Both state surfaces set their own ink, which is the rule a variant that
        // sets a fill must follow. A pressed surface with an inherited ink is the
        // same control on the page ground and a different one inside a Block.
        'hover:bg-accent hover:text-accent-foreground',
        'data-[pressed]:bg-accent data-[pressed]:text-accent-foreground',
        // The coarse-pointer floor, as a step with `min-w-11` on the other axis, and a
        // band is rejected on condition 1 for the reason `toggle-group.tsx` rejects one:
        // a `Toggle` is most often one member of a row or a set, and a 44px band on it is
        // a press aimed at whatever sits beside it. `min-w-11` is the width half for the
        // reason `Button` gives, since an icon-only toggle is `size-4` plus `px-2.5` and
        // would otherwise stay under the floor across. See DESIGN.md, The coarse-pointer
        // floor.
        'pointer-coarse:h-11 pointer-coarse:min-w-11',
        size === 'sm' ? 'h-8 min-w-8 px-2.5' : 'h-9 min-w-9 px-3',
        className,
      )}
      {...(pressed === undefined ? null : { pressed })}
      {...(defaultPressed === undefined ? null : { defaultPressed })}
      {...(onPressedChange === undefined
        ? null
        : { onPressedChange: (next: boolean) => onPressedChange(next) })}
      {...(disabled === undefined ? null : { disabled })}
      {...props}
    />
  )
}

export { Toggle }

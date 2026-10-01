'use client'

import { ChevronDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './button'
import { ButtonGroup } from './button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { cn } from '../../lib/utils'

/**
 * One command in the split button's menu.
 *
 * Data rather than a slot, because a menu is a list and a slot in a list is an
 * array a caller has to build by hand. The `id` is the caller's own identity for
 * the command and never the label, for the reason every keyed list in this
 * package says: labels are localised, and a menu keyed on a localised label
 * remounts the row the moment the reader changes language.
 */
export type SplitButtonAction = {
  /**
   * The caller's own identity for the command.
   *
   * Required, and stable across renders. It is what `onSecondaryAction` reports,
   * so it is the caller's handle on the command rather than a key the Component
   * invented.
   */
  id: string
  /**
   * The command's label, read in place in the menu.
   *
   * A `ReactNode`, so a caller can put an emphasis or an icon inside it. Every
   * word in it is the caller's; Prism ships none.
   */
  label: ReactNode
  /**
   * The mark for the command.
   *
   * A `ReactNode` and not an icon name, because the vocabulary a product uses for
   * its own commands is its own. Pass an `svg` or an `img` and keep it
   * `aria-hidden`, because `label` already names the row.
   */
  icon?: ReactNode
  /**
   * How the menu row reads.
   *
   * `danger` and not `destructive`, so a consumer's tone and this package's tone
   * stay two vocabularies. It applies to the menu row only: the cap is the menu
   * trigger and the dominant action is a `Button`, and neither takes a tone from
   * here, because a destructive menu row beside a destructive dominant action is
   * one claim rather than two.
   */
  tone?: 'default' | 'danger'
  /** Whether the command refuses the press. */
  disabled?: boolean
}

/**
 * The props the Split button accepts.
 *
 * A declared interface rather than a forwarded native one: the Component draws a
 * group and two controls, so there is no single native element to forward to, and
 * a forwarded `onClick` would be a fourth way to say what the dominant action
 * does alongside `onPrimaryAction`.
 */
export interface SplitButtonProps {
  /**
   * The accessible name of the joined group.
   *
   * Required, because a group of two buttons is announced as two buttons and
   * nothing else, and a reader who tabs into one of the split buttons on a page
   * carrying three of them cannot tell which they are in. This is `ButtonGroup`'s
   * own requirement and it is passed straight through, so the name describes the
   * pair rather than either half of it.
   */
  label: string
  /**
   * The dominant action's visible label.
   *
   * Required and a `ReactNode`, because a caller may need an emphasis or an icon
   * inside it. "Save", "Publish", "Export". The Component takes no default: this
   * is the word a reader presses, and four products in at least two languages
   * cannot all be told what it says.
   */
  primaryLabel: ReactNode
  /**
   * The menu trigger's accessible name.
   *
   * Required, and the reason is the same one `Toast` states for its close
   * control. The trigger is an icon, and an icon a reader reaches towards has to
   * say what it is before they press it. "More actions", "Other options". It is
   * a name rather than a visible label because the trigger is a chevron and a
   * chevron is not a word.
   */
  menuLabel: string
  /**
   * The commands in the menu, in the order the reader walks them.
   *
   * Required and a list rather than a slot, because the menu is what the trigger
   * opens and an empty menu is a control that lies: a split button with no
   * commands here draws its trigger as unavailable rather than opening a surface
   * with nothing in it. The order is the caller's, because an order is a claim
   * about how often each command is used.
   */
  actions: readonly SplitButtonAction[]
  /**
   * Runs the dominant action.
   *
   * Required. Prism does not know what saving, publishing or exporting means to
   * the caller, so it neither performs the work nor holds a promise about it.
   * Nothing here disables itself after the press: the caller owns the request,
   * and a caller who wants the control to refuse a second press composes
   * `LifecycleButton` for the dominant half and this for the menu.
   */
  onPrimaryAction: () => void
  /**
   * Called with the `id` of the command chosen from the menu.
   *
   * One callback for the whole menu rather than one per command, so the caller's
   * handler is a single dispatch over its own data instead of a set of closures
   * rebuilt on every render. It fires before the menu closes and carries no
   * label, because a label is a word Prism cannot translate for the caller.
   */
  onSecondaryAction: (id: string) => void
  /**
   * The fill the dominant action is drawn in.
   *
   * Three and not four, and `outline` is the default because it is the one that
   * makes the pair read as a single shape: the menu trigger keeps the frame
   * `DropdownMenuTrigger` already draws, which is an outlined one, so an outlined
   * dominant action is literally the same button as the cap beside it. See the
   * JSDoc on the Component for why the cap is not restyled to match.
   *
   * @defaultValue 'outline'
   */
  variant?: 'outline' | 'default' | 'destructive'
  /**
   * Whether the whole group refuses interaction.
   *
   * Set on the menu rather than drawn, for the reason the JSDoc states in full:
   * the menu already owns a disabled state and reimplementing it would be a
   * second menu trigger. The dominant action is drawn as unavailable instead of
   * natively disabled, because it is a control whose press this Component can
   * simply decline.
   */
  disabled?: boolean
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * One dominant action and a menu, joined as a single shape.
 *
 * **The split is a boundary, and a boundary has a focus contract of its own.**
 * That is the whole of this Component. The dominant action is one tab stop and
 * the menu trigger is another, so the reader reaches the control twice and knows
 * both times that they are still inside one thing; and the two halves are drawn
 * as one shape, because a `Button` beside a `DropdownMenuTrigger` is two controls
 * that happen to be near each other. `ButtonGroup` already owns the first half of
 * that claim and `DropdownMenu` already owns the second, and this is the
 * composition, so neither is redrawn: the joined frame, the single ring drawn
 * around the pair and the collapsed inner borders are `ButtonGroup`'s, and the
 * menu, its typeahead and its Escape handling are `DropdownMenu`'s.
 *
 * **Why this is a Component and not a call site, which is the question every
 * audited upstream variant had to answer.** The composition is three lines, so the
 * honest case cannot be that it is impossible to write. It is that the boundary
 * carries three decisions a caller gets wrong in the same direction every time,
 * and none of the three has anywhere to live but a Component:
 *
 * 1. **The cap's frame.** The trigger's frame is `DropdownMenuTrigger`'s, and
 *    that Component may not be restyled from here: doing so is the override path
 *    this package does not have. So the cap stays outlined whatever the dominant
 *    action is, and a caller who wants the cap filled has to write a second menu
 *    trigger, which is a second focus contract for one control. Publishing
 *    `capTone` would not fix this; it would be a two-member union whose members
 *    mean "the menu trigger" and "not the menu trigger", which is a boolean with
 *    a vocabulary attached to it.
 * 2. **The step.** The cap's height is the trigger's, and the trigger takes no
 *    height prop. So there is no `size` here at all: a `size` a caller could
 *    forward to one half and not the other is a joined group with a notch in it,
 *    and a notch is the one thing a joined group may not have. Refusing the prop
 *    is a smaller surface than documenting the trap.
 * 3. **The three names.** `ButtonGroup` requires a name for the pair and the
 *    trigger requires a name for itself, so the composition has two mandatory
 *    accessible names describing one control, supplied on two unrelated
 *    Components, with nothing tying them together. A caller who forgets the
 *    trigger's produces a chevron announced as "button", which is the defect this
 *    gate exists to catch and which no prop combination can catch.
 *
 * **The honest cost of the cap, stated rather than restyled away.** The two halves
 * do not always match, because only one of them may be restyled. With
 * `variant="default"` or `variant="destructive"` the dominant action is filled and
 * the cap is outlined, and the group is two-tone. That is a real visual cost and
 * it is not fixed here on purpose: the fix is a second menu trigger. A caller who
 * wants one filled shape across both halves needs an upstream request, and
 * `CONTRIBUTING.md` is where it goes.
 *
 * **The second cost is JavaScript, and it is paid by a page that may never open
 * the menu.** `ButtonGroup` is a server Component and `DropdownMenu` is not, so
 * composing the two makes this one client Component. A static page whose dominant
 * action is the only thing it offers pays for a menu it might never open. That is
 * the price of a menu, and a caller who has no menu to offer composes
 * `ButtonGroup` and a `Button` instead, which is the arrangement this Component
 * is not for.
 *
 * **An unavailable dominant action is drawn rather than removed, and an
 * unavailable trigger is the menu's own.** The asymmetry is deliberate and it is
 * not smoothed over. The dominant action's press this Component can decline
 * outright, so it carries `aria-disabled`, keeps its place in the tab order and
 * keeps its half of the shape. The trigger's open state belongs to
 * `DropdownMenu`, and asking that Component for a drawn-unavailable state would
 * mean reimplementing the control, so `disabled` goes to the menu and the
 * trigger takes the state it already had.
 */
function SplitButton({
  label,
  primaryLabel,
  menuLabel,
  actions,
  onPrimaryAction,
  onSecondaryAction,
  variant = 'outline',
  disabled = false,
  className,
}: SplitButtonProps) {
  return (
    <ButtonGroup className={className} label={label}>
      <Button
        data-slot="split-button-primary"
        type="button"
        variant={variant}
        aria-disabled={disabled || undefined}
        onClick={disabled ? () => undefined : onPrimaryAction}
      >
        {primaryLabel}
      </Button>

      <DropdownMenu disabled={disabled || actions.length === 0}>
        <DropdownMenuTrigger data-slot="split-button-menu-trigger" aria-label={menuLabel}>
          <ChevronDownIcon aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              variant={action.tone === 'danger' ? 'destructive' : 'default'}
              disabled={action.disabled}
              onClick={() => onSecondaryAction(action.id)}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}

export { SplitButton }
'use client'

import {
  Children,
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/utils'

/** How many members of a ToggleGroup may be pressed at once. */
export type ToggleGroupSelectionMode = 'single' | 'multiple'

/** The props the ToggleGroup accepts. */
export interface ToggleGroupProps extends Omit<ComponentProps<'div'>, 'onChange' | 'children'> {
  /** The members, as `ToggleGroupItem` elements. */
  children?: ReactNode
  /**
   * Whether one member or several may be pressed.
   *
   * This is the caller's decision and it is a real one, which is why it is a prop
   * with two values rather than two Components. See the group's JSDoc for what
   * each mode means in the accessibility tree, because the two are not the same
   * control wearing two looks.
   */
  selectionMode?: ToggleGroupSelectionMode
  /** The pressed values, when the group is controlled. */
  value?: readonly string[]
  /** The pressed values to start with, for an uncontrolled group. */
  defaultValue?: readonly string[]
  /** Called with the group's whole set of pressed values when it changes. */
  onValueChange?: (value: readonly string[]) => void
  /** Whether every member ignores user interaction. */
  disabled?: boolean
  /**
   * The group's accessible name.
   *
   * Required, and required by the type rather than only by this paragraph, which is
   * the whole of the change: it was declared optional while the sentence beneath it
   * said "Required rather than defaulted", so TypeScript enforced nothing and the
   * group shipped unnamed. Both roles this Component draws are ones ARIA names a
   * MUST for, and both announce as their bare role name when unnamed: a reader
   * tabbing onto a toolbar with two of them is told "toolbar" and has no way to ask
   * which set of controls they have reached, and a radiogroup with no name says
   * nothing about which question its radios are answering. `TextFormatToolbar` draws
   * the same role with a required `label`, which is the shape this now matches.
   *
   * The name is the caller's word, for the reason every region's name in this package
   * is. `aria-labelledby` also arrives through `...props`, so a caller whose name is
   * already drawn somewhere can point at it rather than repeat it.
   */
  'aria-label': string
  /** The direction the arrow keys move in. @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Layout only. */
  className?: string
}

/** The props the ToggleGroupItem accepts. */
export interface ToggleGroupItemProps extends Omit<ComponentProps<'button'>, 'value' | 'children'> {
  /**
   * The value this member contributes to the group.
   *
   * Required, because a member the group cannot name is a member it cannot report
   * and cannot restore, and the group reports the whole set rather than a
   * difference.
   */
  value: string
  /** Whether this member ignores user interaction. */
  disabled?: boolean
  /** The words on the member, and its accessible name. */
  children?: ReactNode
}

/**
 * What the group tells its members, and what a member asks of the group.
 *
 * The pressed set is not read from the DOM and is not lifted into each member. It
 * is one value in one place, which is what makes a controlled group controlled: a
 * member reports an intent and the group decides, so two members cannot each keep
 * a copy and disagree about what is pressed.
 */
type ToggleGroupContextValue = {
  selectionMode: ToggleGroupSelectionMode
  /** The values currently pressed, in press order. */
  value: readonly string[]
  /** Whether the whole group ignores interaction. */
  disabled: boolean
  /** Whether this member's value is pressed. */
  isPressed: (value: string) => boolean
  /** Whether this member is the group's one Tab stop. */
  isTabStop: (value: string) => boolean
  /** Called by a member when it is activated. */
  toggle: (value: string) => void
  /** Called by a member when it takes focus, so the tab stop follows the reader. */
  focus: (value: string) => void
  /** The group's members in document order, which is the order the arrows walk. */
  members: () => HTMLButtonElement[]
  orientation: 'horizontal' | 'vertical'
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null)

/** The keys that move a member, read from the group's own orientation. */
const FORWARD: Record<'horizontal' | 'vertical', readonly string[]> = {
  horizontal: ['ArrowRight'],
  vertical: ['ArrowDown'],
}
const BACKWARD: Record<'horizontal' | 'vertical', readonly string[]> = {
  horizontal: ['ArrowLeft'],
  vertical: ['ArrowUp'],
}

/**
 * A set of toggles that behave as one control.
 *
 * **The single or multiple decision is the caller's, and it changes what the
 * group is rather than how it looks.** This is the decision worth stating because
 * getting it wrong is the usual failure, and it is invisible in a screenshot: two
 * groups of three buttons, one where at most one is pressed and one where any
 * number are, look identical until you read the roles.
 *
 * In `single` mode the group is a **radiogroup** and its members are **radios**
 * carrying `aria-checked`. That is not a stylistic preference, it is the only
 * description of the constraint that is true. The choices are mutually exclusive,
 * there is exactly one answer, and the whole set is one question rather than three
 * independent facts. Three buttons carrying `aria-pressed` say three independent
 * things can be on at once, which is a lie, and a reader of the accessibility tree
 * is left to infer the constraint from nothing.
 *
 * In `multiple` mode the group is a **toolbar** and its members are **pressed
 * buttons** carrying `aria-pressed`, and the arrow keys move focus without
 * choosing. That is the right behaviour for a toolbar of independent toggles,
 * where arrowing past a member must not silently turn it on, and Space is what
 * presses. So the two modes differ in the role of the group, the role of the
 * member, the state attribute, and what an arrow key does, and none of the four is
 * reachable from the other by passing a prop.
 *
 * **The group is one Tab stop, and it is the current answer.** Tab enters on the
 * member that is pressed, or on the first member when nothing is pressed, and Tab
 * leaves the group in one step. That is the composite pattern, and it is why a
 * consumer cannot assemble this from a row of Toggles: composing them gives the
 * Tab order of the document, which is every member of the group and none of the
 * arrows. A radiogroup whose Tab lands on the first option when a different one is
 * checked is a group that reports the wrong current value through the tab order
 * alone, and with seven members in a row the reader pays for it.
 *
 * **The tab stop follows the reader once they move.** It is a piece of state
 * rather than a derivation, because a reader who arrows across a group of seven
 * and Tabs away expects to arrive back where they were, and a stop recomputed
 * from the pressed value on every render is a stop that follows the pressed value
 * instead of the reader.
 *
 * **The keyboard model lives here rather than in each member,** for the reason
 * `Tree` keeps its own: three members each handling an arrow key is three
 * implementations of one rule, and the third is the one that is wrong. The order
 * the arrows walk is the group's own children rather than the node list, so it is
 * the order the reader sees and the order a reordering caller declared, with no
 * second list to fall behind the first.
 *
 * It is a client Component: it holds the pressed set and the roving tab stop, and
 * both are the control rather than a decoration of it.
 */
function ToggleGroup({
  children,
  className,
  selectionMode = 'single',
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  orientation = 'horizontal',
  ...props
}: ToggleGroupProps) {
  const [uncontrolled, setUncontrolled] = useState<readonly string[]>(defaultValue ?? [])
  const controlled = value !== undefined
  const pressed = controlled ? value : uncontrolled

  // The tab stop is state because it has to move; see the JSDoc. `null` is the
  // "the reader has not been here yet" case, and resolving it to the pressed
  // member is what makes an uncontrolled group with a default answer enter on that
  // answer.
  const [stop, setStop] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)

  /**
   * The declared order of the members, read from the children.
   *
   * Read from the children rather than from the DOM on purpose. The tab stop has
   * to be known during the first render, and a query of `root.current` returns
   * nothing on that render because the ref is not attached yet, so a group whose
   * tab stop comes from the DOM has no tab stop on its first paint. A child with
   * no `value` is skipped, which is the same thing the DOM read would have done by
   * leaving it out of the list.
   */
  const declared = useMemo(
    () =>
      Children.toArray(children)
        .map((child) =>
          typeof child === 'object' && child !== null && 'props' in child
            ? (child as { props?: { value?: unknown } }).props?.value
            : undefined,
        )
        .filter((item): item is string => typeof item === 'string'),
    [children],
  )

  const members = () => [
    ...(root.current?.querySelectorAll<HTMLButtonElement>('[data-slot="toggle-group-item"]') ?? []),
  ]

  const context = useMemo<ToggleGroupContextValue>(
    () => ({
      selectionMode,
      value: pressed,
      disabled,
      isPressed: (item) => pressed.includes(item),
      isTabStop: (item) => {
        if (stop !== null) return stop === item
        const current = pressed[0]
        return current === undefined ? item === declared[0] : item === current
      },
      toggle: (item) => {
        // The whole set comes back rather than a difference, so a caller
        // restoring state does not have to know which member it was holding. In
        // single mode pressing the pressed member clears it rather than doing
        // nothing, which is the one place the two modes genuinely differ in
        // consequence: a radio group with no answer is a real state, and it is
        // reachable by pressing the answer again.
        const next =
          selectionMode === 'multiple'
            ? pressed.includes(item)
              ? pressed.filter((held) => held !== item)
              : [...pressed, item]
            : pressed.includes(item)
              ? []
              : [item]
        if (!controlled) setUncontrolled(next)
        onValueChange?.(next)
      },
      focus: (item) => setStop(item),
      members,
      orientation,
    }),
    [controlled, declared, disabled, onValueChange, orientation, pressed, selectionMode, stop],
  )

  return (
    <div
      ref={root}
      data-slot="toggle-group"
      data-selection-mode={selectionMode}
      // The role is the whole difference between the two modes, and it is set here
      // rather than inherited from whatever the underlying primitive defaults to.
      // A `group` with `aria-orientation` is itself an error, which is one of the
      // reasons the multiple mode is a toolbar: a toolbar is the role that says
      // "a set of controls operated with the arrow keys", and it is the role that
      // carries an orientation.
      //
      // Both of those roles are announced by their bare name when nothing names
      // them, which is why `aria-label` is a required prop rather than an optional
      // one; see the prop.
      role={selectionMode === 'multiple' ? 'toolbar' : 'radiogroup'}
      aria-orientation={orientation}
      onKeyDown={(event) => {
        const back = BACKWARD[orientation].includes(event.key)
        if (!back && !FORWARD[orientation].includes(event.key)) return
        const all = members()
        if (all.length === 0) return
        const at = all.indexOf(document.activeElement as HTMLButtonElement)
        if (at === -1) return
        // A member that ignores interaction is skipped rather than focused and
        // doing nothing, which is the same rule `Tree` follows for a label that
        // is not a destination.
        const forward = back ? -1 : 1
        for (let step = 1; step <= all.length; step += 1) {
          const target = all[(at + forward * step + all.length * step) % all.length]
          if (target === undefined || target.disabled) continue
          event.preventDefault()
          target.focus()
          return
        }
      }}
      className={cn(
        'inline-flex items-center gap-1',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
    </div>
  )
}

/**
 * One member of a ToggleGroup.
 *
 * A native `<button>` in both modes, because it is focusable, it submits nothing
 * it was not asked to, and it is the element the browser's own activation already
 * handles. What changes between the modes is the role and the state attribute, and
 * both are read from the group: a radio carrying `aria-checked` in single mode, a
 * pressed button in multiple mode. Render a Prism `Toggle` outside a group when a
 * member stands alone; render this inside one, where the group owns the keyboard
 * model and the pressed set.
 */
function ToggleGroupItem({
  className,
  value,
  disabled,
  children,
  ...props
}: ToggleGroupItemProps) {
  const group = useContext(ToggleGroupContext)
  // A member outside a group still has to be a usable button rather than a broken
  // one, so the defaults here are the standalone behaviour and the group overrides
  // them. A member with no group is a caller's mistake, and the honest response to
  // it is a working control rather than a crash.
  const standalone = group === null
  const multiple = group?.selectionMode === 'multiple'
  const pressed = group?.isPressed(value) ?? false
  const inert = group?.disabled === true || disabled === true

  return (
    <button
      type="button"
      data-slot="toggle-group-item"
      data-value={value}
      data-pressed={pressed ? 'true' : undefined}
      // The single-selection member is a radio, and `aria-checked` is the only
      // attribute that says "one of these is the answer". `aria-pressed` on a
      // button inside a set of mutually exclusive choices says each choice is
      // independent, which is the claim single mode is denying.
      role={standalone || multiple ? undefined : 'radio'}
      aria-checked={standalone || multiple ? undefined : pressed}
      aria-pressed={standalone || multiple ? pressed : undefined}
      // The roving tab stop. A group where every member is out of the tab order is
      // a group a keyboard cannot enter at all, which is the failure a roving
      // tabindex has when nobody owns the pointer position, so the first member is
      // the stop whenever nothing is pressed.
      tabIndex={group === null || group.isTabStop(value) ? 0 : -1}
      disabled={inert}
      onFocus={() => group?.focus(value)}
      onClick={() => group?.toggle(value)}
      className={cn(
        'text-muted-foreground inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-sm px-2.5 text-sm font-medium whitespace-nowrap outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'hover:text-foreground',
        'focus-visible:ring-ring focus-visible:ring-[3px]',
        // Both state surfaces set their own ink, for the reason `Toggle` states: an
        // inherited ink is the same control on the page ground and a different one
        // inside a Block.
        'data-[pressed]:bg-accent data-[pressed]:text-accent-foreground',
        // The coarse-pointer floor, as a step with `min-w-11` on the other axis, and
        // a band is the worst of the three answers here. These are the members of one
        // segmented set, so they sit directly beside each other: a 44px band on one
        // member is a press aimed at its neighbour, which is condition 1 of the three
        // in `DESIGN.md` failing outright. `min-w-11` is the width half for the reason
        // `Button` gives, since an icon-only member is `size-4` plus `px-2.5` and would
        // otherwise stay under the floor across. The cost is that the group is 44 tall
        // on touch rather than 32, and it is paid uniformly because the class is on the
        // member and every member carries it. See DESIGN.md, The coarse-pointer floor.
        'pointer-coarse:h-11 pointer-coarse:min-w-11',
        inert ? 'cursor-not-allowed opacity-50' : '',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }

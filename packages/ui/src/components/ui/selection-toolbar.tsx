'use client'

import { XIcon } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import { Button } from './button'
import { cn } from '../../lib/utils'

/**
 * One command in a selection toolbar.
 *
 * A callback per command rather than one dispatch for the whole row, because a
 * selection toolbar's commands are not interchangeable the way a split button's
 * menu rows are: two of them may be destructive and one may need an argument the
 * caller computes from its own selection, and a single `id` plus a switch at the
 * call site would move that computation to the reader's keystroke.
 */
export type SelectionToolbarCommand = {
  /**
   * The caller's own identity for the command.
   *
   * Required and stable, for the reason every keyed list in this package says:
   * a command keyed on a localised label remounts a control the moment the reader
   * changes language, which drops the focus the Component just took pains to hold.
   */
  id: string
  /**
   * The command's accessible name, in the product's own words.
   *
   * Required and a string, because a name a screen reader reads is a string.
   * Commands here are almost always icon-only, and a row of unnamed icon buttons
   * is announced as "button, button, button", which is three controls nobody can
   * tell apart in a toolbar whose whole job is that they differ.
   */
  label: string
  /**
   * The mark for the command.
   *
   * A `ReactNode` and not an icon name, because the vocabulary a product uses for
   * its own rows is its own. Pass an `svg` or an `img` and keep it `aria-hidden`,
   * because `label` already names the control.
   */
  icon?: ReactNode
  /** Whether the command refuses the press and stays in the walk. */
  disabled?: boolean
  /**
   * Runs the command against the caller's selection.
   *
   * Required, and the caller owns everything inside it: reading what is selected,
   * doing it, and clearing or keeping the selection afterwards. Prism calls it
   * and does not touch the selection, because the selection is a claim about the
   * caller's data and a Component that rewrote it would be rewriting rows it
   * cannot see.
   */
  onRun: () => void
}

/**
 * The props the Selection toolbar accepts.
 *
 * A declared interface rather than a forwarded native one, because the Component
 * draws a `toolbar` and its own commands, so a forwarded `onKeyDown` would be a
 * second place the arrow-key model lives and a forwarded `children` would be a
 * second way to say what the row contains.
 */
export interface SelectionToolbarProps {
  /**
   * What is selected, read at the leading end of the row.
   *
   * Required, and passing `null` is how the caller says there is no selection, in
   * which case this Component renders nothing at all. That is the whole of the
   * appearing half and it is a decision rather than a prop: a toolbar for nothing
   * is a row of controls that do nothing, and a caller who mounts one permanently
   * so it can appear later has paid for it on every page that never selects
   * anything. The cost is that the caller has to hold the sentence rather than
   * only the number, because "3 selected" and "Drei ausgewahlt" are one string
   * in one language, and no Component here may compose the two.
   */
  label: ReactNode
  /**
   * The commands, in the order the arrow keys walk them.
   *
   * Required, and the order is the caller's because it is a claim about how often
   * each is used. Nothing is drawn between them: no separators and no groups, so
   * the order is the only grouping the row has.
   */
  commands: readonly SelectionToolbarCommand[]
  /**
   * The accessible name of the dismiss control.
   *
   * Required, and the reason is the one `Toast` states for its close control: a
   * control the reader reaches towards has to say what it is before they press
   * it, and four products in at least two languages cannot all be told it says
   * "Clear selection".
   */
  dismissLabel: string
  /**
   * Called when the reader asks for the selection to end.
   *
   * Required, and Prism does not clear the selection itself. The selection lives
   * in the caller's rows, in its own checkboxes or its own table state, and a
   * Component that unchecked them would be writing to data it was handed as a
   * count. The caller unmounts the toolbar by clearing the selection, which is
   * also why `label={null}` is how it leaves rather than a `hidden` prop.
   */
  onDismiss: () => void
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/** The drawn commands, read back for the arrow-key walk. */
const COMMAND_SLOT = '[data-slot="selection-toolbar-command"]'

/**
 * Whether the caller says there is nothing selected.
 *
 * The test is "renders nothing" rather than a list of the nothing values, for the
 * reason `LiveRegion` states in full: a caller passing an empty string, a null
 * from a state that has not resolved and a false from a condition are three
 * routes to the same state, and a list of three is a list a fourth route would
 * miss.
 */
function isNothing(label: ReactNode): boolean {
  return label === undefined || label === null || label === false || label === ''
}

/**
 * A toolbar that exists because something is selected, and acts on it.
 *
 * **It is a different Component from `TextFormatToolbar`, and the two disagree
 * about focus.** That is the argument, and it is a disagreement rather than a
 * difference of content: a text format toolbar **must** refuse to move focus on a
 * press, because focus leaving a `contenteditable` collapses its selection in
 * several engines and the command would act on nothing, so it takes a
 * `getEditor` and hands focus back after every command. A selection toolbar over
 * rows **must let** focus move, because a keyboard reader has to Tab back to the
 * list to change what is selected, and a row's checkbox has to be able to receive
 * focus to be unchecked. One Component could not do both, and a
 * `preserveFocus` boolean over the two would be a prop whose two answers are "this
 * is the Component for a caret" and "this is the Component for a set of rows",
 * which is the kind of prop that makes a catalogue a second list of call sites.
 * So the roles are the same and the focus contract is the Component.
 *
 * **It renders nothing when nothing is selected, and the cost is the caller
 * holding the sentence.** See `label`. A Component that counted for itself would
 * need a `count` and a plural rule, and the plural rule is a language question:
 * English puts the noun in the middle, Polish puts it in the genitive and adds
 * three forms, and no Component here may know any of that. The caller passes the
 * finished words and this Component never invents one.
 *
 * **Unavailable is drawn and walked, not removed and not the native `disabled`.**
 * A command that cannot run keeps its place in the row and in the arrow-key walk,
 * carries `aria-disabled`, and refuses the press in its handler, which is the
 * arrangement `Dropzone` states in full: a control that vanishes leaves a
 * keyboard reader with a gap and no announcement, and a natively disabled one
 * leaves a hole they have to interpret. The cost is that the row is wider than
 * the set of things a reader can do about the selection they have made.
 *
 * **The commands are drawn, and the selection is not read.** Prism never calls
 * `window.getSelection` and never asks what is selected, for the same reason
 * `TextFormatToolbar` does not: the rows may be a table, a grid, a card list or
 * something behind a consumer's own state, and the DOM selection a browser would
 * report is either absent or a fiction. So the caller owns whether a command can
 * run, what running it does, and what happens to the selection afterwards, and
 * this Component's entire claim about the selection is that it exists while there
 * is one and says how much of it there is.
 *
 * **The dismiss control is a second command and not a property of the row.** A
 * selection ends by the reader saying so, and a row that could not be ended would
 * leave a reader who selected the wrong eleven rows with no way back that does not
 * involve the checkboxes. It is a real button with its own name rather than a
 * drawn affordance, so the cost is one more stop in a row whose commands are
 * otherwise the caller's.
 *
 * **The row is named by the label it already draws.** `aria-labelledby` on the
 * leading label rather than an `aria-label`, because `label` is a `ReactNode` and
 * there is no string here to put in an `aria-label`, while a reference reads the
 * rendered words. So a reader tabbing onto the row hears the selection and the
 * commands in one announcement, and the two cannot drift apart.
 * `TextFormatToolbar` states the same rule from the other end, where its name is a
 * string and `aria-label` is what takes it.
 *
 * **It is a client Component**, because it holds the one tab stop the `toolbar`
 * role promises, walks it with four keys, and takes the dismissal callback. What
 * that costs is that a server-rendered page cannot show a selection toolbar at all,
 * which is correct, because a selection is something a reader did and a server has
 * not heard about it yet.
 */
function SelectionToolbar({
  label,
  commands,
  dismissLabel,
  onDismiss,
  className,
}: SelectionToolbarProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  // The name of the toolbar, taken from the label the reader can already see.
  //
  // The visible label is a `ReactNode` because the count is a sentence in the
  // caller's language and this Component may not compose one, so the name cannot be
  // an `aria-label`: there is no string here to put in one. `aria-labelledby` reads
  // the rendered text of the element it points at, which is the arrangement
  // `ChoiceCard` uses for its legend and for the same reason, and it has the second
  // property that matters, which is that the name and the words cannot drift apart.
  const labelId = useId()
  // The one tab stop the `toolbar` role promises, held as a position so a caller
  // who reorders the commands does not strand the reader on a command that moved.
  const [active, setActive] = useState(0)
  // Clamped to the row, because a caller who removes commands can leave the
  // remembered position past the end and a toolbar with no tab stop is a toolbar a
  // keyboard reader has to step over.
  const stop = active < commands.length ? active : 0

  if (isNothing(label)) return null

  const focusCommand = (index: number) => {
    const count = commands.length
    if (count === 0) return
    // Wrapping is the toolbar model rather than the list model: a reader who
    // arrows off the right end expects the row to continue, because a row that
    // stops is a row they have to Tab out of and back into to reach the first
    // command again.
    const next = ((index % count) + count) % count
    setActive(next)
    const command = rootRef.current?.querySelectorAll<HTMLElement>(COMMAND_SLOT).item(next)
    command?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        focusCommand(active + 1)
        return
      case 'ArrowLeft':
        event.preventDefault()
        focusCommand(active - 1)
        return
      case 'Home':
        event.preventDefault()
        focusCommand(0)
        return
      case 'End':
        event.preventDefault()
        focusCommand(commands.length - 1)
        return
      default:
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="selection-toolbar"
      role="toolbar"
      // The name, and the reason it is a reference rather than a string is the note
      // on `labelId`. A `toolbar` is one of the roles ARIA names a MUST for: a reader
      // arriving at it by Tab is told "toolbar" and nothing else, so a page with two
      // of them is a page where they cannot tell which row of commands they have
      // reached. The row drew its name all along, in the leading label a sighted
      // reader reads first.
      aria-labelledby={labelId}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        'bg-card flex w-full items-center gap-1 rounded-md border p-1',
        className,
      )}
    >
      <span
        id={labelId}
        data-slot="selection-toolbar-label"
        className="text-muted-foreground px-2 text-sm font-medium"
      >
        {label}
      </span>

      {commands.map((command, index) => (
        <Button
          key={command.id}
          data-slot="selection-toolbar-command"
          type="button"
          variant="ghost"
          size="sm"
          tabIndex={index === stop ? 0 : -1}
          aria-label={command.label}
          aria-disabled={command.disabled || undefined}
          onClick={command.disabled ? () => undefined : command.onRun}
        >
          {command.icon}
        </Button>
      ))}

      <Button
        data-slot="selection-toolbar-dismiss"
        type="button"
        variant="ghost"
        size="sm"
        aria-label={dismissLabel}
        onClick={onDismiss}
      >
        <XIcon aria-hidden="true" />
      </Button>
    </div>
  )
}

export { SelectionToolbar }
'use client'

import { useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'

import { Button } from './button'
import { Toggle } from './toggle'
import { cn } from '../../lib/utils'

/**
 * One command in a text format toolbar: an id, a name, a mark, whether it can run
 * right now, and what running it does.
 *
 * The enabled state is caller data and that is the load-bearing decision. Prism
 * does not read the selection, cannot read it in the editors that matter, and a
 * toolbar that guessed would either grey out a command that works or leave a
 * command live that does nothing. So the caller answers the question it is the
 * only party that can, on every render, and Prism draws the answer.
 */
export type TextFormatCommand = {
  /**
   * The caller's own identity for the command.
   *
   * Required, and required as a stable string rather than as the label, for the
   * reason every keyed list in this package says: the caller's own words are
   * localised, and a toolbar keyed on a localised label remounts a control the
   * moment the reader changes language, which drops the focus the Component just
   * took pains to hold.
   */
  id: string
  /**
   * The command's accessible name, in the product's own words.
   *
   * Required, and a string because a name is a string. Format commands are almost
   * always icon-only, and a row of icon-only buttons with no names is announced
   * as "button, button, button", which is three controls nobody can tell apart and
   * a toolbar whose whole job is that they differ. Write the verb or the format
   * name in the reader's language: "Bold", "Insert link", "Decrease indent".
   */
  label: string
  /**
   * The mark for the command.
   *
   * A `ReactNode` and not an icon name, because the icon set is Lucide's and the
   * vocabulary a product uses for formatting is its own: a CMS that calls the
   * third row a "quote block" wants a glyph that is not Prism's to choose. Pass an
   * `svg` or an `img`; it is drawn at the size `Button` gives any child, and it
   * should be `aria-hidden` because `label` already names the control.
   */
  icon?: ReactNode
  /**
   * Whether the command is currently applied, for a command that has an on state.
   *
   * Omit it and the command is drawn as a `Button` and announced as a button. Pass
   * `true` or `false` and it is drawn as a `Toggle` carrying `aria-pressed`, which
   * is the difference between "bold is available here" and "bold is on right now".
   * The two are routinely confused, and a toolbar that reports the first as the
   * second tells a screen reader user their text is bold when it is not, which is
   * the one claim in a text editor a reader cannot check for themselves.
   */
  pressed?: boolean
  /**
   * Whether the command can run against the selection as it stands.
   *
   * Required, and a boolean rather than a callback on purpose. A callback would be
   * read at the moment of the press, which is the moment the selection has already
   * been disturbed by the press, so the answer would be about a selection that no
   * longer exists. A boolean read on render is about the selection the reader can
   * see, which is the one the command will act on.
   */
  isEnabled: boolean
  /**
   * Runs the command against the caller's selection.
   *
   * Required, and the caller owns everything inside it: reading the selection,
   * applying the format, and restoring the range afterwards. Prism calls it and
   * then hands focus back, in that order, for the reason the props below state.
   */
  onApply: () => void
}

/**
 * The props the Text format toolbar accepts.
 *
 * A declared interface rather than a forwarded native one: the Component draws a
 * `toolbar` and its own children, so there is no native element left to forward
 * to and a forwarded `onKeyDown` would be a second place the arrow-key model
 * lives.
 */
export interface TextFormatToolbarProps {
  /**
   * The commands, in the order the arrow keys walk them.
   *
   * Required, and the order is the caller's because it is a claim about how often
   * each command is used: a formatting row where link sits between bold and
   * italic is one every reader has to learn again. Prism draws no separators and
   * draws no groups, so an order is the only grouping the row has.
   */
  commands: readonly TextFormatCommand[]
  /**
   * The toolbar's accessible name.
   *
   * Required, and a string because an accessible name is a string. A `toolbar`
   * role with no name is a landmark a screen reader user walks past twice, and
   * this row is usually one of several on a page. Write what the commands act on:
   * "Text formatting", "Formatting for the description".
   */
  label: string
  /**
   * Returns the element that holds the selection the commands act on.
   *
   * Required, and a function rather than a ref because the Component has to read
   * it at two moments it cannot predict: after a press, to know whether the reader
   * is still on the toolbar and therefore whether focus is owed back, and after
   * the command has run, to send that focus to the element that lost it. A ref
 * * would be read once, at mount, which is before the caller's editor exists in
   * most arrangements and stale for the rest of the page's life.
   *
   * Return the element that should receive focus: a `contenteditable`, the wrapper
   * around a third-party editor, the input a markdown source is typed into. Return
   * `null` and the Component runs the command and leaves focus alone, which is the
   * right answer for a caller whose commands open something else.
   */
  getEditor: () => HTMLElement | null
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The commands, read back through one root ref for the arrow-key walk and for the
 * focus handoff.
 *
 * The Component's own slot rather than a ref per command, for the same reason
 * `RepeatableRows` does it: a ref array indexed by position is a second list to
 * reconcile against the caller's `commands` on every render, and the commands are
 * the caller's data. A query reaches exactly the set that has to move, which is
 * the set this Component drew.
 */
const COMMAND_SLOT = '[data-slot="text-format-toolbar-command"]'

/**
 * A row of commands that act on a selection somewhere else on the page.
 *
 * **It is a `toolbar` and not a row of buttons, and the role is the Component
 * rather than a prop.** Prism already owns the other half of this decision in
 * `DataToolbar`, and it drew the opposite one for a good reason: that row is a
 * frame, its controls are the caller's, and a `toolbar` role teaches a reader that
 * the arrow keys move between the things inside it, which is a promise a frame
 * that mostly holds a search box does not keep. Here the promise is kept, because
 * every control in the row is drawn by this Component out of the caller's command
 * data, which means the Component also owns the set the reader walks and the focus
 * it has to hand back. Taking the role as a prop would be the `DataToolbar`
 * arrangement with the awkward half removed, and it would let a caller have a row
 * that claims the arrow-key model without owning anything it could be consistent
 * about. So the role is not a choice here, and the arrow keys, the single tab stop
 * and the Home and End keys are part of what this Component is.
 *
 * **The enabled state is a state contract of the surface, and that is why this is
 * not a slot.** The obvious composition is a `DataToolbar` with the caller's
 * buttons in it, and it is the wrong one for a reason that only shows up once the
 * selection moves: whether a command is live is a fact about a document state
 * Prism cannot see, so it changes without any prop of the layout changing and
 * without a render being caused by anything Prism did. A slot hands that question
 * to the caller, and the caller answers it in whatever control they happened to
 * draw, which is how "bold is available" ends up painted as "bold is on" and how a
 * command that cannot run ends up focusable and silently doing nothing. Here the
 * question is a required boolean on every command, so it is answered for every
 * command on every render, and a command that cannot run says so.
 *
 * **What Prism cannot verify about the selection is most of it, and it says so
 * rather than implying otherwise.** This Component never calls
 * `window.getSelection`. It cannot: the editor may be a `contenteditable`, a
 * third-party editor with its own document and its own model, an `iframe`, or a
 * canvas, and in every one of those cases the DOM selection a browser would
 * report is either absent or a fiction. So three things are the caller's: whether
 * a command can run, what running it does, and where the range is afterwards. The
 * Component's entire claim about the selection is the one thing it can honestly
 * make, which is that a pointer press on a command does not take focus out of the
 * editor, because focus leaving a `contenteditable` collapses its selection in
 * several engines and the command would then act on nothing. That is why every
 * control carries a `mousedown` that prevents the default.
 *
 * **A pointer press does not move focus, and a keyboard one has to.** Those are
 * opposite requirements and the Component answers both, which is the part worth
 * being explicit about. Preventing the default on `mousedown` keeps the editor's
 * focus, and therefore its selection, alive; a reader using a mouse never sees a
 * focus ring on a command, and that is correct, because their focus never left
 * the text they are editing. A reader using the keyboard reaches the commands with
 * Tab, which is the one tab stop the `toolbar` role promises, and then their focus
 * genuinely is on a command, so the Component owes it back.
 *
 * **Focus goes back after the command, and only if it is still on the toolbar.**
 * Order matters: a command that restores its own range does it against whatever
 * has focus at the time, so the Component sends focus back last and the caller's
 * range is the last thing standing. And the return is conditional, because a
 * command that opened a dialog or moved focus into a preview has already put the
 * reader where they belong, and a Component that pulled focus back from it would
 * be undoing the caller's own arrangement. Prism's claim stops at the element
 * `getEditor` returned. It cannot restore the caret's offset, the scroll position
 * or the direction of the range, and it does not try: a selection is a claim about
 * the caller's document, and a Component that guessed at one would be the reason a
 * reader's text was rewritten in a position they did not choose.
 *
 * **Unavailable is drawn, not removed, and it is not the native `disabled`.** A
 * command that cannot run keeps its place in the row and in the arrow-key walk,
 * carries `aria-disabled`, and refuses the press in its handler. The same argument
 * `Dropzone` makes: a control that vanishes leaves a keyboard reader with a gap and
 * no announcement, and a natively disabled one leaves the row with a hole in it
 * that a reader has to interpret. The cost is that the row is wider than the set
 * of things a reader can do right now, and the reason a command is unavailable is
 * the caller's to state beside the editor.
 *
 * **It composes `Button` and `Toggle` and does not compose `Tooltip`, and the
 * refusal has a reason worth recording.** Every command's control is one of those
 * two, so the metrics, the press feedback, the coarse-pointer floor and the
 * full-strength ring are Prism's and not re-derived. `Tooltip` cannot join them,
 * because `TooltipTrigger` renders its own `<button>`: wrapping a command in one
 * would put a button inside a button, which is the arrangement `Dropzone` refuses
 * for a file input and for exactly the same reasons. So the name is the
 * `aria-label` and a caller who wants a phrase beside an icon-only command puts a
 * `Tooltip` around their own editor control, or names the command in full.
 *
 * **It is a client Component**, because it takes focus from one element and gives
 * it to another, holds the one tab stop the role promises, and takes three
 * callbacks. None of that is knowable at a server render, and all of it is the
 * Component's reason to exist. What it costs is a small one, and worth naming: the
 * Component reads the commands on every render, so a caller who recomputes its
 * `isEnabled` booleans by walking the document has done that walk on every
 * keystroke anywhere on the page.
 */
function TextFormatToolbar({
  commands,
  label,
  getEditor,
  className,
}: TextFormatToolbarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  // The one tab stop the `toolbar` role promises, held as a position so a caller
  // who reorders the commands does not strand the reader on a command that moved.
  const [active, setActive] = useState(0)
  // The one tab stop the `toolbar` role promises, clamped to the row. A caller who
  // removes commands can leave the remembered position past the end, and a
  // toolbar with no tab stop is a toolbar a keyboard reader has to step over.
  const stop = active < commands.length ? active : 0

  const focusCommand = (index: number) => {
    const count = commands.length
    if (count === 0) return
    // Wrapping is the toolbar model rather than the list model: a reader who
    // arrows off the right end expects the row to continue, because a row that
    // stops is a row they have to Tab out of and back into to reach the first
    // command again.
    const next = ((index % count) + count) % count
    setActive(next)
    const command = rootRef.current
      ?.querySelectorAll<HTMLElement>(COMMAND_SLOT)
      .item(next)
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

  const onPointerDown = (event: MouseEvent<HTMLElement>) => {
    // The one line that keeps a format toolbar working. Focus leaving an editor
    // collapses its selection in several engines, so a press that moved focus
    // would leave the command acting on a selection the reader can no longer see.
    // The control still receives the press, still draws its active surface, and
    // still fires its click; only the focus move is declined.
    event.preventDefault()
  }

  const apply = (command: TextFormatCommand) => {
    if (!command.isEnabled) return
    command.onApply()
    // Read after the command, not before: a command that opened something has
    // already moved the reader there, and pulling focus back from it would undo
    // the caller's own arrangement. A reader still on the toolbar after the
    // command has run is a reader who got there with the keyboard, and the editor
    // is where they were working.
    const root = rootRef.current
    if (root === null || !root.contains(document.activeElement)) return
    getEditor()?.focus()
  }

  return (
    <div
      ref={rootRef}
      data-slot="text-format-toolbar"
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        'bg-card flex w-full items-center gap-1 rounded-md border p-1',
        className,
      )}
    >
      {commands.map((command, index) => {
        const unavailable = !command.isEnabled

        return (
          <span
            key={command.id}
            data-slot="text-format-toolbar-item"
            data-unavailable={unavailable || undefined}
            // The unavailable surface is on the wrapper rather than on the
            // control, because `Button` and `Toggle` style the native `disabled`
            // attribute and this Component does not set it. The dimming is Prism's
            // and the control keeps its own focus ring, its press feedback and its
            // place in the arrow-key walk.
            className={cn('inline-flex', unavailable && 'opacity-50')}
          >
            {command.pressed === undefined ? (
              <Button
                data-slot="text-format-toolbar-command"
                type="button"
                variant="ghost"
                size="icon"
                tabIndex={index === stop ? 0 : -1}
                aria-label={command.label}
                aria-disabled={unavailable || undefined}
                onMouseDown={onPointerDown}
                onClick={() => apply(command)}
              >
                {command.icon}
              </Button>
            ) : (
              <Toggle
                data-slot="text-format-toolbar-command"
                type="button"
                size="sm"
                tabIndex={index === stop ? 0 : -1}
                aria-label={command.label}
                aria-disabled={unavailable || undefined}
                pressed={command.pressed}
                onMouseDown={onPointerDown}
                onClick={() => apply(command)}
              >
                {command.icon}
              </Toggle>
            )}
          </span>
        )
      })}
    </div>
  )
}

export { TextFormatToolbar }

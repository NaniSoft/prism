import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Command row accepts.
 *
 * The row holds no words of its own. `label` is the command, `hint` is whatever
 * the caller puts at the far end of it, and `keywords` are the extra words that
 * should find it. Every one of the three is a prop because the reader's language
 * is the caller's, and a row that ships an English label ships a claim about a
 * command in a product that is not this system's.
 */
export interface CommandProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  /** The words on the row. */
  label: string
  /**
   * A short run at the far end of the row, usually the keyboard shortcut.
   *
   * It is set apart from the label rather than shown on a second line, because a
   * two-line row doubles the height of every row in the list and a palette is a
   * surface a reader scans rather than reads.
   */
  hint?: string
  /**
   * Words that should also find this command.
   *
   * The row does not render them, and that is the point of accepting them: a
   * caller keeps one object per command and spreads it onto the row, so the same
   * object can be read by whatever ranks the list. Accepting the field here is
   * what lets that spread be total rather than a hand-picked three fields.
   */
  keywords?: readonly string[]
  /**
   * The characters of `label` that matched the query, as a start and an end.
   *
   * The row does not decide where the match is; whoever ranked the list does, and
   * passes the range down. That keeps one ranking in the system rather than one
   * here and a different one in the palette.
   */
  matchRange?: readonly [number, number]
  /**
   * Whether this is the highlighted row.
   *
   * The highlight is drawn on the row rather than moved as focus, so a reader can
   * keep typing in the field while they choose. A list that moves DOM focus into
   * itself takes the caret away mid-word, which is why the palette and the
   * combobox both drive this from the arrow keys instead.
   */
  active?: boolean
  /** Called when the reader chooses the command. */
  onSelect?: () => void
  /** Called when the pointer moves onto the row, so the highlight can follow it. */
  onHover?: () => void
}

/**
 * One command, as a row in a list of commands.
 *
 * **This is the leaf; `CommandPalette` is the composite.** The palette is the
 * dialog, the overlay behaviour, the scroll lock and the return of focus. This
 * is one line of what it draws, for a caller who wants the row without the
 * dialog: a settings page whose whole search list is fourteen commands, a
 * command menu on a button, a launcher inside a panel that is already a
 * floating surface and does not want a second overlay stacked on it.
 *
 * **It ranks nothing.** The row takes `matchRange` as a prop because deciding
 * where a query matches is one decision and this system makes it once, in the
 * shared scorer the palette and the combobox both call. A row that scored its own
 * label would be a second scorer that starts agreeing with the first and stops.
 *
 * **The match is emphasised by weight, not by a colour.** A `<strong>` inherits
 * whatever ink the row already has, so it is correct on the quiet row and on the
 * highlighted one. A colour would be a second ink to keep in step with the two row
 * states, and a saturated background on every matched character fights the label
 * it sits inside.
 *
 * **The row takes `role="option"` and belongs in a listbox.** The parent owns the
 * `role="listbox"`, the `aria-activedescendant` wiring and the roving `tabIndex`;
 * the row is one option inside it. The row is not focusable by Tab, because the
 * field above it keeps the caret for the whole interaction. It can still take
 * programmatic focus, and it draws a full-strength ring when it does.
 */
function Command({
  className,
  label,
  hint,
  keywords,
  matchRange,
  active = false,
  onSelect,
  onHover,
  ...props
}: CommandProps) {
  return (
    <div
      data-slot="command"
      data-active={active}
      data-keywords={keywords?.join()}
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onMouseEnter={onHover}
      // The row suppresses the browser outline and draws a ring of its own at full
      // strength, because the class that suppressed it is the only indicator a reader
      // who moved focus onto a row programmatically would otherwise have.
      className={cn(
        'text-muted-foreground hover:text-foreground flex cursor-pointer items-baseline justify-between gap-3 rounded-sm px-3 py-2 text-sm outline-none',
        'focus-visible:ring-ring focus-visible:ring-[3px]',
        active && 'bg-accent text-accent-foreground',
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">
        {matchRange === undefined ? (
          label
        ) : (
          <>
            {label.slice(0, matchRange[0])}
            <strong className="font-semibold">
              {label.slice(matchRange[0], matchRange[1])}
            </strong>
            {label.slice(matchRange[1])}
          </>
        )}
      </span>
      {hint === undefined ? null : <span className="shrink-0 text-xs">{hint}</span>}
    </div>
  )
}

export { Command }

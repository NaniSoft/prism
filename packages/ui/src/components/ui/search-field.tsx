import { SearchIcon, XIcon } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './input-group'
import { cn } from '../../lib/utils'

/** The props the Search field accepts. */
export interface SearchFieldProps {
  /**
   * The query, as the caller holds it.
   *
   * Required, and this is a controlled field because of it. See the note on the
   * Component below for what an uncontrolled search field costs a consumer whose
   * result set empties.
   */
  value: string
  /**
   * Called with the query as the reader changes it, and with an empty string
   * when the clear control is pressed.
   *
   * Required, and required for the same reason `value` is: a search field that
   * owns its own text cannot be emptied from outside itself.
   */
  onValueChange: (value: string) => void
  /**
   * The field's visible name, drawn above the control.
   *
   * Required, and it is a node rather than a string because a label is often
   * more than a word: a count beside the name, or a piece of the page's own
   * heading. The accessible name comes from the same node, through the label
   * element, so what a reader sees and what a screen reader announces are one
   * thing rather than two.
   */
  label: ReactNode
  /**
   * What the field shows while it is empty.
   *
   * A hint and not a name: it disappears on the first keystroke, and it is
   * drawn in the muted token so it reads as an instruction rather than as an
   * answer.
   */
  placeholder?: string
  /**
   * A short helper line under the control, announced with it.
   *
   * Replaced by `error` while the field is invalid rather than stacked under it,
   * because the reader needs one instruction at a time and two lines of the same
   * kind is one too many.
   */
  description?: ReactNode
  /**
   * What is wrong with the query, drawn in the destructive token and announced
   * as it appears.
   *
   * Also marks the control `aria-invalid`, so the failure is a state and not
   * only a colour. Say what to do next: the message is the caller's sentence
   * about their own product.
   */
  error?: ReactNode
  /**
   * The accessible name of the control that empties the field.
   *
   * The clear control is drawn whenever this is passed and is not drawn at all
   * when it is not, so the prop is what makes it exist rather than a label for
   * something already on screen. The words are the caller's because a screen
   * reader reads them, and "Clear" in a product in another language is a
   * sentence this package does not get to write.
   */
  clearLabel?: string
  /**
   * The caller's own line about what the query found, drawn under the control.
   *
   * A node and not a number: "12 results", "3 of 40 invoices" and "no matches
   * yet" are three different sentences, and only the caller knows which one is
   * true and what it should be called. The Component draws it, announces it and
   * refuses to count anything itself.
   */
  resultSummary?: ReactNode
  /**
   * The caller's own control at the end of the field, such as a filter trigger.
   *
   * A slot and not a button, because the trigger is the caller's: it may be a
   * menu, a popover, a second field or a toggle, and its name, its state and its
   * focus ring belong to whatever Component the caller builds it from. The slot
   * draws no fill and no border of its own for the reason set out below.
   */
  trailing?: ReactNode
  /** Layout only. */
  className?: string
}

/**
 * A labelled search input with a leading icon, an optional clear control and an
 * optional slot for the caller's own filter trigger.
 *
 * **It is controlled, and that is the whole reason `onValueChange` is required.**
 * An uncontrolled search field holds its own text, so a consumer whose result
 * set empties has no way to clear it: nothing outside the input can reach the
 * value, and a search box that cannot be cleared by the page is a search box the
 * reader has to select-all and delete one character at a time. Making the field
 * controlled costs the caller one piece of state and buys them the two things a
 * results page needs and an uncontrolled field cannot give: clearing on demand,
 * and clearing when the query no longer matches anything. The alternative, an
 * optional `onValueChange` beside a `defaultValue`, was rejected because it is
 * two Components' behaviour behind one name, and the half with no value is the
 * half that cannot be emptied.
 *
 * **This Component does not own the search landmark.** A `<search>` element, or
 * `role="search"`, names a region of the page rather than a control, and a page
 * has two real search regions only when its two fields answer two different
 * questions. A landmark on every field turns a screen reader's list of
 * landmarks into a list of text boxes, and a landmark that is not a region
 * teaches a reader that landmarks are decoration. Wrap the field yourself when
 * the page really does have one search, and put the landmark on the container
 * rather than on the field, so moving the field between containers does not drag
 * the landmark with it.
 *
 * **The clear control is drawn whenever `clearLabel` is given, including while
 * the field is empty.** The alternative was to draw it only once there was
 * something to clear, which looks tidier until a reader tabs onto it and presses
 * it: the control leaves the document under the focus and the focus falls to the
 * body, which is a keyboard reader's dead end in the middle of a form. A control
 * that is always where it was is worth the quiet space beside an empty field.
 * It is the last thing in the group for the same reason, so a caller who adds a
 * filter trigger in the trailing slot does not move the clear control out from
 * under a reader who has learned where it is.
 *
 * **The leading icon says nothing and the trailing icon says everything.** The
 * magnifier is `aria-hidden`, because the field is already named by its label and
 * a second name for one control is a control announced twice. The clear control
 * is the opposite case: an icon-only button with no name is announced as
 * "button", so it takes the name the caller supplied and the mark is
 * decoration. The platform's own clear mark on a search input is switched off for
 * the same reason: it is a second mark doing the same job, it has no name, and
 * a reader would be choosing between two of them.
 *
 * **The trailing slot draws no chrome of its own.** It is a place in the field
 * for a control the caller composes, and Prism does not restyle what a caller
 * composes. An addon wrapped around a caller's own trigger would put a grey fill
 * and a second border inside one field, which is the seam `InputGroup` was drawn
 * to remove, and a menu trigger that arrives already rounded would have to be
 * un-rounded by the caller before it looked right. Bring the control; Prism
 * holds the space for it.
 *
 * **The result line is a polite live region, and keeping it in the document is
 * the caller's job.** A count that changes as the reader types is the only thing
 * on screen that reports the consequence of typing, and nothing else says it, so
 * the line is announced politely when it changes. It is drawn only once
 * `resultSummary` is passed, so a caller who starts passing it after the first
 * render brings the region into the document together with its content, which is
 * the one case a live region is least reliable for. Pass an empty summary on the
 * first paint and the region is already there waiting. Prism cannot do that
 * itself, because Prism does not know whether a summary is ever coming.
 *
 * **It carries no directive.** It holds no state, so there is nothing of its own
 * to reconcile, and the caller that owns `value` and `onValueChange` already
 * lives in a client graph, which puts this module in the client graph with it.
 * That is also the reminder: a caller who renders this from a server component
 * gets a field whose typing never reaches their state, because a server
 * component cannot hand an event handler down. A required `value` is a piece of
 * state, and state is a client module.
 */
function SearchField({
  value,
  onValueChange,
  label,
  placeholder,
  description,
  error,
  clearLabel,
  resultSummary,
  trailing,
  className,
}: SearchFieldProps) {
  const generated = useId()
  const inputId = `${generated}-input`
  const invalid = error !== undefined
  const descriptionId = description === undefined ? undefined : `${generated}-description`
  const errorId = invalid ? `${generated}-error` : undefined

  // The error comes first when both are present, so the reader hears what is
  // wrong before the background detail, which is the order the two are drawn in.
  const describedBy =
    errorId === undefined
      ? descriptionId
      : descriptionId === undefined
        ? errorId
        : `${errorId} ${descriptionId}`

  return (
    <div data-slot="search-field" className={cn('flex w-full flex-col', className)}>
      <Field>
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
        <InputGroup>
          <InputGroupAddon position="prefix">
            <SearchIcon className="text-muted-foreground size-4" aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id={inputId}
            type="search"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            // WebKit and Blink draw their own clear mark on a search input, and
            // they draw it with no name and no way to place it. Left alone it sits
            // beside this Component's clear control, so a reader sees two marks
            // that mean the same thing and only one of which has a name.
            className="[&::-webkit-search-cancel-button]:appearance-none"
          />
          {trailing === undefined ? null : (
            <div data-slot="search-field-trailing" className="flex shrink-0 items-stretch">
              {trailing}
            </div>
          )}
          {clearLabel === undefined ? null : (
            <InputGroupButton
              data-slot="search-field-clear"
              aria-label={clearLabel}
              onClick={() => onValueChange('')}
            >
              <XIcon className="size-4" aria-hidden="true" />
            </InputGroupButton>
          )}
        </InputGroup>

        {invalid ? <FieldError id={errorId}>{error}</FieldError> : null}
        {descriptionId === undefined ? null : (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}
        {resultSummary === undefined ? null : (
          <p
            data-slot="search-field-summary"
            aria-live="polite"
            className="text-muted-foreground text-sm tabular-nums"
          >
            {resultSummary}
          </p>
        )}
      </Field>
    </div>
  )
}

export { SearchField }

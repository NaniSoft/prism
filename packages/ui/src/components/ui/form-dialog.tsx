'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'

import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Field } from './field'
import { LiveRegion } from './live-region'
import { cn } from '../../lib/utils'

/**
 * Where a form dialog's submission is.
 *
 * A closed set of four and not a boolean plus a message, and the reason is the same
 * one `LifecycleButton` gives: four states do not fit into two answers, and the
 * two that cannot be expressed are the two that cost the most. `invalid` is a
 * submission that never left the browser and `failed` is one that did, and a reader
 * who has been told the two are the same state has been told their work was
 * rejected by a server when in fact a field was empty.
 */
export type FormDialogPhase = 'idle' | 'invalid' | 'submitting' | 'failed'

/**
 * One thing wrong with the form, in the caller's own words.
 *
 * `field` is the `id` of the control the message belongs to, and the id rather
 * than the `name` because the summary's entries are anchors to it: a summary entry
 * that cannot take the reader to the control that caused it is a list they have to
 * match by eye against a form they then have to read a second time.
 */
export type FormDialogIssue = {
  /** The `id` of the control this message belongs to. */
  field: string
  /** The message, in the product's own words. */
  message: string
}

/**
 * The props a FormDialog accepts.
 *
 * Two halves, and the split is the argument. The *modal* half is `Dialog`, and
 * nothing here redraws it. The *submission* half is this Component's own, and it
 * exists because a validating submit is a state machine with an accessibility
 * contract attached to it, and neither `Dialog` nor `AlertDialog` nor `Popover`
 * carries one. The three shapes upstream ships for this are the three ways of
 * getting that contract wrong, and the refusals are on `FormDialog`: a `Popover`
 * dismisses on an outside press, so a half-answered form loses its answers; an
 * `AlertDialog` cannot be dismissed at all, so a long form traps a reader in it;
 * and a bare `Dialog` with a submit button gives a caller nowhere to put the
 * running state, so every consumer re-derives one.
 */
export interface FormDialogProps {
  /**
   * The modal's open state.
   *
   * Controlled and required rather than defaulted, because the caller's answer to
   * "is my form showing" is the fact that decides what happens to a submission in
   * flight, and a Component that could open itself would be a Component deciding
   * when a reader's answers are discarded.
   */
  open: boolean
  /** Called when the open state changes, including on Escape, the close control and an outside press. */
  onOpenChange: (open: boolean) => void
  /**
   * The content of the control that opens the dialog.
   *
   * Required and a node rather than a `ReactElement` to clone, because the trigger
   * is Prism's `DialogTrigger` and what a caller composes into it is a label or a
   * label with an icon. The cost is that a caller cannot pass their own `Button`
   * here without it becoming a button inside a button, and the answer to that is
   * that they compose `DialogTrigger` themselves in their own layout and use this
   * Component for the panel.
   */
  trigger: ReactNode
  /**
   * Where the submission is.
   *
   * Required and controlled, for the same reason `LifecycleButton` is: the caller
   * owns the request, so the caller owns where the request is. Prism draws the
   * label, the refusal, the summary and the focus move that a position implies, and
   * moves nothing itself.
   */
  phase: FormDialogPhase
  /**
   * Called when the reader asks to submit, given the form's own element.
   *
   * Required, and called only from `idle`. A control that accepted presses while a
   * submission was running would let a reader queue a second one without knowing
   * whether the first had landed, which is the double submission
   * `LifecycleButton` refuses.
   *
   * The form element rather than a record of values, because the caller owns the
   * shape of the form. This Component does not know which controls there are, what
   * they are called or what a value means, so a values record would be a second
   * description of the form that could disagree with it.
   */
  onSubmit: (form: HTMLFormElement) => void
  /**
   * Called with the form's own values when the reader asks to submit, before
   * `onSubmit` is reached.
   *
   * Optional rather than required, and the omission is the decision: a form with no
   * rules of its own is the ordinary case, and a required callback would make every
   * caller write `() => []`. It returns rather than throws, because validation
   * produces a *list* and a thrown error carries one. An empty array is the ordinary
   * result and the submission goes ahead; a non-empty one is drawn as the refusal
   * and `onSubmit` is never called, which is the whole difference between a form
   * that checks itself and one that asks a network whether it is allowed to try.
   */
  validate?: (values: FormData, form: HTMLFormElement) => readonly FormDialogIssue[]
  /**
   * The issues to draw in the refusal, given whatever the caller has.
   *
   * The second route to the same list as `validate`, and what makes a *server*
   * refusal drawable: a request that came back with errors has already happened, so
   * this Component never called `validate`, and a form whose summary can only come
   * from a local check cannot show what the server said. The two are unioned by
   * position and never merged, because drawing the local result over the server's
   * would hide the one the reader needs, which is the sentence saying why the
   * *server* refused.
   */
  issues?: readonly FormDialogIssue[]
  /** The dialog's heading, and the name every reader hears for it. */
  title: ReactNode
  /** One line under the heading saying what submitting this will do. */
  description?: ReactNode
  /**
   * The label of the submit control while nothing has been attempted.
   *
   * Required and never defaulted: "Create workspace", "Save changes" and "Guardar
   * cambios" are three products' answers to the same control.
   */
  idleLabel: ReactNode
  /**
   * The label of the submit control while the form stands refused.
   *
   * Required, and it is the action again rather than a description of the problem,
   * because the control is still a control the reader can press once they have
   * fixed what is wrong, and a label that has become an error message is a control
   * that no longer says what it does.
   */
  invalidLabel: ReactNode
  /** The label of the submit control while the submission is running. */
  submittingLabel: ReactNode
  /** The label of the submit control after the submission was refused by something. */
  failedLabel: ReactNode
  /**
   * The heading above the error summary.
   *
   * Required, and a heading rather than a sentence because the summary is a focus
   * target and a reader who lands on it has to know what they have landed on before
   * they read the list. "There is a problem" and "Two fields need attention" are a
   * product's two, and only the second one carries the count.
   */
  errorSummaryLabel: ReactNode
  /**
   * The words naming one field, given its id.
   *
   * Required, and a function of the id rather than of the message for the reason
   * every readable string here is one. It is also what lets a summary entry name
   * the *control* rather than repeat the message beside it, so the reader is taken
   * somewhere and told what it is on the way.
   */
  fieldLabel: (field: string) => string
  /**
   * The words of the control that leaves the dialog without submitting.
   *
   * Required, and there is always one. A modal whose only way out is its submit
   * control is a trap a keyboard reader cannot leave, and a reader who opened the
   * wrong form deserves one keypress back out.
   */
  cancelLabel: ReactNode
  /**
   * The accessible name of the built-in close control.
   *
   * A prop and not a fixed word, for the reason `Dialog` states: a consumer that
   * localises its dialog cannot otherwise localise the one control that dismisses
   * it.
   */
  closeLabel?: string
  /** The form's own controls, which the caller's `Field` and `Input` compose. */
  children?: ReactNode
  /**
   * The controls beside cancel and submit.
   *
   * Rendered as a slot rather than replacing the two, because a caller who has to
   * re-derive a refused submit control to add a third button is a caller who gets
   * the refusal wrong. What belongs here is the *extra* control: a save-as-draft
   * beside cancel, a destructive delete beside submit.
   */
  extraActions?: ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The error summary's own frame.
 *
 * A tinted destructive surface rather than a filled one, so a form with one wrong
 * field is not interrupted by a block of red, and destructive ink because the
 * summary is only ever rendered when something is wrong. It sets its own fill and
 * therefore its own ink, for the reason the Stated Ink Rule gives: an ink left to
 * be inherited is whatever surface the element happens to be sitting on.
 */
const SUMMARY = 'border-destructive/40 bg-destructive/5 text-destructive rounded-md border p-3'

/**
 * The summary's focus target, drawn once.
 *
 * `tabIndex={-1}` at the call site and not `tabIndex={0}`, and the difference is
 * the whole keyboard model: a focus target that is a tab stop adds a permanent stop
 * to every reader's journey for a region that exists only after a refusal, while
 * `-1` makes it focusable by script and by nothing else. The outline is suppressed
 * because the ring replaces it, and the ring is `ring-ring` at full strength on
 * `focus-visible` for the reason every ring in this package is: the token is the
 * one measured to clear 3:1 against every surface, and a destructive ring on a
 * panel whose own ink is already destructive reads as a second error rather than
 * as an indicator.
 */
const SUMMARY_FOCUS = 'rounded-sm outline-none focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * A modal that owns a validating submit: it runs the caller's rules before the
 * submission, draws what is wrong where it can be acted on, and keeps the reader
 * where they were when a submission is refused.
 *
 * **It is the accessibility centrepiece of the three modal shapes, and what makes
 * it one is a focus move rather than a drawing.** A form dialog has four things a
 * reader must be able to do from a keyboard: submit it, be told what is wrong, get
 * to whatever is wrong, and get back to where they were. The first three are
 * ordinary and the fourth is where a hand-rolled version fails. A refusal tends to
 * re-render the form's content, and a re-render that replaces the control the
 * reader was on leaves focus on `body`: a reader in a six-field form is now at the
 * top of the document with no idea which field they were in. So on a refusal the
 * summary takes focus and nothing else does.
 *
 * **The move is to the summary and not to the first invalid field, because a
 * summary is a list and a first field is one of its entries.** A reader with one
 * mistake out of six needs the count and the whole list, since they have to decide
 * whether to fix everything or abandon the form; landing them in the first field
 * gives them neither and makes them Tab through the rest to assemble what they were
 * just told. The summary takes focus and is deliberately *not* a `role="alert"`: an
 * alert in the same commit as a focus move is one refusal announced twice in two
 * voices, which is the arrangement `LifecycleButton` explicitly avoids.
 *
 * **Validation runs before the submission and its result is unioned with the
 * server's by position, never merged.** `validate` is a local check over the form's
 * own values, so a field left empty is caught before a request goes out and the
 * reader is not made to wait for a round trip to be told what the form already
 * knew. `issues` is the other route, for a request that came back refused, and both
 * reach one summary because a form that can show local errors and not server errors
 * is a form whose worst errors are the ones it hides. Merging was rejected: a local
 * result arriving after the server's would overwrite the sentence that says why
 * the *server* said no.
 *
 * **A refusal with nothing to draw is the caller's own transitional state, and this
 * Component says nothing rather than inventing a sentence.** A caller who sets
 * `phase` to `invalid` on the way to a server response and passes `issues` as
 * undefined is between two states, and the honest drawing is no summary, no
 * announcement and no focus move until there is something to read. The cost is
 * named rather than hidden: a caller in that state has a submit control labelled as
 * a refusal with no explanation on the page, which is why `invalidLabel` is required
 * and why the documentation says to set the phase when the issues arrive.
 *
 * **The submit control refuses a second press while one is running and says so
 * rather than vanishing.** `aria-disabled` and not the native attribute, for the
 * reason `Dropzone` and `LifecycleButton` both give: a natively disabled control
 * leaves the tab order, so a reader tabs onto where it was, presses Enter and
 * nothing happens with no announcement to explain it. Here the control keeps its
 * place, keeps its ring, and announces itself as busy. The price is a tab stop that
 * does nothing, which is what every disabled control costs and is why this package
 * draws them rather than removing them.
 *
 * **The modal is `Dialog` and only `Dialog`, and the two refusals are the argument
 * rather than a preference.** A `Popover` closes on an outside press, so for a form
 * it means a reader who clicks the page behind has silently lost six fields of
 * typing with no warning and no route back. An `AlertDialog` refuses dismissal
 * outright, so for a form it is a trap: a twelve-field dialog with no outside press
 * and no Escape is a surface a reader cannot leave once they are in it. `Dialog` is
 * the only one of the three that can be dismissed and does not dismiss itself, and
 * that is the property a form needs. The backdrop, the portal, the focus trap, the
 * scroll lock and Escape are composed rather than reimplemented, for the reason
 * every composition here is one: two implementations of a focus trap disagree
 * within a release and a consumer cannot tell which they got.
 *
 * **It is a client Component**, because validation and submission happen after the
 * reader acts, because the summary's focus move is script, and because every one of
 * its value props is a function the caller hands it, which is a client-to-client
 * boundary wherever it is written. What that costs is the price of every client
 * control: a server Component may render this panel once with the form's values in
 * place, and what it may not do is check them.
 */
function FormDialog({
  open,
  onOpenChange,
  trigger,
  phase,
  onSubmit,
  validate,
  issues,
  title,
  description,
  idleLabel,
  invalidLabel,
  submittingLabel,
  failedLabel,
  errorSummaryLabel,
  fieldLabel,
  cancelLabel,
  closeLabel,
  children,
  extraActions,
  className,
}: FormDialogProps) {
  const generated = useId()
  const headingId = `${generated}-errors`
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  // The local check's result, held so the refusal can be drawn from a check this
  // Component ran itself. Cleared the moment a submission is allowed through, so a
  // later refusal never shows a stale message from an earlier attempt.
  const [local, setLocal] = useState<readonly FormDialogIssue[]>([])
  // The phase the last focus move was made from. The move happens on the
  // transition into a refusal and not on every render while the reader is sitting
  // on the summary, which is what stops a reader who tabs away and back from being
  // dragged onto it again.
  const movedFor = useRef<FormDialogPhase>('idle')

  const refused = phase === 'invalid'
  const shown: readonly FormDialogIssue[] = refused ? (issues ?? local) : []
  const running = phase === 'submitting'

  useEffect(() => {
    if (!open) {
      movedFor.current = 'idle'
      return
    }
    if (!refused) {
      movedFor.current = 'idle'
      return
    }
    if (movedFor.current === 'invalid') return
    movedFor.current = 'invalid'
    // Only when there is something to read. A refusal with no issues drawn is the
    // caller's own transitional state, and moving focus onto a region with no
    // content is a reader being told there is a problem and then finding none.
    if (shown.length > 0) summaryRef.current?.focus()
  }, [open, refused, shown.length])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (running) return
    const form = formRef.current
    if (form === null) return

    if (validate === undefined) {
      setLocal([])
      onSubmit(form)
      return
    }

    const found = validate(new FormData(form), form)
    setLocal(found)
    // A refusal never reaches `onSubmit`, which is the whole distinction between a
    // form that checks itself and one that asks a network whether it is allowed to
    // try.
    if (found.length > 0) return
    onSubmit(form)
  }

  const label = running
    ? submittingLabel
    : phase === 'failed'
      ? failedLabel
      : refused
        ? invalidLabel
        : idleLabel

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger data-slot="form-dialog-trigger">{trigger}</DialogTrigger>

      <DialogContent closeLabel={closeLabel} className={cn('max-w-overlay-form', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description === undefined ? null : <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          ref={formRef}
          data-slot="form-dialog-form"
          // The browser's own bubbles are off because this Component reports
          // validity in one place, and a bubble over a styled message is two
          // reports of one problem in two voices.
          noValidate
          onSubmit={submit}
          className="flex flex-col gap-4"
        >
          {children}

          {/*
           * The error summary, and the one focus move this Component makes.
           *
           * `Field` and not a bare `div`, because the summary is a group of related
           * things about one form and `Field` is the primitive that says so with a
           * `role="group"` and the vertical rhythm a list of them needs. It is the
           * same primitive the caller's own fields are made of, so the summary reads
           * as part of the form rather than as an alert dropped above it.
           *
           * `tabIndex={-1}` makes it a script target and not a tab stop: it exists
           * only after a refusal, and a region that appears and disappears must not
           * leave a hole in the order. It is deliberately *not* a `role="alert"`,
           * because the focus move announces it and an alert in the same commit is
           * one refusal heard twice in two voices. The heading is drawn rather than
           * the region named by a prop, so the name a reader hears and the heading a
           * sighted reader reads are the same text by construction.
           */}
          {shown.length === 0 ? null : (
            <Field
              ref={summaryRef}
              data-slot="form-dialog-error-summary"
              aria-labelledby={headingId}
              tabIndex={-1}
              className={cn(SUMMARY, SUMMARY_FOCUS)}
            >
              <h2
                id={headingId}
                data-slot="form-dialog-error-summary-heading"
                className="text-sm font-semibold"
              >
                {errorSummaryLabel}
              </h2>

              {/*
               * The entries, and each is an anchor to the control that caused it
               * with the message beside it.
               *
               * An anchor rather than a button, because the destination is a place
               * in this document and the browser's own fragment handling is what
               * moves focus onto the control: a reader who follows one is put on the
               * field, not merely scrolled past it. The visible text is the field's
               * own label and the message sits after it, so the entry names the
               * control rather than making the reader choose between a label and a
               * sentence and infer the pairing.
               */}
              <ul data-slot="form-dialog-issues" className="mt-1 flex list-none flex-col gap-2">
                {shown.map((issue) => (
                  <li key={`${issue.field}:${issue.message}`} data-slot="form-dialog-issue">
                    <a
                      href={`#${issue.field}`}
                      data-slot="form-dialog-issue-link"
                      className={cn(
                        'hover:underline',
                        'focus-visible:ring-ring',
                        'rounded-sm text-sm font-medium',
                        'underline underline-offset-2 outline-none',
                        'focus-visible:ring-[3px]',
                      )}
                    >
                      {fieldLabel(issue.field)}
                    </a>
                    <p data-slot="form-dialog-issue-message" className="text-sm">
                      {issue.message}
                    </p>
                  </li>
                ))}
              </ul>
            </Field>
          )}

          <DialogFooter className="mt-2">
            <div data-slot="form-dialog-actions" className="flex flex-wrap items-center gap-2">
              {extraActions}

              <Button
                data-slot="form-dialog-cancel"
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {cancelLabel}
              </Button>

              {/*
               * The submit control, and the refusal is here as well as on the
               * form's own submit handler. A reader pressing this from the keyboard
               * produces a submit event, but the refusal has to hold for the press
               * itself, and `aria-disabled` deliberately keeps the control operable
               * so that the refusal is a decision rather than the browser's.
               */}
              <Button
                data-slot="form-dialog-submit"
                type="submit"
                aria-disabled={running || undefined}
                onClick={(event) => {
                  if (running) event.preventDefault()
                }}
              >
                {label}
              </Button>
            </div>
          </DialogFooter>
        </form>

        {/*
         * The two positions a focus move does not cover.
         *
         * The refusal is announced by the summary taking focus, so this region says
         * nothing then: an announcement of a refusal here would be the second of the
         * two voices the summary's focus move exists to avoid. What it carries is
         * the submission starting, which is polite because a reader who has just
         * pressed submit knows, and the submission being refused by something other
         * than the form's own rules, which is assertive because nothing else on the
         * page has said so.
         */}
        <LiveRegion
          data-slot="form-dialog-status"
          className="sr-only"
          politeness={phase === 'failed' ? 'assertive' : 'polite'}
        >
          {phase === 'failed' ? failedLabel : running ? submittingLabel : ''}
        </LiveRegion>
      </DialogContent>
    </Dialog>
  )
}

export { FormDialog }

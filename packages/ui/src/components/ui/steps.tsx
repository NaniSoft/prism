import { cn } from '../../lib/utils'

/** Where a step stands relative to the one the reader is on. */
type StepState = 'complete' | 'current' | 'upcoming'

/**
 * One step in a sequence.
 *
 * `label` is the step, in the caller's words: a short noun or verb phrase, the
 * thing that is either done or not. `description` is the qualifier, and it is a
 * separate field because the two answer different questions and have different
 * readers. A label is what a reader scanning the rail is looking for, and it has
 * to survive at the width a step gets in a six step row. A description is what a
 * reader who has arrived at this step wants, and it can be a sentence. Putting
 * both in one field means one of the two is truncated, and the one that is
 * truncated is chosen by the width of the container rather than by the reader.
 */
export type Step = {
  /** The step, in the caller's words. */
  label: string
  /** The qualifier under the label, for a reader who has arrived here. */
  description?: string
  /**
   * This step's state, overriding the one derived from its index and `current`.
   *
   * Derived is the default and the override is the exception, in that order,
   * because the derived answer is the one that cannot disagree with `current`.
   * Read the reasoning on `Steps` before passing one; the short version is that
   * an override is a second source of truth about a position, and a second
   * source of truth is what the rest of this package is organised to avoid.
   */
  state?: StepState
}

/** The props the Steps accepts. */
export interface StepsProps {
  /**
   * The sequence, in order. The order is the claim: a reader who is told these
   * are steps is told there is a route through them, so a list passed in an
   * order the process does not have is a wrong diagram rather than a layout
   * problem.
   */
  steps: readonly Step[]
  /**
   * The index of the step the reader is on, zero based.
   *
   * Required and clamped rather than optional, because a sequence with no
   * position is a list and a list is a different Component. The clamp is what
   * makes a caller's off-by-one harmless: a `current` past the end or below zero
   * lands on the nearest real step rather than on nothing, and the alternative
   * was a throw on a value that is only wrong by one.
   */
  current: number
  /**
   * The name of the sequence, read over the rail.
   *
   * Optional, and the reason it is optional rather than required is that this
   * Component's whole job is the position: `steps` and `current` are the two
   * facts it cannot do without, and a rail that is one list among many on a
   * page takes its name from the heading the caller has already put above it.
   * A page with two rails that look alike is a page where a reader cannot tell
   * which process they are in, and a checkout and an import both have four
   * steps, so a caller with more than one on a page should pass it. A prop the
   * rail cannot function without would have been the wrong shape here; a prop
   * that removes a genuine ambiguity is the right one, so it is there and
   * nothing on it depends.
   */
  label?: string
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The disc a step's mark is drawn in, one per state.
 *
 * The three states differ by shape before they differ by colour: a filled disc
 * for a step that is done, an outlined one for the step the reader is on, and a
 * filled muted one for a step ahead. That is the whole discipline behind a
 * component that is read as feedback, and it is why the state is not a colour
 * here either: a filled mint disc and a mint outline are the same picture
 * narrowed to one channel, and a reader who cannot separate them is being told
 * the same thing about two different steps.
 */
const MARKER: Record<StepState, string> = {
  complete: 'bg-primary text-primary-foreground border-primary',
  current: 'bg-background text-foreground border-primary',
  upcoming: 'bg-muted text-muted-foreground border-border',
}

/** An index held inside the sequence, so a `current` past either end lands on a real step. */
function clamp(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(Math.trunc(value), 0), total - 1)
}

/**
 * An ordered indicator of where a reader is in a sequence.
 *
 * **The state is derived from the index and `current`, and the derivation is the
 * answer that cannot disagree.** A caller's `current` is one number and the
 * states before and after it are consequences of it, so the three can never
 * drift: move `current` and every mark moves with it, and there is no
 * combination of `current` and `state` a caller can pass that says step one is
 * behind them and step two is also behind them. That is not a convenience. The
 * failure is invisible in review and visible only in use, on the screen where
 * the reader is looking at a rail that says they have finished the thing they
 * are doing, and there is no way for a reader to tell which of the two marks is
 * the one to believe.
 *
 * **The override exists for a sequence that is not the process.** A checkout
 * where a reviewer approved a line out of band, a migration where one stage was
 * completed by hand last night, a form where the reader has already answered
 * the question that step two would have asked. In those cases the position and
 * the state are two different facts, and a derived mark would draw a claim the
 * data contradicts. So `state` is a prop, and the cost of it is named: it is a
 * second source of truth about a position, which is the thing this package is
 * organised to avoid, so it is an override per step rather than a mode, and the
 * derivation still decides every step the caller said nothing about. A caller
 * that overrides everything has replaced the rule with their own and gained
 * nothing but the type.
 *
 * **Exactly one step is current, and it is enforced rather than described.** Two
 * steps marked current is a rail with two answers to "where am I", and no step
 * marked current is a rail with none, which is the state a reader cannot act on
 * at all. Both are checked against the resolved list rather than against the
 * declaration, because the interesting case is neither of them directly: a
 * caller who marks the step `current` points at as something else has removed
 * the only mark that said where they were, and no declaration in the data
 * mentions a current step at all. So the resolved states are counted and a count
 * that is not one is a thrown diagnostic rather than a drawing. A derivation
 * alone can never produce that count, so the diagnostic only ever fires on a
 * caller's own declarations, which is the arrangement that keeps it a real
 * signal rather than a nuisance.
 *
 * **The rule between the steps is the honest indicator, and the reason is that
 * the alternatives restate the same fact.** A filled bar under every completed
 * step says "this one is done" once per step, so a reader looking at a
 * six step rail is given the same sentence six times and has to combine them
 * themselves to learn the one thing they came for, which is how much is behind
 * them. The connector carries that fact once and carries something the bars
 * cannot: it measures the space between two stages, so it is the only element
 * that shows the sequence has a length at all. It is filled up to the step the
 * reader is on and empty after it, which is also why it is the element that
 * makes a long sequence readable at a glance. A bar per step was rejected on
 * that ground, and a number per step was rejected earlier, because a number is
 * a count of where the reader is and not a measure of how far they have come.
 *
 * **`aria-current` goes on the current step and nowhere else, because a colour
 * is not a position in a sequence.** It is the only attribute on the rail that
 * states the position to a reader who cannot see the rail, and putting it
 * anywhere else is a claim about a step that is not the one the reader is on.
 * The three states are not announced, and that is deliberate rather than an
 * omission: they are consequences of the position, so a reader moving by list
 * item is already told "item two of six" and then "current", and from those two
 * the states of the other five follow. Announcing them would mean this
 * Component shipping the words "complete" and "upcoming" into every consumer's
 * product, which is the same defect the copy gate holds the close button of a
 * dialog for. The ordinal on each disc is the one thing that is hidden, and for
 * the mirror of that reason: the list semantics already say which item this is,
 * and a spoken number in front of every label is noise to a reader who is
 * reading the steps rather than counting them.
 *
 * **It is a server Component.** No hook, no state, no effect, and the rail is
 * arithmetic over props, so it costs a consumer nothing in client JavaScript and
 * renders identically with scripting off, in a print stylesheet and to a crawler.
 */
function Steps({ steps, current, label, className }: StepsProps) {
  // An empty sequence is an empty list rather than a throw. The invariant below
  // is about a rail with a position, and a caller with no steps has no position
  // to disagree about; the cost is an empty rail, which is what was asked for.
  if (steps.length === 0) {
    return <ol data-slot="steps" aria-label={label} className={cn('flex w-full', className)} />
  }

  const at = clamp(current, steps.length)
  const resolved = steps.map((step, index) =>
    step.state ?? (index < at ? 'complete' : index === at ? 'current' : 'upcoming'),
  )
  const placed = resolved.filter((state) => state === 'current').length

  if (placed !== 1) {
    // The message reaches a developer in a console and is never rendered, which
    // is why it is a sentence and why the copy gate exempts it. It names both
    // halves of the failure because they have different fixes: two currents is a
    // caller who marked two steps, and none is a caller who marked the step
    // `current` points at as something else.
    throw new Error(
      `Steps: ${placed} step(s) resolved to the current state, and exactly one must. ` +
        'Set `current` to the index of the step the reader is on, and pass `state` only ' +
        'on a step that was reached out of band.',
    )
  }

  const last = steps.length - 1

  return (
    <ol
      data-slot="steps"
      data-current={at}
      aria-label={label}
      className={cn('flex w-full flex-col gap-4 sm:flex-row sm:gap-0', className)}
    >
      {steps.map((step, index) => {
        const state = resolved[index]
        const here = index === at
        return (
          <li
            key={index}
            data-slot="step"
            data-state={state}
            // The only position statement on the rail, and it is on the step it
            // is about. Nothing else carries it, including the step whose disc is
            // the same size as this one's.
            aria-current={here ? 'step' : undefined}
            className={cn('flex items-start', index === last ? 'flex-none' : 'flex-1')}
          >
            <div data-slot="step-marker-row" className="flex w-full items-center gap-2">
              <span
                data-slot="step-marker"
                className={cn(
                  'inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium tabular-nums',
                  MARKER[state],
                )}
              >
                {/*
                 * The ordinal, hidden from assistive technology. A reader moving
                 * by list item has just been told which item this is, and
                 * repeating it in front of the label is a number in front of
                 * every step. It is drawn because a reader looking at the rail
                 * counts, and the number is the reason the discs are the same
                 * size whatever the state: a completed step keeps its place in
                 * the count rather than being replaced by a tick, which is what
                 * makes the rule between them readable.
                 */}
                <span aria-hidden="true">{index + 1}</span>
              </span>
              {index === last ? null : (
                <span
                  data-slot="step-rule"
                  data-filled={state === 'upcoming' ? undefined : 'true'}
                  aria-hidden="true"
                  className={cn(
                    'h-0.5 flex-1 rounded-full',
                    // Filled up to the step the reader is on and empty after it,
                    // which is the whole indicator: one element saying how far
                    // through they are, where a filled bar per step says "done"
                    // once per step and leaves the arithmetic to the reader.
                    state === 'upcoming' ? 'bg-border' : 'bg-primary',
                  )}
                />
              )}
            </div>

            <div data-slot="step-text" className="mt-2 min-w-0 sm:pr-4">
              <p
                data-slot="step-label"
                className={cn(
                  'text-sm font-medium',
                  state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {step.label}
              </p>
              {step.description === undefined ? null : (
                <p data-slot="step-description" className="text-muted-foreground mt-0.5 text-sm">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export { Steps }

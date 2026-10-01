import { useId, type ChangeEventHandler, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * One choice in a ChoiceCard group, and every word about it.
 *
 * **A choice is a value and two pieces of text, and there is no fourth field.**
 * There is no price, no badge, no illustration and no "recommended" flag, because
 * each of those is a claim about a product this package has not seen. A card that
 * drew a ribbon would be publishing a recommendation the consumer did not make,
 * which is the defect the whole taxonomy refuses. A consumer who wants a price
 * passes it as the description, because a price beside a plan is a line of the
 * consumer's own copy, and a consumer who wants a recommendation passes their own
 * control in the description or composes the card themselves.
 */
export type ChoiceCardOption = {
  /**
   * The value this choice contributes to the group, and the value the form
   * submits.
   *
   * Required, and required as a `string` because that is what a radio's own
   * `value` is and what a form posts. Two choices sharing a value are one choice
   * to the browser and two to the reader, so the values must be unique inside the
   * group, and the consumer's own keys are the right ones because they are what
   * their store already holds.
   */
  value: string
  /**
   * The choice's name, and the first half of the radio's accessible name.
   *
   * Required, and a node because a choice is often a name and a piece of emphasis,
   * or a name and an inline figure, and a `string` prop would make a consumer
   * reach for a wrapper element to smuggle either through. The node is also the
   * text a sighted reader reads, which is what keeps the visible label and the
   * announced name the same words rather than two copies of them.
   */
  label: ReactNode
  /**
   * The supporting line under the choice: what it costs, what it covers, what
   * committing to it means.
   *
   * Optional, and it is the second half of the radio's accessible name rather than
   * a description reached separately, because it sits inside the label. See the
   * note on `ChoiceCard` for why that is the arrangement and what it costs.
   */
  description?: ReactNode
  /**
   * Whether this choice cannot be taken, and why the consumer decided that.
   *
   * Optional, and a disabled option is refused rather than drawn as enabled and
   * ignored, and it stays in the accessibility tree so a reader is told the choice
   * exists and is not available. A card that silently vanished is a card a reader
   * will believe has been withdrawn.
   */
  disabled?: boolean
}

/**
 * How many cards sit on a row, as a closed set of three.
 *
 * A number rather than a Tailwind class, for the reason `ListPanel` gives about
 * its own bound: the arrangement is a claim about the content rather than about
 * the layout. A plan is usually a row of two or three and a region is usually a
 * stack, and a consumer who could only write a column class would be picking one
 * of those for the other. Three members and no more, because four cards on a row
 * at this padding stop being readable at the measure a documentation page has.
 */
const CHOICE_CARD_COLUMNS = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
} as const

/**
 * How many cards sit on a row.
 *
 * @defaultValue 1
 */
export type ChoiceCardColumns = keyof typeof CHOICE_CARD_COLUMNS

/**
 * The props a ChoiceCard accepts.
 *
 * The fieldset's own props are forwarded with `children` and `onChange` removed.
 * `children` goes because the group draws its own cards and a consumer who passed
 * any would be reaching past the set. `onChange` goes because the group's handler
 * is a selection report and the element's own `onChange` is a form event about the
 * whole fieldset, which is a different thing under the same word; the selection
 * handler is declared in this body instead, where its meaning is written down.
 */
export type ChoiceCardProps = {
  /**
   * The group's own name, drawn above the cards and announced as the group's
   * name.
   *
   * Required, and required as a node because the name is content: it is often a
   * heading with a count in it, and it is drawn as the fieldset's legend, so the
   * element a sighted reader reads is the element a screen reader names the group
   * by. There is no default and no generated name anywhere in this module, because
   * a group of plans with no name is announced as an unnamed group and a reader
   * learns nothing about what the question was. The sentence is the consumer's, in
   * their language: "Plan", "Region", "Billing cadence".
   */
  label: ReactNode
  /**
   * The choices, in the order a reader should meet them.
   *
   * Required, and order is the consumer's because which option reads first is a
   * claim about their product rather than about this design system. A set of one
   * is a legitimate value: a single choice with nothing to compare against is a
   * field whose answer is fixed, and it renders as one card in a row of one.
   */
  options: readonly ChoiceCardOption[]
  /**
   * The chosen value, when the group is controlled.
   *
   * Optional, and paired with `onChange` in the ordinary controlled way. A value
   * that names no option marks nothing, which is a real state and not a throw: a
   * saved record naming an option the product has since withdrawn is the
   * consumer's data problem, and taking the page down over it is worse than
   * drawing a chooser with nothing selected.
   */
  value?: string
  /**
   * The option selected initially, for a group nobody is controlling.
   *
   * Optional, and it is the whole of the no-JavaScript path. With this and no
   * `onChange`, the group is a set of real radios in a real form: the browser holds
   * the selection, the arrow keys move it, and the value is posted on submit, with
   * no framework involved at any point. A controlled `value` with no `onChange` is
   * a read-only group, and the browser's own warning is the honest report of it.
   */
  defaultValue?: string
  /**
   * Called with the input's own change event when the reader takes a choice.
   *
   * Optional, and it is the platform's event rather than a `(value: string)`
   * report, so `event.target.value` is the chosen value and nothing is reshaped
   * on the way through. See the note on `ChoiceCard` for why this module is still
   * a server Component, because that is the one place this Component departs from
   * the package's usual rule and the departure is deliberate.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>
  /**
   * The form field name the chosen value is submitted under.
   *
   * Optional, and it is a field name rather than a label: this is the key the
   * value arrives at on the server, and a consumer that omits it gets radios that
   * still work, still announce and still constrain, and post nothing.
   */
  name?: string
  /**
   * The `id` of the form that owns these radios, for a group rendered outside its
   * own `<form>` element.
   *
   * Optional, and it is the same attribute a native input has, forwarded because a
   * consumer whose chooser lives in a dialog has to say which form owns it.
   */
  form?: string
  /**
   * Whether every choice ignores interaction.
   *
   * Optional, and it is put on each input rather than on the fieldset, because
   * `<fieldset disabled>` is a second place the same state is written and the
   * fieldset's own attribute is the browser's rather than this Component's. The
   * visible dimming comes from the same place either way, since a card dims when
   * the radio inside it is disabled.
   */
  disabled?: boolean
  /**
   * Whether a value must be chosen before the form submits.
   *
   * Optional, and it is put on each input, which is how the platform expresses it:
   * a required radio group is satisfied by any one of its members, and a form that
   * submits without a choice is refused by the browser with a message in the
   * reader's own language rather than by this package.
   */
  required?: boolean
  /** How many cards sit on a row. @defaultValue 1 */
  columns?: ChoiceCardColumns
  /** Layout only, and the legend stays the first child of the fieldset. */
  className?: string
} & Omit<ComponentProps<'fieldset'>, 'onChange' | 'children'>

/**
 * A set of choices where each one is a card, and the reader takes exactly one.
 *
 * **It is a fieldset of real radios, and the argument for the native route is that
 * every hard part is already solved by the platform.** A radio group has one Tab
 * stop, arrow keys that move and choose, a checked state the platform owns, form
 * participation, constraint validation, and a place in every browser's
 * accessibility tree. The ARIA route, which is what `ToggleGroup` and
 * `BillingSources` take, buys total control of the appearance and pays for it
 * with a hidden input to submit, a roving tab stop to maintain, and a keyboard
 * model a reader has to test rather than one the platform ships. This Component's
 * whole subject is the appearance, and it is the one place in this package where
 * the appearance is free and the semantics are not on offer: a card is a label
 * around a radio, and a label is a native element.
 *
 * **The card is a `<label>` wrapping the radio, and that is what makes the whole
 * card pressable.** The alternative is a 16 pixel circle with a line of text beside
 * it, which is what `radio-group` draws, and it is right there because a radio row
 * is a form field and a form field is compact by convention. A card is the size of
 * a plan, a region and a cadence, and at that size a small target beside a
 * sentence the reader also wants to press is a target a finger misses. So the
 * label wraps the radio, the whole card is the target, and the radio's accessible
 * name comes from the label element natively, with no generated id and nothing to
 * keep in step. The cost is the one a wrapping label creates and it is not small:
 * a control inside a card, a link in the description, a copy button beside the
 * price, all of them select the radio when the reader presses them, because a
 * label forwards the click to what it wraps. A consumer who needs an interactive
 * element inside a choice puts that choice somewhere else.
 *
 * **The description is inside the label, so it is part of the name.** A screen
 * reader announces the choice's label and then its description, in the order the
 * reader sees them, and then the role and then its position in the group: "Team.
 * Twelve agents, billed yearly. Radio button, 2 of 3." The rejected alternative is
 * a description outside the label reached by `aria-describedby`, which would give
 * a short name and a separate description, and it costs two things: an id to
 * generate and to wire, and the whole-card hit area, because everything outside
 * the label stops selecting. Given that the hit area is the reason this Component
 * exists, the name carries the description. The cost is that a long description is
 * a long name, so keep it to one line, which is the same rule the package states
 * about a `CardDescription`.
 *
 * **The group is a `<fieldset>` with a `<legend>`, and it also carries
 * `role="radiogroup"`.** The fieldset is what groups the radios and what names
 * them, and the legend is the name. The explicit role is an addition rather than a
 * replacement: an element with an explicit role is named by `aria-labelledby`
 * rather than by its legend, so the legend is given an id and pointed at, and what
 * is bought is that a screen reader announces a radio group rather than a
 * grouping, which is the difference between a reader knowing this is one question
 * and a reader having to infer it from six radios. The cost is stated: the name
 * now depends on an id, so a consumer who takes the fieldset's props and replaces
 * the legend with their own element has to carry the id, and `useId` is the reason
 * this module still needs no `'use client'` of its own.
 *
 * **The selected card states its border and its indicator and not its fill, and
 * that is a decision about competing signals.** A fill a `hover` can take over is a
 * fill whose meaning changes under the pointer, and which of the two wins is a
 * question about Tailwind's variant order rather than about this design system.
 * The two things that carry selection here are the ones nothing else competes for:
 * the radio's own dot fills, and the border takes the primary role. The cost is
 * that a selected card is quieter than a filled one, so a consumer who wants a
 * louder selected state adds their own `Tag` or `Badge` beside the choice, which is
 * a claim about their product and therefore theirs to make.
 *
 * **The module is a server Component and it takes a function prop anyway, which is
 * a deliberate departure from the rule the rest of this package follows.** The rule
 * exists for a reason: a Component that *calls* a function prop during render, or
 * that holds state the callback drives, has to be in the client graph, because a
 * server component cannot hand a function down. This Component never calls
 * `onChange`. It forwards it to an `<input>`, where it is an ordinary DOM handler
 * the framework attaches at hydration, and the Component's own output is a pure
 * function of its props with no hook, no state and no effect. `Metric` and
 * `SearchField` are the precedents in this package for a server Component with a
 * function prop, and the reasoning is theirs as much as this one's. The cost is
 * real and is why it is stated: a consumer who passes `onChange` from a server
 * file gets a build error in every framework that draws that line, and that error
 * is correct, because a server component cannot hand an event handler down. A
 * consumer who wants the value in their own state is already in a client module, and
 * a consumer who does not is in a server one and gets a working radio group that
 * ships no JavaScript at all.
 *
 * **It is distinct from `radio-group` and from `card`, and both differences are
 * about the same thing.** `radio-group` is the compact form: a small circle beside
 * a short label, one row, a form field. `card` is a surface with a title, a
 * description, content and a footer, and it is not a control at all: it has no
 * role, it is not focusable, and it submits nothing. This is the third thing, the
 * one where the control and the surface are the same box, and neither of the other
 * two can be turned into it. A `card` cannot become a choice without a role and a
 * checked state; a `radio-group` cannot become a choice card without a label around
 * each row and the row-sized target that brings. Composing them does not help
 * either, because a card wrapped around a radio row is a card with a small target
 * inside it, which is the arrangement this Component exists to replace.
 */
function ChoiceCard({
  label,
  options,
  value,
  defaultValue,
  onChange,
  name,
  form,
  disabled = false,
  required = false,
  columns = 1,
  className,
  ...props
}: ChoiceCardProps) {
  const generated = useId()
  const legendId = `${generated}-legend`

  return (
    /*
     * A block, not a flex column, and the legend is its first child. A fieldset
     * whose display is not `block` takes its legend out of the ordinary flow in
     * some engines, and the legend is what names the group, so the layout is
     * arranged on the grid below rather than on the fieldset.
     */
    <fieldset
      data-slot="choice-card"
      // The role states what the set is rather than leaving a reader to infer it
      // from six radios, and the name comes from the legend through the id
      // because an element with an explicit role is not named by its contents.
      role="radiogroup"
      aria-labelledby={legendId}
      className={cn('w-full min-w-0', className)}
      {...props}
    >
      <legend id={legendId} data-slot="choice-card-legend" className="mb-3 text-sm font-medium">
        {label}
      </legend>

      <div data-slot="choice-card-grid" className={cn('grid gap-3', CHOICE_CARD_COLUMNS[columns])}>
        {options.map((option) => (
          <label
            key={option.value}
            data-slot="choice-card-option"
            data-value={option.value}
            className={cn(
              // Both halves of the resting surface are stated here rather than
              // inherited, for the Stated Ink Rule: a fill with no ink of its own is
              // the same card on the page ground and a different one inside any
              // Block that draws a filled surface.
              'border-border bg-background text-foreground hover:bg-muted',
              'flex cursor-pointer items-start gap-3 rounded-lg border p-4',
              'transition-colors duration-fast ease-out',
              'has-[:checked]:border-primary',
              // The focus ring is drawn on the card rather than on the radio, so it
              // bounds the thing the reader is choosing instead of a small circle
              // inside it. The radio is `sr-only` rather than hidden, so there is no
              // outline to suppress on either element and the browser's own
              // indicator is not competing with this one.
              'has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-[3px]',
              'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
            )}
          >
            {/*
             * The indicator, and it holds the radio rather than sitting beside it.
             * That is what lets the dot be a sibling of the input and take
             * `peer-checked:` from it: a `has-` variant reaches a descendant, and
             * the ring around the dot is a descendant of the input rather than an
             * ancestor of it, so the two need opposite directions to be read from
             * two different elements. The span is not `aria-hidden` because the
             * radio is inside it, and it announces nothing on its own.
             */}
            <span
              data-slot="choice-card-indicator"
              className={cn(
                'border-input text-primary bg-background mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                'transition-colors duration-fast ease-out',
                'has-[:checked]:border-primary',
              )}
            >
              <input
                data-slot="choice-card-input"
                className="peer sr-only"
                type="radio"
                name={name}
                form={form}
                value={option.value}
                checked={value === undefined ? undefined : value === option.value}
                defaultChecked={value === undefined ? defaultValue === option.value : undefined}
                disabled={disabled || option.disabled === true}
                required={required}
                onChange={onChange}
              />
              <span
                data-slot="choice-card-dot"
                aria-hidden="true"
                className="bg-primary text-primary size-2 rounded-full opacity-0 peer-checked:opacity-100"
              />
            </span>

            <span data-slot="choice-card-body" className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span data-slot="choice-card-label" className="text-sm font-medium">
                {option.label}
              </span>
              {option.description === undefined ? null : (
                <span data-slot="choice-card-description" className="text-muted-foreground text-sm">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export { ChoiceCard }

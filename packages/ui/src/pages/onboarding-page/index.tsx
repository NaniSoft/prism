'use client'

import type { ReactNode } from 'react'

import { Onboarding01 } from '../../blocks/onboarding-01'
import type { HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One thing the reader has to do, or has done, or is stuck on.
 *
 * The same seven fields as `Onboarding01`'s own step, declared here rather than
 * imported so that this Page's published interface does not change when the Block
 * gains a field, and so a consumer reading the corpus sees one vocabulary for the
 * screen rather than two.
 *
 * `stateLabel` and `hrefLabel` are optional in the type and required in practice:
 * `Onboarding01` refuses both at run time, by the same argument it makes for every
 * mark and every link in this package. A mark with no sentence beside it is a shape
 * a reader can only see, and a link announced by its address is punctuation rather
 * than a name.
 */
export type OnboardingPageStep = {
  /** A stable key for the step, and the key a `stateLabel` and an action are found by. */
  id: string
  /** What the step is, in the words a reader would use in conversation. */
  name: string
  /** A line or two about what this step involves, for a reader who has arrived at it. */
  description?: ReactNode
  /**
   * Where the step stands.
   *
   * `blocked` is a fact about this run rather than a position in the order, and it
   * is here because a checklist that can only say done and not done and next will
   * read as broken to a reader who is genuinely stuck.
   */
  state: 'done' | 'current' | 'upcoming' | 'blocked'
  /** The words for that state, in the product's own voice. Required whenever `state` is set. */
  stateLabel?: string
  /** The control that acts on this step, beside it: a connect, a retry, a skip. */
  action?: ReactNode
  /** Where the step goes, rendered as a native anchor so the destination is real. */
  href?: string
  /** The words on that link. Required whenever `href` is. */
  hrefLabel?: string
}

/**
 * The props an OnboardingPage takes.
 *
 * Every string and every count is a prop and the Page ships none of them. The one
 * place that is hardest is the progress sentence, which is a function rather than a
 * template, because it has a plural and changes shape past one and every language
 * words it differently.
 */
export type OnboardingPageProps = {
  /**
   * Optional label above the page's own heading. See the No-Default-Eyebrow Rule.
   *
   * A `string` and not a node, because the checklist's `eyebrow` is a `string`: the
   * label is one short line that the Block sets in small caps, and a node there
   * would be markup inside a run of text that is already an eyebrow.
   */
  eyebrow?: string
  /**
   * The page's heading, and this screen's `h1`.
   *
   * Required, and it is handed to the checklist rather than drawn above it. See
   * the Page's JSDoc for why that is the right home for the `h1` rather than a
   * title the Page draws separately.
   */
  title: ReactNode
  /** One or two sentences under the heading, for the part the heading cannot carry. */
  description?: ReactNode
  /**
   * The steps, in the order the reader should do them.
   *
   * `readonly` because the normal way a consumer writes a step list is an `as
   * const` fixture, and a prop typed as a mutable array rejects that fixture at the
   * moment it is most useful. The list is handed to `Onboarding01` as a fresh array
   * because that Block declares a mutable one.
   */
  steps: readonly OnboardingPageStep[]
  /**
   * The sentence the progress figure is named by, given the two counts.
   *
   * Required, and a function rather than a string for the reason `Onboarding01`
   * gives: the phrase has a plural, it changes shape past one, and every language
   * words it differently. A Page that composed it would compose the English one and
   * ship it into every consumer's product.
   */
  progressLabel: (done: number, total: number) => string
  /**
   * The note under the progress figure: what happens when the last step is done,
   * what a blocked step needs, where to read more.
   */
  completion?: ReactNode
  /**
   * What the checklist draws in place of the steps when there are none.
   *
   * Required, and it is `Onboarding01`'s own requirement forwarded rather than
   * softened. A setup with no steps is either a product that has nothing to set up
   * or a caller's query that returned nothing, and those are opposite claims: the
   * first is good news and the second is a fault in the consumer's data, and this
   * Page cannot tell them apart, so the sentence is the caller's.
   */
  empty: ReactNode
  /**
   * The way out of a setup that is going wrong, beside the checklist.
   *
   * A `Help01` goes here and it is the reason this is a Page rather than a Block.
   * See the JSDoc on the Page: a checklist with no escape is a dead end a reader
   * has to close the tab to leave.
   */
  help?: ReactNode
  /**
   * The closing band: a `Contact01`, a `Newsletter01`, or whatever else a reader
   * who has run out of road should be given next.
   */
  footer?: ReactNode
  /**
   * How the screen is arranged.
   *
   * `centred` is the default and it sets the whole screen in one reading measure,
   * which is the screen a first run is: there is one thing to do and nothing else
   * competing for the reader. `split` puts the checklist and the help in two
   * columns from the large breakpoint up, which is the screen a return visit is,
   * where the reader has done the setup once and is now reading for the answer
   * rather than for the route. With no `help`, `split` leaves the checklist the
   * full width of both columns, so the arrangement is total rather than conditional.
   */
  layout?: 'centred' | 'split'
  /**
   * The level of the page's own heading, which the checklist draws.
   *
   * Defaults to `h1`, because a Page owns the top of the document outline. A
   * consumer embedding this screen under a heading it already owns passes one level
   * deeper and the outline follows.
   */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Item. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * A complete setup screen: the heading, the checklist, and the way out of a setup
 * that is going wrong.
 *
 * **This is the second of the three Pages that `DESIGN.md` records under Known Open
 * Items as deferred to v1.1**, so it discharges that row rather than adding to the
 * tail. The other two are `PricingPage` and `ErrorPage`.
 *
 * **The distinction from `onboarding-01` is the whole argument for this Page
 * existing, so it is worth being blunt about it. The Block is the checklist. This
 * is the screen.** A checklist is a list with a figure above it, and a list is a
 * thing a reader arrives at. A screen is a heading, a list, and a way out of the
 * situation the list describes, and a reader who is stuck does not go looking for
 * the checklist: they arrive at the screen, because the screen is the only address
 * they were ever given. A reader three days into a setup with one step left open and
 * no permission yet granted has a question, and the question is not "which step is
 * next", it is "is this broken", and the answer to that cannot live in a list of
 * rows. So the Page composes the checklist with a way to ask, and `help` is why it
 * is a Page and not a Block: a checklist with no escape is a dead end a reader has
 * to close the tab to leave, and closing the tab is the worst outcome a setup
 * screen can have, because the reader does not come back.
 *
 * **The `h1` is the checklist's own section heading, and handing it over is the
 * decision.** The rejected alternative was a title this Page drew above the
 * checklist, and it failed twice. The first failure is duplication: the checklist
 * opens with a heading, so a title above it is the same words twice on one screen.
 * The second is rhythm: a Page that draws its own heading band has to decide where
 * the content starts below it, and the answer is always a second `Section` of
 * vertical padding between the heading and the thing the heading is about, which on
 * a screen whose whole job is one list reads as an empty band. Passing `title` to
 * the Block puts the page heading where the page's subject is, gives the screen
 * exactly one `h1` without this Page having to police it, and lets `Onboarding01`
 * hold the heading left, which is the alignment `SectionHeading` requires of
 * anything with content under it.
 *
 * **`layout` is the only layout decision the Page makes, and both of its forms are
 * the same screen read by a different reader.** `centred` puts one reading measure
 * on the page, which is the first run, where the only question is which step comes
 * next. `split` gives the checklist three fifths and the help two, which is the
 * return visit, where the route is already known and the missing paragraph is not.
 * The rejected third form was a single full-width column for both, which is `centred`
 * and costs nothing to say, so it was not named.
 *
 * **The Page checks nothing, and that is a boundary rather than an omission.**
 * `Onboarding01` already refuses a step with no `stateLabel`, a step with an `href`
 * and no `hrefLabel`, and a rail with two current steps, and it names the step by
 * its `id`. This Page hands the list over in the same shape, so those messages
 * already name the key the caller passed here, and repeating them would only print
 * the same sentence twice.
 *
 * **It is a client Component, and the reason is `progressLabel` rather than any
 * state of the Page's own.** A handler is a function, a function is a piece of
 * state, and a function cannot cross from a server Component to a client Component,
 * so a Page that took one and rendered it into a client Block would have to be a
 * client module itself. The rejected alternative was a formatted count, which is a
 * Page that ships an English phrase and its plural rule into every consumer's
 * product. The cost is that this screen's data is serialised across the boundary to
 * reach a Block two elements down, and the answer is that a setup screen is a client
 * screen anyway: the consumer's own retry handler is a client handler.
 */
export function OnboardingPage({
  eyebrow,
  title,
  description,
  steps,
  progressLabel,
  completion,
  empty,
  help,
  footer,
  layout = 'centred',
  headingLevel = 'h1',
  className,
}: OnboardingPageProps) {
  const split = layout === 'split'

  return (
    <div data-slot="onboarding-page" className={cn(className)}>
      <div
        data-slot="onboarding-page-body"
        data-layout={layout}
        className={cn(
          'w-full gap-10',
          split
            ? 'grid items-start lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'
            : 'mx-auto flex max-w-measure-narrow flex-col',
        )}
      >
        {/*
          The checklist carries the page heading, so it takes the page's own level
          and this wrapper holds nothing but the layout the two regions share. With
          `split` and no help it takes both tracks, which is why the rule is total
          rather than a condition on whether a slot was passed.
        */}
        <div
          data-slot="onboarding-page-checklist"
          className={cn(split && help === undefined && 'lg:col-span-2')}
        >
          <Onboarding01
            eyebrow={eyebrow}
            title={title}
            description={description}
            steps={[...steps]}
            progressLabel={progressLabel}
            completion={completion}
            empty={empty}
            headingLevel={headingLevel}
          />
        </div>

        {help === undefined ? null : (
          <div data-slot="onboarding-page-help">{help}</div>
        )}
      </div>

      {footer === undefined ? null : (
        <div data-slot="onboarding-page-footer">{footer}</div>
      )}
    </div>
  )
}

export default OnboardingPage

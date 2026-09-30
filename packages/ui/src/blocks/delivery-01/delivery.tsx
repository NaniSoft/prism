import type { ReactNode } from 'react'

import { Progress } from '../../components/ui/progress'
import { RelativeTime } from '../../components/ui/relative-time'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { Steps, type Step } from '../../components/ui/steps'
import { cn } from '../../lib/utils'

/**
 * The five states a thing in transit can be in.
 *
 * Five, and they are positions rather than a vocabulary, so the words for them are
 * the caller's through `stateLabel` and the machine value never reaches a reader.
 * That is the whole reason `stateLabel` is required wherever `state` is: four
 * NaniSoft products each track this differently, and between them they use eleven
 * words for these five positions, where "In transit" and "Shipping" and "Running"
 * are one position, and "Delivered" and "Done" and "Complete" are another.
 *
 * A sixth state would be the one that splits a position that does not need
 * splitting: a `delayed` over a `held`, or a `delivered` that is not `complete`.
 * Each one is a colour a reader has to learn and a word a maintainer has to keep
 * true, and a ladder with more rungs than positions is how a stage column stops
 * being readable. What a caller wants to say about why something is late is the
 * caller's own `description` on the item and the words beside the stage it is on.
 */
export type DeliveryState = 'queued' | 'in-transit' | 'held' | 'delivered' | 'failed'

/**
 * The tone each of the five states is drawn in, from the shared semantic contract
 * and no other.
 *
 * **Two of the five share a role and the sharing is deliberate rather than lazy.**
 * `queued` and `in-transit` are both `info`, the contract's cool role that means
 * not an alarm, because a thing that has not left and a thing that is on its way
 * are both the ordinary states of a delivery. `delivered` is `success`, because it
 * is the state a reader is glad to see. `held` is `warning` and not `destructive`,
 * for the reason `Project01` gives for a blocked project: held is a thing to attend
 * to rather than a breakage, and a list of forty deliveries with four of them in
 * red reads as four incidents and sends a reader looking for a failure that is not
 * happening. `failed` is the one that earns `destructive`, and a caller whose
 * product treats a failure as a permanent outcome has no seam here: the answer is
 * the caller's own `detail` on the item.
 *
 * The cost is named rather than hidden: a held delivery is a real problem, and this
 * tone says "attend to it" rather than "something is broken". A caller whose
 * product means the second has no seam here, and the answer is their own `summary`
 * above the surface.
 */
const STATE_TONE: Record<DeliveryState, StatusTone> = {
  queued: 'info',
  'in-transit': 'info',
  held: 'warning',
  delivered: 'success',
  failed: 'destructive',
}

/**
 * The three states a stage on the rail can be in.
 *
 * `done` is behind the reader, `current` is where they are, and `upcoming` is ahead.
 * A stage's state is a position in a sequence rather than a judgement about the
 * delivery, which is why this list is three and `DeliveryState` is five: a delivery
 * can be held, and a stage in a sequence cannot, because a held stage is a fact
 * about the delivery and belongs in its state.
 */
export type DeliveryStageState = 'done' | 'current' | 'upcoming'

/**
 * The state a stage's mark is drawn from on the rail.
 *
 * Three entries for three positions. `done` becomes `complete` because that is the
 * word `Steps` uses for a stage behind the reader, and the two vocabularies differ
 * only there. A map rather than a lookup at the call site because the translation is
 * a fact about the Component and not about the data, and a Block that spelled
 * `complete` in three places would be three chances to spell it once wrong.
 */
const RAIL_STATE: Record<DeliveryStageState, 'complete' | 'current' | 'upcoming'> = {
  done: 'complete',
  current: 'current',
  upcoming: 'upcoming',
}

/**
 * The thing that is moving: what it is, and where its full record lives.
 *
 * `name` is the anchor of the whole Block. The four consumer sites that would
 * install this one each have their own noun for it, a release, a migration, a
 * configuration push and a fleet rollout, so the name is the caller's and this
 * Block has no word for it at all.
 */
export type DeliveryItem = {
  /** What the thing is, as the product writes it. */
  name: string
  /**
   * The line under the name, for the part of the record the name cannot carry:
   * which estate, which fleet, which region.
   *
   * A node, because the honest line is a composition of a caller's own facts and
   * very often carries a link to the record itself, and a `string` would force a
   * flattening that loses whichever of those it could not hold.
   */
  detail?: ReactNode
  /** Where the record lives in full. Rendered as a real link. */
  href?: string
  /**
   * The words on that link, and required whenever `href` is set.
   *
   * A link announced by its address is punctuation rather than a name, and a reader
   * following a link to check a claim deserves to know what they are about to open.
   * The sentence belongs to the caller, because the destination is theirs.
   */
  hrefLabel?: string
}

/**
 * One stage of the journey: what it is called, when it happened or is due, where
 * it stands, and the words for where it stands.
 *
 * **The moment and the state are separate fields because they are separate facts,
 * and because a stage that has a date and no state is a real one.** That matters
 * more here than on most surfaces: a stage that has not happened yet carries a
 * name and a date and nothing else, because a shipment screen that shows a
 * delivery time as though it had happened is a screen lying to a reader who is
 * waiting. So `at` on an `upcoming` stage is a reading, and this Block draws it in
 * the muted ink beside a `stateLabel` the caller wrote, and the two together say
 * the only thing that is true about a stage that has not happened.
 */
export type DeliveryStage = {
  /** A stable key for the stage. */
  id: string
  /** What the stage is called, in the caller's own words. */
  name: string
  /**
   * When the stage happened, or is expected to.
   *
   * Epoch milliseconds, a `Date`, or a string the platform parses, and Prism hands
   * it to `RelativeTime` untouched, so the absolute reading a reader sees is the
   * platform's own in their language. See the Block JSDoc for why this Block
   * formats nothing and takes the sentence from the caller instead.
   *
   * An `upcoming` stage's `at` is an expectation, not a record, and the JSDoc on
   * this type says what this Block does and does not claim about one.
   */
  at?: number | string
  /**
   * The words for the moment, given the moment.
   *
   * Optional, and its absence is a legitimate state rather than a gap: a caller
   * whose stages are mostly dates wants the platform's own absolute reading with
   * nothing beside it, and a caller who has three languages already has a
   * component for the relative phrase. See the Block JSDoc for why it is a
   * function: the sentence has a plural, it changes shape past a day, and every
   * language words it differently.
   */
  dateLabel?: (value: number | string) => string
  /**
   * Where the stage stands.
   *
   * `done` is behind the reader, `current` is where they are, and `upcoming` is
   * ahead. A stage's state is a position in a sequence rather than a judgement
   * about the delivery, which is why this list is three and `DeliveryState` is
   * five.
   */
  state: DeliveryStageState
  /**
   * The words for that state, in the product's own vocabulary.
   *
   * Required whenever a stage carries a state, and every stage does, so the run
   * throws without it. The mark `Steps` draws is a shape, and a shape is not a
   * sentence a reader can act on: "Signed", "Rolling out" and "Waiting on a region"
   * are the same position in three products' words.
   */
  stateLabel?: string
  /**
   * The line under the stage's name on the rail, for whatever the caller wants
   * said about this particular stage.
   *
   * A node, because the honest line is a sentence with a link in it or a figure
   * beside it, and the rail draws it under the name where a reader who has arrived
   * at this stage wants it.
   */
  detail?: ReactNode
}

/**
 * The props a Delivery01 takes.
 *
 * Every string is a prop and the Block ships none. There is no item, no state, no
 * stage, no moment and not one word of the sentence that says what the states are
 * called or how long anything took. The expected-reading sentence is the sharpest
 * version of that rule, because "arriving Tuesday" and "due Tuesday" and "next
 * week" are three products' decisions and a reader who is waiting for a thing has
 * the least patience for a sentence in the wrong language.
 */
export type Delivery01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The section title, required.
   *
   * Required because a reader on a page about a thing in transit needs to know
   * whose it is, and a stage rail with a release name and no heading above it is a
   * diagram with no caption. The name of the thing itself is the item, not the
   * title: the title is what the section is about, which on a fleet is the fleet
   * and on a product page is the feature.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The thing that is moving.
   *
   * Required, and it is a single thing rather than a list, which is the one place
   * this Block refuses the shape a storefront would want. A shipment screen with
   * four shipments on it is a list, and a list is what `ProjectList01` is; a
   * delivery that is going somewhere is one thing with a rail under it, and a
   * reader who is waiting for it wants its state and not a comparison with three
   * others. A caller with four of them composes four of these or reaches for a
   * Page, and the cost is named: the Block draws one journey.
   */
  item: DeliveryItem
  /**
   * Where the whole thing stands.
   *
   * Optional, and its absence is a real state: a thing whose status has not been
   * read yet is a thing this Block says nothing about, which is better than a
   * thing it guesses at. When it is given, `stateLabel` is required inside it.
   */
  state?: DeliveryState
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required and not derived from `state`, for the reason `DeliveryState` gives:
   * the state is a colour and the words are a claim, and four products use eleven
   * words for five positions between them. See `DeliveryState` for the full
   * argument.
   */
  stateLabel?: (state: DeliveryState) => string
  /**
   * When the thing is expected to arrive, and the words for it.
   *
   * Both optional, and both absent together or not at all, because a moment with no
   * sentence beside it is a date a reader has to interpret and a sentence with no
   * moment beside it is a promise about nothing. Omit the pair for a thing with no
   * expected arrival: a stage-based delivery that reports its own progress has no
   * single moment to point at, and inventing one would be a claim about a schedule
   * this Block cannot see.
   */
  expectedAt?: number | string
  /**
   * The words for the expected moment, given the moment.
   *
   * A function for the reason `dateLabel` is one, and the reason is stronger here
   * than on a stage: a reader waiting for a thing is the reader least able to be
   * shown a date in the wrong locale, and "arriving in about two hours" has a
   * plural, changes shape past a day, and is worded differently in every language
   * there is. Prism formats what `Intl` already localises, which is the absolute
   * reading, and hands the sentence back.
   */
  expectedLabel?: (value: number | string) => string
  /**
   * The stages the journey has, in the order it runs them.
   *
   * Order is the caller's because it is a claim about a sequence, and the rail
   * this Block composes says "steps" to every reader and to every crawler, so a
   * list in an order the journey does not have is a wrong diagram rather than a
   * layout problem.
   */
  stages: readonly DeliveryStage[]
  /**
   * How far along the journey is, and the sentence the bar announces.
   *
   * Omit the pair for a thing that is not measured. A bar at zero is a claim that
   * nothing has happened, and a delivery the product reports by stage rather than
   * by percentage is a real shape.
   */
  progress?: number
  /**
   * The sentence the bar announces, given the value.
   *
   * **A function and not a string, and the reason is the seam rather than the
   * grammar.** A bar is a percentage of something this Block cannot see, and
   * forty per cent of a rollout is not the same fact as forty per cent of a
   * migration. It is also a function because this Block is a server Component and
   * `Progress` is a client one, so a callback handed down from here is a build
   * error rather than a warning, and `Progress` therefore publishes `valueText`
   * for exactly this case. The cost of composing it is named: `Progress` is a
   * client Component, so a delivery with a fill is a client island, and a caller
   * with forty of them on one page is paying for forty. The answer is to leave
   * `progress` off the ones that are not measured.
   */
  progressLabel?: (value: number) => string
  /**
   * The controls that act on this delivery: retry, cancel, open it somewhere else.
   *
   * A slot rather than a set of named buttons, because which controls a delivery
   * has is the caller's fact. A thing that can be cancelled and a thing that can be
   * re-run share this frame and nothing else, and a Block that drew a retry control
   * would hand every consumer a permission its product may not grant.
   */
  actions?: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The stage the rail is on, and the reason this Block picks it rather than asking.
 *
 * `Steps` requires exactly one current step and throws without one, and a delivery's
 * stage list is a place where that is genuinely absent: a delivery whose stages are
 * all done has no current stage, and a delivery nobody has started has one that is
 * not declared. So the rail's position is derived when the caller has not declared
 * one: the first stage that has not been done, and the last stage when everything
 * is done, which is the only position a finished rail can hold.
 *
 * The caller who has declared one gets it, and the caller who has declared two is
 * a caller whose data contradicts itself, which the guard above refuses rather than
 * a position this Block guesses at.
 */
function railCurrent(stages: readonly DeliveryStage[]): number {
  const declared = stages.findIndex((stage) => stage.state === 'current')
  if (declared !== -1) return declared
  const firstOpen = stages.findIndex((stage) => stage.state === 'upcoming')
  return firstOpen === -1 ? stages.length - 1 : firstOpen
}

/**
 * A thing in transit: what it is, where it stands, the stages it has been through,
 * and the reading a reader is waiting for.
 *
 * **This is a shipment screen and the pattern is the storefront's, so the
 * translation is a change of subject rather than a change of shape.** A shipment
 * screen says what a parcel is, where it is, which stage it has reached and when
 * it is expected; this says the same four things about the delivery of a
 * configuration to a fleet of nodes. The reader's question is identical in both
 * cases and it is the reason the arrangement is the one it is: someone is waiting,
 * and the four facts they need are what, where, how far and when. What is not
 * identical is what a Block can say about any of them, and that is where every
 * string on this surface comes from the caller.
 *
 * **A stage that has not happened renders as an expected reading and never as a
 * fact, and that is the sentence this Block is built around.** A shipment screen
 * that shows a delivery time as though it had happened is a screen lying to a
 * reader who is waiting, and the lie is worse here than in a shop for a reason that
 * has nothing to do with the subject: a reader waiting for a parcel is disappointed
 * and a reader waiting for a configuration is deciding whether to roll back. So an
 * `upcoming` stage carries a name, a date and nothing else. This Block draws the
 * date in the muted ink, beside a `stateLabel` the caller wrote, and the two
 * together are the only thing it says. There is no tick, no rule filled past the
 * reader's position, no "delivered" in a colour a reader might mistake for the
 * stage ahead, and the rail's own connector stops at the current stage, which is
 * `Steps`' arrangement and the reason this Block composes it rather than drawing
 * its own. A caller who wants a stage to carry more has `detail`, and the honest
 * answer to a caller whose stage needs a claim about the future is that the claim
 * is a promise, and a promise belongs in the caller's own copy beside the rail
 * rather than in a diagram this Block draws.
 *
 * **The words travel as a string because this Block is a server Component and
 * `Progress` is a client one, and a function cannot cross that seam.** That is the
 * whole of the reason for the `valueText` prop, and it is worth stating in full
 * because the alternative looks like a style choice. `Progress` takes both a
 * `getAriaValueText` function and a `valueText` string, and a Block that passed the
 * function down would be a build error in every framework that draws the server
 * boundary, not a warning: the function would have to be serialised to cross it
 * and cannot be. So the sentence is computed here, on the server, where the
 * caller's function is still a function, and it travels down as a string. The same
 * argument is why `stateLabel` and `expectedLabel` and `dateLabel` are functions
 * rather than strings: they are called here too, and what a reader hears is the
 * caller's own sentence in their own language, while the absolute reading beside it
 * is the platform's.
 *
 * **The state is `Status` and the rail is `Steps`, and neither was redrawn.**
 * `Status` is a dot in one of five tones beside the caller's words, and it owns the
 * arrangement that matters here: the dot is `aria-hidden` and the words carry the
 * state, so a reader who cannot separate `warning` from `destructive` still reads
 * which is which, and a state is never colour alone. A hand-drawn dot beside a word
 * would be a second implementation of that Component, and the second one is the one
 * that gets the `aria-hidden` wrong. `Steps` owns three things this Block would
 * otherwise have to settle again: that the states differ by shape before they
 * differ by colour, so a reader who cannot separate a filled disc from a ring is
 * not being told two different things about two different stages; that exactly one
 * step carries `aria-current`, because two current stages is a rail with two
 * answers to where the reader is; and that the rule between the stages is filled up
 * to the reader's position and empty after it, which is the element that says how
 * far along they are and the element that cannot overrun an `upcoming` stage.
 *
 * **The cost of composing `Steps` is its own limitation rather than this Block's,
 * and it is named.** A `Step`'s qualifier is a `string` and a stage's moment is a
 * node, so the rail cannot hold a date. The moments are drawn beneath it as the
 * definition list they are, one row per dated stage, and a caller whose stages are
 * mostly dates wants `MilestoneTimeline01`, which is the Block built for a dated
 * sequence. The second cost is the client island: `Progress` is a client Component,
 * so a delivery with a fill is one island, and the answer for a caller with many is
 * to leave `progress` off the ones that are not measured.
 *
 * **The moments are the caller's and the sentences are the caller's, and the
 * absence of a `time` element's `datetime` on an `upcoming` stage is a decision
 * rather than an oversight.** A moment that has happened is a fact and belongs in a
 * `<time>` with a machine value, so a crawler and a screen reader get a timestamp
 * whatever the visible reading says. A moment that has not happened is an
 * expectation, and putting a machine value on it invites a consumer's own tooling
 * to read a forecast as a record. This Block draws both through `RelativeTime`,
 * which owns that decision, and the honest cost is that a consumer who wants a
 * scheduled delivery to appear in a calendar feed has to publish it from their own
 * record rather than from this page.
 *
 * **It is a server Component.** No hook, no state, no client code of its own and
 * no router. The only client code it can pull in is one `Progress` island on the
 * delivery that asks for a fill, and the whole thing renders with scripting off, in
 * a print stylesheet and to a crawler.
 */
export function Delivery01({
  eyebrow,
  title,
  description,
  item,
  state,
  stateLabel,
  expectedAt,
  expectedLabel,
  stages,
  progress,
  progressLabel,
  actions,
  headingLevel = 'h2',
  className,
}: Delivery01Props) {
  if ((item.href === undefined) !== (item.hrefLabel === undefined)) {
    throw new Error(
      `Delivery01: "${item.name}" declares one of href and hrefLabel without the other, so the surface ` +
        'would carry a link with no words on it, or a name with no link beside it. Pass the words that ' +
        'say what following it does, or drop the href.',
    )
  }

  if ((expectedAt === undefined) !== (expectedLabel === undefined)) {
    throw new Error(
      `Delivery01: "${item.name}" declares one of expectedAt and expectedLabel without the other, so ` +
        'the surface would carry a date with no sentence beside it, or a promise about an arrival with ' +
        'nothing to attach it to. Pass the moment and the words for it, or pass neither.',
    )
  }

  if (state !== undefined && stateLabel === undefined) {
    throw new Error(
      `Delivery01: "${item.name}" declares a state and no words for it, so the mark beside it would ` +
        'be a colour with nothing to read beside it, on the one surface where a reader is waiting and ' +
        'the state is the thing they came for. Pass stateLabel in the vocabulary the product uses.',
    )
  }

  if (progress !== undefined && progressLabel === undefined) {
    throw new Error(
      `Delivery01: "${item.name}" declares a progress value and no sentence for it, so the bar would ` +
        'announce a bare figure meaning whatever the reader assumes it is a percentage of. Pass ' +
        'progressLabel, or drop the progress.',
    )
  }

  if (stages.length === 0) {
    throw new Error(
      `Delivery01: "${item.name}" passes no stages, so there would be no rail to say how far along the ` +
        'delivery is, and a state with nothing under it is a badge. Pass the stages the journey has, ' +
        'which is at least one.',
    )
  }

  const currents = stages.filter((stage) => stage.state === 'current').length
  if (currents > 1) {
    throw new Error(
      `Delivery01: the stages of "${item.name}" declare ${currents} current stages, and a rail has one ` +
        'position. Two current stages is a reader told they are in two places at once. Declare one, or ' +
        'leave the state to the order.',
    )
  }

  for (const stage of stages) {
    if (!stage.stateLabel) {
      throw new Error(
        `Delivery01: the stage "${stage.id}" of "${item.name}" declares a state and no stateLabel, so ` +
          'the mark beside it would be a shape with no sentence, and a shape a reader can only see is ' +
          'a state nobody can act on. Pass the words your readers use for that position.',
      )
    }
  }

  const rail: Step[] = stages.map((stage) => ({
    label: stage.name,
    description: stage.stateLabel,
    /*
      The states are the caller's rather than the rail's whenever the caller
      declared a position, because a delivery that reached a stage out of band is
      real: an operator approved a region in another tab, a stage was completed by
      hand last night, a reader has already answered the question step two would
      have asked. A rail derived from the order would draw a claim the data
      contradicts. With no declared position the rail derives every mark, which is
      the arrangement that cannot disagree with itself.
    */
    ...(currents === 1 ? { state: RAIL_STATE[stage.state] } : null),
  }))

  const dated = stages.filter(
    (stage): stage is DeliveryStage & { at: number | string } => stage.at !== undefined,
  )

  return (
    <Section data-slot="delivery-01" className={cn(className)}>
      <div data-slot="delivery-01-body" className="flex flex-col gap-8">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/*
          The header row: what the thing is, where it stands, and when it is
          expected. The name and the detail are the caller's; the state is a mark
          beside the caller's own words, and the expected reading is the platform's
          absolute date with the caller's sentence beside it. Nothing here is
          composed by this Block, and the two absences are the design: no
          `RelativeTime` when there is no expected moment, because a delivery with
          no arrival to point at should not be given one, and no mark when there is
          no state, because a thing whose status has not been read yet is a thing
          this Block says nothing about.
        */}
        <div data-slot="delivery-01-header" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span data-slot="delivery-01-name" className="text-sm font-semibold">
              {item.href === undefined || item.hrefLabel === undefined ? (
                item.name
              ) : (
                <a
                  data-slot="delivery-01-link"
                  href={item.href}
                  className="hover:underline focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-[3px]"
                >
                  {item.hrefLabel}
                </a>
              )}
            </span>

            {state === undefined || stateLabel === undefined ? null : (
              <Status
                data-slot="delivery-01-state"
                tone={STATE_TONE[state]}
                label={stateLabel(state)}
              />
            )}

            {expectedAt === undefined ? null : (
              <span
                data-slot="delivery-01-expected"
                className="text-muted-foreground text-sm"
              >
                <RelativeTime date={expectedAt} relative={expectedLabel?.(expectedAt)} />
              </span>
            )}
          </div>

          {item.detail === undefined ? null : (
            <div
              data-slot="delivery-01-detail"
              className="text-muted-foreground text-pretty text-sm"
            >
              {item.detail}
            </div>
          )}
        </div>

        {progress === undefined || progressLabel === undefined ? null : (
          <div data-slot="delivery-01-progress" className="flex flex-col gap-2">
            {/*
              The bar, and the fill travels as a string. See the JSDoc above: a
              callback cannot cross from a server Component to a client one, so the
              sentence is computed here and handed down as data. The cost is one
              client island on the delivery that asks for a fill.
            */}
            <Progress value={progress} valueText={progressLabel(progress)} />
          </div>
        )}

        {/*
          The rail, and it is `Steps` with the current index passed in. The stage
          states are the caller's whenever the caller declared a position, and
          derived otherwise, which is the arrangement that cannot disagree with
          itself. The rule between the stages is filled up to the reader's position
          and empty after it, so an `upcoming` stage is never reached by a filled
          connector.
        */}
        <div data-slot="delivery-01-rail">
          <Steps steps={rail} current={railCurrent(stages)} />
        </div>

        {/*
          The stage detail, and the moments, which the rail has no room for. A
          `Step`'s qualifier is a string and a moment is a node, so the two cannot
          both go on the rail, and the definition list below is the honest shape for
          a set of names and their moments. Drawn only when there is something to
          draw, because a list of nothing is a gap the reader looks through.
        */}
        {dated.length === 0 ? null : (
          <dl
            data-slot="delivery-01-stages"
            className="grid gap-x-8 gap-y-2 sm:grid-cols-2"
          >
            {dated.map((stage) => (
              <div
                key={stage.id}
                data-slot="delivery-01-stage"
                data-state={stage.state}
                className="flex flex-col gap-0.5"
              >
                <dt className="flex items-baseline gap-3 text-sm font-medium">
                  <span>{stage.name}</span>
                  {/*
                    The date, and the reading on an `upcoming` stage is drawn in the
                    muted ink with the caller's sentence beside it, because a moment
                    that has not happened is an expectation and this Block is not
                    going to let a date look like a record. See the JSDoc above.
                  */}
                  <span
                    data-slot="delivery-01-stage-date"
                    className={cn(
                      'text-muted-foreground text-sm font-normal',
                      stage.state === 'upcoming' ? 'text-muted-foreground/70' : null,
                    )}
                  >
                    <RelativeTime
                      date={stage.at}
                      relative={stage.dateLabel?.(stage.at)}
                    />
                  </span>
                </dt>
                {stage.detail === undefined ? null : (
                  <dd
                    data-slot="delivery-01-stage-detail"
                    className="text-muted-foreground text-pretty text-sm"
                  >
                    {stage.detail}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        )}

        {actions === undefined ? null : (
          <div data-slot="delivery-01-actions" className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </Section>
  )
}

export default Delivery01

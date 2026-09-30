'use client'

import type { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { LiveRegion } from '../../components/ui/live-region'
import { RelativeTime } from '../../components/ui/relative-time'
import {
  Section,
  SectionHeading,
  type HeadingLevel,
} from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. It is the same rule `AvatarGroup` applies, repeated rather than
 * imported, and the boundary is the reason: that helper is private to its module and
 * exporting it would make a private derivation part of a published surface in order to
 * save six lines in a Block. The cost is stated rather than hidden: two modules carry
 * this rule, so a change to it is a change in both, and a caller who needs a case the
 * rule does not cover composes `Avatar` themselves and passes their own node.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * One person in a handover: a name, a role, and a portrait where there is one.
 *
 * **A person's own object and not a heading and not a string, and the reason is that
 * this Block draws two of them and they are peers.** A handover is a moment where
 * somebody else becomes responsible, so the person handing over and the person
 * receiving are the two halves of one fact, and a Block that drew the receiver as the
 * new owner would be saying the handover had already happened. It has not, and the
 * confirmation control below is where it happens. So neither is emphasised, neither is
 * a heading, and this type is the same shape for both.
 *
 * The role is optional, because a handover between two people in the same team needs
 * none and a handover between two teams needs one, and a shape that required it would
 * put an empty line on half the handovers anybody actually writes.
 */
export type Handoff01Person = {
  /**
   * The person's own name, as they publish it.
   *
   * Required, and it is also the source of the initials the portrait falls back to.
   * A caller who wants to display a name differently from the one it abbreviates has a
   * problem this Block has no opinion about.
   */
  name: string
  /** What they do, in the words the caller uses. Omit it rather than passing an empty string. */
  role?: string
  /**
   * The portrait, with the name the initials come from.
   *
   * Omit it for a person the caller has no photograph of. Nothing is drawn where the
   * portrait would be, because a person-shaped glyph is a claim about a person this
   * system knows nothing about, and a handover is a document two colleagues are about
   * to read together. A name is enough to know who is taking a run.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The person's name, which is the initials' source. */
    name: string
  }
}

/**
 * One thing that is still outstanding on a run being handed over, and where it goes.
 *
 * `label` is required and `id` is required, and the reason is stated on the Block's
 * `open` prop rather than here: these are the items, and a count would not be the
 * items.
 */
export type Handoff01Open = {
  /** The item's stable key within the set. */
  id: string
  /**
   * What is still outstanding, in the caller's own words.
   *
   * A sentence rather than a noun phrase where it can be, because the reader of a
   * handover is deciding whether they can take a run and the sentence is what tells
   * them. "The Rotterdam capture is half done" says more than "Rotterdam capture".
   */
  label: string
  /** Where the item can be read in full. Its presence makes the label a link. */
  href?: string
  /**
   * The words on the link beside the label, and required whenever `href` is.
   *
   * A link whose only words are the item's own label tells a reader nothing about what
   * activating it does, and a handover is read by somebody who is about to be
   * responsible for the thing the link points at. So the sentence is the caller's and
   * the run throws without it.
   */
  hrefLabel?: string
}

/**
 * How the confirmation request stands, in the caller's own words.
 *
 * A prop and never a state this Block writes, for the reason every Block in this wave
 * states: a sentence this package wrote would be inherited verbatim by every consumer,
 * and a handover has more outcomes than any other control in the package, from accepted
 * to queued behind a rota to refused to a message nobody read to a network failure
 * halfway through.
 */
export type Handoff01Status = {
  /**
   * Which of the four the request is in. Read by the Block for two things only.
   *
   * `confirmed` is the one that changes the control's words, and `sending` is the one
   * that disables it, because a second press while the first is in flight is a second
   * handover of the same run and the second one would arrive at a colleague who has
   * already been told they are running it. Everything else is the caller's to say.
   */
  state: 'idle' | 'sending' | 'confirmed' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * The props a Handoff01 takes.
 *
 * Every string is a prop and the Block ships none: no name, no role, no state word, no
 * outstanding item, no button label and not one word of the sentence that says whether
 * the handover happened. A handover with Prism's words in it would be a handover between
 * two people Prism has never met.
 */
export type Handoff01Props = {
  /** The short line above the title, usually which run this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, and the reason is the one every list and table in this package gives: a
   * handover with no heading is a set of names a reader cannot name, and a document a
   * reader cannot name is a document they cannot come back to at the end of a shift.
   */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The person handing the run over.
   *
   * Required, because a handover with no outgoing owner is a run nobody is giving up
   * and the confirmation below would be a stranger accepting it.
   */
  from: Handoff01Person
  /**
   * The person receiving it.
   *
   * Required, and **this is the whole of why the two people are drawn at the same
   * weight rather than the receiver being styled as the new owner.** A handover is a
   * moment where somebody else becomes responsible, and the handover is not complete
   * until the receiver confirms: the confirmation control below is where that happens,
   * and the confirmation is the caller's state because this Block does not know what
   * happened. So the receiver is drawn beside the sender, with the same size, the same
   * ink and the same treatment, and neither is a heading and neither is emphasised. The
   * cost is that a reader cannot tell from the drawing alone who is now responsible,
   * and the answer is that they cannot, because it is not true until the confirmation
   * lands, at which point the caller's `status` says so in the caller's own words.
   */
  to: Handoff01Person
  /**
   * What state the run is in, in the caller's own words.
   *
   * A string and not a `StatusTone`, because a tone is a claim about urgency that only
   * the caller can make and a run being handed over is not itself urgent. "Draining",
   * "Waiting for the capture to finish" and "Quiet since Thursday" are three states
   * and no two of them are the same urgency. Drawn in the muted ink beside the
   * confirm control, because it is context for the decision rather than the decision.
   */
  state?: string
  /**
   * The words naming the state, when the state is a short token rather than a
   * sentence.
   *
   * Required whenever `state` is given, and the run throws without it, for the reason
   * every other pair in this package states: a token beside a sentence is two
   * readings of one fact, and a caller who passes the machine value without the
   * sentence has a code on a document somebody reads aloud. A handover is the worst
   * case for this particular defect, because the document is read by two people at once
   * and the one who did not write the token will not know what it means.
   */
  stateLabel?: string
  /**
   * When the run started, in whichever of the three forms the caller holds it.
   *
   * Drawn through `relative-time`, so a number arrives as a date in the reader's own
   * locale and a string is handed to the platform untouched. The cost is that the
   * moment is in the client graph rather than the server one, which is a cost this
   * Block was already paying because a handover carries a control.
   */
  startedAt?: number | string
  /**
   * What is still outstanding on the run, in the caller's own words, one item per
   * entry.
   *
   * **These are the items and not a count, and the reason is the whole of what a
   * handover is.** "3 open" tells a reader nothing about whether they can take the
   * run: three open items is a comfortable handover on one estate and a disaster on
   * another, and the difference is what the three items say. The three items are the
   * difference between a handover that transfers work and one that transfers a
   * question, because a reader who can see them can decide and a reader who can only
   * count them has to ask. So the list is drawn, in full, with each item's own label
   * and a link when the caller has a destination for it, and the cost is that the
   * section grows with the number of outstanding items, which is a cost the caller
   * controls by choosing which items to list.
   *
   * Omit it for a run with nothing outstanding, and the outstanding region is not
   * drawn at all rather than being drawn empty, because an empty region headed by
   * nothing reads as a rendering failure. A caller who wants to say so in words
   * passes `empty`.
   */
  open?: readonly Handoff01Open[]
  /**
   * Called when the reader presses the confirmation control.
   *
   * A callback and not a router, for the reason the whole package holds: a Block
   * reports an interaction and the consumer decides what it means. There is no
   * confirmed state written here either, because whether the caller's server accepted
   * the handover is a fact about the caller's server, and a Block that drew a tick
   * would be asserting that it had.
   */
  onConfirm?: () => void
  /**
   * The words on the confirmation control.
   *
   * Required whenever `onConfirm` is set, and the run throws without it, because a
   * button with no name is announced as a button and this is the one control on the
   * page that transfers responsibility for something.
   */
  confirmLabel?: string
  /**
   * The words on the control once the caller's own state says the handover happened.
   *
   * Required whenever `status.state` reads `confirmed`, and the run throws without it,
   * because a control that still reads "Take this run" after the run has been taken
   * is a control that says the opposite of what happened. The control is disabled at
   * that point rather than hidden, so a reader who is looking at the page as the
   * handover lands sees the same control change rather than a control appearing from
   * nowhere.
   */
  confirmedLabel?: string
  /**
   * The outcome of the caller's own request, drawn in a live region and announced.
   *
   * A prop and never an internal state Prism writes, for the reason the type states: a
   * success sentence this package wrote would be inherited by every consumer and would
   * be the one sentence on the page most certainly wrong.
   */
  status?: Handoff01Status
  /**
   * The caller's own sentence for a run with nothing outstanding.
   *
   * Required, and the reason is the one every list in this package states, inverted
   * here: a handover with nothing outstanding is the good case, and the sentence saying
   * so is the one a reader is most likely to believe without reading. "Nothing
   * outstanding" is a claim about an estate Prism cannot see, and a caller whose run
   * has three quiet things outstanding is the caller who needs to say so.
   */
  empty: ReactNode
  /**
   * Heading level for the section heading. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control or a stale word on a document
 * two colleagues are reading together.
 *
 * Four, and each one is a control that cannot be used or a document that would say
 * something false. A confirmation control with no label is announced as a button, and
 * it is the one control on the page that transfers responsibility. A state with no
 * words is a token beside nothing. A link with no sentence is announced by its
 * destination. A confirmed handover whose control still reads the confirmation label
 * is a control that says the opposite of what happened.
 *
 * Named parameters rather than the props object, because the only four of the eleven
 * props this reads are the four that can be wrong and a caller reading a diagnostic
 * should not have to scan a reconstructed object literal to find which one failed.
 */
function assertHandoff(input: {
  onConfirm: (() => void) | undefined
  confirmLabel: string | undefined
  confirmedLabel: string | undefined
  state: string | undefined
  stateLabel: string | undefined
  status: Handoff01Status | undefined
  open: readonly Handoff01Open[] | undefined
}): void {
  const { onConfirm, confirmLabel, confirmedLabel, state, stateLabel, status, open } = input

  if (onConfirm !== undefined && (confirmLabel === undefined || confirmLabel.trim() === '')) {
    throw new Error(
      'Handoff01: onConfirm was passed with no confirmLabel, so the control that transfers ' +
        'responsibility for a run would be a button announced as a button and nothing else. Pass the ' +
        'words for it, or drop the handler and render your own control.',
    )
  }

  if ((state === undefined) !== (stateLabel === undefined)) {
    throw new Error(
      'Handoff01: one of state and stateLabel was passed without the other, so the run would carry either ' +
        'a token with no sentence beside it or a sentence naming nothing. A handover is read aloud by two ' +
        'people and the one who did not write the token will not know what it means. Pass both, or neither.',
    )
  }

  for (const item of open ?? []) {
    if ((item.href === undefined) !== (item.hrefLabel === undefined)) {
      throw new Error(
        `Handoff01: the outstanding item "${item.label}" declares one of href and hrefLabel without the ` +
          'other, so the row would carry a link with no words on it, or a sentence about following something ' +
          'and nothing to follow. Pass both, or neither.',
      )
    }
  }

  if (status?.state !== 'confirmed') return

  if (confirmedLabel === undefined || confirmedLabel.trim() === '') {
    throw new Error(
      'Handoff01: the status reads confirmed and no confirmedLabel was passed, so the control would still ' +
        'read the words that ask for a handover that has already happened. Pass the words the control ' +
        'should read now, or do not report the handover as confirmed until the reader can be told what it ' +
        'now says.',
    )
  }

  if (confirmLabel === undefined || confirmLabel.trim() === '') {
    throw new Error(
      'Handoff01: the status reads confirmed and no confirmLabel was passed, so this Block has nothing to ' +
        'have read before the handover landed. Pass both labels, so the control has words in both states.',
    )
  }
}

/**
 * A run being handed from one owner to another: who is handing over, who is
 * receiving, what state the run is in, what is still open, and a confirm control.
 *
 * **A handover is a moment where somebody else becomes responsible, so this Block
 * draws the two people at the same weight and does not style the receiver as the new
 * owner.** That is the decision the whole Block is shaped around, and it has a cost
 * that is worth stating rather than hiding. The obvious arrangement is to emphasise
 * the receiver, to draw the sender as a departing figure in the muted ink and the
 * receiver in the foreground with the confirm control under them, because that is what
 * a handover looks like the moment after it completes. It is wrong here for two
 * reasons. The first is that the handover is not complete until the receiver confirms,
 * and the confirmation control below is where it completes, so a drawing that says the
 * receiver is now the owner is asserting something three props before it is true. The
 * second is that the confirmation is the caller's state and not this Block's: this
 * Block knows what the reader was told and nothing about what happened, so the one
 * moment at which the receiver does become the owner is the one moment this Block
 * cannot draw. So the two are peers, side by side, the same size and the same ink,
 * neither one a heading, and the run's own words say who is responsible. The cost is
 * that a reader looking at the page cannot tell from the drawing alone who is running
 * the run, and the answer is that they cannot, and that is true.
 *
 * **The outstanding items are drawn as items and not as a count, because "3 open"
 * tells a reader nothing about whether they can take the run.** Three open items is a
 * comfortable handover on one estate and a catastrophe on another, and the difference is
 * entirely in what the three items say: a capture half done, a certificate renewal
 * booked and a snapshot that is failing are three things a receiver can look at and
 * decide about, and a number is not. The three items are the whole difference between
 * a handover that transfers work and one that transfers a question, because a reader
 * who can see them can decide and a reader who can only count them has to ask, and
 * asking is what a handover is supposed to avoid. So `open` is a list with a label per
 * item and an optional link per item, drawn in full, in the caller's order. The cost is
 * that the region grows with the number of outstanding items, which is a cost the
 * caller controls by choosing which items to list, and a caller with two hundred open
 * items wants a `DataTable01` rather than this Block.
 *
 * **It must not decide whether the handover happened, and the confirmation is the
 * caller's state for the same reason `OpsChecklist01` does not decide a verdict.** A
 * design system that drew a tick would be asserting a fact about a run it cannot see,
 * and a Block that removed the control on success would be asserting a second one: that
 * the run has changed hands, which only the caller's server knows. So `status` is a
 * prop with the caller's own sentence, the control is disabled rather than removed
 * once `status.state` reads `confirmed`, and the words it reads then are the caller's
 * too, which is why `confirmedLabel` is required at that point and the run throws
 * without it. A control that still reads "Take this run" after the run has been taken
 * is a control that says the opposite of what happened.
 *
 * **The two links in a handover are a real anchor and a real anchor, and both carry
 * the caller's sentence.** A link whose only words are the item's own label tells a
 * reader nothing about what activating it does, and a handover is read by somebody
 * about to be responsible for the thing the link points at, which is the one context in
 * which knowing what you are about to open matters most. So `hrefLabel` is required
 * inside the arm where `href` is, the run throws for the JavaScript caller and for a
 * value that came out of a store with the type's guarantee gone, and the destination
 * stays in the `href` where the status bar and the context menu can reach it.
 *
 * **The state is a string and not a `StatusTone`, and that is the one place this Block
 * refuses the mapping it makes everywhere else.** Every other mark in this package
 * takes a tone and hands the sentence back, because a tone is a claim about urgency
 * and a run being handed over is not urgent in a way Prism could see. A run that is
 * draining and a run that has been quiet since Thursday are both handovers, and one of
 * them is an emergency and the other is a Tuesday. So `state` is the caller's words,
 * drawn in the muted ink between the two people and the outstanding items, where a
 * receiver reads it as context for the decision rather than as a fourth section, and
 * `stateLabel` is required with it so a short token never appears without the sentence
 * that names it.
 *
 * **It is a client Component, and the reason is the handler rather than the state.**
 * `onConfirm` is a function, a function is a piece of state, and state is a client
 * module: a server component cannot hand an event handler to a `<button>`, so a caller
 * rendering this from a server component would get a handover whose control does
 * nothing. The rest of the rendering is two portraits and a list, which is the price of
 * that argument and a small one. With no `onConfirm` set the rendered output is
 * entirely static, and the direction of the whole Block is unchanged: nothing here
 * fetches, nothing here polls and nothing here announces anything on a timer.
 */
export function Handoff01({
  eyebrow,
  title,
  description,
  from,
  to,
  state,
  stateLabel,
  startedAt,
  open,
  onConfirm,
  confirmLabel,
  confirmedLabel,
  status,
  empty,
  headingLevel = 'h2',
  className,
}: Handoff01Props) {
  assertHandoff({ onConfirm, confirmLabel, confirmedLabel, state, stateLabel, status, open })

  const sending = status?.state === 'sending'
  const confirmed = status?.state === 'confirmed'
  const nothingOpen = open === undefined || open.length === 0

  return (
    <Section data-slot="handoff-01" className={cn(className)}>
      <div data-slot="handoff-01-body" className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        {/*
          The two people, and the reason they are peers is the Block's JSDoc: a
          handover is not complete until the receiver confirms, and the confirmation is
          the caller's state, so there is no moment this Block could draw the receiver
          as the owner. Same size, same ink, neither one a heading. The order on the
          page is the caller's, because `from` is read first and a reader who is about
          to take a run reads the person they are taking it from first.
        */}
        <div
          data-slot="handoff-01-people"
          className="grid gap-8 sm:grid-cols-2 sm:gap-12"
        >
          <Party data-slot="handoff-01-from" party={from} side="from" />
          <Party data-slot="handoff-01-to" party={to} side="to" />
        </div>

        {/*
          The run's own reading: the caller's own words for its state and the
          platform's absolute reading of the moment it started, in that order because
          the state is what a person says out loud and the moment is what they check.
          `stateLabel` is guaranteed present whenever `state` is, because the refusal
          above threw without it, so the two are never one and the other. The region
          draws itself only when at least one of the two is there, and it is a plain
          row rather than a bordered band, because a run's state is context for the
          decision below it and a frame would make it look like a fourth section.
        */}
        {state === undefined && startedAt === undefined ? null : (
          <div
            data-slot="handoff-01-state"
            className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
          >
            {stateLabel === undefined ? null : (
              <span data-slot="handoff-01-state-word">{stateLabel}</span>
            )}
            {startedAt === undefined ? null : (
              <RelativeTime data-slot="handoff-01-started" date={startedAt} dateStyle="medium" />
            )}
          </div>
        )}

        {/*
          The outstanding items, in full and in the caller's order, and not a count.
          A list rather than a set of paragraphs, because the items are what a receiver
          is deciding about and a list is what tells assistive technology how many there
          are. The rule between rows is a border rather than a gap alone, so the
          boundary survives at any zoom level where the gap stops being visible.
        */}
        {nothingOpen ? (
          <p
            data-slot="handoff-01-empty"
            className="text-muted-foreground max-w-measure-narrow text-pretty"
          >
            {empty}
          </p>
        ) : (
          <ul
            data-slot="handoff-01-open"
            className="border-border flex max-w-measure-narrow flex-col border-t"
          >
            {open?.map((item) => (
              <li
                key={item.id}
                data-slot="handoff-01-open-item"
                data-item={item.id}
                className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b py-3 last:border-b-0"
              >
                <span
                  data-slot="handoff-01-open-label"
                  className="text-pretty text-sm first:font-medium"
                >
                  {item.label}
                </span>

                {item.href === undefined || item.hrefLabel === undefined ? null : (
                  <CtaLink
                    data-slot="handoff-01-open-link"
                    href={item.href}
                    variant="ghost"
                    size="sm"
                    className="ms-auto shrink-0"
                  >
                    {item.hrefLabel}
                  </CtaLink>
                )}
              </li>
            ))}
          </ul>
        )}

        {onConfirm === undefined ? null : (
          <div data-slot="handoff-01-actions" className="flex flex-col gap-3">
            {/*
              The control, and the two states it can be in. It is disabled rather
              than removed once the handover has landed, because a reader who is
              looking at the page as the confirmation arrives should see the same
              control change its words rather than watch a control disappear, and
              because a control that vanishes takes a keyboard reader's focus with
              it. The words in both states are the caller's and the run has already
              refused to draw the confirmed state without them.

              The control sits after the people and the outstanding items and nothing
              else, so the reader's order is who, then what is left, then the one thing
              that changes who is responsible. Nothing is drawn beside it, because
              everything a control needs context for is already on the page above it and
              a second copy of the run's state beside the button would be the same
              sentence read twice.
            */}
            <Button
              data-slot="handoff-01-confirm"
              type="button"
              disabled={sending || confirmed}
              onClick={onConfirm}
              className="self-start"
            >
              {confirmed ? confirmedLabel : confirmLabel}
            </Button>

            {/*
              The outcome, in a live region, and it renders nothing while there is no
              message. `assertive` only for a refusal, because that is the one state
              where the reader is waiting for an answer and nothing else follows it, and
              a handover in its resting state carries no live region at all rather than
              an empty one announcing every unrelated change of its ancestors. A region
              that is always present is the noise this Component exists to avoid as
              well as to cause.
            */}
            <LiveRegion
              data-slot="handoff-01-status"
              politeness={status?.state === 'error' ? 'assertive' : 'polite'}
              busy={sending}
              className="text-sm"
            >
              {status?.message}
            </LiveRegion>
          </div>
        )}
      </div>
    </Section>
  )
}

/**
 * One person, drawn the same way whichever side of the handover they are on.
 *
 * **One helper rather than the markup written twice, and the reason is the same one
 * `Download01` gives for its single `FileMeta`.** Two copies would be two answers to
 * what a person in a handover looks like, and the second one is the one that goes
 * stale, which on this Block would be the copy that emphasised the receiver. One
 * helper with a `side` attribute that draws nothing different is the mechanical form of
 * the same decision the JSDoc above argues: the two are peers, and the code says so
 * by having one shape for them.
 *
 * The portrait is omitted entirely when the caller has no photograph, and the initials
 * are the person's own rather than a person-shaped glyph, for the reason
 * `AvatarGroup` and `AvatarGroup`'s callers state: a silhouette is a picture of nobody
 * and tells a reader nothing about who they are looking at.
 */
function Party({
  party,
  side,
  className,
}: {
  party: Handoff01Person
  /** Which side of the handover this person is on, carried on the markup for a test. */
  side: 'from' | 'to'
  className?: string
}) {
  return (
    <div
      data-slot="handoff-01-party"
      data-side={side}
      className={cn('flex min-w-0 items-start gap-4', className)}
    >
      {party.avatar === undefined ? null : (
        <Avatar className="size-12 shrink-0">
          {party.avatar.src === undefined ? null : (
            <AvatarImage src={party.avatar.src} alt="" />
          )}
          <AvatarFallback className="text-mono">{initialsOf(party.avatar.name)}</AvatarFallback>
        </Avatar>
      )}

      <div data-slot="handoff-01-party-text" className="flex min-w-0 flex-col gap-0.5">
        {/*
          The name is a `span` and not a heading, and the reason is the one the Block
          JSDoc gives: a handover's two names are the two halves of one fact about who
          is responsible, and putting them in the outline would give a reader
          navigating by heading two entries that say nothing the section's own heading
          has not said. The person handing over is not a section of the page and the
          person receiving is not either.
        */}
        <span data-slot="handoff-01-party-name" className="text-base font-semibold">
          {party.name}
        </span>
        {party.role === undefined ? null : (
          <span data-slot="handoff-01-party-role" className="text-muted-foreground text-sm">
            {party.role}
          </span>
        )}
      </div>
    </div>
  )
}

export default Handoff01

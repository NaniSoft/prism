'use client'

import { type ReactNode, useId } from 'react'

import { Field, FieldDescription, FieldLabel } from '../../components/ui/field'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Switch } from '../../components/ui/switch'

/**
 * One thing that can happen on a channel, and whether this workspace wants to
 * hear about it.
 *
 * The `on` boolean is the preference and not a request, and the difference is
 * stated in the Block's JSDoc because it decides what a controlled switch costs:
 * a Block that held the next value would show a reader a preference the product
 * has not stored.
 */
export type SettingsNotificationsEvent = {
  /** A stable key for the row, and the value handed back to `onToggle`. */
  id: string
  /**
   * The event's own name, as the product writes it, and the visible label of the
   * control that turns it on.
   *
   * A short noun phrase, because it sits on a row beside a switch. A phrase that
   * wraps is a row whose control is vertically centred against two lines, and a
   * list of preferences is scanned on the left edge.
   */
  label: string
  /**
   * The line under the event's name: when it fires, what it carries, what it
   * costs.
   *
   * A node rather than a string because half of the useful sentences in this
   * position carry a link to the thing being described, and a caller who has to
   * flatten theirs to a string loses it.
   */
  description?: ReactNode
  /**
   * The preference as the product has it, and not what the reader is about to
   * change it to.
   *
   * The switch is controlled from this value and nothing else, so a change is a
   * request rather than a mutation. See the Block's JSDoc for why that is the
   * arrangement rather than the one that feels more responsive.
   */
  on: boolean
  /**
   * Marks an event the product cannot work without, which draws the control
   * read-only and asks the reader to accept the state rather than to change it.
   *
   * This is the load-bearing flag in the whole Block and the argument for it is
   * the Block's JSDoc at length. The short version: a preference surface where
   * every control is optional will let a reader turn off something the product
   * cannot work without, and the failure arrives later, somewhere else, with
   * nothing on this page to point at.
   */
  required?: boolean
  /**
   * The mark that says this event cannot be turned off.
   *
   * Required whenever `required` is set, and a thrown diagnostic rather than a
   * silent absence, for the reason `Status` gives for its own label: a control
   * that will not move with nothing beside it saying so is a control a reader
   * cannot tell from a fault.
   */
  requiredLabel?: string
}

/**
 * One channel a workspace can be notified on, and the events on it.
 *
 * A channel is a group, and the group is named by the product: whether a
 * notification goes by email, by a message inside the product, by a push to a
 * device or by a webhook is a fact about the product's architecture and about
 * its users, and a design system that shipped a channel list would be shipping
 * an architecture.
 */
export type SettingsNotificationsChannel = {
  /** A stable key for the group, and the value handed back to `onToggle`. */
  id: string
  /** The channel's own name, and the heading of the group. */
  name: string
  /** The line under the channel's name: what it is for, and who else sees it. */
  description?: ReactNode
  /** The events on this channel, in the order a reader should meet them. */
  events: readonly SettingsNotificationsEvent[]
}

/**
 * The props a SettingsNotifications01 takes.
 *
 * Every string is a prop and the Block ships none. There is no channel, no event,
 * no default preference, no required set and not one of the three sentences a
 * notification surface is most tempted to ship, which are the words on a switch,
 * the words beside a control that will not move, and the note that says a product
 * needs the event. A Block that shipped any of the three would be stating
 * somebody else's notification policy inside their own product.
 */
export type SettingsNotifications01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The section title. Required, because a preferences list with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** The channels, in the order a reader should meet them. The Block does not sort. */
  channels: readonly SettingsNotificationsChannel[]
  /**
   * Called when a reader turns one event on or off.
   *
   * A request and not a mutation: the switch is controlled from `event.on`, so
   * nothing moves on this page until the product says it has. See the Block's
   * JSDoc for why the truth is worth more here than the immediacy.
   */
  onToggle?: (channelId: string, eventId: string, on: boolean) => void
  /**
   * The accessible name of one switch, given the channel, the event and the
   * state the control would move to.
   *
   * Required whenever `onToggle` is set, and the last argument is the state
   * pressing the control would produce rather than the state it is in, because a
   * switch's accessible name has to say what turning it does. A name that says
   * what the control currently is asks the reader to combine two facts before
   * they can act, and the whole of a switch is that it is one press.
   *
   * The sentence must contain the event's own `label`, because that is the
   * visible label of the control and the WCAG rule that a visible label must be
   * contained in the accessible name is not a formality on this Block: a reader
   * using voice control says the words they can see, and a switch whose announced
   * name does not contain its own label cannot be activated by saying them.
   *
   * It is not consulted for an event marked `required`, and the Block's JSDoc
   * says why: that control does not move, so a sentence describing what pressing
   * it would do is a claim about a thing that cannot happen.
   */
  updateLabel?: (
    channel: { id: string; name: string },
    event: { id: string; label: string },
    on: boolean,
  ) => string
  /**
   * The note that says the product cannot work without the marked events.
   *
   * Required whenever any event is marked `required`, and drawn once at the top
   * of the section rather than repeated on each row, because it is the product's
   * standing reason for the whole set rather than an excuse for one control. It
   * is also the described-by of every read-only control on the page, which is the
   * arrangement that makes a control which cannot move legible rather than
   * mysterious.
   */
  disabledLabel?: string
  /**
   * What the surface shows when there are no channels.
   *
   * Required, and the reason is that a product with no notification channels and
   * a product whose channels failed to load are not the same page, and a Block
   * that guessed between them would be guessing about somebody else's outage.
   */
  empty: ReactNode
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, so that a preferences surface never renders a control it cannot
 * explain.
 *
 * A switch that moves and reports nothing, a switch that reports a move and
 * cannot move, an event marked as one the product cannot work without and no
 * words for the reader on either side of that, and a required set with no note
 * saying so anywhere on the page. Each is a caller's mistake rather than a
 * request, so each throws in a console rather than rendering the quiet version of
 * itself.
 */
function assertProps(props: {
  channels: readonly SettingsNotificationsChannel[]
  onToggle?: (channelId: string, eventId: string, on: boolean) => void
  updateLabel?: (
    channel: { id: string; name: string },
    event: { id: string; label: string },
    on: boolean,
  ) => string
  disabledLabel?: string
}): void {
  const { channels, onToggle, updateLabel, disabledLabel } = props

  if (onToggle !== undefined && updateLabel === undefined) {
    throw new Error(
      'SettingsNotifications01: onToggle was passed with no updateLabel, so every switch would be announced ' +
        'by the name of the event alone. That name says what the control is, not what pressing it does, and ' +
        'a reader who cannot tell those two things apart has to press the control to find out.',
    )
  }

  if (onToggle === undefined && updateLabel !== undefined) {
    throw new Error(
      'SettingsNotifications01: updateLabel was passed with no onToggle, so the sentences would be composed ' +
        'and then discarded, which is a caller who believes they have named the switches on a surface that ' +
        'has none.',
    )
  }

  for (const channel of channels) {
    if (channel.events.length === 0) {
      throw new Error(
        `SettingsNotifications01: the channel ${JSON.stringify(channel.name)} carries no events, so the group ` +
          'would be a heading with a line under it and nothing to decide. Omit the channel, or give it the ' +
          'events it is for.',
      )
    }

    for (const event of channel.events) {
      if (
        event.required === true &&
        (event.requiredLabel === undefined || event.requiredLabel.trim() === '')
      ) {
        throw new Error(
          'SettingsNotifications01: an event is marked required and passed no requiredLabel, so the control ' +
            'that will not move would say nothing about why. Pass the mark, and the note on the section.',
        )
      }
    }
  }

  const anyRequired = channels.some((channel) => channel.events.some((event) => event.required === true))
  if (anyRequired && (disabledLabel === undefined || disabledLabel.trim() === '')) {
    throw new Error(
      'SettingsNotifications01: an event is marked required and no disabledLabel was passed, so a reader ' +
        'would meet a control that will not move with no sentence anywhere on the page explaining that a ' +
        'product decision is what stopped them. Pass the note.',
    )
  }
}

/**
 * Per-channel notification preferences: a channel, a line about it, a set of
 * switches for the events on it, and a note where the product has a standing
 * requirement of its own.
 *
 * **This is the Block where a design system's care is most visible and least
 * appreciated, because the reader came to change one thing and leave.** A
 * preferences surface is the densest set of controls a product puts in front of a
 * reader, and it is the one they visit least often and trust most. They are not
 * reading it, they are hunting. They want the switch for the one event and they
 * want to be sure of three things when they find it: that this is the right
 * event, that pressing it does what they think, and that it did what they wanted.
 * Everything below is in service of the third of those, which is the one a
 * surface usually gets wrong, usually by being optimistic.
 *
 * **The `required` flag is the load-bearing decision, and the set is a prop
 * because a design system that fixed the list would be deciding for every
 * product which of its events are load-bearing.** The argument has two halves and
 * both matter. A preference surface where every control is optional is a surface
 * that will let a reader turn off something the product cannot work without: the
 * reader is told the switch is theirs, presses it, the product stores the answer,
 * and the failure arrives days later in a different part of the product with
 * nothing on this page to point at. The reader is right that the switch was
 * there and the product is right that the event was needed, and neither of them
 * is wrong, which is the worst possible place for a disagreement to live. So a
 * required set has to exist. And the fixed-list alternative is worse than the
 * problem: this package does not know what any product cannot work without. A
 * product whose password reset email is load-bearing and a product that mails
 * nothing at all are both real, and a Block that shipped the first product's list
 * would install it into the second, where a reader could turn off a notification
 * that does not exist and a support ticket would arrive with no cause anyone can
 * find. So the flag is on the event, the note is the caller's, and the
 * consequence is that a consumer wiring this Block up has to decide which of their
 * own events are load-bearing. That is a sentence worth naming rather than
 * hiding: it is a decision, and it is theirs.
 *
 * **A required control is drawn read-only rather than disabled, and the reason is
 * that a disabled control is not in the tab order.** A keyboard reader who tabs
 * across a preferences surface with three required events meets three holes where
 * three controls used to be. They cannot find the setting, they cannot come back
 * to it, and there is nothing in the document to tell them the setting exists at
 * all, so the most likely reading is that the page is broken or that the product
 * has hidden something from them. Both are worse than the truth, which is that a
 * decision has been made on their behalf. So the control keeps its place in the
 * order, keeps its state announced, and takes the note as its description: the
 * reader meets it, hears that it will not move, and hears why. The cost is
 * stated rather than hidden, because it is real: a read-only control is drawn in
 * the same ink as a live one, so the mark beside it and the note under the title
 * are what carry the fact, and there is no flag on this package that dims it. A
 * caller who wants the visual weight of a disabled control has to choose between
 * that and the focus hole, and the focus hole is the worse of the two, so the
 * decision here is not that read-only is better but that it is less bad.
 *
 * **The switch's accessible name says what pressing it will do, and the sentence
 * is the caller's.** A switch announces its state, so a reader who meets a
 * control named "Deploys" with the state off knows the current answer and has to
 * work out the consequence themselves, which is the one step a switch exists to
 * remove. So the name is composed from the state the control would move to, and
 * it is a function rather than a record of strings because the honest sentence
 * names the event, the channel and sometimes a qualification, and because a
 * consumer in three languages has the sentence in three languages and Prism has
 * none of them. The name is not consulted for a required event, and that is a
 * consequence rather than an omission: a sentence describing what pressing a
 * read-only control would do is a claim about a thing that cannot happen, and a
 * Block that printed one would be the defect it exists to prevent.
 *
 * **The note is described once and repeated by reference, so every read-only
 * control on the page carries it.** It is drawn at the top rather than repeated on
 * each row, for the reason `list-panel` states for a count: it is the product's
 * standing reason for the whole set, so a reader who meets it once has met it. The
 * `aria-describedby` is what makes it true per control, and that is a real
 * difference rather than a nicety: a sentence a reader has to go and find is a
 * sentence most readers do not go and find, and a control that will not move with
 * an unfound reason behind it is exactly the control a reader reports as broken.
 *
 * **A switch is the control, and not a checkbox and not a button.** `Switch` is
 * composed for all three reasons the Component's own JSDoc gives, and the third
 * is the one that matters on this surface: a switch takes effect immediately, so
 * there is no save control on the page for a reader to press and no state in which
 * the page is holding changes the reader has not committed. That is the whole
 * reason a preferences surface is drawn as switches rather than as a form, and
 * re-deriving it here would mean a hand-written checkbox with no keyboard model, a
 * hidden input that may not submit, and a page where a reader has to look for a
 * button to find out whether they pressed the right thing.
 *
 * **The Block holds no preference state, so a failed change is the caller's to
 * show.** `event.on` is the truth, the switch is controlled from it, and
 * `onToggle` is a request. A Block that moved the switch and rolled it back would
 * show a reader a preference the product rejected, and a reader who left the page
 * in the moment between would leave believing they had turned something off that
 * was still on. The arrangement is the one a server action wants, and it is
 * stated rather than hidden: with a slow network the switch does not move until
 * the product answers, which is slower than the alternative and the only version
 * of it that is not lying.
 *
 * It is a client Component, and the directive is unconditional: a surface that
 * attaches a handler owns the JavaScript that carries it, and the directive is on
 * the module rather than in a leaf so a consumer composing a server page gets the
 * boundary in one place they can see. `Switch` is the only client leaf it draws,
 * and it is a client leaf for the same reason.
 */
export function SettingsNotifications01({
  eyebrow,
  title,
  description,
  channels,
  onToggle,
  updateLabel,
  disabledLabel,
  empty,
  headingLevel = 'h2',
  className,
}: SettingsNotifications01Props) {
  assertProps({ channels, onToggle, updateLabel, disabledLabel })

  // A channel is a group inside the section, so its name is one level below the
  // section's own heading and travels with it when the Block is composed deeper.
  const ChannelTitle = childLevel(headingLevel)
  const base = useId()
  const noteId = disabledLabel === undefined ? undefined : `${base}-note`
  // Whether there is anything at all to decide, which is a fact about the data
  // rather than a prop a caller has to keep in step with the channels.
  const hasEvents = channels.some((channel) => channel.events.length > 0)

  if (!hasEvents) {
    return (
      <Section className={className} data-slot="settings-notifications">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <p data-slot="settings-notifications-empty" className="text-muted-foreground text-pretty text-sm">
          {empty}
        </p>
      </Section>
    )
  }

  return (
    <Section className={className} data-slot="settings-notifications">
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-8"
      />

      {/*
        The note, once, at the top of the section, and referred to by every
        read-only control below rather than repeated beside each one. The reason is
        the product's standing position on the whole set, so a reader has met it
        once, and the `aria-describedby` is what makes it true per control: a
        sentence a reader has to go and find is a sentence most readers do not go
        and find.
      */}
      {noteId === undefined ? null : (
        <p
          id={noteId}
          data-slot="settings-notifications-note"
          className="text-muted-foreground mb-8 text-pretty text-sm"
        >
          {disabledLabel}
        </p>
      )}

      <div data-slot="settings-notifications-channels" className="flex flex-col gap-10">
        {channels.map((channel) => {
          if (channel.events.length === 0) return null

          return (
            <section
              key={channel.id}
              data-slot="settings-notifications-channel"
              data-channel={channel.id}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <ChannelTitle
                  data-slot="settings-notifications-channel-name"
                  className="text-lg font-semibold tracking-tight"
                >
                  {channel.name}
                </ChannelTitle>
                {channel.description === undefined ? null : (
                  <p className="text-muted-foreground text-pretty text-sm">
                    {channel.description}
                  </p>
                )}
              </div>

              <ul data-slot="settings-notifications-events" className="flex flex-col">
                {channel.events.map((event) => {
                  const controlId = `${base}-${channel.id}-${event.id}`
                  const required = event.required === true

                  return (
                    <li
                      key={event.id}
                      data-slot="settings-notifications-event"
                      data-event={event.id}
                      data-required={required ? 'true' : undefined}
                      className="border-border flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                    >
                      <Field className="min-w-0 gap-1">
                        <FieldLabel htmlFor={controlId} className="text-base">
                          {event.label}
                        </FieldLabel>
                        {event.description === undefined ? null : (
                          <FieldDescription>{event.description}</FieldDescription>
                        )}
                      </Field>

                      {/*
                        The control, the mark and the note reference, and the three
                        travel together on purpose. `readOnly` rather than
                        `disabled` is the load-bearing choice: a disabled control is
                        out of the tab order, so a keyboard reader meets a hole where
                        a setting used to be and never learns the setting exists. See
                        the Block JSDoc for the cost of the arrangement that keeps
                        the control in the order.
                      */}
                      <div
                        data-slot="settings-notifications-control"
                        className="flex shrink-0 items-center gap-3 pt-0.5 sm:pt-1"
                      >
                        {required && event.requiredLabel === undefined ? null : (
                          <span
                            data-slot="settings-notifications-required"
                            className="text-muted-foreground text-xs font-medium"
                          >
                            {event.requiredLabel}
                          </span>
                        )}

                        <Switch
                          id={controlId}
                          checked={event.on}
                          readOnly={required}
                          aria-label={
                            required || updateLabel === undefined
                              ? undefined
                              : updateLabel(channel, event, !event.on)
                          }
                          aria-describedby={required ? noteId : undefined}
                          onCheckedChange={
                            onToggle === undefined
                              ? undefined
                              : (next) => onToggle(channel.id, event.id, next)
                          }
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </Section>
  )
}

export default SettingsNotifications01

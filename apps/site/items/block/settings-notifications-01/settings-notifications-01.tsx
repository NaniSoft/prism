'use client'

import {
  SettingsNotifications01,
  type SettingsNotificationsChannel,
  type SettingsNotificationsEvent,
} from '@nanisoft/prism-ui/blocks/settings-notifications-01'

/**
 * The sentence a switch announces, given the state pressing it would produce.
 *
 * The name has to say what the control will do rather than what it currently is,
 * and it has to contain the event's own label because that label is the visible
 * text of the switch: a reader using voice control says the words they can see.
 */
function updateLabel(
  channel: { id: string; name: string },
  event: { id: string; label: string },
  on: boolean,
): string {
  const verb = on ? 'Send' : 'Stop sending'
  return `${verb} ${event.label.toLowerCase()} by ${channel.name.toLowerCase()}`
}

const CHANNELS: SettingsNotificationsChannel[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Goes to the four addresses on the members list, and nowhere else.',
    events: [
      {
        id: 'password-changed',
        label: 'A password was changed',
        description: 'Sent so that a change somebody else made is noticed.',
        on: true,
        required: true,
        requiredLabel: 'Always on',
      },
      {
        id: 'new-device',
        label: 'A new device signed in',
        description: 'Carries where and when, because that is the question you will ask.',
        on: true,
        required: true,
        requiredLabel: 'Always on',
      },
      {
        id: 'weekly',
        label: 'The weekly round-up',
        description: 'One message a week, on a Tuesday morning.',
        on: false,
      },
      {
        id: 'invitation-accepted',
        label: 'An invitation was accepted',
        on: true,
      },
    ],
  },
  {
    id: 'in-app',
    name: 'In the app',
    description: 'A badge on the icon, and nothing that leaves the browser.',
    events: [
      {
        id: 'mention',
        label: 'Somebody mentioned you',
        on: true,
      },
      {
        id: 'overdue',
        label: 'A finding went past its window',
        on: true,
      },
      {
        id: 'digest',
        label: 'A digest of the day',
        description: 'The same set, gathered once, at the end.',
        on: false,
      },
    ],
  },
]

/** Every event in the set as its own object, so the no-handler pass can be built from the data. */
const AS_ROWS: SettingsNotificationsEvent[] = CHANNELS.flatMap((channel) => channel.events)

/** One channel with no events at all is refused, so the third pass is a whole empty channel list. */
export default function SettingsNotifications01Demo() {
  return (
    <>
      <SettingsNotifications01
        headingLevel="h3"
        eyebrow="Preview"
        title="What this workspace tells you about"
        description="Two channels, nine events, and two of them marked as ones the product cannot work without. The note is drawn once and every read-only switch refers to it."
        channels={CHANNELS}
        disabledLabel="The two security alerts cannot be turned off, because an account nobody hears about is an account nobody recovers."
        updateLabel={updateLabel}
        onToggle={() => {}}
        empty="This workspace has no channels yet."
      />
      <SettingsNotifications01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same set with nothing required"
        description="Without a required event there is no note, no read-only control and no mark, and the surface is nine ordinary switches."
        channels={CHANNELS.map((channel) => ({
          ...channel,
          events: channel.events.map((event) => ({
            id: event.id,
            label: event.label,
            description: event.description,
            on: event.on,
          })),
        }))}
        updateLabel={updateLabel}
        onToggle={() => {}}
        empty="This workspace has no channels yet."
      />
      <SettingsNotifications01
        headingLevel="h3"
        eyebrow="Preview"
        title="A product with no channels at all"
        description="The empty sentence is yours, because a product with no channels and a product whose channels failed to load are not the same page."
        channels={[]}
        onToggle={() => {}}
        updateLabel={updateLabel}
        empty="Nothing here can be sent yet. The first channel appears when the workspace is set up."
      />
      <SettingsNotifications01
        headingLevel="h3"
        eyebrow="Preview"
        title="One event, on a channel that is on its own"
        description="A single switch is a legitimate answer, and a channel with no events is not: the Block refuses it rather than drawing a heading with nothing to decide under it."
        channels={[{ id: 'sms', name: 'Text message', events: [AS_ROWS[2]] }]}
        onToggle={() => {}}
        updateLabel={updateLabel}
        empty="This workspace has no channels yet."
      />
    </>
  )
}

'use client'

import { useState } from 'react'

import { Faq01 } from '@nanisoft/prism-ui/blocks/faq-01'
import type { Contact01Status } from '@nanisoft/prism-ui/blocks/contact-01'

import { ContactPage } from '@nanisoft/prism-ui/pages/contact-page'

/**
 * The contact screen, with two offices and the questions before them.
 *
 * Four of the five field types are on show, including the select, so the field
 * list reads as a declaration rather than as a fixed form. One office carries a map
 * link and one does not, which is the pair of arms on the office type: a place with
 * no map has no destination to name and no control at all.
 *
 * The Demo is a client Component because the page is one. `onSubmit` is a function
 * and a function cannot cross from a server component to a client component, so the
 * outcome sentence below is written here and never in the package.
 */
export default function ContactPageDemo() {
  const [status, setStatus] = useState<Contact01Status>()

  return (
    <ContactPage
      headingLevel="h3"
      eyebrow="The desk"
      title="Tell us what is going wrong"
      description="One or two sentences saying who reads this and what happens next, so a reader knows before they type."
      form={{
        title: 'Write to the estate desk',
        description: 'The same four fields every support request needs, and nothing this repository has an opinion about.',
      }}
      fields={[
        {
          id: 'name',
          label: 'Your name',
          type: 'text',
          required: true,
          autoComplete: 'name',
          placeholder: 'The name we should use',
        },
        {
          id: 'email',
          label: 'Where to reply',
          type: 'email',
          required: true,
          autoComplete: 'email',
          description: 'The reply goes to this address and nowhere else.',
        },
        {
          id: 'topic',
          label: 'What this is about',
          type: 'select',
          required: true,
          options: [
            { value: 'collector', label: 'A collector that will not start' },
            { value: 'permission', label: 'A permission set waiting for approval' },
            { value: 'invoice', label: 'An invoice or a plan' },
            { value: 'other', label: 'Something else' },
          ],
        },
        {
          id: 'message',
          label: 'What happened',
          type: 'textarea',
          required: true,
          description: 'The collector name, the schedule, and what you saw instead.',
          placeholder: 'What you did, what you expected, and what you saw',
        },
      ]}
      submitLabel="Send it"
      consent="We keep what you write until the request is closed, and we do not put it on a marketing list."
      onSubmit={() =>
        setStatus({
          state: 'sent',
          message: 'It is with the desk. Someone answers in the order requests arrived, which is usually the same day.',
        })
      }
      status={status}
      officesLabel="Where we are"
      offices={[
        {
          id: 'london',
          name: 'London',
          lines: ['Nexus Software Ltd', '2 Bevis Marks', 'London EC3A 7BD', 'United Kingdom'],
          detail: 'The desk is read between 08:00 and 18:00 UK time, Monday to Friday.',
          mapHref: '/offices/london',
          mapLabel: 'Open the map',
        },
        {
          id: 'berlin',
          name: 'Berlin',
          lines: ['Nexus Software GmbH', 'Chausseestrasse 112', '10115 Berlin', 'Germany'],
          detail: 'Read only on Tuesdays and Thursdays, which is when the estate maintainers are in.',
        },
      ]}
      footer={
        <Faq01
          headingLevel="h4"
          title="Before you write"
          questions={[
            {
              id: 'faster',
              question: 'What makes a request we can answer first time?',
              answer: 'The collector name, the schedule it belongs to, and one line saying what you saw instead.',
            },
            {
              id: 'waiting',
              question: 'My permission set is still waiting for approval. Should I write?',
              answer: 'Not yet. An approval is a click, not a queue, and the person who can make it may not be at a desk.',
            },
          ]}
        />
      }
    />
  )
}

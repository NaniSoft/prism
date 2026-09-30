'use client'

import { useState } from 'react'

import { Help01 } from '@nanisoft/prism-ui/blocks/help-01'
import { Newsletter01 } from '@nanisoft/prism-ui/blocks/newsletter-01'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'

import { OnboardingPage } from '@nanisoft/prism-ui/pages/onboarding-page'

/**
 * The setup screen, with a help index beside the checklist.
 *
 * Every one of the four step states is on show at once, because the fourth is the
 * one the screen exists for: `blocked` is the step a reader is genuinely stuck on,
 * and a checklist that can only say done, current and upcoming reads as a broken
 * product to exactly the reader who is right about that.
 *
 * The Demo is a client Component because the page is one. `progressLabel` is a
 * function and a function cannot cross from a server component to a client
 * component, and the help index filters on every keystroke, so both the count and
 * the index have to be rendered on this side of the boundary.
 */
export default function OnboardingPageDemo() {
  const [query, setQuery] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <OnboardingPage
      headingLevel="h3"
      layout="split"
      eyebrow="Setup"
      title="Three things, then your estate is running"
      description="One or two sentences saying what the reader will have when the list is finished."
      steps={[
        {
          id: 'workspace',
          name: 'Create the workspace',
          description: 'The name is the only thing about it you cannot change later.',
          state: 'done',
          stateLabel: 'Done yesterday',
          href: '/settings/workspace',
          hrefLabel: 'Open the workspace settings',
        },
        {
          id: 'collector',
          name: 'Connect the first collector',
          description: 'A read-only key against the estate you want observed.',
          state: 'current',
          stateLabel: 'You are here',
          action: (
            <CtaLink href="/settings/collectors" size="sm" variant="ghost">
              Open the collector settings
            </CtaLink>
          ),
        },
        {
          id: 'approval',
          name: 'Approve the permission set',
          description: 'The collector asks for six scopes. It needs four of them.',
          state: 'blocked',
          stateLabel: 'Waiting on an administrator, since Tuesday',
        },
        {
          id: 'schedule',
          name: 'Set the schedule',
          state: 'upcoming',
          stateLabel: 'Unlocks when the permission set is approved',
        },
      ]}
      progressLabel={(done, total) => `${done} of ${total} done`}
      completion="Nothing else is needed. The first run starts itself."
      empty="There is nothing to set up yet, so this estate is already running."
      help={
        <Help01
          headingLevel="h4"
          title="Setup answers"
          value={query}
          onValueChange={setQuery}
          label="Search the setup answers"
          clearLabel="Clear the search"
          categories={[
            {
              id: 'collectors',
              title: 'Collectors',
              description: 'What a collector is, what it may read, and what it may not.',
              articles: [
                {
                  id: 'scopes',
                  title: 'Why a collector needs six scopes when it reads four',
                  href: '/docs/collectors/scopes',
                  hrefLabel: 'Read the scope note',
                },
                {
                  id: 'keys',
                  title: 'Rotating a collector key without losing a schedule',
                  href: '/docs/collectors/keys',
                  hrefLabel: 'Read the rotation guide',
                },
              ],
            },
            {
              id: 'approvals',
              title: 'Approvals',
              articles: [
                {
                  id: 'admin',
                  title: 'Who can approve a permission set',
                  href: '/docs/permissions/approvers',
                  hrefLabel: 'Read who can approve',
                },
              ],
            },
          ]}
          empty="Nothing here matches that, which usually means the word you want is in the caller's own docs."
          summary={(matches) => (matches === 0 ? '' : `${matches} article(s)`)}
        />
      }
      footer={
        <Newsletter01
          headingLevel="h4"
          title="One note a month about setup changes"
          label="Email address"
          consent="One email a month. Every note has an unsubscribe link, and the address is never sold."
          submitLabel="Subscribe"
          onSubmit={() => setSubscribed(true)}
          status={
            subscribed
              ? { state: 'sent', message: 'You are on the list. The next note is on the first of the month.' }
              : undefined
          }
        />
      }
    />
  )
}

'use client'

import { useState } from 'react'

import { Help01, type Help01Category } from '@nanisoft/prism-ui/blocks/help-01'

/**
 * A small index with the two cases that make the filter's rules visible.
 *
 * "Billing" is a category whose own name is a plausible query, so typing it carries
 * every article under it rather than matching one, and "settings" appears inside
 * three article titles across two categories, so a reader who types it gets a
 * narrower list than the whole index. Between them they are the two decisions the
 * JSDoc argues, and neither is visible in a screenshot of the resting state.
 */
const CATEGORIES: Help01Category[] = [
  {
    id: 'billing',
    title: 'Billing',
    description: 'Invoices, plans, VAT and refunds.',
    articles: [
      {
        id: 'vat',
        title: 'Adding a VAT number',
        href: '/overview',
        hrefLabel: 'Read this article',
        updatedAt: 'Updated 12 August',
      },
      {
        id: 'refund',
        title: 'Asking for a refund',
        href: '/overview',
        hrefLabel: 'Read this article',
      },
      {
        id: 'dunning',
        title: 'What happens when a card expires',
        href: '/overview',
        hrefLabel: 'Read this article',
        updatedAt: 'Updated 30 June',
      },
    ],
  },
  {
    id: 'api',
    title: 'The API',
    description: 'Keys, rate limits and webhooks.',
    articles: [
      {
        id: 'keys',
        title: 'Rotating your API keys',
        href: '/overview',
        hrefLabel: 'Read this article',
        updatedAt: 'Updated 3 September',
      },
      {
        id: 'settings',
        title: 'Reading your account settings',
        href: '/overview',
        hrefLabel: 'Read this article',
      },
    ],
  },
  {
    id: 'workspace',
    title: 'Your workspace',
    description: 'Members, roles and the audit log.',
    articles: [
      {
        id: 'roles',
        title: 'What each role can do',
        href: '/overview',
        hrefLabel: 'Read this article',
      },
      {
        id: 'settings',
        title: 'Changing the workspace settings',
        href: '/overview',
        hrefLabel: 'Read this article',
      },
      {
        id: 'invite',
        title: 'Inviting somebody who already has an account',
        href: '/overview',
        hrefLabel: 'Read this article',
      },
    ],
  },
]

/**
 * The result line, written the way four products write it.
 *
 * It returns null for a count of zero, so the live region is in the document from
 * the first paint with nothing in it and a sentence the moment there is something
 * to say. The plural is the caller's too: the Block hands over a number because the
 * noun it goes with inflects, and the inflection belongs to this sentence.
 */
function summary(matches: number): React.ReactNode {
  if (matches === 0) return null
  return matches === 1 ? '1 article' : `${matches} articles`
}

export default function Help01Demo() {
  const [query, setQuery] = useState('')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Try <strong>Billing</strong>, which is a category&rsquo;s own name and therefore
        carries all three of its articles, and <strong>settings</strong>, which is in
        two article titles and is a token no category is named after. Or type something
        that is not here at all, which is the one line this Block refuses to write.
      </p>

      <Help01
        eyebrow="Nexus"
        title="How can we help?"
        description="Start typing, or pick a group. Everything here is written by the people who built the thing."
        value={query}
        onValueChange={setQuery}
        label="Search the help centre"
        clearLabel="Clear the search"
        categories={CATEGORIES}
        empty={
          <>
            Nothing here matches that. Try a shorter phrase, or{' '}
            <a href="/overview" className="underline underline-offset-4">
              write to us
            </a>{' '}
            and a person will answer.
          </>
        }
        summary={summary}
        headingLevel="h3"
      />
    </div>
  )
}

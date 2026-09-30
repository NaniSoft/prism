'use client'

import { useId, useState } from 'react'

import {
  OfferingCategories01,
  type OfferingCategories01Category,
  type OfferingCategories01Form,
} from '@nanisoft/prism-ui/blocks/offering-categories-01'
import { Button } from '@nanisoft/prism-ui/components/button'
import { NativeSelect } from '@nanisoft/prism-ui/components/native-select'

/**
 * Five kinds of capability, which is one more than a tab row should ever be asked to
 * carry on its own, and that is the reason both arrangements are here.
 *
 * Every count is composed by this Demo rather than printed by the Block, and the
 * second argument is the kind's own name because the noun in that sentence usually is
 * the name of the kind. "12 sources" and "12 supported" and "12" are three sentences,
 * and which one is true is a fact about the page, not about the count.
 */
const CATEGORIES: readonly OfferingCategories01Category[] = [
  {
    id: 'capture',
    name: 'Capture sources',
    description: 'Where a market is read from, and what each one will and will not publish.',
    count: 12,
    countLabel: (count) => `${count} sources connected`,
    href: '/capabilities/capture',
    hrefLabel: 'Read the capture sources',
  },
  {
    id: 'agents',
    name: 'Agents',
    description: 'What acts on a finding, and what it is allowed to touch when it does.',
    count: 6,
    countLabel: (count) => `${count} agents on the runtime`,
    href: '/capabilities/agents',
    hrefLabel: 'Read about the agents',
  },
  {
    id: 'connectors',
    name: 'Connectors',
    description: 'What a site has to expose so its readings can be walked rather than visited.',
    count: 9,
    countLabel: (count, kind) => `${count} ${kind.toLowerCase()} shipped`,
    href: '/capabilities/connectors',
    hrefLabel: 'Read the connectors',
  },
  {
    id: 'tiers',
    name: 'Tiers',
    description: 'What a plan may do, and the ceiling on each of them.',
    count: 3,
    countLabel: (count) => `${count} plans, and the ceiling on each`,
  },
  {
    id: 'retention',
    name: 'Retention and export',
    description: 'How long a reading is kept, and the format it leaves in.',
    count: 4,
    countLabel: (count) => `${count} export formats`,
    href: '/capabilities/export',
    hrefLabel: 'Read the export formats',
  },
]

/**
 * The panel the tab arrangement reveals.
 *
 * It is the caller's own nodes, and it is the point of the `content` slot: the Block
 * knows which kind is showing and nothing at all about what is in it. A panel drawn
 * here would be the Block inventing content for the one place on the page where
 * content is most specific.
 */
function Panel() {
  return (
    <div className="border-border rounded-xl border p-6">
      <p className="text-pretty text-sm">
        Every capability in this kind, with the four facts a reader checks before they
        ask. This is the caller&apos;s own table or list or grid; the Block put it here and
        knows nothing about it.
      </p>
      <ul className="text-muted-foreground mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <li>What it handles</li>
        <li>What it costs</li>
        <li>What it will not do</li>
        <li>Which regions it covers</li>
      </ul>
    </div>
  )
}

/**
 * The strip, with the arrangement switched live.
 *
 * The toggle is the Demo's own control and it is not a prop, which is the whole point
 * of `variant` being a decision the page makes rather than one the Block makes. The
 * second control is here to show the sort of filter a category strip does not draw: a
 * native select, with its own label, wired to the caller's own state, handed in
 * through the slot rather than asked of the Block.
 */
export default function OfferingCategories01Demo() {
  const [form, setForm] = useState<OfferingCategories01Form>('grid')
  const [onlyWithLinks, setOnlyWithLinks] = useState('all')
  const filterId = useId()

  const shown =
    onlyWithLinks === 'all'
      ? CATEGORIES
      : CATEGORIES.filter((category) => category.href !== undefined)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={form === 'grid' ? 'secondary' : 'ghost'}
          aria-pressed={form === 'grid'}
          onClick={() => setForm('grid')}
        >
          Grid
        </Button>
        <Button
          type="button"
          size="sm"
          variant={form === 'tabs' ? 'secondary' : 'ghost'}
          aria-pressed={form === 'tabs'}
          onClick={() => setForm('tabs')}
        >
          Tabs
        </Button>
      </div>

      {/*
        The caller's own control, with its own visible label and its own state. The
        Block did not draw it, does not own its value, and has no opinion about what a
        kind of capability may be narrowed by.
      */}
      <div className="flex items-center gap-3">
        <label htmlFor={filterId} className="text-sm font-medium">
          Narrow the kinds
        </label>
        <NativeSelect
          id={filterId}
          value={onlyWithLinks}
          onChange={(event) => setOnlyWithLinks(event.target.value)}
        >
          <option value="all">Every kind</option>
          <option value="linked">Only the kinds that link somewhere</option>
        </NativeSelect>
      </div>

      <OfferingCategories01
        headingLevel="h3"
        eyebrow="Capabilities"
        title="Five kinds of capability"
        description="The grid is the default because the grid answers all five questions at once, and the tab row answers one until the reader asks."
        categories={shown}
        variant={form}
        content={<Panel />}
        /*
         * The tab labels are spread rather than passed, because the Block refuses
         * them on the grid: a name for a control that is not drawn is a word the
         * documentation publishes and the page never renders, and that is the
         * failure the check is there to catch. The spread is the same shape the
         * Block's own type has, so the Demo says in its markup what the type says
         * in its signature.
         */
        {...(form === 'tabs' ? { tabsLabels: { previous: 'Previous kind', next: 'Next kind' } } : {})}
        empty="No kinds match that. Every kind we publish is in the grid, so there is nothing hidden behind the tabs."
      />

      <p className="text-muted-foreground text-pretty text-sm">
        Switch to the tabs and the same five kinds become one at a time, with two
        controls at the end of the row for a strip that overflows on a phone. The words
        on those two controls are the caller&apos;s, and they are visible words rather than
        accessible names for two arrows, because a reader who cannot tell which arrow
        moves back has to guess.
      </p>
    </div>
  )
}

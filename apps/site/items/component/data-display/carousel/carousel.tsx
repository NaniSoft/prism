'use client'

import { useState } from 'react'

import { Carousel, type CarouselSlide } from '@nanisoft/prism-ui/components/carousel'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Item, type ItemEntry } from '@nanisoft/prism-ui/components/item'

/**
 * Three states of a carousel, and the list that is the real route to the content.
 *
 * The third slide is a wide one, so the track has to move by different amounts and
 * the reader can see that the movement is a layout rather than a guess. The second
 * Demo filters the set down to one, which is the state a filtered carousel passes
 * through and the one that is usually drawn as a picture with two dead buttons.
 *
 * And the list underneath is the point of the whole Component: everything the
 * carousel shows, a reader can reach some other way. A carousel that is the only
 * presentation of this set is a set a reader on a keyboard cannot see.
 */
const CHARTS = [
  { id: 'mar', title: 'March', value: '3,990', note: 'One retry' },
  { id: 'apr', title: 'April', value: '6,270', note: '' },
  { id: 'may', title: 'May', value: '5,510', note: 'Three retries' },
]

/** A drawn series, so the slides have something in them worth looking at. */
function Bars({ value, wide }: { value: number; wide: boolean }) {
  const height = 24 + Math.round(value / 400)
  return (
    <div className="bg-muted flex h-full w-full items-end gap-2 p-6">
      {Array.from({ length: wide ? 12 : 7 }, (_, index) => (
        <span
          key={index}
          className="bg-brand-ink flex-1 rounded-t-sm"
          style={{ height: `${Math.max(12, height - index * 2)}%` }}
        />
      ))}
    </div>
  )
}

const SLIDES: CarouselSlide[] = CHARTS.map((chart) => ({
  id: chart.id,
  label: `${chart.title}, ${chart.value}`,
  children: <Bars value={Number(chart.value.replace(',', ''))} wide={false} />,
}))

/** A fourth slide with a different shape, so the track moves by different amounts. */
const WITH_A_WIDE_SLIDE: CarouselSlide[] = [
  ...SLIDES,
  {
    id: 'half',
    label: 'A wider comparison',
    children: <Bars value={6270} wide />,
  },
]

/** The same content as a list, which is the route the carousel must not replace. */
const AS_A_LIST: ItemEntry[] = CHARTS.map((chart) => ({
  id: chart.id,
  title: chart.title,
  description: chart.note === '' ? 'No retries' : chart.note,
  meta: chart.value,
  href: `/reports/${chart.id}`,
  selected: true,
}))

/** The carousel, the filtered case, and the list that is the other route. */
export default function CarouselDemo() {
  const [showAll, setShowAll] = useState(true)
  const [narrow, setNarrow] = useState(false)
  const [empty, setEmpty] = useState(false)

  return (
    <div className="flex max-w-measure-wide flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Carousel
          slides={empty ? [] : narrow ? SLIDES.slice(0, 1) : showAll ? WITH_A_WIDE_SLIDE : SLIDES}
          label="Spend by month"
          position={(index, total) => `Slide ${index} of ${total}`}
          empty="No months in this range"
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAll((value) => !value)}>
            {showAll ? 'Drop the wide slide' : 'Add the wide slide'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setNarrow((value) => !value)}>
            {narrow ? 'Show every month' : 'Filter to one month'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEmpty((value) => !value)}>
            {empty ? 'Show the months' : 'Show the empty case'}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          The same three months as a list. A carousel must never be the only route to
          its content, and this is the other route.
        </p>
        <ul
          aria-label="Spend by month, as a list"
          className="border-border divide-border divide-y rounded-md border"
        >
          {AS_A_LIST.map((entry) => (
            <li key={entry.id}>
              <Item entry={entry} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

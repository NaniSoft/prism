import type { ReactNode } from 'react'

import { ArrowUpRight } from 'lucide-react'

import { Section, SectionHeading, type HeadingLevel } from '@nanisoft/prism-ui/components/section'

/**
 * One specimen in the landing page's catalogue band: the published Component
 * rendering live, and the route to its documentation.
 *
 * `node` is the Component itself, not a wrapper around one and not a picture of
 * one, which is the band's whole claim: a screenshot of a Component is a second
 * copy of its appearance that the next release silently rots, while the rendered
 * Component on this page is the package this page imports, in whatever pack and
 * mode the reader has chosen. It is also why the specimens are uncontrolled: a
 * control a server page cannot wire a handler to would be a control activating
 * to nothing, and the ones chosen here all hold their own state, so flipping the
 * switch or dragging the slider works with no handler passed at all.
 */
export type Specimen = {
  /** The Component, rendering. Uncontrolled, so it works with no handler. */
  node: ReactNode
  /** The catalogue's name for it, printed in the mono face under the figure. */
  name: string
  /** The Component's own documentation route, `/components/<slug>`. */
  href: string
  /** Whether the cell takes two grid columns rather than one. */
  wide?: boolean
}

/**
 * The landing page's catalogue band: the Components themselves, rendered.
 *
 * **This is the band that shows the library rather than describing it.** The
 * other bands are words about the system and swatches of its palette, and words
 * about a design system are indistinguishable from words about any product.
 * A gallery of rendered Components is checkable by looking at it, in the way
 * the pack band is: the reader is seeing the product, not a claim about it.
 *
 * **It is site apparatus rather than a Block, for the same reason the rules band
 * is.** A specimen gallery is one site's way of showing its library, and a Block
 * shaped by the site that asked for it is a Block this repository has already
 * refused to ship twice. The band composes `Section` and `SectionHeading`, lays
 * its own grid, and takes every word and every specimen as props.
 *
 * **The link is the name under the figure, and never the figure itself.** The
 * specimen renders live controls, and a control inside an anchor is invalid
 * markup and two tab stops for one action, so the card's body is plain content
 * and the route to the documentation is the footer row. The one specimen that
 * holds many tab stops of its own, the calendar, is wrapped in `inert`: a
 * month of day buttons is a control cluster the landing does not owe a reader,
 * and the band's copy names the three controls that are live.
 *
 * Hover is the first motion law, whole: a colour change on the card's border,
 * the same on the footer's text, and a half-step lift, at the authored fast
 * duration and decelerating easing. The lift is a transform, so the compositor
 * owns it and the resting position is the card's full form, which is what lets
 * the universal reduced-motion rule remove the movement and keep everything
 * else the hover said.
 */
export function Specimens({
  title,
  description,
  meta,
  specimens,
  headingLevel = 'h2',
}: {
  title: string
  description?: string
  /**
   * One quiet line of facts about the system, set in the mono face under the
   * heading. The facts the landing carries here are the ones a reader deciding
   * whether to adopt looks for: what the library stands on, its licence, and
   * the machine surface an agent reads.
   */
  meta?: string
  specimens: readonly Specimen[]
  headingLevel?: HeadingLevel
}) {
  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        title={title}
        description={description}
        align="left"
        className="max-w-measure mb-4"
      />

      {meta ? (
        <p className="text-muted-foreground font-mono text-mono mb-10">{meta}</p>
      ) : null}

      {/*
        A two-column phone grid and a three-column desktop grid, with one cell
        taking two columns, so the band is not nine equal boxes: the wide cell
        breaks the row the way a specimen sheet's plate line breaks its rows,
        and the varied heights of the specimens do the rest.
      */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specimens.map((specimen) => (
          <li
            key={specimen.href}
            className={`group border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 flex flex-col overflow-hidden rounded-xl border transition duration-fast ease-out${
              specimen.wide ? ' sm:col-span-2' : ''
            }`}
          >
            <div className="border-border flex min-h-40 flex-1 items-center justify-center border-b p-6">
              {specimen.node}
            </div>
            <a
              href={specimen.href}
              className="text-muted-foreground group-hover:text-foreground flex items-center justify-between gap-2 px-4 py-2.5 font-mono text-mono transition-colors"
            >
              {specimen.name}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}

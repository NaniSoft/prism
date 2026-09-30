import type { LucideIcon } from 'lucide-react'

import { Section, SectionHeading, type HeadingLevel } from '@nanisoft/prism-ui/components/section'

/** One rule, with the icon that names it. */
export type Principle = {
  icon: LucideIcon
  title: string
  body: string
}

/**
 * The landing page's rules band: a heading, one paragraph, and the rules.
 *
 * **It is site apparatus rather than a Block, and the reason is the layout.** The
 * `FeatureGrid01` this replaces rendered four equal cards in a two-column grid,
 * and four equal cards with an icon tile each is the single most recognisable
 * shape of a template landing page. What the four claims needed was not a tile
 * per claim but a row: an icon, a name and a sentence on one line, with a
 * hairline between rows and nothing boxed. `FeatureGrid01` cannot render that,
 * and a Block that shipped a second layout for one site's landing page would be a
 * Block shaped by the site that asked for it.
 *
 * So the band composes `Section` and `SectionHeading`, which is the same contract
 * every Block composes, and lays its own rows out. The rules and the words are
 * props, so nothing here is a fact about this site that a reader cannot check.
 *
 * `hover` is on the row and the transition is `transition-colors`, which is the
 * system's feedback law: a colour change on hover, at the authored duration, with
 * no transform and no movement. Nothing scrolls into view and nothing enters.
 */
export function Principles({
  eyebrow,
  title,
  description,
  principles,
  headingLevel = 'h2',
}: {
  eyebrow?: string
  title: string
  description?: string
  principles: Principle[]
  headingLevel?: HeadingLevel
}) {
  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="left"
        className="max-w-measure mb-10"
      />

      {/*
        The rule under every row rather than between rows, and the two columns
        come from that rather than from `divide-y`.

        Every item carries a top border, so the first item of each column draws a
        line under the heading and the second item of each column draws the line
        between the two rows. Two items sharing a y position draw one continuous
        rule, which is what a reader sees and what a `divide-y` would not produce:
        `divide-y` puts a border on every child but the first in DOM order, so in
        a two-column grid it rules off the top of the second item in the first
        column, which is a line through the middle of a band with nothing above
        it. This way the count of items can change without the rule moving.
      */}
      <ul className="grid gap-x-12 gap-y-0 md:grid-cols-2">
        {principles.map((principle) => (
          <li key={principle.title} className="border-border flex gap-4 border-t py-5">
            <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <principle.icon className="size-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold tracking-tight">{principle.title}</h3>
              <p className="text-muted-foreground text-pretty text-sm">{principle.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

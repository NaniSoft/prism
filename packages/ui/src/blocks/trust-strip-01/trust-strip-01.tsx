import type { LucideIcon } from 'lucide-react'

import { Section, type HeadingLevel } from '../../components/ui/section'
import { Heading } from '../../components/ui/typography'
import { cn } from '../../lib/utils'

/**
 * One assurance statement, and the mark that carries it.
 *
 * The icon is required and not optional, because this item is always rendered: an
 * optional icon would compile and then paint an empty accent tile, which is the
 * safe-at-render condition an optional prop turns unsafe. The icon is `aria-hidden`
 * at the render, because the label beside it is the statement and a reader who
 * cannot see the mark has not been told anything by it.
 *
 * `detail` is optional and additive: a strip item with a detail renders both lines and
 * one without it renders one, with no space held open for the second.
 */
export type TrustStripItem = {
  /** The mark beside the statement. Hidden from assistive technology. */
  icon: LucideIcon
  /** The statement itself. A few words, read in one glance. */
  label: string
  /** The qualifier under the statement, for the detail a bare statement cannot carry. */
  detail?: string
}

/**
 * The props a TrustStrip01 takes.
 *
 * Every string is a prop and the Block ships none. There is no default list of
 * certifications, no default compliance marks and no default customer count, and the
 * reason is on the Block's own JSDoc: all three are claims, and a claim is the one
 * thing this frame is not allowed to make on a consumer's behalf.
 */
export type TrustStrip01Props = {
  /**
   * The statements, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which assurance matters most.
   */
  items: readonly TrustStripItem[]
  /**
   * Where the band sits in the container.
   *
   * `center` is the usual one, because the band is usually centred under a hero and a
   * centred band under a centred hero is the same axis. `left` is for a page whose
   * hero is flush left, where a centred strip under it reads as a different
   * composition rather than as a band.
   *
   * @defaultValue 'center'
   */
  align?: 'center' | 'left'
  /**
   * The surface the band is drawn on.
   *
   * `default` leaves it on the page ground, which is the quieter of the two and the
   * right one above the fold where the strip's job is to be noticed once and not
   * again. `muted` puts the band on the muted surface, for a strip that is a section
   * in its own right rather than a transition. The muted band states its own ink as
   * well as its own fill, which is the rule `check-variant-ink` and `toast.tsx` both
   * state: a surface that sets a fill and inherits its ink is correct wherever the
   * design system happened to put it and wrong everywhere else.
   *
   * @defaultValue 'default'
   */
  tone?: 'default' | 'muted'
  /**
   * The band's name, used as a heading that is in the outline and not on the page.
   *
   * Optional, and it is the only way this Block renders a heading at all: a visible
   * heading above a strip of four assurance lines is a heading about a heading, which
   * is the arrangement `LogoStrip01` refuses. But a strip is often one item among a
   * page of sections, and a reader navigating by heading then finds nothing where the
   * band is, which is a gap in the outline rather than a virtue. So the name is
   * available and hidden: a reader who navigates by heading meets it, and a reader
   * reading the page sees the four lines and no title over them.
   */
  heading?: string
  /**
   * The level that hidden heading is composed at.
   *
   * It names the level of the one heading this Block can render, and it does nothing
   * when no `heading` is passed. That is the same pair `LogoStrip01` declares for its
   * `title`, and the default is `h2` because a Block is composed rather than a page:
   * it installs into a consumer's layout and renders inside catalogue previews, where
   * the surrounding document already owns the `h1`. See `HeadingLevel`.
   *
   * @defaultValue 'h2'
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A narrow band of short assurance statements, one per mark, with no visible heading.
 *
 * **This is the most common place on a marketing page where a design system is
 * tempted to put a claim, and the narrowness of what an honest Block can say here is
 * the whole reason the Item is worth shipping.** A strip of badges reads as free
 * assurance: it looks like furniture, the way a claim looks when it is made by
 * something nobody can ask. So the obvious version of this Block ships a row of
 * certifications and a row of customer logos, which every consumer of the library
 * would then publish as NaniSoft's own. Prism ships the frame and the caller ships
 * the words, and a strip of certifications, a strip of compliance marks and a strip
 * of a customer count are then the same component and none of them is Prism's to
 * assert. The strip is deliberately narrow: it takes an icon and a label per item and
 * it has nowhere to put a claim of its own.
 *
 * **It is not a `logo` cloud, and the difference is evidence against assertion.** A
 * name beside a mark is evidence: the reader can look the organisation up, and the
 * arrangement is checkable by anyone, which is what makes a customer strip honest.
 * A sentence beside a mark is a claim, and a claim is not checkable by looking.
 * `LogoCloud01` is the other Block and it takes marks rather than sentences, so a
 * page that has real marks to show uses that one and a page that has real statements
 * to make uses this one. Shipping one component for both would have meant shipping one
 * of the two as an afterthought, and the strip shape is the right home for a
 * sentence.
 *
 * **The icons are hidden from assistive technology.** The label beside a mark is the
 * statement, and a reader who cannot see the mark has learned nothing from the mark,
 * so announcing it would replace the words with the thing the words are there to
 * avoid. The same warning applies to the printed band: a mark whose meaning is its
 * shape does not survive a monochrome printer, and the label is what carries it there.
 *
 * **The band is a `ul`, and it renders nothing for an empty list.** A reader is told
 * how many statements there are before hearing the first one, which is the whole
 * answer to the question a strip raises, and a caller with nothing to assert gets no
 * frame rather than a bordered box with nothing in it.
 *
 * **The strip does not move.** A band of items that slides is an entrance animation,
 * and this system has none: motion is a response to something the reader did, or a
 * cycle that is making a claim about a running system, and neither is a row of
 * assurance lines arriving. Four NaniSoft sites wanted their strips to move; what they
 * wanted from the movement was a second, quieter statement of what the product is,
 * and repetition of the type does that without anything moving.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function TrustStrip01({
  items,
  align = 'center',
  tone = 'default',
  heading,
  headingLevel = 'h2',
  className,
}: TrustStrip01Props) {
  if (items.length === 0) return null

  const centred = align === 'center'

  return (
    <Section data-slot="trust-strip-01" className="py-10 sm:py-14">
      {/*
        The hidden heading. It is here for the outline rather than for the page, which
        is the arrangement the prop explains: a visible heading above four assurance
        lines is a heading about a heading, and a reader navigating by heading still
        needs to find the band.
      */}
      {heading ? (
        <Heading as={headingLevel} data-slot="trust-strip-01-heading" className="sr-only">
          {heading}
        </Heading>
      ) : null}

      <ul
        data-slot="trust-strip"
        className={cn(
          'flex flex-wrap items-center gap-x-8 gap-y-5 text-sm',
          centred ? 'justify-center text-center' : 'justify-start text-left',
          tone === 'muted' ? 'bg-muted text-foreground rounded-xl px-6 py-6' : 'text-foreground',
          className,
        )}
      >
        {items.map((item) => (
          <li
            key={item.label}
            data-slot="trust-strip-01-item"
            className="flex items-center gap-3 text-left"
          >
            <span
              aria-hidden
              data-slot="trust-strip-01-icon"
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                tone === 'muted'
                  ? 'bg-background text-muted-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <item.icon className="size-4" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium">{item.label}</span>
              {item.detail ? (
                <span data-slot="trust-strip-01-detail" className="text-muted-foreground text-xs">
                  {item.detail}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default TrustStrip01
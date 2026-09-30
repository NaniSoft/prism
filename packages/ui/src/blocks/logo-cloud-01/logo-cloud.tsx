import type { ReactNode } from 'react'

import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One mark in the cloud.
 *
 * The mark is the third party's, which is why every field here is a slot rather
 * than a drawing. Prism owns the cell; the organisation owns the logo, the name
 * and whether the mark is a link at all.
 */
export type LogoCloudLogo = {
  /**
   * A stable key for the cell.
   *
   * Required, and used as the key and as the `data-logo` attribute on the cell,
   * so a test can name one mark rather than the first one and two organisations
   * in one cloud are individually addressable. A name would do as a key and
   * would not: two partners can share a trading name, and a cloud is a set a
   * caller reorders between renders.
   */
  id: string
  /**
   * The organisation's own name.
   *
   * Required, and it is a real word in the document: every mark carries a
   * visually hidden node holding it, so the cloud is a list of names rather than
   * a wall of unlabelled images. See the Block's JSDoc for why the name is drawn
   * hidden rather than printed under the mark.
   */
  name: string
  /**
   * The mark as an image the caller hosts.
   *
   * Rendered with an empty `alt`, because the hidden name beside it already says
   * who this is and an image that repeats it is announced twice. A caller whose
   * mark is an SVG or a wordmark passes `mark` instead.
   */
  src?: string
  /**
   * Where the mark goes.
   *
   * Omit it and the mark is inert, which is correct rather than a gap: a link
   * the caller did not choose is Prism making a claim about somebody else's
   * site. See the Block's JSDoc.
   */
  href?: string
  /**
   * The mark as a node, for an inline SVG, an icon or a wordmark.
   *
   * The alternative to `src`, not an addition to it: a mark is either something
   * the caller hosts or something they composed. A caller who passes both has a
   * cell with two marks in it, so `src` is drawn and `mark` is not.
   */
  mark?: ReactNode
}

/**
 * The grid tracks each column count asks for.
 *
 * Four is the default because four is what a set of marks reads as at a glance:
 * a sixth mark in a row is past the width at which a reader compares them rather
 * than scans them. Two steps per count is deliberate and it is the reason the set
 * is closed at four members. A five-up grid at `sm` is 40rem of five cells, which
 * is 8rem a cell, and a real customer mark at 8rem wide is a thumbnail rather
 * than a mark; every count therefore widens at `lg` rather than at `sm`, except
 * three, which is narrow enough to hold at `sm`.
 */
const TRACKS = {
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-3 lg:grid-cols-5',
  6: 'sm:grid-cols-3 lg:grid-cols-6',
} as const

/**
 * The props a LogoCloud01 takes.
 *
 * Every string is a prop and the Block ships none. There is no default customer
 * list, no default partner set and not one default name, because a cloud that
 * hardcoded any of them would hand every consumer who installed it a claim about
 * who uses their product.
 */
export type LogoCloud01Props = {
  /**
   * The cloud's accessible name, rendered as the list's name and as no visible
   * text.
   *
   * Required, and required for the reason `LogoStrip01` states in full: a list of
   * names with nothing naming the list is a set of facts a reader cannot weigh.
   * "Customers", "Partners" and "Integrations" are three different claims about
   * the same six marks, and the word that says which is the caller's.
   */
  label: string
  /**
   * The marks, in the order a reader should meet them.
   *
   * Order is the caller's because it is a claim about which relationship matters
   * first, and a cloud that sorted itself would be making that claim on the
   * caller's behalf. The Block does not shuffle, rotate or pick a lead.
   */
  logos: readonly LogoCloudLogo[]
  /**
   * How many marks sit on one row at full width.
   *
   * @defaultValue 4
   */
  columns?: 3 | 4 | 5 | 6
  /**
   * `grid` draws a bordered cell per mark. `marquee-off` draws the same marks
   * with no cell boundaries and more room around each one, and it is named for
   * what it is not: the still version of the band that slides. See the Block's
   * JSDoc, which is where the refusal is argued.
   *
   * @defaultValue 'grid'
   */
  variant?: 'grid' | 'marquee-off'
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a cloud composed under its own heading. */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A grid of customer or partner marks, each one a real slot the caller fills.
 *
 * This is the `logo-cloud-01` DESIGN.md's Known Open Items records as deferred to
 * v1.1, and it discharges that line. `logo-strip-01` is its sibling rather than
 * its earlier draft, and the two are different Items because they make different
 * claims. The strip is a line of words about what the consumer sells, and every
 * word in it is the consumer's; the cloud is a set of marks belonging to other
 * organisations, where Prism contributes the grid and nothing in the cell. A
 * strip that named a real customer would be a design system asserting a
 * relationship on the consumer's behalf, which is the defect that strip's own
 * documentation already names. This Block exists so that the mark, the name and
 * the relationship are the caller's and the frame is Prism's.
 *
 * **There is no scrolling form, and the marquee is refused by name.** Every site
 * that asked for a logo wall wanted a band of marks that slides, and this system
 * will not build one. DESIGN.md's Motion section says it in one line: "No
 * entrance animation, no scroll-reveal, no parallax, no carousels, no attention
 * loop, and no motion on text." A band that advances on its own is an attention
 * loop, and the reason the law is in that document is that four products spent a
 * migration without a way to say so and then reached for the one motion the
 * design system had no opinion about. So this Block has one form and it does not
 * move. What ships instead is the decision on the record: `marquee-off` is the
 * name of the still version, so the argument travels with the prop rather than
 * living in a document a consumer has to find. A caller who reaches for a
 * marquee gets a quiet row of marks and a `variant` value that tells them why.
 *
 * **A mark with no `href` is inert, and that is correct rather than a gap.** A
 * logo is a claim about somebody else's company, and the only destination Prism
 * could invent for it is one the customer never chose, which is a second claim
 * about a site Prism has never seen. So `href` is the caller's to pass and a mark
 * without one is a picture with a name, exactly as a customer mark is on paper.
 * The Block does not fall back to a search, a homepage or a guessed slug.
 *
 * **The marks are muted, and the Block does not strip colour.** The cell carries
 * the muted foreground ink, and an image mark is dimmed with an alpha toward the
 * surface rather than recoloured. The reason is that a row of full-colour
 * third-party marks fights the pack and the mode: it brings hues the token
 * contract has never heard of into a surface whose whole job is to resolve
 * consistently across six packs and two modes, and there is no token that makes
 * an arbitrary third party's brand colour follow a mode switch. So the caller is
 * asked for monochrome marks, and a caller who passes a colour mark keeps it:
 * a filter that turned a mark grey would be a Block rewriting an identity, and a
 * mark that is a single flat colour is legible at the muted band anyway. The cost
 * is stated rather than hidden: this Block can dim a mark and cannot recolour
 * one, so a caller's set of full-colour logos stays a row of full-colour logos.
 *
 * **Every mark carries its name in a visually hidden node.** A row of images with
 * no names is a row of shapes, and a screen reader announces a list of them as a
 * count followed by nothing. The name is the one word Prism requires here and it
 * is required for that reason; it is hidden rather than printed because a printed
 * name under every mark turns a wall of marks into a table of companies, which
 * is a different claim about the same data. This is the same rule
 * `pricing-compare-01` follows for its cells, where the cell needs a name a
 * reader can hear whether the value beside it is an image or a figure. The cost of
 * the rule is that a mark drawn as visible text is announced twice, once as its
 * own lettering and once as the hidden name, so a caller whose mark carries a
 * wordmark passes an image or an SVG rather than a text node.
 *
 * The grid is a `ul` of `li`, so a reader hears how many marks there are before
 * the first name. An empty set renders nothing at all, for the reason
 * `ProductSwitcher`, `FactList` and `AvatarGroup` each state: a cloud of zero
 * cells is a frame around a gap. A cell that declares neither `src` nor `mark` is
 * a thrown diagnostic rather than an empty cell, because a frame around a gap is
 * the one state this Block has no way to render honestly.
 *
 * It is a server Component: no hook, no state, no client code and no motion.
 */
export function LogoCloud01({
  label,
  logos,
  columns = 4,
  variant = 'grid',
  eyebrow,
  title,
  description,
  headingLevel = 'h2',
  className,
}: LogoCloud01Props) {
  if (logos.length === 0) return null

  /*
   * The two arrangements, chosen before the markup rather than inside it. The
   * `marquee-off` arrangement is the one that names the absent motion, so it is
   * the arrangement with no cell boundary: a band of marks that reads as one row
   * rather than as a table of cells, with the marks at rest.
   */
  const layout =
    variant === 'grid'
      ? cn('border-border grid border-t border-l', TRACKS[columns])
      : 'flex flex-wrap items-center justify-center gap-x-12 gap-y-8'

  return (
    <Section className={className}>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-10"
        />
      ) : null}

      <ul
        data-slot="logo-cloud"
        data-variant={variant}
        aria-label={logos.length > 1 ? label : undefined}
        className={layout}
      >
        {logos.map((logo) => {
          if (logo.src === undefined && logo.mark === undefined) {
            throw new Error(
              'LogoCloud01: a logo declares neither src nor mark, so its cell would hold no mark and no ' +
                'figure, which is a frame around a gap. Pass the mark the caller has for it, or drop the entry.',
            )
          }

          /*
           * The name is drawn once, hidden, beside the mark rather than inside
           * the image, so that a mark passed as `src` and a mark passed as `mark`
           * are named the same way. An `alt` would name only the first of the two,
           * and a cloud where half the marks announce themselves through an
           * attribute and half through a node is two rules where there should be
           * one.
           */
          const cell = (
            <>
              {logo.src === undefined ? null : (
                <img
                  data-slot="logo-cloud-image"
                  src={logo.src}
                  alt=""
                  className="max-h-8 w-auto"
                />
              )}
              {logo.mark}
              <span data-slot="logo-cloud-name" className="sr-only">
                {logo.name}
              </span>
            </>
          )

          return (
            <li
              key={logo.id}
              data-slot="logo-cloud-item"
              data-logo={logo.id}
              className={cn(
                'flex min-h-24 items-center justify-center p-6',
                variant === 'grid' ? 'border-border border-r border-b' : '',
              )}
            >
              {logo.href === undefined ? (
                <span
                  data-slot="logo-cloud-mark"
                  className="text-muted-foreground flex items-center justify-center opacity-80"
                >
                  {cell}
                </span>
              ) : (
                <a
                  data-slot="logo-cloud-mark"
                  href={logo.href}
                  className="text-muted-foreground focus-visible:ring-ring hover:opacity-100 focus-visible:opacity-100 flex items-center justify-center rounded-sm opacity-80 transition-opacity duration-fast ease-out focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  {cell}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export default LogoCloud01
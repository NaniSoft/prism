import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { FactList } from '../../components/ui/fact-list'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One result a customer got: the name of it and the value.
 *
 * The two members are `FactList`'s own `Fact`, and that is not a coincidence to be
 * tidied away later. A case study's results are terms and their answers, not
 * figures in a row, and a definition list announces the term before the value
 * where a set of big numerals does not: a reader who lands on a study with a
 * number they do not recognise needs to know what it is before they can weigh it.
 * Composing `FactList` is also the reason these read the same as the facts
 * elsewhere on a page, which a hand-drawn pair of `dt` and `dd` would not.
 */
export type CaseStudyResult = {
  label: ReactNode
  value: ReactNode
}

/**
 * The link arm and the no-link arm of one study, as a union.
 *
 * A study that names a destination has to be given the sentence that says what
 * following it does, and this is the type that says so. A card whose only link is
 * the customer name reads as a name: the reader sees a company, assumes it is
 * the whole of what is there, and the work behind it is one click away and
 * unmentioned. "Read the case study" is a claim about the page a reader is about
 * to land on, and it belongs to whoever wrote that page, so `hrefLabel` is
 * required in the link arm rather than optional beside it.
 */
export type CaseStudyLink = {
  /**
   * Where the study goes. Present makes the card carry a link.
   */
  href: string
  /**
   * The words on the link, and the only way a reader learns what following it
   * does.
   */
  hrefLabel: string
  /** Opens the destination in a new browsing context, with the matching `rel`. */
  newTab?: boolean
} | {
  href?: never
  hrefLabel?: never
  newTab?: never
}

/**
 * One case study: who it was for, what sector they are in, what the situation
 * was, what came of it, and where the full account lives.
 *
 * `customer`, `sector` and `summary` are the same fields `CaseStudy01` takes,
 * spelled identically and with the same meanings, and the reason is the whole of
 * the relationship between the two Blocks. One study is a full band: a reader who
 * has decided to read one about a named customer gets the situation, the approach
 * and the results at length. Many studies are a set of summaries: a reader
 * scanning a grid is choosing between them, and the grid has to hold the same
 * facts at a quarter of the length. Because the fields are the same, a consumer
 * that has a data model for one has it for both, and a study promoted from the
 * grid into its own band is the same record rather than a second shape of record
 * to keep in step. That is the kind of agreement a design system should make and
 * usually does not, and it costs nothing here: the two Blocks draw different
 * arrangements of the same four fields and neither of them owns a field.
 *
 * `id` is a key and not a label, for the reason `Story01` states: a grid of
 * studies is reordered by a consumer as often as it is read, and a key made of
 * the words means a rename in the copy is a rename in the key.
 */
export type CaseStudy = {
  id: string
  /** The customer's own name, spelled as the customer spells it. */
  customer: string
  /** The sector the customer is in, for a grid that groups or filters by it. */
  sector?: string
  /** The situation and what was done about it, in a few sentences. */
  summary: ReactNode
  /** What came of it, as terms and their answers. Composed onto `FactList`. */
  results?: CaseStudyResult[]
  /** A figure of the work, composed by the caller. */
  media?: ReactNode
} & CaseStudyLink

/** How many studies a grid puts on one line. The tracks, not the study count. */
export type CaseStudyColumns = 2 | 3

/**
 * The tracks a grid of studies gets, from the caller's own column count.
 *
 * Spelled out per count so a grid has exactly as many tracks as it declared and
 * not one empty at the end of a row. Two is the default because a case study's
 * summary is a paragraph rather than a line, and two paragraphs side by side is
 * the widest arrangement at which both are still read rather than scanned.
 */
const TRACKS: Record<CaseStudyColumns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * The props a CaseStudies01 takes.
 *
 * Every string, every result and every figure is a prop and the Block ships none:
 * no customer, no sector, no figure and no placeholder result. A grid that
 * hardcoded its studies would hand every consumer a set of customers that are not
 * theirs, which is a claim about named companies and the worst of the
 * hardcoded-copy family.
 */
export type CaseStudies01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a grid composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The studies, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which one leads.
   */
  studies: CaseStudy[]
  /**
   * Whether the studies are cards in a grid or rows in a list.
   *
   * `grid` is the default because a reader scanning a page chooses between
   * studies, and choosing is a comparison that wants the peers visible at once.
   * `list` is for a page that has already narrowed to one sector, where the
   * studies are read one after another rather than compared, and where a full
   * width row per study gives the summary and the figure room two cards do not
   * have.
   */
  variant?: 'grid' | 'list'
  /**
   * How many studies sit on one line in the `grid` variant. Ignored by `list`,
   * which has one study per line by definition.
   *
   * @defaultValue 2
   */
  columns?: CaseStudyColumns
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A set of case studies as a grid of summaries or a list of rows, each holding
 * the same fields a single-study band holds.
 *
 * **One study and many studies are the same record, and that is the decision
 * worth having made.** The alternative was a `CaseStudy` type declared here that
 * is a narrowed version of the one a single-study band takes, so the grid could
 * hold a shorter summary, a smaller result list and a smaller figure. What that
 * buys is a grid that can be terse; what it costs is a second shape for one
 * concept, so a study promoted from the grid to its own band is a mapping, and
 * two mappings in a consumer's content model are two things that will disagree.
 * So the fields are shared and identical, and the terseness is the caller's
 * choice of length rather than a type the Block enforces. The cost is real: a
 * grid of five studies whose summaries are each the length a full band wants is a
 * grid nobody scans, and the answer is the caller's to give by writing shorter
 * summaries in the shorter place.
 *
 * **The NaniSoft framing is in this JSDoc and in the Demo, and nowhere in the
 * Block.** What these studies are evidence for is a pipeline that runs, a market
 * that is captured rather than reconstructed, an estate that is observed rather
 * than visited, and findings that go to agents that act on them rather than to a
 * queue of tickets. A study is the only place on a marketing page where a claim
 * about a running system is checkable, because it is the only place a named
 * customer and a number sit in the same card. So the customer, the situation and
 * the results are props, and the Demo is where a claim of that kind is actually
 * written, because a Block that shipped one would put a named company and a
 * fabricated reading into every consumer's page.
 *
 * **A link needs a label, and the type is what says so.** `href` without
 * `hrefLabel` would render a card whose only link is the customer name, and a
 * reader meets that as a name rather than as a link to work: the visible text is
 * the company, so the reader assumes the company is all there is, and the study
 * behind it is a click they were never invited to make. The words on the link say
 * what following it does, which is a claim about the destination and therefore
 * about whoever wrote the destination, so the label is required rather than
 * defaulted. The rejected alternative was a label this Block generated, which
 * would have been the same three words in every consumer's product in English.
 *
 * **The results are a `FactList`, and the reason is the reading order.** A
 * result is a term and its answer, and a definition list announces the term
 * before the value. A grid of numerals with a caption under each reverses that,
 * so a reader who lands on a number they do not recognise has to guess its unit
 * before they can weigh it. Composing `FactList` also means a result reads the
 * same on this grid as it does in a plan comparison or a document header, which
 * is a reader learning one thing rather than four.
 *
 * **The list variant puts the figure beside the copy rather than above it, and
 * the order is copy first.** A reader who never sees the figure still reads the
 * customer, the situation and the results, and a screen reader reaches the
 * sentence before the drawing. At every width the copy column comes first in the
 * DOM, so the order is the same on a phone and on a desktop, where a list that
 * moved its figure above its copy on a narrow screen would read as a gallery.
 *
 * The customer name is the card's title, and it is a heading one step below the
 * section, derived rather than written, so a Block embedded one level deeper
 * carries its card titles with it. A summary that runs past four sentences stops
 * being a summary, and the full account belongs in the single-study band rather
 * than in a longer string here.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function CaseStudies01({
  eyebrow,
  title,
  description,
  studies,
  variant = 'grid',
  columns = 2,
  headingLevel = 'h2',
  className,
}: CaseStudies01Props) {
  // A study's name is a heading one step below the section that introduces the
  // set, so four names under one section read as four children of it rather than
  // as four competing sections.
  const Title = childLevel(headingLevel)
  const asGrid = variant === 'grid'

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <ul
        data-slot="case-studies-01"
        data-variant={variant}
        className={cn(
          asGrid ? 'grid gap-6' : 'flex flex-col gap-6',
          asGrid && TRACKS[columns],
          className,
        )}
      >
        {studies.map((study) => {
          const isLink = study.href !== undefined

          return (
            <li
              key={study.id}
              data-slot="case-studies-01-item"
              className={cn(asGrid && 'h-full')}
            >
              <Card
                className={cn(
                  'h-full gap-5 py-6',
                  // A row in the list variant is one study per line, so the copy
                  // and the figure share a single row rather than stacking. The
                  // tracks are a fraction rather than a count because the figure
                  // is the reader's and its own proportions decide how much room
                  // it needs; the copy column is capped rather than the figure.
                  !asGrid && 'md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-8',
                )}
              >
                <CardHeader>
                  {study.sector ? (
                    <span
                      data-slot="case-studies-01-sector"
                      className="text-muted-foreground font-mono text-xs"
                    >
                      {study.sector}
                    </span>
                  ) : null}
                  <CardTitle>
                    <Title>{study.customer}</Title>
                  </CardTitle>
                  <p className="text-muted-foreground text-pretty text-sm">{study.summary}</p>
                </CardHeader>

                <CardContent className="flex flex-col gap-5">
                  {study.results && study.results.length > 0 ? (
                    <FactList facts={study.results} />
                  ) : null}

                  {study.media ? (
                    <div data-slot="case-studies-01-media" className="min-w-0">
                      {study.media}
                    </div>
                  ) : null}

                  {isLink ? (
                    <CtaLink
                      href={study.href}
                      newTab={study.newTab}
                      variant="ghost"
                      size="sm"
                      className="self-start"
                    >
                      {study.hrefLabel}
                    </CtaLink>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export default CaseStudies01

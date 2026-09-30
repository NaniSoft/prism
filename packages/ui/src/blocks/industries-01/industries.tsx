import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { cn } from '../../lib/utils'

/**
 * The link arm and the no-link arm of one sector, as a union.
 *
 * The same agreement `CaseStudies01` and `Careers01` make, for the same reason. A
 * tile whose only link is the sector name reads as a name in a list of names, and
 * the sentence that says what following it does is a claim about the destination,
 * so it belongs to whoever wrote the destination.
 */
export type IndustryLink = {
  /** Where the sector's work is. Present makes the tile carry a link. */
  href: string
  /** The words on the link, and what following it does. */
  hrefLabel: string
  /** Opens the destination in a new browsing context, with the matching `rel`. */
  newTab?: boolean
} | {
  href?: never
  hrefLabel?: never
  newTab?: never
}

/**
 * One sector a product serves: its name, the one-line problem its readers have,
 * and optionally a mark and a link into the work.
 *
 * `problem` is required and this is the field the whole Block is shaped around. A
 * sector tile with only a name is a navigation menu, and this is not one: a
 * navigation list answers "where can I go", a sectors list answers "does this
 * recognise my week". The second is the question a reader brings to a page about
 * sectors, and a tile that can only carry the first cannot answer it, so the
 * one-line problem is required rather than optional and the Block throws when a
 * sector arrives with none. The alternative was an optional field, which compiles
 * cleanly and produces a menu of sector names on a page that claimed to say
 * something about sectors, and a page of names is a page nobody reads twice.
 *
 * `name` is a `string` and not a `ReactNode` because a grid of sectors is scanned
 * down its left edge and a name that wraps costs every other tile its alignment.
 * `icon` is optional and additive: a tile that reserves space for a mark that is
 * not there is a hole, and the problem line is what the tile is for.
 */
export type Industry = {
  /** A stable key for the sector. */
  id: string
  /** The sector's own name, spelled as that sector's people would spell it. */
  name: string
  /** The one line that says why this sector reaches for the product. */
  problem: string
  /** The sector's mark, from the icon set this system uses. */
  icon?: LucideIcon
} & IndustryLink

/**
 * The tracks the grid variant gets.
 *
 * Two at the narrowest width where a grid exists and three at the width of the
 * container, so a six-sector page reads as three and then three rather than as
 * three and then one orphan. The tracks, not the sector count: a sectors list is
 * content and the grid is the arrangement.
 */
const GRID_TRACKS = 'sm:grid-cols-2 lg:grid-cols-3'

/**
 * The props an Industries01 takes.
 *
 * Every string, every problem and every mark is a prop and the Block ships none:
 * no sector, no problem, no link label and no default set of industries. A list
 * that hardcoded its sectors would hand every consumer a set of sectors that are
 * not theirs, which is a claim about markets.
 */
export type Industries01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a list composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The sectors, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which sector leads.
   */
  industries: Industry[]
  /**
   * How the sectors are arranged: a grid of tiles, a list of rows, or a set of
   * tabs that shows one sector at a time.
   *
   * `grid` is the default and the default is the argument, not a shrug. Tabs hide
   * five of six answers behind a control, and on a marketing page a hidden answer
   * is an unanswered question: a reader who arrives looking for their own sector
   * and does not see it in the visible list has to guess whether it is one of the
   * tabs, and a reader who does not guess goes away. So hiding is opt-in, and the
   * caller who opts in is saying they have a reason to make every reader click
   * before they can read the rest.
   *
   * `list` is for a page that has already narrowed, where each sector's row can
   * carry more than one line.
   *
   * @defaultValue 'grid'
   */
  variant?: 'grid' | 'list' | 'tabs'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The sectors a product serves: a name, a one-line problem, and a link into the
 * work, as a grid, a list or a set of tabs.
 *
 * **A sectors list is sometimes tabs, and the reason is the length of the
 * problem.** When each sector has a paragraph and a link, a grid of six paragraphs
 * is a page nobody scrolls: the reader lands on it, reads the first two, and
 * leaves, having answered nothing about the other four. A set of tabs turns the
 * same six claims into six choices the reader picks between, and a reader who
 * recognises their own sector reads one and is done. That is a real improvement
 * and it is why the tabs variant exists rather than being a variant nobody wanted.
 *
 * **The grid is the default because tabs hide five of six answers behind a
 * control, and on a marketing page a hidden answer is an unanswered question.** A
 * reader who arrives looking for their own sector and does not see it among the
 * visible tiles has to work out whether it is behind a tab, and a reader who does
 * not work it out is a reader who leaves. So the cost of hiding is charged to the
 * caller rather than to the reader: the variant is opt-in, and a caller who passes
 * `tabs` is making the argument that their sectors are alternatives a reader
 * chooses between rather than a set a reader checks membership of. The rejected
 * default was tabs, which is the shape most industries pages reach for first,
 * because it looks more like an interface and less like a page.
 *
 * **The one-line problem is required, and that is what makes this a sectors list
 * rather than a menu.** A tile with only a name is a navigation menu, and this is
 * not one. A menu answers "where can I go"; a sectors list answers "does this
 * recognise my week", and the second is the question a reader brings to a page
 * whose subject is sectors. So the field is required, the Block throws without
 * it, and the cost of the requirement is a caller with nothing to say about a
 * sector has to write the sentence themselves rather than leave the tile blank,
 * which is the correct outcome: a blank tile in a grid of six is a defect a reader
 * sees and a sentence is thirty words of copy.
 *
 * **The NaniSoft framing is in this JSDoc and in the Demo, and nowhere in the
 * Block.** The sectors are the places where the four claims bite hardest: a
 * market that is captured rather than reconstructed, an estate observed rather than
 * visited, a pipeline that keeps running between the shifts, and findings handed
 * to agents. Each `problem` is one of those claims written as a sentence about the
 * reader's week, and that is the only place the sentence can live: a Block that
 * hardcoded six problems would put one company's reading of six markets into every
 * consumer's page, and a sector name attached to it.
 *
 * **The tabs variant composes `Tabs`, and the client JavaScript it costs is paid
 * whether or not you use it.** A client boundary in this system is a module, and
 * there is no conditional import of a client module, so `Tabs` is in this Block's
 * graph from the moment the Block is imported and a page that renders the `grid`
 * variant still ships the tab engine's code. That is a real cost and it is the
 * cost of one Block offering all three arrangements rather than a consumer
 * composing `Tabs` around a sectors list themselves and paying for it only when
 * they did. The alternative was to ship the tabs variant as its own Block, which
 * would have meant a second `Industry` type, a second heading level, and two
 * catalogue entries for one list of sectors. The cost is paid; the duplication is
 * not, and that is the trade this Block makes.
 *
 * A sector's name is a heading one step below the section, derived rather than
 * written, so a Block embedded one level deeper carries its tile titles with it.
 * The problem is one line: at two lines the tile stops being a list entry and
 * starts being a paragraph, and the longer answer belongs in the work the link
 * points at.
 *
 * It is a server Component. The `tabs` variant composes `Tabs`, which is a client
 * Component, and composing a client Component from a server one is what a slot is
 * for, so this Block ships no directive of its own.
 */
export function Industries01({
  eyebrow,
  title,
  description,
  industries,
  variant = 'grid',
  headingLevel = 'h2',
  className,
}: Industries01Props) {
  // A sector's name is a heading one step below the section that introduces the
  // set, so six names under one heading read as six children of it rather than as
  // six competing sections.
  const Title = childLevel(headingLevel)
  const asTabs = variant === 'tabs'

  if (asTabs) {
    // The first sector is the panel a reader sees before touching anything, and
    // putting it in the `defaultValue` is what keeps the control from starting in
    // a state where the visible list and the visible panel disagree.
    const first = industries[0]

    return (
      <Section>
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

        {first ? (
          <Tabs
            data-slot="industries-01-tabs"
            defaultValue={first.id}
            className={cn('gap-6', className)}
          >
            <TabsList className="flex-wrap">
              {industries.map((industry) => (
                <TabsTrigger key={industry.id} value={industry.id}>
                  {industry.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {industries.map((industry) => (
              <TabsContent key={industry.id} value={industry.id}>
                <Card data-slot="industries-01-panel" className="gap-4 py-6">
                  <CardHeader>
                    {industry.icon ? (
                      <span
                        data-slot="industries-01-icon"
                        className="bg-accent text-accent-foreground mb-2 flex size-10 items-center justify-center rounded-lg"
                      >
                        <industry.icon className="size-5" />
                      </span>
                    ) : null}
                    <CardTitle>
                      <Title>{industry.name}</Title>
                    </CardTitle>
                    <p className="text-muted-foreground text-pretty text-sm">{industry.problem}</p>
                  </CardHeader>
                  {industry.href !== undefined ? (
                    <CardContent>
                      <CtaLink
                        href={industry.href}
                        newTab={industry.newTab}
                        variant="ghost"
                        size="sm"
                        className="self-start"
                      >
                        {industry.hrefLabel}
                      </CtaLink>
                    </CardContent>
                  ) : null}
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : null}
      </Section>
    )
  }

  const asList = variant === 'list'

  return (
    <Section>
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
        data-slot="industries-01-list"
        data-variant={variant}
        className={cn(asList ? 'flex flex-col gap-3' : 'grid gap-6', !asList && GRID_TRACKS, className)}
      >
        {industries.map((industry) => (
          <li
            key={industry.id}
            data-slot="industries-01-item"
            className={cn(!asList && 'h-full')}
          >
            {/*
              A grid tile is a `Card` and a list row is not, and the difference is
              the width of the answer. A grid of sectors is three across, so a tile
              has to hold a name and one line inside a card, and the card is what
              gives the three-across arrangement its edges. A list row is the whole
              width, so a card would be a box around two lines of text and a link,
              which reads as an item to be handled rather than read.
            */}
            {asList ? (
              <div
                data-slot="industries-01-row"
                className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {industry.icon ? (
                      <span
                        data-slot="industries-01-icon"
                        className="bg-accent text-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-md"
                      >
                        <industry.icon className="size-4" />
                      </span>
                    ) : null}
                    <Title className="text-base">{industry.name}</Title>
                  </div>
                  <p className="text-muted-foreground text-pretty text-sm">{industry.problem}</p>
                </div>
                {industry.href !== undefined ? (
                  <CtaLink
                    href={industry.href}
                    newTab={industry.newTab}
                    variant="ghost"
                    size="sm"
                    className="shrink-0 self-start sm:self-auto"
                  >
                    {industry.hrefLabel}
                  </CtaLink>
                ) : null}
              </div>
            ) : (
              <Card className="h-full gap-3 py-6">
                <CardHeader>
                  {industry.icon ? (
                    <span
                      data-slot="industries-01-icon"
                      className="bg-accent text-accent-foreground mb-2 flex size-10 items-center justify-center rounded-lg"
                    >
                      <industry.icon className="size-5" />
                    </span>
                  ) : null}
                  <CardTitle>
                    <Title>{industry.name}</Title>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-muted-foreground text-pretty text-sm">{industry.problem}</p>
                  {industry.href !== undefined ? (
                    <CtaLink
                      href={industry.href}
                      newTab={industry.newTab}
                      variant="ghost"
                      size="sm"
                      className="self-start"
                    >
                      {industry.hrefLabel}
                    </CtaLink>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default Industries01

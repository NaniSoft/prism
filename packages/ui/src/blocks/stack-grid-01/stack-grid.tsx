import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One part a product is assembled from: its name, the product it wraps when the
 * name is a codename, and the role it plays.
 *
 * `name` and `role` are required, and a part with no role is a logo and a part
 * with no name is a role. A survey grid is a claim that a set of parts is
 * sufficient, and both halves of that claim are the caller's to make.
 */
export type StackPart = {
  /** The part's own name, as its authors spell it. */
  name: string
  /**
   * The real product underneath a codename, when the name above is not a name a
   * reader could look up.
   *
   * Optional and additive: a part whose name already is its product's own name
   * omits it, and a tile that omits it renders the two elements it rendered
   * before this field existed, with no line and no space held open for one.
   *
   * It is a field and not a slot, because the value goes inside the tile this
   * Block already draws. A slot is a value that goes in an element the Block does
   * not own, and a `StackPart` is a part's data, which is the `li` the Block
   * renders. It is the same shape as `ProductGrid01`'s `pack` and
   * `StatusLedger01`'s `detail`: one more value in a row the caller owns.
   *
   * Three of the four NaniSoft sites publish their stack under a codename with
   * the product printed beneath it, and the missing field is what made the
   * migration drop eight published names rather than move them. It is also the
   * evidence for the claim the section makes: a grid that says it composes rather
   * than forks can only be checked by a reader who can see what it composed.
   *
   * Pass it when it differs from `name`. The Block renders what it is handed and
   * does not compare the two, so a caller that passes one name twice prints it
   * twice.
   */
  realName?: string
  /**
   * One phrase about what the part does here. It is a role rather than a
   * description: the grid is a survey of what a product is built from, not a
   * feature list, and a role that runs to a sentence turns a survey into prose.
   */
  role: string
}

/**
 * One thing a product built itself, rather than assembled: its name and one line
 * about it.
 *
 * The two are required for the same reason `StackPart`'s are, and for one more:
 * a grid of in-house work beside a grid of assembled parts is a claim that the
 * work was NaniSoft's own, and that claim needs a name and a line under it to be
 * a claim a reader can check.
 */
export type StackOwn = {
  /** The component's own name. */
  name: string
  /** One line about what it does and why it is not assembled. */
  blurb: string
}

/**
 * The props a StackGrid01 takes.
 *
 * Every string is a prop and the Block ships none: no part, no role, no
 * realName, no blurb and no default "built in-house" mark. A grid that hardcoded
 * a part list would hand every consumer a survey of somebody else's stack.
 */
export type StackGrid01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a grid composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The parts the product is assembled from, in the order a reader should meet
   * them. Order is the caller's because it is a claim about which part matters
   * first.
   */
  parts: readonly StackPart[]
  /**
   * The things the product built itself, in the order a reader should meet them.
   * Omit it for a product that assembled everything, and pass it when the claim
   * is that some of the work is its own.
   */
  own?: readonly StackOwn[]
  /**
   * The label on the in-house group, which is the claim the group makes. Omit it
   * when the group is titled by the section itself, and pass a word you mean:
   * "built in-house", "built by Nanisoft" and "our own" are three different
   * claims and the Block does not choose between them.
   */
  ownLabel?: string
  /**
   * The line under the grid, for the sentence that qualifies it: what is not
   * here, or where to read the full list.
   */
  caption?: string
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A survey of what a product is assembled from, and what it built itself.
 *
 * Three of the four NaniSoft sites publish this section, and each one drew it by
 * hand with the same two groups: a survey grid of composed parts, each a name
 * and a role, and below it a second grid of the components the product wrote
 * itself, each a name and a line about it. Three of them also drew the second
 * group differently from the first - a dashed border, a different tile, a mark
 * above the name - because the visual difference is the claim: *this part is
 * ours*.
 *
 * That is what the `own` group is here. It is a separate prop and a separate
 * grid rather than a flag on the part, because the difference is a claim about
 * provenance and a claim is not a property of a row: a part that is assembled and
 * a part that is built are the same kind of thing with a different answer to "who
 * wrote it", and putting the answer in the row would make the two groups
 * indistinguishable in the data as well as on screen.
 *
 * The two groups differ in weight rather than in colour. The composed parts are
 * tiles on the muted surface; the in-house parts sit on the page with a
 * `border-primary` hairline, which is the one place in this system where a border
 * carries a pack's hue and it is paired with `shadow-md` because it is the one
 * element that means *lifted*. No step in either group is a pastel fill: a pastel
 * is a fill for a large area and never a signal, and a tile of pastel behind one
 * word is a signal a reader has to learn.
 *
 * `ownLabel` is required when `own` is passed, because the group is a claim and
 * the claim is the caller's words. Three of the four sites write three different
 * ones, and the Block does not choose.
 *
 * A tile carries a name, the real product behind it when the name is a codename,
 * and a role. The middle value is optional and additive: eight of the sixteen
 * parts on the three sites that draw this section are a codename over a product
 * its reader could look up, and before the field existed the honest answer
 * inside this surface was to lose those names. A part whose *role* needs two
 * lines still belongs in the section's `description`, where it applies to the
 * group rather than to one tile, because that is a claim about every tile rather
 * than a second name for one of them.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function StackGrid01({
  eyebrow,
  title,
  description,
  parts,
  own,
  ownLabel,
  caption,
  headingLevel = 'h2',
  className,
}: StackGrid01Props) {
  // Both groups are sets of tiles under one section, so a tile name is a heading
  // one step below it rather than a sibling of it.
  const Title = childLevel(headingLevel)
  if (own !== undefined && own.length > 0 && !ownLabel) {
    throw new Error(
      'StackGrid01: the in-house group was passed with no ownLabel, so the grid would make the claim ' +
        '"this part is ours" in a shape and leave the words to a reader to infer. Pass the words you mean, ' +
        'or omit the group.',
    )
  }

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

      <div data-slot="stack-grid" className={cn('flex flex-col gap-10', className)}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {parts.map((part) => (
            <li key={part.name}>
              <Card className="bg-muted h-full gap-2 py-4">
                <CardHeader className="gap-1">
                  <CardTitle className="text-sm">
                    <Title>{part.name}</Title>
                  </CardTitle>
                  {/*
                    The real product behind a codename, in the same annotation
                    face the in-house group uses for its own words. The element is
                    rendered only when the caller passes one: a tile that reserves
                    a line for absent content is a layout shift, and this grid is
                    the first thing a reader sees scroll.
                  */}
                  {part.realName ? (
                    <span className="text-muted-foreground font-mono text-xs">{part.realName}</span>
                  ) : null}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-pretty text-xs">{part.role}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        {own && own.length > 0 ? (
          <ul data-slot="stack-grid-own" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {own.map((entry) => (
              <li key={entry.name}>
                <Card className="border-primary shadow-md h-full gap-2 py-4">
                  <CardHeader className="gap-1">
                    <span className="text-muted-foreground font-mono text-xs">{ownLabel}</span>
                    <CardTitle className="text-sm">
                      <Title>{entry.name}</Title>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-pretty text-xs">{entry.blurb}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {caption ? <p className="text-muted-foreground mt-6 text-pretty text-sm">{caption}</p> : null}
    </Section>
  )
}

export default StackGrid01

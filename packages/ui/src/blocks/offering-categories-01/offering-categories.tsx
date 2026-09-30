'use client'

import { useState, type ReactNode } from 'react'

import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { cn } from '../../lib/utils'

/**
 * The two ways this Block draws the set, and the prop that selects between them.
 *
 * Named for what it selects rather than for the word variant, because in this
 * package a name ending in `Variant` is the shape that names a cva recipe and the
 * surface gate refuses it. The prop is still called `variant`, because that is what
 * the word means here and it is what every other Block in this package calls it.
 */
export type OfferingCategories01Form = 'grid' | 'tabs'

/**
 * The two words the tab arrangement's own controls need.
 *
 * Required in the `tabs` arrangement and refused outside it, and they are visible
 * words rather than accessible names for icon-only buttons. A control whose name
 * exists only for a screen reader is a control a sighted reader has to guess at, and
 * a row of two arrows in a category strip is exactly that: the reader cannot tell
 * which arrow moves back and which moves on. So the two buttons carry the words on
 * them, the icons are decorative, and a consumer in another language passes the two
 * words its own interface already uses for those directions.
 */
export type OfferingCategories01Labels = {
  /** The words on the control that shows the previous category. */
  previous: string
  /** The words on the control that shows the next category. */
  next: string
}

/**
 * One kind of capability, with the one line that says what the kind is and how much
 * of the catalogue is in it.
 *
 * `description` is required and this is the field the whole Block is shaped around.
 * A tile with only a name is a navigation menu, and this is not one: a navigation
 * list answers "where can I go", while a list of kinds answers "is the thing I need
 * one of these", and that is the question a reader brings to a page about kinds. The
 * alternative was an optional field, which compiles cleanly and produces a menu of
 * category names on a page that claimed to say something about them, and a page of
 * names is a page nobody reads twice. It is a `string` and not a node because the
 * line is read by scanning a grid's middle column and a sentence that wraps to three
 * lines costs every other tile its alignment.
 */
export type OfferingCategories01Category = {
  /** The kind's stable key. The route is the usual choice and needs no coordination. */
  id: string
  /** The kind's own name, as the product spells it. It is also the card title. */
  name: string
  /** One line about what this kind of capability is. */
  description: string
  /**
   * How many capabilities sit in this kind, when the caller is counting.
   *
   * Optional, and a number rather than a string because a count is a quantity and a
   * string here would be a sentence this Block cannot parse back out. Passing one
   * requires `countLabel`, and the run throws without it; see the note on that prop
   * for why the Block cannot write the sentence itself.
   */
  count?: number
  /**
   * The sentence for the count, given the number and the kind's own name.
   *
   * Required whenever `count` is passed, and the run throws without it. "12 sources"
   * and "12 supported" and "12" are three sentences, and they are three sentences
   * because a count means different things on different pages: on one it is how many
   * things exist, on another it is how many regions are covered, on a third it is
   * how many of them a given plan may use. Only the owner of the set knows which,
   * so the number crosses the seam and the sentence is composed by the caller, and
   * the second argument is the kind's own name because the noun in that sentence is
   * usually the name of the kind. A function rather than a template for the reason
   * `Waitlist01` hands a position back as one: word order and noun inflection belong
   * to the reader's language, and a Block that composed the sentence would compose
   * the English one.
   *
   * It is drawn in the interface face rather than the mono one, which is the opposite
   * of what `Metric` does with a string value and for the same underlying reason
   * stated the other way round: the mono stack in this system annotates a
   * machine-readable reading, and a sentence is not a reading.
   */
  countLabel?: (count: number, category: string) => string
  /** Where the kind goes. Its presence makes the tile carry a link. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the kind's own name reads as a name in a list of
   * names, and the sentence that says what following it does is a claim about the
   * destination, so it belongs to whoever wrote the destination. This is the same
   * union `Industries01` and `Careers01` make for the same reason.
   */
  hrefLabel?: string
}

/**
 * The props an OfferingCategories01 takes.
 *
 * Every string is a prop and the Block ships none: no kind, no description, no
 * count, no link label and not one sentence for the empty case. A Block that
 * hardcoded its categories would hand every consumer a taxonomy that is not theirs,
 * and a taxonomy is a claim about what a product thinks the shapes of its own
 * catalogue are.
 */
export type OfferingCategories01Props = {
  /** Optional label above the section title. It has no default. */
  eyebrow?: string
  /** The section title, and required. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The kinds, in the order a reader should meet them.
   *
   * Order is the caller's because the order of the kinds is a claim about which one
   * leads, and a Block that sorted them alphabetically would be making that claim on
   * the caller's behalf. It is also the order the tab arrangement's own controls
   * move in, so `previous` and `next` mean the same thing on every kind.
   */
  categories: readonly OfferingCategories01Category[]
  /**
   * How the kinds are drawn: a grid of tiles, or a set of tabs showing one at a time.
   *
   * `grid` is the default and the default is the argument rather than a shrug. See
   * the Block's JSDoc for the full case; the short form is that tabs hide five of
   * six answers behind a control, and on a marketing page a hidden answer is an
   * unanswered question.
   *
   * @defaultValue 'grid'
   */
  variant?: OfferingCategories01Form
  /**
   * The caller's own panel, shown under the tab row in the `tabs` arrangement.
   *
   * A slot and not a set of tiles, because the things inside a kind are the
   * caller's own rows: they may be a `OfferingList01`, a page of their own, a table
   * the caller has already written, or nothing at all while the page is still being
   * built. The Block knows the kind and the Block does not know what is in it, and
   * drawing a tile per kind with a generic body would be a Block inventing content
   * for the one place content is most specific.
   */
  content?: ReactNode
  /**
   * The words on the tab arrangement's own two controls.
   *
   * Required in the `tabs` arrangement and refused outside it. See
   * `OfferingCategories01Labels` for why they are visible words and not accessible
   * names for two icon buttons.
   */
  tabsLabels?: OfferingCategories01Labels
  /**
   * The caller's own sentence for a set with no kinds in it.
   *
   * Required, and a node. An empty catalogue is a real state on a product page whose
   * categories are generated from a list of capabilities, and the sentence that
   * distinguishes "we have not written these yet" from "this product has none" is
   * the caller's.
   */
  empty: ReactNode
  /**
   * Heading level for the section title.
   *
   * Defaults to `h2` because a Block is composed, not a page. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * A grid of kinds of capability, or a tab row with the caller's own panel under it.
 *
 * **The storefront version of this pattern is a category strip, and the translation
 * is the noun on the tile.** What that strip publishes is a row of departments a shop
 * sells in, each tile carrying the department's name, a line about it, how many
 * products are in it, and a link into the department. Every part of the layout and
 * every part of the accessibility work transfers unchanged, because a tile is a tile
 * and a count is a count whichever set it counts. What does not transfer is what the
 * categories are. The kinds here are kinds of capability: capture sources, agents,
 * connectors, tiers. A reader is not looking for the aisle their shopping falls in,
 * so the count beside a tile is not a shelf size and the link is not a browse page,
 * and a Block that wrote either of those sentences would be describing a shop.
 *
 * **The grid is the default because tabs hide five of six answers behind a control,
 * and on a marketing page a hidden answer is an unanswered question.** A reader who
 * arrives looking for their own kind of capability and does not see it among the
 * visible tiles has to work out whether it is behind a tab, and a reader who does
 * not work it out is a reader who leaves. So the cost of hiding is charged to the
 * caller rather than to the reader: the arrangement is opt-in, and a caller who
 * passes `tabs` is making the argument that their kinds are alternatives a reader
 * chooses between rather than a set a reader checks membership of. The rejected
 * default was tabs, which is the shape most category strips reach for first, because
 * it looks more like an interface and less like a page.
 *
 * **The tabs are sometimes right, and the reason is the panel rather than the tile.**
 * When each kind has a paragraph and a real panel of capabilities behind it, a grid
 * of six panels is a page nobody scrolls: the reader lands on it, reads the first
 * two, and leaves, having answered nothing about the other four. A tab row turns the
 * same six claims into six choices the reader picks between, and a reader who
 * recognises their own kind reads one and is done. That is a real improvement, which
 * is why the arrangement exists rather than being one nobody wanted, and the two
 * controls it draws are the answer to a tab row that overflows on a phone.
 *
 * **The count needs a label function and the run throws without one.** "12 sources"
 * and "12 supported" and "12" are three sentences, and they are three sentences
 * because a count means different things on different pages: on one it is how many
 * things exist, on another it is how many regions are covered, on a third it is how
 * many of them a given plan may use. A Block that picked one would be picking a
 * meaning, and it would be picking it for every consumer at once. So the number
 * crosses the seam and the sentence is the caller's, and the missing label is a
 * thrown diagnostic rather than a bare numeral on a marketing page. The cost of the
 * requirement is a caller who counts in three places writes one function, which is
 * the correct outcome: a count that means one thing on one page and another on the
 * next is a number nobody can act on.
 *
 * **The tabs arrangement composes `Tabs`, and the client JavaScript it costs is paid
 * whether or not you use it.** A client boundary in this system is a module, and there
 * is no conditional import of a client module, so `Tabs` is in this Block's graph
 * from the moment the Block is imported and a page that renders the `grid`
 * arrangement still ships the tab engine's code. That is a real cost and it is the
 * cost of one Block offering both arrangements rather than a consumer composing
 * `Tabs` around a list of kinds themselves and paying for it only when they did. The
 * alternative was to ship the tab arrangement as its own Block, which would have
 * meant a second category type, a second heading level and two catalogue entries
 * for one list of kinds. The cost is paid; the duplication is not.
 *
 * **The state is one string and it is the only state this Block holds.** The two
 * controls move it, the triggers move it, and a set that changes under the Block
 * falls back to the first kind rather than stranding the reader on a trigger that no
 * longer exists. It is a string rather than an index because a tab's identity is the
 * kind's identity, and an index goes stale the moment a caller reorders the set.
 *
 * **The card title is a heading one step below the section, derived rather than
 * written**, so moving this Block from an `h2` section to an `h3` one carries its
 * tile titles with it. The description is one line, because at two lines the tile
 * stops being a list entry and starts being a paragraph, and the longer answer
 * belongs in the panel the link points at.
 *
 * **The heading is aligned left**, because the set is content and it sits under the
 * heading. `SectionHeading` states the rule and this Block has tiles underneath it.
 *
 * It is a client Component, and the reason is the tab arrangement's two controls:
 * they have to move a value nothing else can see, so the Block owns one string, and
 * a module that owns a string is a client module. It owns nothing else, so the client
 * cost is one `useState` and not a running loop, and the data still crosses the seam
 * as props.
 */
export function OfferingCategories01({
  eyebrow,
  title,
  description,
  categories,
  variant = 'grid',
  content,
  tabsLabels,
  empty,
  headingLevel = 'h2',
  className,
}: OfferingCategories01Props) {
  const asTabs = variant === 'tabs'

  /*
   * The tab arrangement needs a panel to reveal and two controls to name, and a tab
   * row that reveals nothing is a control that does nothing, which is the same
   * defect the grid arrangement avoids by drawing all six answers at once.
   */
  if (asTabs && (tabsLabels === undefined || tabsLabels.previous.trim() === '' || tabsLabels.next.trim() === '')) {
    throw new Error(
      'OfferingCategories01: the tabs arrangement was chosen with no tabsLabels, so its two controls would be ' +
        'two arrows with nothing on them and nothing read out, and a reader could not tell which one moves ' +
        'back. Pass the words your interface uses for those two directions.',
    )
  }
  if (!asTabs && tabsLabels !== undefined) {
    throw new Error(
      'OfferingCategories01: tabsLabels were passed for the grid arrangement, where no tab control is drawn, ' +
        'so the words would be published in the documentation and rendered nowhere. Pass them, or choose the ' +
        'tabs arrangement.',
    )
  }
  if (asTabs && content === undefined) {
    throw new Error(
      'OfferingCategories01: the tabs arrangement was chosen with no content, so activating a trigger would ' +
        'reveal an empty panel and a reader would learn nothing about the kind they picked. Pass the panel ' +
        'your page draws for the kind that is showing, or use the grid arrangement.',
    )
  }

  for (const category of categories) {
    if (category.count !== undefined && category.countLabel === undefined) {
      throw new Error(
        `OfferingCategories01: the kind "${category.name}" declares a count with no countLabel, so the page ` +
          'would print a bare number beside a tile, and a bare number beside a tile is three sentences the ' +
          'Block cannot choose between. Pass the function that composes it in the reader language.',
      )
    }
    if (category.href !== undefined && (category.hrefLabel === undefined || category.hrefLabel.trim() === '')) {
      throw new Error(
        `OfferingCategories01: the kind "${category.name}" declares an href with no hrefLabel, so the tile ` +
          'would carry a link whose only words are the kind own name, which tells a reader nothing about ' +
          'what following it does. Pass the words that say what it does, or omit the href.',
      )
    }
  }

  /*
   * One string, and it is the only state this Block holds. The initial value is the
   * first kind, which is what a reader sees before touching anything, and putting
   * it in the initial state rather than resolving it on every render is what keeps
   * the visible row and the visible panel from ever disagreeing on the first paint.
   */
  const [chosen, setChosen] = useState<string>(categories[0]?.id ?? '')

  // A set that changed under the Block falls back to the first kind rather than
  // stranding the reader on a trigger that is no longer there.
  const at = categories.findIndex((category) => category.id === chosen)
  const current = at === -1 ? categories[0] : categories[at]
  const position = current === undefined ? -1 : at === -1 ? 0 : at

  const step = (delta: number) => {
    const next = categories[position + delta]
    if (next !== undefined) setChosen(next.id)
  }

  // A tile title nests one level below the section that introduces the set, so six
  // names under one heading read as six children of it rather than six competing
  // sections. A hardcoded h3 would be right exactly once.
  const Title = childLevel(headingLevel)

  return (
    <Section data-slot="offering-categories-01" className={className}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      {categories.length === 0 ? (
        /*
         * The caller's own sentence, drawn where the tiles would have been rather
         * than above them, so a reader is not told there is nothing at the foot of a
         * page that lists categories. `text-pretty` because the honest empty line is
         * sometimes a paragraph and `text-balance` would leave a one-word last line.
         */
        <p
          data-slot="offering-categories-01-empty"
          className="text-muted-foreground max-w-measure-narrow text-pretty"
        >
          {empty}
        </p>
      ) : asTabs && current !== undefined ? (
        <Tabs
          data-slot="offering-categories-01-tabs"
          value={current.id}
          onValueChange={setChosen}
          className="gap-6"
        >
          {/*
            The row and its two controls, laid out as one band so the controls sit
            beside the triggers rather than under them. The controls are disabled at
            the ends rather than wrapping, because a control named "previous" that
            jumps to the last trigger is a control that lies about what it does.
          */}
          <div
            data-slot="offering-categories-01-tabbar"
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <TabsList className="flex-wrap">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={position <= 0}
                onClick={() => step(-1)}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {tabsLabels?.previous}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={position >= categories.length - 1}
                onClick={() => step(1)}
              >
                {tabsLabels?.next}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/*
            One panel for the kind that is showing, and the panel is the caller's.
            The Block knows which kind is active and nothing else about what is in it,
            which is why this is a slot rather than a card per kind.
          */}
          <TabsContent value={current.id} className="min-w-0">
            {content}
          </TabsContent>
        </Tabs>
      ) : (
        <ul
          data-slot="offering-categories-01-grid"
          className={cn('grid gap-6', 'sm:grid-cols-2 lg:grid-cols-3', className)}
        >
          {categories.map((category) => (
            <li
              key={category.id}
              data-slot="offering-categories-01-tile"
              data-category={category.id}
              className="h-full"
            >
              <Card className="h-full gap-4 py-6">
                <CardHeader>
                  <CardTitle as={Title}>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-3">
                  {/*
                    The count, in the interface face rather than the mono one. The
                    mono stack annotates a machine-readable reading, and what arrives
                    here is a whole sentence the caller composed, not a bare number.
                  */}
                  {category.count === undefined || category.countLabel === undefined ? null : (
                    <span
                      data-slot="offering-categories-01-count"
                      className="text-muted-foreground text-xs font-medium"
                    >
                      {category.countLabel(category.count, category.name)}
                    </span>
                  )}

                  {category.href === undefined || category.hrefLabel === undefined ? null : (
                    <CtaLink
                      href={category.href}
                      variant="ghost"
                      size="sm"
                      className="self-start"
                    >
                      {category.hrefLabel}
                    </CtaLink>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

export default OfferingCategories01

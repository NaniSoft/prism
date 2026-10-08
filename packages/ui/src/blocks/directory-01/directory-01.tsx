'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { SearchField } from '../../components/ui/search-field'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. It is the same rule `AvatarGroup` applies, repeated rather than
 * imported, and the boundary is the reason: that helper is private to its module and
 * exporting it would make a private derivation part of a published surface in order to
 * save six lines in a Block. The cost is stated rather than hidden: two modules carry
 * this rule, so a change to it is a change in both, and a caller who needs a case the
 * rule does not cover composes `Avatar` themselves and passes their own node.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * The query in the form the match reads it: case folded, split on whitespace, with
 * the empty tokens dropped.
 *
 * The tokens are AND rather than OR, and the reason is the one `SearchDialog` and
 * `Help01` each state: a reader who types two words is narrowing, and with OR a
 * directory returns nearly every member of it, which is not a result but a list the
 * reader has to work through themselves.
 */
function tokensOf(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter((token) => token.length > 0)
}

/**
 * Whether every token appears somewhere in one case-folded string.
 *
 * A substring test with no stemming and no typo tolerance, which is the same
 * downgrade `Help01` takes and for the same reason: a fuzzy engine is a large
 * dependency whose ranking a consumer cannot restyle, audit against this package's
 * gates or replace without forking the Block.
 */
function containsAll(haystack: string, tokens: readonly string[]): boolean {
  return tokens.every((token) => haystack.includes(token))
}

/**
 * The words a member can be found by, as one case-folded string.
 *
 * The name, the role and the tags, and not the `href`, for the reason the tags are
 * there: a tag is the one field that classifies a person rather than identifying them,
 * and a reader who filters a directory by a skill is filtering by something they can
 * see on the card. A destination is a route in the caller's own application and
 * matching against it would let a reader find a person by a URL, which is not a thing
 * a reader remembers about a colleague.
 */
function haystackOf(member: Directory01Member): string {
  return [member.name, member.role ?? '', ...(member.tags ?? []).map((tag) => tag.label)]
    .join(` `)
    .toLowerCase()
}

/**
 * How many members the filter left on the page, which is what the caller's summary is
 * built from.
 *
 * A separate step rather than a value in the same pass so the number cannot drift from
 * the rows: it is counted from the array that was rendered, so a caller whose summary
 * disagrees with the page has a bug in their own function rather than a Block that
 * passed one number and drew another.
 */
function countMembers(categories: readonly Directory01Category[]): number {
  return categories.reduce((total, category) => total + category.members.length, 0)
}

/**
 * One person in a directory, and everything a reader needs to decide whether to
 * follow: a name, a role, a portrait where there is one, the caller's own tags, and
 * a destination.
 *
 * **`href` and `hrefLabel` are both required, and the second one is the whole of the
 * argument.** A person's name is a name, and the sentence that says following it is
 * a thing you do is the caller's, not this Block's. A directory of forty members
 * whose links all read the member's own name is forty links a screen reader user
 * hears as forty names and a mouse reader cannot tell apart, and the destination is
 * in the status bar for exactly one of them at a time. `community-01` and
 * `careers-01` make the same argument about their own links, and it is worth making a
 * third time because it is the rule and not a preference: the words that say what
 * activating a link does describe the caller's own destination, and a design system
 * that supplied them would be supplying a claim about a route it cannot see. The
 * alternatives were all worse. A default of "View profile" would be one English
 * sentence in every product that installs this Block, inside a design system rather
 * than inside a product's copy. Deriving the label from the name would produce "Priya
 * Raman" twice, once visible and once announced, and the visible one would be the
 * accessible name's tail rather than a sentence about the action. Making the name
 * itself the link would put the whole row behind one control and lose the tags. So the
 * label is a required prop and the run throws without it, and the type makes the pair
 * a union so a TypeScript caller cannot build a member with one and not the other.
 */
export type Directory01Member = {
  /** The member's stable key within the set. */
  id: string
  /** The person's own name, as they publish it. */
  name: string
  /** What they do, in the words the caller uses. Omit it rather than passing an empty string. */
  role?: string
  /**
   * Where this member's own record goes.
   *
   * Required, because a directory of people whose entries go nowhere is a list of
   * names and the reader arrived to reach one of them.
   */
  href: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * **A person's name is a name, and the sentence that says following it is a thing
   * you do is the caller's.** See this type's JSDoc for the whole argument, which is
   * the same one `community-01` and `careers-01` make and which is worth making a third
   * time because it is the rule and not a preference: the words that say what
   * activating a link does describe a destination in the caller's own application, and
   * a design system that supplied them would be supplying a claim about a route it
   * cannot see. "Message Priya", "Open the settlement run" and "See who is on call"
   * are three different offers and the Block knows which one you meant.
   */
  hrefLabel: string
  /**
   * The portrait, with the name the initials come from.
   *
   * A name rather than a string, because an `Avatar` without a fallback is an empty
   * circle for exactly as long as the image takes to arrive and forever if it never
   * does. Omit the whole field for a member the caller has no photograph of: the
   * `cards` arrangement then draws a card with a name and no mark, which is honest, and
   * the `rows` arrangement draws no disc at all.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The person's name, which is the initials' source. */
    name: string
  }
  /**
   * The caller's own short words for what this person is: a skill, a team, a place.
   *
   * Drawn as badges, never searched away, and they are the field a reader filters by,
   * which is why they are in the haystack. A caller with a fifth and sixth
   * classification composes them into the `hrefLabel` slot or their own control
   * beside the card rather than growing this list, because a card of eight badges is a
   * card a reader cannot read.
   */
  tags?: readonly { id: string; label: string }[]
}

/**
 * One group of members, and the caller's own name for the group.
 *
 * A category is a place a reader navigates to rather than a result they read, and that
 * fact is what the search is built on: a token that matches a category's own title
 * carries every member under it. A directory whose categories were only labels would
 * make searching for a team's name return the team's heading and nothing else, which is
 * the least useful thing a filter can do.
 */
export type Directory01Category = {
  /** The category's stable key. The route is the usual choice and needs no coordination. */
  id: string
  /** The category's own name, which is also its card title. */
  title: string
  /**
   * One line under the category's name.
   *
   * A node and not a string, because a directory's groups are named differently by
   * different products and the line under a group is sometimes a sentence and sometimes
   * a list of the three things in it. It is drawn rather than searched; see the note on
   * `Directory01Member` for why this Block reads strings only.
   */
  description?: ReactNode
  /** The members under it, in the order the reader should meet them. */
  members: Directory01Member[]
}

/**
 * How the directory is drawn: a grid of cards or a list of full-width rows.
 *
 * The type is `Directory01Form` and the prop is `variant`, and the two names differing
 * is the surface gate working rather than a slip: `check-surface.mjs` refuses a public
 * entry export whose name ends in `Variant`, because in this package that shape names a
 * cva map. This union is the two arrangements the Block can draw and it is named for the
 * arrangement.
 */
export type Directory01Form = 'cards' | 'rows'

/**
 * The props a Directory01 takes.
 *
 * Every string is a prop and the Block ships none: no member name, no role, no tag, no
 * category name, no link label and not one word of the two sentences the search field
 * needs. A directory with Prism's words in it would be a list of Prism's colleagues.
 */
export type Directory01Props = {
  /** The short line above the title, usually what this directory is for. */
  eyebrow?: ReactNode
  /** The heading. Required, because an index with no heading is a list in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The query, as the caller holds it.
   *
   * Required and controlled, for the reason `SearchField` gives in full: a search
   * field that owns its own text cannot be emptied from outside itself, and a
   * directory whose field cannot be cleared is a field a reader has to select and
   * delete one character at a time. It is also what this Block is for, so the two are
   * the same prop rather than one of them being derived.
   */
  value: string
  /**
   * Called with the query as the reader changes it, and with an empty string when the
   * clear control is pressed.
   */
  onValueChange: (value: string) => void
  /**
   * The field's visible name and its accessible name.
   *
   * Required and a `string`, because a field has one name and that name is the
   * caller's. A control with no name is announced as a search box, which is the one
   * name every other field of its kind on the page shares.
   */
  label: string
  /**
   * The accessible name of the control that empties the field.
   *
   * Required, and it is what makes the control exist rather than a name for something
   * already on screen: `SearchField` draws the clear control whenever this is passed
   * and draws nothing when it is not. The words are the caller's because a screen
   * reader reads them.
   */
  clearLabel: string
  /**
   * The categories, in the order a reader should meet them.
   *
   * The caller holds the whole directory, because this Block searches nothing: see the
   * JSDoc on the Block for why that is a law and not a limitation.
   */
  categories: Directory01Category[]
  /**
   * The caller's own sentence for a query that matched nothing.
   *
   * Required, and the reason is the one `Help01` states: a reader who has typed
   * something and got nothing is reading exactly one line, and a Block that wrote it
   * would write it in this package's language, in every product that installs it,
   * inside a design system rather than inside a product's copy, which is where a
   * translation tool is least likely to look. It is a node because the honest
   * no-results line is sometimes a sentence and sometimes a link to the caller's own
   * support address.
   */
  empty: ReactNode
  /**
   * The result line, written the way four products write it.
   *
   * A function and not a node, because the count a reader reads is a sentence whose
   * word order and noun inflection belong to their language, and a Block that composed
   * it would compose the English one. A function is also what lets a caller say
   * nothing before the reader has typed anything, by returning null for a count they
   * do not want to announce, which is the case every results line has on its first
   * paint.
   */
  summary?: (matches: number) => ReactNode
  /**
   * The caller's own control for one member, placed without styling at the member's
   * trailing edge.
   *
   * A node per member rather than one node for the directory, because what a caller
   * puts here acts on the member it sits beside: a plugin's enable is a `Switch`
   * whose `onCheckedChange` names that plugin, and one node reused across fifty
   * members could not. It is a function in the shape `DataTable01`'s
   * `renderRowActions` already takes, so the two per-row action shapes in this
   * package are one shape and not two.
   *
   * **The Block draws no control of its own here, and that is the whole reason the
   * prop is a node.** `scripts/check-block-controls.mjs` classifies `Switch` and
   * fails a Block that renders one without its handler, and a Block ships no
   * behaviour and so cannot supply one. So a member's action arrives as the caller's
   * own node, holding the caller's own control and its own handler, and the Block
   * places it in the member's trailing edge in both arrangements and draws nothing
   * where it is not passed. Until a directory wants one of these, this is absent and
   * a member is a name, a role, the tags and a destination.
   */
  renderMemberAction?: (member: Directory01Member) => ReactNode
  /**
   * How the set is drawn.
   *
   * @defaultValue 'cards'
   *
   * `cards` is right for a directory a reader scans for a face they recognise, which
   * is the common case for a set of people under about forty. `rows` is right for a
   * long list or a narrow column, where the portrait belongs at the leading edge of a
   * line rather than above a name in a grid.
   */
  variant?: Directory01Form
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The refusal, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a link a reader cannot follow on a page.
 *
 * One, and it is the one this Block is built around: a member with a destination and
 * no sentence. Each message names the member, because a caller with two hundred
 * members needs to know which one and not which number.
 */
function assertMembers(members: readonly Directory01Member[]): void {
  for (const member of members) {
    if (member.hrefLabel.trim() === '') {
      throw new Error(
        `Directory01: the member "${member.name}" has no hrefLabel, so the control would be a link announced ` +
          'by a name, which tells a screen reader nothing about what activating it does. A person name is a ' +
          'name, and the sentence saying that following it is a thing you can do belongs to the caller. Pass ' +
          'the words for the action.',
      )
    }
  }
}

/**
 * A directory of people or things a reader can search, browse and follow: a search
 * field, a set of categories, and the members under them.
 *
 * **This Block filters what it was given and it searches nothing. It holds no
 * directory, it fetches no directory, and there is no prop that points at one.** That
 * is a law and not a limitation, and the gate that holds it is
 * `packages/ui/scripts/check-block-imports.mjs`, which fails a Block that imports a
 * router or a data client or calls a network function. A Block that fetched a
 * directory would be a Block every consumer whose people live in its own identity
 * provider has to rewrite, and the corpus publishes it as a product-agnostic section,
 * so an agent composing a page from it composes a request the consumer never asked
 * for.
 *
 * **Every member's link carries the caller's sentence, and that is the rule rather
 * than a preference, which is why it is worth the third time it is being argued.** A
 * person's name is a name, and the sentence that says following it is a thing you do
 * is the caller's. `community-01` argues it for a channel join and `careers-01` for
 * an application; this is the same argument for a colleague's record, and repeating it
 * is the point, because a rule nobody states three times is a rule one Block happens
 * to follow. The failure is specific: forty members whose links all read the member's
 * own name is forty links a screen reader user hears as forty names, and a mouse
 * reader cannot tell them apart either because the words are identical. The
 * alternatives were all worse. A default would be one English sentence in every
 * product that installs this Block, inside a design system rather than inside a
 * product's copy, which is where a translation tool is least likely to look. Making
 * the name the link would put the row behind one control and lose the tags. So
 * `hrefLabel` is required, the type makes the pair a union, and the run throws for the
 * JavaScript caller and for a value that came out of a directory service with the
 * type's guarantee already gone.
 *
 * **This differs from `help-01` in what a member is, and the difference is in the
 * link affordance rather than in the layout.** An article is something to read: the
 * reader opens it, reads it, and comes back, so the article's own name is a perfectly
 * good label and the link beside it is a small quiet control under a title. A person
 * is something to reach: the reader wants to send a message, open a run, or ask a
 * question, so the member's name is an identity and the offer beside it is a
 * different sentence every time. That is why this Block's link is drawn as an
 * `outline` control at the card's trailing edge and why its label is required, while
 * `Help01` draws a `ghost` control under the article's title and requires the label
 * for the same underlying reason. The two Blocks share the field-search shape and
 * differ in the one fact that matters: an article is read in place and a person is
 * reached somewhere else.
 *
 * **A token that matches a category's own title carries every member under it, and
 * that is a decision about what a category is.** A category is a place a reader
 * navigates to rather than a result they read, so a reader who types a team's name
 * wants the team. Without the rule, searching for a category's name returns the
 * category's card with nothing in it, which is the least useful thing a filter can do
 * and looks like a broken one. The cost is the opposite one and it is real: a token
 * appearing in a category's name is a broad match, and a category called Platform
 * matches more than a reader typing platform meant. That is a cost the caller
 * controls by naming their categories, and it is named here rather than left to be
 * discovered.
 *
 * **Only strings are searched, and the two things a directory holds that are not
 * strings are deliberately excluded.** `description` is a `ReactNode`, and matching
 * it would mean walking the caller's markup for words, which is a Block reading
 * somebody else's content. `href` is a route in the caller's own application, and
 * matching against it would let a reader find a person by a URL, which is not a thing
 * a reader remembers about a colleague. Both are drawn. Neither is searched, and a
 * consumer who wants a description searched passes strings they have chosen to put in
 * the tags.
 *
  * **The category title is a heading one step below the section and the member's name
  * is a heading one step below that, because a directory has two levels of outline and
  * both of them are used.** A reader who searches a directory and then navigates by
  * heading wants the team and then the person, and a directory flattened onto one
  * level of forty member names is an outline a reader scrolls rather than navigates. So
  * the categories are headings at `childLevel(headingLevel)` and the member names at
  * `childLevel(childLevel(headingLevel))`, both derived and both used in both
  * arrangements, so a member is the same heading whether it is on a card or a row. A
  * card title whose element depended on a layout prop would make the outline depend on
  * a layout prop, which is the one thing `headingLevel` exists to prevent. This is the
  * same answer `Changelog01` gives for the same shape, a group and the records inside
  * it. The cost is two hundred extra outline entries in a directory that size, and
  * the answer for one that size is a list the reader searches rather than a grid they
  * scan.
  *
 * **The field composes `SearchField`, so the clear control, the polite result region
 * and the one tab stop are that Component's rather than a second implementation
 * here.** The result line is where `summary` goes: `SearchField` draws it as a polite
 * live region and announces it when the count changes, which is the only thing on the
 * page reporting the consequence of typing and the only place a screen reader user
 * learns that a search ran. A caller who starts passing a summary after the first
 * render brings the region into the document together with its content, which
 * `SearchField` says is the one case a live region is least reliable about, so pass an
 * empty summary on the first paint.
 *
 * **This Block does not own the search landmark, for the reason `SearchField` gives.**
 * A `<search>` element names a region of the page rather than a control, and a page
 * has two real search regions only when its two fields answer two different questions,
 * so put the landmark on the container if the page really does have one search.
 *
 * It is a client Component, and the reason is the filtering rather than the field: the
 * query is a prop the caller holds, the set that results is derived from it on every
 * keystroke, and a server component cannot re-render its own children. The filtering
 * itself is a substring test per member and holds no index of its own, so the client
 * cost is the derivation and not a running loop.
 */
export function Directory01({
  eyebrow,
  title,
  description,
  value,
  onValueChange,
  label,
  clearLabel,
  categories,
  empty,
  summary,
  renderMemberAction,
  variant = 'cards',
  headingLevel = 'h2',
  className,
}: Directory01Props) {
  // A category's title is a heading one step below the section that introduces the
  // set, and a member's name is a step below that, so a reader who searches a
  // directory and then navigates by heading lands on the team and then on the person
  // rather than on forty sibling names. A hardcoded level would be right exactly once.
  const Title = childLevel(headingLevel)
  const Member = childLevel(Title)
  const asCards = variant === 'cards'

  const tokens = useMemo(() => tokensOf(value), [value])

  const visible = useMemo(() => {
    // An empty query draws the whole directory, which is the resting state of a
    // directory and not a special case: a reader who has typed nothing is browsing.
    if (tokens.length === 0) return categories

    const kept: Directory01Category[] = []
    for (const category of categories) {
      if (containsAll(category.title.toLowerCase(), tokens)) {
        kept.push(category)
        continue
      }
      const members = category.members.filter((member) =>
        containsAll(haystackOf(member), tokens),
      )
      if (members.length > 0) kept.push({ ...category, members })
    }
    return kept
  }, [categories, tokens])

  for (const category of categories) assertMembers(category.members)

  const shown = countMembers(visible)

  return (
    <Section data-slot="directory-01" className={cn(className)}>
      <div data-slot="directory-01-body" className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        {/*
          The field, in the container's own measure rather than the section's, so the
          directory under it is a reading column and not a band across six columns.
          `resultSummary` is drawn only once `summary` is passed, so a caller who
          starts passing one should pass an empty result on the first paint to bring
          the live region into the document before its first content.
        */}
        <div data-slot="directory-01-search" className="w-full max-w-measure-narrow">
          <SearchField
            value={value}
            onValueChange={onValueChange}
            label={label}
            clearLabel={clearLabel}
            {...(summary === undefined ? null : { resultSummary: summary(shown) })}
          />
        </div>

        {visible.length === 0 ? (
          /*
           * The caller's own sentence, drawn where the categories would have been
           * rather than above them, so the reader is not told there is nothing at the
           * foot of a page that shows a directory. A `text-pretty` wrapper is here
           * because the honest no-results line is sometimes a paragraph and
           * `text-balance` would leave a one-word last line in it.
           */
          <p
            data-slot="directory-01-empty"
            className="text-muted-foreground max-w-measure-narrow text-pretty"
          >
            {empty}
          </p>
        ) : (
          <div
            data-slot="directory-01-categories"
            data-variant={variant}
            className={cn(
              'flex flex-col gap-10',
              // The card arrangement is a grid and the row arrangement is a stack, and
              // the difference is the grid template rather than two trees, so a member
              // is one set of elements whichever arrangement is drawn and a consumer
              // who switches `variant` at render time gets one list in the
              // accessibility tree rather than two.
              asCards ? 'grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3' : null,
            )}
          >
            {visible.map((category) => (
              <section
                key={category.id}
                data-slot="directory-01-category"
                data-category={category.id}
                aria-labelledby={`${category.id}-heading`}
                className="flex min-w-0 flex-col gap-4"
              >
                <div data-slot="directory-01-category-head" className="flex flex-col gap-1.5">
                  <Title
                    id={`${category.id}-heading`}
                    data-slot="directory-01-category-title"
                    className="text-lg font-semibold tracking-tight"
                  >
                    {category.title}
                  </Title>
                  {category.description === undefined ? null : (
                    <p
                      data-slot="directory-01-category-description"
                      className="text-muted-foreground text-pretty text-sm"
                    >
                      {category.description}
                    </p>
                  )}
                </div>

                {asCards ? (
                  <ul data-slot="directory-01-members" className="grid gap-4 sm:grid-cols-2">
                    {category.members.map((member) => (
                      <li
                        key={member.id}
                        data-slot="directory-01-card"
                        data-member={member.id}
                        className="flex"
                      >
                        <Card data-slot="directory-01-card-surface" className="w-full gap-4 py-5">
                          <CardHeader className="gap-3">
                            <div data-slot="directory-01-identity" className="flex min-w-0 gap-3">
                              {member.avatar === undefined ? null : (
                                <Avatar className="size-10 shrink-0">
                                  {member.avatar.src === undefined ? null : (
                                    <AvatarImage src={member.avatar.src} alt="" />
                                  )}
                                  <AvatarFallback className="text-mono">
                                    {initialsOf(member.avatar.name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex min-w-0 flex-col gap-0.5">
                                {/*
                                  The member's name, as a card title and therefore a
                                  heading one step below the category. `CardTitle`'s own
                                  default is a `div`, and the default is right for a
                                  grid of features where four titles under one section
                                  heading is the whole outline. It is wrong here,
                                  because a directory is two levels: the team a reader
                                  is in, and then the person. So the element is the
                                  derived level rather than the Component's default,
                                  and both arrangements use it, so a member is the same
                                  heading whether it is on a card or a row.
                                */}
                                <CardTitle
                                  as={Member}
                                  data-slot="directory-01-name"
                                  className="truncate text-sm leading-snug"
                                >
                                  {member.name}
                                </CardTitle>
                                {member.role === undefined ? null : (
                                  <span
                                    data-slot="directory-01-role"
                                    className="text-muted-foreground text-xs"
                                  >
                                    {member.role}
                                  </span>
                                )}
                              </div>
                            </div>

                            {member.tags === undefined || member.tags.length === 0 ? null : (
                              <div
                                data-slot="directory-01-tags"
                                className="flex flex-wrap items-center gap-1.5"
                              >
                                {member.tags.map((tag) => (
                                  <Badge key={tag.id} variant="secondary">
                                    {tag.label}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardHeader>

                          <CardFooter className="gap-2">
                            {/*
                              The link, and the reason it is an `outline` control at
                              the card's trailing edge rather than a quiet one under
                              the name: a person in a directory is something to reach
                              and not something to read, so the offer is the point of
                              the card and it is drawn at the weight a reader can find.
                              A help index draws the same field as a `ghost` control
                              under an article's title, because an article is read in
                              place. The words are the caller's and the run has already
                              refused a member without them.
                            */}
                            <CtaLink href={member.href} variant="outline" size="sm">
                              {member.hrefLabel}
                            </CtaLink>

                            {/*
                              The caller's own node, in the same trailing band and the
                              same shape in both arrangements. The Block places it and
                              draws nothing where it is not passed, so a member's
                              enable is the caller's `Switch` with its own handler
                              rather than a control this Block cannot act on.
                            */}
                            {renderMemberAction === undefined ? null : (
                              <span
                                data-slot="directory-01-member-action"
                                className="flex items-center"
                              >
                                {renderMemberAction(member)}
                              </span>
                            )}
                          </CardFooter>
                        </Card>
                      </li>
                    ))}
                  </ul>
                ) : (
                  /*
                    * A list rather than a grid of cards, because in this arrangement
                    * the portrait belongs at the leading edge of a line and the badges
                    * belong beside the name, not above it. The rule between rows is a
                    * border rather than a gap alone, so the boundary survives at any
                    * zoom level where the gap stops being visible.
                    */
                  <ul
                    data-slot="directory-01-members"
                    className="border-border flex flex-col border-t"
                  >
                    {category.members.map((member) => (
                      <li
                        key={member.id}
                        data-slot="directory-01-row"
                        data-member={member.id}
                        className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b py-4 last:border-b-0"
                      >
                        {member.avatar === undefined ? null : (
                          <Avatar className="size-8 shrink-0">
                            {member.avatar.src === undefined ? null : (
                              <AvatarImage src={member.avatar.src} alt="" />
                            )}
                            <AvatarFallback className="text-mono">
                              {initialsOf(member.avatar.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {/*
                          The same derived heading in the row arrangement, so a member
                          is the same element in both. A row that drew the name in a
                          `span` here and a heading on a card there would make the
                          outline depend on a layout prop, which is the one thing
                          `headingLevel` exists to prevent.
                        */}
                        <Member
                          data-slot="directory-01-name"
                          className="min-w-0 truncate text-sm font-medium"
                        >
                          {member.name}
                        </Member>

                        {member.role === undefined ? null : (
                          <span
                            data-slot="directory-01-role"
                            className="text-muted-foreground min-w-0 flex-1 truncate text-sm"
                          >
                            {member.role}
                          </span>
                        )}

                        {member.tags === undefined || member.tags.length === 0 ? null : (
                          <span
                            data-slot="directory-01-tags"
                            className="flex flex-wrap items-center gap-1.5"
                          >
                            {member.tags.map((tag) => (
                              <Badge key={tag.id} variant="secondary">
                                {tag.label}
                              </Badge>
                            ))}
                          </span>
                        )}

                        <CtaLink
                          href={member.href}
                          variant="outline"
                          size="sm"
                          className="ms-auto shrink-0"
                        >
                          {member.hrefLabel}
                        </CtaLink>

                        {renderMemberAction === undefined ? null : (
                          <span
                            data-slot="directory-01-member-action"
                            className="flex shrink-0 items-center"
                          >
                            {renderMemberAction(member)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}

export default Directory01

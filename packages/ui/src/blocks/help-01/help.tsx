'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
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
 * One article in a help category: its name, where it goes, and when it last
 * changed.
 *
 * **`hrefLabel` is required whenever `href` is, and the run fails without it,
 * for the reason `Download01` states in full.** A link whose only words are the
 * document's own name tells a reader nothing about what activating it will do, and
 * a help index has the same defect with the same cause: the destination is a route
 * in the caller's own application, the caller knows what is behind it, and the
 * reader is guessing from a title that is often deliberately vague so that it
 * matches a search. So the words on the link are the caller's and the name of the
 * article beside them is the caller's too, and a caller who has not thought about
 * the difference has a list of twelve links all reading the same.
 *
 * `updatedAt` is drawn as passed and is not formatted here, for the reason
 * `ResourceList01` gives for its `detail` cell: a date's honest reading is a
 * `RelativeTime` or a caller's own formatter, and the string a caller holds may be
 * a locale, a quarter or a release name rather than a date at all.
 */
export type Help01Article = {
  /** The article's stable key within its category. */
  id: string
  /**
   * The article's own name, as its authors spell it.
   *
   * It is also what the search below matches against, and it is matched as a
   * string rather than as a node for the same reason: a `ReactNode` would have to
   * be walked for words, and a Block reading the caller's markup looking for
   * something to search is a Block that has started to own the content.
   */
  title: string
  /** Where the article goes. Its presence makes the row carry a link. */
  href: string
  /** The words on the link, and required whenever `href` is. */
  hrefLabel?: string
  /**
   * When the article last changed, in the caller's own words.
   *
   * Drawn exactly as passed, and Prism formats no date. A caller who wants the
   * reading to say how long ago it was composes `relative-time` and passes the
   * node, or formats the string themselves.
   */
  updatedAt?: string
}

/**
 * One group of articles, and the caller's own name for the group.
 *
 * A category is a place a reader navigates to rather than a result they read, and
 * that fact is what the search below is built on: a token that matches a
 * category's own title carries every article under it. A help index whose
 * categories are only labels would make searching for a section's name return the
 * section's heading and nothing else, which is the least useful thing a filter can
 * do.
 */
export type Help01Category = {
  /** The category's stable key. The route is the usual choice and needs no coordination. */
  id: string
  /** The category's own name, which is also its card title. */
  title: string
  /**
   * One line under the category's name.
   *
   * A node and not a string, because a help index's groups are named differently by
   * different products and the line under a group is sometimes a sentence and
   * sometimes a list of the three things in it. It is drawn rather than searched;
   * see the note on `Help01Article.title` for why this Block reads strings only.
   */
  description?: ReactNode
  /** The articles under it, in the order the reader should meet them. */
  articles: Help01Article[]
}

/** The props a Help01 takes. Every string in this Block is one of them. */
export type Help01Props = {
  /** The short line above the title, usually what the help centre is for. */
  eyebrow?: ReactNode
  /** The heading. Required, because an index with no heading is a list in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The query, as the caller holds it.
   *
   * Required and controlled, for the reason `SearchField` gives in full: a search
   * field that owns its own text cannot be emptied from outside itself, and a help
   * index whose field cannot be cleared is a field a reader has to select and
   * delete one character at a time. It is also what this Block is for, so the two
   * are the same prop rather than one of them being derived.
   */
  value: string
  /**
   * Called with the query as the reader changes it, and with an empty string when
   * the clear control is pressed.
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
   * Required, and it is what makes the control exist rather than a name for
   * something already on screen: `SearchField` draws the clear control whenever
   * this is passed and draws nothing when it is not. The words are the caller's
   * because a screen reader reads them.
   */
  clearLabel: string
  /**
   * The categories, in the order a reader should meet them.
   *
   * The caller holds the whole index, because this Block searches nothing: see the
   * JSDoc on the Block for why that is a law and not a limitation.
   */
  categories: Help01Category[]
  /**
   * The caller's own sentence for a query that matched nothing.
   *
   * Required, and the reason is the same one that puts every other string in this
   * package behind a prop. "No results" is English, and it is the one sentence in a
   * help centre a reader is guaranteed to read, so a Block that wrote it would put
   * it into every product that installs this one, in a product whose interface is
   * in another language, inside a design system rather than inside a product's copy,
   * which is where a translation tool is least likely to look. It is a node because
   * the honest no-results line is sometimes a sentence and sometimes a link to the
   * caller's own support address, and a string prop would force the caller to
   * flatten it.
   */
  empty: ReactNode
  /**
   * The caller's own line about what the query found.
   *
   * A function and not a node, and the reason is the same one that makes
   * `Waitlist01`'s position a function rather than a template: the count a reader
   * reads is a sentence whose word order and noun inflection belong to their
   * language, and a Block that composed it would compose the English one. A function
   * is also what lets a caller say nothing before the reader has typed anything, by
   * returning null for a count they do not want to announce, which is the case
   * every results line has on its first paint.
   */
  summary?: (matches: number) => ReactNode
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The query in the form the match reads it: case folded, split on whitespace, with
 * the empty tokens dropped.
 *
 * The tokens are AND rather than OR, and that is the same rule `SearchDialog`
 * states for the same reason: a reader who types two words is narrowing, and with
 * OR a help index returns nearly everything, which is not a ranking but a list the
 * reader has to work through themselves.
 */
function tokensOf(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter((token) => token.length > 0)
}

/**
 * Whether every token appears somewhere in one case-folded string.
 *
 * A substring test with no stemming and no typo tolerance, which is the same
 * downgrade `SearchDialog` takes and for the same reason: a fuzzy engine is a large
 * dependency whose ranking a consumer cannot restyle, audit against this package's
 * gates or replace without forking the Block. A caller whose help content needs
 * more composes their own control.
 */
function containsAll(haystack: string, tokens: readonly string[]): boolean {
  return tokens.every((token) => haystack.includes(token))
}

/**
 * How many articles the filter left on the page, which is what the caller's summary
 * is built from.
 *
 * A separate step rather than a value in the same pass so the number cannot drift
 * from the rows: it is counted from the same array that was rendered, and a caller
 * whose summary disagrees with the page has a bug in their own function rather than
 * a Block that passed one number and drew another.
 */
function countArticles(categories: Help01Category[]): number {
  return categories.reduce((total, category) => total + category.articles.length, 0)
}

/**
 * A help index: a field at the top, a set of categories, and the articles under
 * them, filtered as the reader types.
 *
 * **This Block filters what it was given and it never searches anything. It holds
 * no index, it fetches no index, and there is no prop that points at one.** That is
 * a law and not a limitation, and the gate that holds it is
 * `packages/ui/scripts/check-block-imports.mjs`, which fails a Block that imports a
 * router or a data client or calls a network function. A Block that fetched a help
 * index would be a Block every consumer whose help lives elsewhere has to rewrite:
 * four consumers with four stores would each either patch the fetch or fork the
 * Block, and the corpus publishes it as a product-agnostic section, so an agent
 * composing a page from it composes a fetch the consumer never asked for. The Block
 * that exists instead is a frame over an array, and the frame is the part a
 * consumer can install.
 *
 * **What a consumer composes it with is a static JSON index filtered in the
 * browser, and that is the same shape `SearchDialog` already takes.** A help
 * centre is a set of documents a build step already knows about, so the index is
 * usually produced by that build step and served as one file, and the browser
 * filters it. A consumer that already serves an index for `SearchDialog` reuses the
 * same bytes here, and a consumer whose help lives in a CMS renders it into props
 * and gets the same behaviour with no index at all. The difference between the two
 * Components is the one the wave table records: `SearchDialog` is a dialog over an
 * index and fetches it itself, because a dialog is mounted by a deliberate act and
 * the index is the same bytes on every page; this Block is a section inside a page,
 * so it fetches nothing and takes the index as props. A section that fetched on
 * mount would fetch on every page that carried it.
 *
 * **A token that matches a category's own title carries every article under it, and
 * that is a decision about what a category is.** A category is a place a reader
 * navigates to rather than a result they read, so a reader who types a section's
 * name wants the section. Without the rule, searching for a category's name returns
 * the category's card with nothing in it, which is the least useful thing a filter
 * can do and looks like a broken one. The alternative, dropping a category that
 * matched on its own title, tells the reader there is nothing when there is a whole
 * section, and the cost of the rule is the opposite one, which is that a token
 * appearing in a category's name is a broad match: a category called Billing matches
 * more than a reader typing billing meant. That is a cost the caller controls by
 * naming their categories, and it is named here rather than left to be discovered.
 *
 * **Only names are searched, and the two things a help index holds that are not
 * names are deliberately excluded.** `description` is a `ReactNode`, and matching it
 * would mean walking the caller's markup for words, which is a Block reading
 * somebody else's content; `updatedAt` is a string in the caller's own format, which
 * may be a date, a locale, a quarter or a release name, and the tokens a reader
 * would type to match it are not derivable from it. Both are drawn. Neither is
 * searched, and a consumer who wants either of them searched passes strings it has
 * chosen to put in the titles.
 *
 * **`empty` is required and `summary` is a function, and both are there for the same
 * reason: this is the one Block in the package where a sentence is guaranteed to be
 * read.** A reader who has typed something and got nothing is reading exactly one
 * line, and a Block that wrote it would write it in this package's language, in
 * every product that installs it, inside a design system rather than inside a
 * product's copy. So the no-results sentence is the caller's node and the count line
 * is the caller's function, and the count is handed over rather than composed for
 * the same reason `Waitlist01` hands a position back as a function: word order and
 * noun inflection are the reader's language, not a number format.
 *
 * **An `href` needs an `hrefLabel` and the run fails without one, because a link
 * whose only words are a document's own name tells a reader nothing about what
 * activating it will do.** The article's name and the words on its link are two
 * props rather than one for that reason, which is the same split `Download01` makes,
 * and the check is here for the JavaScript caller and for a value that came out of a
 * build step with the type's guarantee already gone. Each message names the article
 * rather than the index, because a caller with two hundred articles needs to know
 * which one.
 *
 * **The category title is a heading one step below the section, and the article
 * names are not headings at all.** A help index has three levels of outline in it if
 * the articles were given one, and three is one too many: the article names are the
 * text of the links, so a reader navigating by heading would meet a list of link
 * labels that says nothing the card title has not already said. So the categories
 * are headings at `childLevel(headingLevel)` and the articles are list items, and
 * moving this Block from an `h2` section to an `h3` one carries the categories with
 * it.
 *
 * **The field composes `SearchField`, so the clear control, the polite result
 * region and the one tab stop are that Component's rather than a second
 * implementation here.** The result line is where `summary` goes: `SearchField`
 * draws it as a polite live region and announces it when the count changes, which is
 * the only thing on the page reporting the consequence of typing and the only place
 * a screen reader user learns that a search ran. A caller who starts passing a
 * summary after the first render brings the region into the document together with
 * its content, which `SearchField` says is the one case a live region is least
 * reliable about, so pass an empty summary on the first paint.
 *
 * **This Block does not own the search landmark, for the reason `SearchField`
 * gives.** A `<search>` element names a region of the page rather than a control,
 * and a page has two real search regions only when its two fields answer two
 * different questions, so put the landmark on the container if the page really does
 * have one search.
 *
 * It is a client Component, and the reason is the filtering rather than the field:
 * the query is a prop the caller holds, the set that results is derived from it on
 * every keystroke, and a server component cannot re-render its own children. The
 * filtering itself is a substring test per title and holds no index of its own, so
 * the client cost is the derivation and not a running loop.
 */
export function Help01({
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
  headingLevel = 'h2',
  className,
}: Help01Props) {
  // A category's title is a heading one step below the section that introduces the
  // set, so a reader who has learned the outline on one Block finds it the same on
  // this one. A hardcoded `h3` would be right exactly once.
  const Title = childLevel(headingLevel)

  const tokens = useMemo(() => tokensOf(value), [value])

  const visible = useMemo(() => {
    // An empty query draws the whole index, which is the resting state of a help
    // centre and not a special case: a reader who has typed nothing is browsing.
    if (tokens.length === 0) return categories

    const kept: Help01Category[] = []
    for (const category of categories) {
      if (containsAll(category.title.toLowerCase(), tokens)) {
        kept.push(category)
        continue
      }
      const articles = category.articles.filter((article) =>
        containsAll(article.title.toLowerCase(), tokens),
      )
      if (articles.length > 0) kept.push({ ...category, articles })
    }
    return kept
  }, [categories, tokens])

  for (const category of visible) {
    for (const article of category.articles) {
      if (article.hrefLabel === undefined || article.hrefLabel.trim() === '') {
        throw new Error(
          `Help01: the article "${article.title}" in the category "${category.title}" declares an href with no ` +
            'hrefLabel, so the row would carry a link whose only words are the article own name, which tells a ' +
            'reader nothing about what activating it does. Pass the words that say what it does, or omit the href.',
        )
      }
    }
  }

  const shown = countArticles(visible)

  return (
    <Section data-slot="help-01" className={cn(className)}>
      <div data-slot="help-01-body" className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        {/*
         * The field, in the container's own measure rather than the section's, so
         * the result list under it is a reading column and not a band across six
         * columns. `resultSummary` is drawn only once `summary` is passed, so a
         * caller who starts passing one should pass an empty result on the first
         * paint to bring the live region into the document before its first content.
         */}
        <div data-slot="help-01-search" className="w-full max-w-measure-narrow">
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
           * foot of a page that shows an index. A `text-pretty` wrapper is here
           * because the honest no-results line is sometimes a paragraph and
           * `text-balance` would leave a one-word last line in it.
           */
          <p
            data-slot="help-01-empty"
            className="text-muted-foreground max-w-measure-narrow text-pretty"
          >
            {empty}
          </p>
        ) : (
          <div
            data-slot="help-01-categories"
            className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((category) => (
              <Card
                key={category.id}
                data-slot="help-01-category"
                data-category={category.id}
                className="h-full gap-4"
              >
                <CardHeader>
                  <CardTitle>
                    <Title>{category.title}</Title>
                  </CardTitle>
                  {category.description === undefined ? null : (
                    <CardDescription>{category.description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent>
                  {/*
                   * A list rather than a set of paragraphs, because the articles
                   * are the links a reader is here to press and a list is what tells
                   * assistive technology how many there are. The rule between rows
                   * is a border rather than a gap alone, so the boundary survives at
                   * any zoom level where the gap stops being visible.
                   */}
                  <ul data-slot="help-01-articles" className="flex flex-col">
                    {category.articles.map((article, index) => (
                      <li
                        key={article.id}
                        data-slot="help-01-article"
                        className={cn(
                          'flex min-w-0 flex-col gap-1.5',
                          index > 0 ? 'border-border border-t pt-3' : null,
                        )}
                      >
                        <span
                          data-slot="help-01-article-title"
                          className="text-foreground text-sm font-medium"
                        >
                          {article.title}
                        </span>

                        {/*
                         * The link's words beside the article's name, and the
                         * reading beside those. Both are the caller's, and the
                         * reading is drawn exactly as passed: Prism formats no date,
                         * because a date's honest reading is `relative-time` and
                         * that is a caller's decision about the semantics of their
                         * own string.
                         */}
                        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <CtaLink
                            data-slot="help-01-article-link"
                            href={article.href}
                            variant="ghost"
                            size="sm"
                            className="self-start"
                          >
                            {article.hrefLabel}
                          </CtaLink>

                          {article.updatedAt === undefined ? null : (
                            <span
                              data-slot="help-01-article-updated"
                              className="text-muted-foreground text-xs"
                            >
                              {article.updatedAt}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}

export default Help01

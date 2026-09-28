import type { ReactNode } from 'react'

import { Prose } from '../../components/ui/prose'
import { Heading, Text } from '../../components/ui/typography'
import { cn } from '../../lib/utils'

/**
 * One page in a documentation tree: a title and the address it is read at.
 *
 * `href` is required. A page in the navigation that goes nowhere is an entry a
 * reader can focus and not follow, and the Page renders every page entry as a
 * native anchor so a reader can see where a destination is before taking it.
 */
export type DocsNavPage = {
  type: 'page'
  /** The words the reader meets. */
  title: string
  /** The address the page is read at. */
  href: string
}

/**
 * One group in a documentation tree: a label and the pages under it, at any
 * depth.
 *
 * `href` is the group's own index page, and it is optional on purpose. A group
 * with no index is a place in the tree and not a route, so the Page renders it
 * as a label: no anchor, no `href`, nothing focusable. Inventing a route for it
 * would publish an address that resolves to nothing, and rendering an anchor
 * with no `href` would publish a destination a reader can reach and cannot
 * follow. AlphaLens already uses the absent case to mean exactly this, in every
 * section whose folder holds no `index.mdx`, and Atlas and Nexus style those
 * entries out of their own stylesheets with a rule that has now become dead.
 *
 * `items` is required, because a group that renders a label and holds nothing
 * is an empty rail entry rather than a group. Pass a page with no children
 * rather than a group with none.
 */
export type DocsNavGroup = {
  type: 'group'
  /** The words on the label. A status inside them stays inside them. */
  title: string
  /**
   * The group's own index page, where it has one. Omit it for a group that is
   * only a heading over its pages.
   */
  href?: string
  /** The pages under this group, in the order a reader should meet them. */
  items: readonly DocsNavEntry[]
}

/**
 * A rule between entries, carrying a name that is usually empty.
 *
 * It is a label and never a link. The alternative spelling, a page entry with an
 * empty `href`, was what two of the three consumer sites shipped and had to
 * restyle in their own stylesheets, because an anchor with no destination is a
 * control that cannot be operated.
 */
export type DocsNavDivider = {
  type: 'divider'
  /** The words on the rule, which may be the empty string. */
  title: string
}

/**
 * One entry in a documentation tree, of any of the three kinds.
 *
 * The union is closed, and it is a union rather than one shape with optional
 * fields because a reader meets three different things in a rail: a destination,
 * a label over a list, and a rule. A single shape would make all three look
 * alike, and "a place that is a heading, not a link" is the distinction the whole
 * arrangement turns on.
 */
export type DocsNavEntry = DocsNavPage | DocsNavGroup | DocsNavDivider

/**
 * The two words the pager renders above the neighbouring pages' titles.
 *
 * Both are required, and both are the caller's: "Previous" and "Next" are this
 * Page's own phrasing, a site that files its pages in the other direction says
 * the opposite pair, and a Page that ships no copy ships no reader-facing copy
 * either.
 */
export type DocsPagerLabels = {
  /** The word above the previous page's title. */
  previous: string
  /** The word above the next page's title. */
  next: string
}

/**
 * The props a DocsShell takes.
 *
 * The navigation is data and the frame is the consumer's. Three sites publish
 * full documentation sets and each of them has a different shape: Nexus files
 * six sections of five pages, Atlas files four of which one holds nine pages
 * under a single heading, and AlphaLens files six sections separated by rules
 * and named for subject matter rather than for a documentation genre. The shape
 * arrives in `nav` and the Page renders it, so none of the three had to be told
 * which of the others it looks like.
 *
 * The document's own body is `children`, because a document is authored wherever
 * it is authored, a Markdown pipeline or a CMS, and Prism owns the measure and
 * the rhythm around the words rather than the words.
 */
export type DocsShellProps = {
  /**
   * The page's title, and the document's `h1`.
   *
   * It is optional because the three consumer sites do not agree about whether a
   * documentation page has one: two render the frontmatter title as the page
   * heading, and one lets the document's own Markdown own it. When it is absent
   * the Page renders no heading at all rather than an empty one, so the document
   * keeps exactly the outline its own content declares.
   */
  title?: string
  /**
   * One or two sentences under the title: what this part of the documentation
   * covers. A `ReactNode` because a site that files a page for a pipeline states
   * the pipeline's stage as markup rather than as a sentence.
   */
  description?: ReactNode
  /**
   * The documentation tree, in the order a reader should meet it. The whole
   * shape arrives here, so the Page holds no opinion about how many sections a
   * site has, how deep they nest, or what a section is called.
   */
  nav?: readonly DocsNavEntry[]
  /**
   * The headings inside this page, in document order, for the contents rail.
   *
   * It is the consumer's document that knows its own outline, because Prism does
   * not parse Markdown and a Page that guessed at it would guess wrong on every
   * document rather than on some. Pass the whole outline or none: a partial one
   * is a contents list that lies about the page.
   */
  toc?: readonly DocsNavEntry[]
  /**
   * The address of the page being rendered. The rail marks it with
   * `aria-current="page"` and the pager derives its two neighbours from it, so
   * the same navigation renders a different pager for every page without the
   * caller deriving anything.
   */
  currentHref?: string
  /**
   * The accessible name of the rail. Required whenever `nav` is passed, because
   * it is a word a reader hears and a Page that ships no copy ships no
   * reader-facing copy either.
   */
  navLabel: string
  /**
   * The accessible name of the contents rail. Required whenever `toc` is passed,
   * for the same reason `navLabel` is.
   */
  tocLabel: string
  /**
   * The accessible name of the pager. Required whenever there is a neighbour to
   * reach, for the same reason `navLabel` is.
   */
  pagerLabel: string
  /**
   * The two words the pager renders above the neighbouring pages' titles.
   * Required whenever either neighbour exists, for the same reason `navLabel`
   * is.
   */
  pagerLabels: DocsPagerLabels
  /**
   * The document's own body. Any flow content: paragraphs, headings, lists,
   * code, images, tables. `Prose` holds it to the reading measure and to the
   * block rhythm, and it is passed `fullWidth` so the document fills the column
   * the frame gives it rather than sitting in a second measure inside one.
   */
  children: ReactNode
  /**
   * A slot above the frame, inside the container: a breadcrumb trail, a version
   * picker, a search field. A slot rather than a prop because each of those is a
   * Block, and a Page that took one per prop would be a Page whose interface
   * lists the whole catalogue.
   */
  header?: ReactNode
  /**
   * A slot below the frame, inside the container: a feedback prompt, a link back
   * to the section index, a support address.
   */
  footer?: ReactNode
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A documentation screen: a navigation rail, the document, a contents rail and
 * the pager to the neighbouring pages.
 *
 * **This is the Page the other three NaniSoft sites import, and the name is
 * theirs.** All three already read `import { DocsShell, type DocsNavEntry }
 * from '@nanisoft/prism-ui/pages'` in their own document template, and all three
 * map their page tree into that shape in their own `lib/to-prism-tree`. A
 * published name cannot be cheaply changed and there is no redirect lane for item
 * routes, so the name follows the three import lines rather than this file's
 * shape. It was `docs-shell` in the retired line, where it was an empty
 * `div` plus a class name that each site then had to style from scratch, and it
 * is `docs-shell` here because that is what the three call sites already say.
 *
 * **A section is a label, not a control.** It carries no status, no badge, no
 * count, no collapse and no sort, and that is the whole of its interface. The
 * reason is specific: AlphaLens files its documentation as a pipeline, where
 * "Unified data contract (approved)" is a stage of the work and not a topic a
 * reader may visit in any order, and every structural affordance says the
 * opposite. A status in the title is part of the title and stays there as words:
 * the Page reads no parentheses, matches no vocabulary, and renders no pill
 * beside a heading that has one. A tree is data, and a Page that parsed a
 * consumer's data would be a Page that had opinions about it.
 *
 * **A group with no index is a label rather than a route.** `href` is optional
 * on `DocsNavGroup` for exactly that, and the absence means the label. The three
 * consumer sites all write `url: node.index?.url ?? ''` in their own adapter
 * today, which is the same fact spelled as an empty string, and two of the three
 * then carry a stylesheet rule that styles the resulting anchor-with-no-href
 * back into a label. Naming the case in the type makes those two rules dead
 * rather than load-bearing, and the type is the only place that had to change.
 *
 * **The pager is derived from the navigation rather than passed.** The rail
 * already knows every page and the order a reader meets them in, and deriving the
 * two neighbours from that plus `currentHref` removes one derivation from each
 * of the three sites. It is derived rather than passed for a second reason: a
 * caller who passes neighbours can pass a neighbour that is not in the tree, and
 * this is the one arrangement where a reader would notice.
 *
 * **The consumer supplies two orders and the Page imposes neither.** `nav` is in
 * the order the rail shows, and `toc` is in the order the contents rail shows.
 * Both are read as given: nothing is sorted, deduplicated or alphabetised, and a
 * tree whose sections are named for subject matter reads in the order its
 * author filed it. A Page that sorted its rail would flatten the one thing the
 * three sites disagree about and cannot both be right about.
 *
 * **The rail is bounded in height.** Atlas files nineteen pages and AlphaLens
 * files twenty-seven, so the taller tree is half again as long, and an unbounded
 * rail on a tall tree is a rail that pushes the document below the fold before
 * the reader has read a line of it. The rail and the contents rail are each
 * capped against the viewport and scroll inside it, so a nineteen-page tree and a
 * twenty-seven-page tree are both a full screen and neither is a page-long
 * sidebar.
 *
 * It is a Page rather than a Block because it is a whole screen and it is the
 * screen a content pipeline targets: a route that reads one document and hands
 * it the page tree, the outline and the current address. A Block would be the
 * rail, and the rail's job is not separable from the screen's, because the
 * arrangement of rail, document, contents and pager is what the three sites each
 * wrote separately and are here written once.
 *
 * It is a server Component. It fetches nothing, it holds no state and it imports
 * no router, so a consumer renders it from whichever route their framework names
 * and hands it the document their pipeline produced.
 */
export function DocsShell({
  title,
  description,
  nav,
  toc,
  currentHref,
  navLabel,
  tocLabel,
  pagerLabel,
  pagerLabels,
  header,
  footer,
  className,
  children,
}: DocsShellProps) {
  const rail = nav && nav.length > 0 ? nav : undefined
  const contents = toc && toc.length > 0 ? toc : undefined
  const neighbours = currentHref === undefined ? undefined : deriveNeighbours(nav ?? [], currentHref)

  return (
    <div data-slot="docs-shell" className={cn('mx-auto w-full max-w-6xl px-6 py-10 lg:px-8', className)}>
      {header}

      <div
        data-slot="docs-shell-frame"
        className={cn(
          'flex flex-col gap-8 lg:flex-row lg:gap-10',
          // One column for the document, and a third for whichever rails are
          // present. The frame is sized by what the consumer passed rather than
          // by a fixed three-column grid, so a tree with no contents rail leaves
          // the document the width the two remaining columns divide between
          // them.
          contents ? 'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_13rem]' : 'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]',
        )}
      >
        {rail ? (
          <aside
            data-slot="docs-rail"
            className="hidden lg:col-start-1 lg:row-start-1 lg:block"
          >
            <nav
              aria-label={navLabel}
              className="lg:sticky lg:top-20 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pe-4"
            >
              <NavList entries={rail} currentHref={currentHref} depth={0} />
            </nav>
          </aside>
        ) : null}

        <article data-slot="docs-article" className="flex min-w-0 flex-col gap-8">
          {title ? (
            <header className="flex flex-col gap-3">
              <Heading as="h1" size="3xl">
                {title}
              </Heading>
              {description ? (
                <Text size="lg" tone="muted" className="max-w-measure">
                  {description}
                </Text>
              ) : null}
            </header>
          ) : description ? (
            <Text size="lg" tone="muted" className="max-w-measure">
              {description}
            </Text>
          ) : null}

          <Prose fullWidth>{children}</Prose>

          {neighbours ? (
            <Pager
              previous={neighbours.previous}
              next={neighbours.next}
              label={pagerLabel}
              labels={pagerLabels}
            />
          ) : null}
        </article>

        {contents ? (
          <aside
            data-slot="docs-contents"
            className="hidden lg:col-start-3 lg:row-start-1 lg:block"
          >
            <nav
              aria-label={tocLabel}
              className="lg:sticky lg:top-20 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto"
            >
              <NavList entries={contents} currentHref={currentHref} depth={0} />
            </nav>
          </aside>
        ) : null}
      </div>

      {footer}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * The rail
 * ------------------------------------------------------------------ */

/**
 * One level of the tree as a list, at whatever depth it sits.
 *
 * The nesting is a rule rather than a special case: the tree is the shape the
 * navigation has, and one level of that is the whole renderer. A tree one deep
 * and a tree seven deep are the same code with different data, which is what
 * lets one Page carry a site that files nine pages under a heading and a site
 * that files six sections separated by rules.
 */
function NavList({
  entries,
  currentHref,
  depth,
}: {
  entries: readonly DocsNavEntry[]
  currentHref?: string
  depth: number
}) {
  return (
    <ul
      data-slot="docs-nav-list"
      data-depth={depth}
      className={cn(
        'border-border flex flex-col gap-1 border-l',
        // One level of indent per nested group, and none at the top, so the
        // depth reads from the rule rather than from the words.
        depth > 0 && 'ps-3',
      )}
    >
      {entries.map((entry, index) => (
        <NavNode key={`${entry.type}:${index}`} entry={entry} currentHref={currentHref} depth={depth} />
      ))}
    </ul>
  )
}

/**
 * One entry, in whichever of the three shapes it arrives.
 *
 * The switch is on `type` rather than on the presence of fields, so an entry
 * that arrives malformed falls to the last arm and renders nothing rather than
 * rendering a destination it has no address for.
 */
function NavNode({
  entry,
  currentHref,
  depth,
}: {
  entry: DocsNavEntry
  currentHref?: string
  depth: number
}) {
  if (entry.type === 'divider') {
    // A rule between entries. It is a label, so it is not focusable and a reader
    // does not meet it as a destination, and the empty title renders no words
    // above the hairline rather than a word a reader has to interpret.
    return (
      <li
        data-slot="docs-nav-divider"
        className="border-border mt-2 border-t pt-2 first:mt-0 first:border-t-0 first:pt-0"
      >
        {entry.title ? (
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {entry.title}
          </span>
        ) : null}
      </li>
    )
  }

  if (entry.type === 'group') {
    return (
      <li data-slot="docs-nav-group">
        <div className="flex flex-col gap-1">
          {/*
            The one rule this whole arrangement turns on. A group with an index
            is a destination and renders an anchor; a group without one is a
            label and renders a span, so it carries no `href`, is not focusable,
            and cannot be reached by Tab. There is no third arm and no anchor
            with an empty `href`, because both publish an address that resolves
            to nothing.
          */}
          {entry.href === undefined ? (
            <span
              data-slot="docs-nav-label"
              className={cn(
                'rounded-sm text-sm font-semibold tracking-tight',
                containsHref(entry, currentHref) ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {entry.title}
            </span>
          ) : (
            <a
              data-slot="docs-nav-heading"
              href={entry.href}
              aria-current={currentHref === entry.href ? 'page' : undefined}
              className={cn(
                'hover:text-foreground rounded-sm text-sm font-semibold tracking-tight transition-colors duration-fast ease-out',
                under(entry.href, currentHref) ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {entry.title}
            </a>
          )}

          {entry.items.length > 0 ? (
            <NavList entries={entry.items} currentHref={currentHref} depth={depth + 1} />
          ) : null}
        </div>
      </li>
    )
  }

  return (
    <li data-slot="docs-nav-page">
      <a
        data-slot="docs-nav-link"
        href={entry.href}
        aria-current={currentHref === entry.href ? 'page' : undefined}
        className={cn(
          '-ms-px block border-l-2 py-1 ps-3 text-sm transition-colors duration-fast ease-out',
          currentHref === entry.href
            ? 'text-foreground border-primary font-medium'
            : 'text-muted-foreground hover:text-foreground border-transparent',
        )}
      >
        {entry.title}
      </a>
    </li>
  )
}

/* ------------------------------------------------------------------ *
 * The pager
 * ------------------------------------------------------------------ */

/** One page the pager can reach, and where it is. */
type Neighbour = { title: string; href: string }

/**
 * Every page the tree holds, in the order a reader meets them.
 *
 * A group's own index page comes before the pages under it, because that is the
 * order the tree states and the Page does not reorder it. A group with no index
 * contributes its children and nothing else, which is the second thing that
 * makes an absent `href` a label rather than a route: there is no page there for
 * the pager to reach either. A divider contributes nothing at all.
 */
function flatten(entries: readonly DocsNavEntry[], into: Neighbour[] = []): Neighbour[] {
  for (const entry of entries) {
    if (entry.type === 'page') {
      into.push({ title: entry.title, href: entry.href })
      continue
    }
    if (entry.type === 'group') {
      if (entry.href !== undefined) into.push({ title: entry.title, href: entry.href })
      flatten(entry.items, into)
    }
  }
  return into
}

/**
 * The pages either side of `currentHref`, or nothing when it is not in the tree.
 *
 * It returns `undefined` rather than a pair of blanks when the address is not in
 * the navigation, because a pager with two empty halves is a rule above nothing
 * and a reader cannot tell it from a page that has no neighbours.
 */
function deriveNeighbours(
  entries: readonly DocsNavEntry[],
  currentHref: string,
): { previous?: Neighbour; next?: Neighbour } | undefined {
  const flat = flatten(entries)
  const at = flat.findIndex((entry) => entry.href === currentHref)
  if (at === -1) return undefined
  return { previous: flat[at - 1], next: flat[at + 1] }
}

/**
 * The two pages either side of this one, rendered as native links.
 *
 * Each half renders only when there is a page for it. A "previous" link on the
 * first page is a link to the page the reader has already read, and a "next"
 * link on the last is a promise the site cannot keep.
 */
function Pager({
  previous,
  next,
  label,
  labels,
}: {
  previous?: Neighbour
  next?: Neighbour
  label: string
  labels: DocsPagerLabels
}) {
  if (!previous && !next) return null
  return (
    <nav
      aria-label={label}
      data-slot="docs-pager"
      className="border-border mt-4 flex flex-wrap items-start justify-between gap-4 border-t pt-6"
    >
      {previous ? (
        <a
          href={previous.href}
          className="hover:text-foreground flex flex-col rounded-sm transition-colors duration-fast ease-out"
        >
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {labels.previous}
          </span>
          <span className="text-sm font-semibold">{previous.title}</span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a
          href={next.href}
          className="hover:text-foreground ms-auto flex flex-col rounded-sm text-right transition-colors duration-fast ease-out"
        >
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {labels.next}
          </span>
          <span className="text-sm font-semibold">{next.title}</span>
        </a>
      ) : null}
    </nav>
  )
}

/* ------------------------------------------------------------------ *
 * The current address
 * ------------------------------------------------------------------ */

/** Under a route, or at it, and never under a route that merely starts the same. */
function under(href: string | undefined, currentHref: string | undefined): boolean {
  return (
    href !== undefined &&
    currentHref !== undefined &&
    (currentHref === href || currentHref.startsWith(`${href}/`))
  )
}

/**
 * Whether the current page is inside this group.
 *
 * A group with a route answers for that route and everything under it. A group
 * without one has no route to answer with, so it asks its children, which is the
 * only way a label can still show a reader that they are inside it.
 */
function containsHref(group: DocsNavGroup, currentHref: string | undefined): boolean {
  if (under(group.href, currentHref)) return true
  return group.items.some((entry) => {
    if (entry.type === 'page') return under(entry.href, currentHref)
    if (entry.type === 'group') return containsHref(entry, currentHref)
    return false
  })
}

export default DocsShell

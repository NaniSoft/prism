import type { ReactNode } from 'react'

import { Prose } from '../../components/ui/prose'
import { headingSizeClass } from '../../components/ui/section'
import { Heading, Text } from '../../components/ui/typography'
import { cn } from '../../lib/utils'

/**
 * One page in a documentation tree: a title and the address it is read at.
 *
 * `href` is required. A page in the navigation that goes nowhere is an entry a
 * reader can focus and not follow, and the Page renders every page entry as a
 * native anchor so a reader can see where a destination is before taking it.
 *
 * **Required is not the same as enforced, and the difference is stated here
 * rather than left to be discovered.** `href: string` admits `''`, because the
 * empty string is a legal `string` and the only type that refuses it is a branded
 * one, which would put an `as` in every consumer's adapter for three sites this
 * Page is already published to. So the type admits the value and `readTree`
 * refuses it, at the boundary, by throwing and naming the entry. The promise this
 * block used to make was true only of the group arm; it is now true of what the
 * Page renders, and it says which of the two is doing the work.
 *
 * `title` may be the empty string, and an entry the Page cannot name is not
 * rendered at all. It used to render as a label on the same rule that makes a
 * group with no index a label, and that produced `<li><span></span></li>`: a
 * row of nothing inside a `<nav>`, which one consumer measured at 102 across 25
 * of its 31 documentation pages. A blank row is not a destination and it is not
 * a label either, because a label is words. So the Page drops the entry and
 * counts the drop on the rail as `data-unnamed-entries`, which is the same
 * answer `Diagram` gives a relation it cannot resolve.
 *
 * **The page is not lost, and one thing is.** The address still resolves, the
 * document still renders at it, and every link into it still works; what the rail
 * loses is one row. The pager does lose that page, because the pager walks the
 * same list and the row is no longer in it, so a reader who arrives at the address
 * directly finds a document and no pager. That was already the answer before the
 * row was dropped, and it is the cost of dropping rather than of this change:
 * keeping it would mean publishing the nameless link a second time.
 *
 * **A blank `title` and a blank `href` are answered differently, and the reason
 * is what each one has left.** A page with an address and no words is a real page
 * with one unrenderable field, so dropping the row costs a reader nothing and
 * taking the whole screen down over it would cost them everything. A page with
 * words and no address is a row whose entire content is a route that does not
 * exist, and there is nothing to render in its place, so `readTree` refuses it.
 */
export type DocsNavPage = {
  type: 'page'
  /**
   * The words the reader meets. An empty or blank string names nothing, and the
   * Page renders no row for the entry and counts the drop.
   */
  title: string
  /** The address the page is read at. An empty string is refused, by name. */
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
  /**
   * The words on the label. A status inside them stays inside them.
   *
   * An empty or blank string renders no label, and the pages under the group are
   * still rendered: a group whose title cannot be rendered has lost a heading and
   * not a section, so dropping the whole entry would delete pages the reader can
   * otherwise reach. A group with no words and no children has nothing left to
   * draw and is dropped whole.
   */
  title: string
  /**
   * The group's own index page, where it has one. Omit it for a group that is
   * only a heading over its pages.
   *
   * An empty or blank string is the same answer as omitting it, and deliberately
   * so: all three consumer adapters write `url: node.index?.url ?? ''` for a
   * folder holding no `index.mdx`, so the empty string is how they have always
   * spelled "this group is not a route", and reading it as the absence is what
   * keeps those adapters correct without a change in any of them. A page has no
   * such reading: there, an empty address is a fault, and `readTree` says so.
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
   *
   * It is also the visible word on the disclosure that stands in for the rail
   * below `lg`, because it is already this navigation's name and a Page cannot
   * invent a second one. A consumer that files its navigation in another language
   * gets the control in that language by having done this once.
   */
  navLabel: string
  /**
   * The accessible name of the contents rail. Required whenever `toc` is passed,
   * for the same reason `navLabel` is, and the contents disclosure below `lg`
   * carries it for the same reason too.
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
 * back into a label. So the Page reads an empty or blank `href` as the absence on
 * this arm, and the two stylesheet rules are dead rather than load-bearing. It
 * takes one function rather than only a type, because an optional field the
 * caller spells as `''` is not an optional field the type can see.
 *
 * **An entry with no words is a label too, and a page with no address is
 * refused.** Both halves of "what makes this a destination" are answered in one
 * function, `destinationOf`, and both the rail and the pager ask it. An entry
 * that is a label on the rail is not a page the pager reaches either, so one
 * malformed row cannot become two surfaces' worth of broken link. A page whose
 * address is empty or blank has no such reading: there is nothing to render in
 * place of the link, so the Page throws, naming the entry, before any of the tree
 * renders.
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
 * **The rail is bounded in height, and the bound is what the reader has to be
 * able to see.** Atlas files nineteen pages and AlphaLens files twenty-seven, so
 * the taller tree is half again as long, and an unbounded rail on a tall tree is
 * a rail that pushes the document below the fold before the reader has read a
 * line of it. The rail and the contents rail are each capped against the viewport
 * and scroll inside it, so a nineteen-page tree and a twenty-seven-page tree are
 * both a full screen and neither is a page-long sidebar.
 *
 * **A cap the reader cannot see is a defect, and this one was invisible for 344
 * and 750 pixels.** Measured in two consumers' built exports at 1280 by 680, the
 * rail's content stood at 912 and 1318 pixels against a 568 pixel box, so more
 * than half of one site's documentation navigation sat below the fold with
 * `mask-image: none`, no scrollbar Chrome would draw until the reader scrolled,
 * no fade and no count. Chrome's overlay scrollbars are the reason this is not
 * caught by looking: they appear on scroll, so the first render of a rail that
 * hides half its content is indistinguishable from a rail that has all of it, and
 * the last visible row was cut mid-word above dead space, which reads as a
 * rendering fault rather than as a scroll region.
 *
 * **The affordance is a fade across the foot of the scroll region, with the space
 * it covers reserved rather than borrowed.** Three answers were available and the
 * other two were rejected for stated reasons. A persistent themed scrollbar is
 * truthful at both ends and costs nothing to legibility, and it is still here in
 * the sense that the region is a real scroll region rather than a clipped box,
 * but it is a single hairline whose length says "there is more" without saying
 * which way, it needs `scrollbar-gutter` reserved in a 15rem rail to stop the
 * content shifting when a short tree becomes a tall one, and in Chrome it is the
 * least reliable of the three to reason about because the property that makes it
 * persistent is the same one whose default is an overlay. A collapse control needs
 * a disclosure whose state a server Component cannot hold. An "N more" control is
 * copy this Page does not ship and it needs the count the Page cannot compute
 * without measuring, which is the one thing a server Component cannot do.
 *
 * So the fade, and it is painted on a wrapper that does not scroll rather than on
 * the scroll region itself: a mask or a gradient inside the scrollport moves with
 * the content and marks nothing. The wrapper carries the sticky offset, the
 * scroll region keeps the cap and the scrolling, and the gradient is pinned to
 * the wrapper's foot. The region carries `padding-bottom` of the same height, and
 * that is the half that makes it honest: at rest the gradient falls on reserved
 * space and the last row is fully legible, and only while there is more below
 * does it fall on content. Without the padding the same gradient washes the last
 * row permanently, which is the usual cost of this answer and the reason the
 * padding is not optional.
 *
 * **The fade is paint, and it is on the accessibility tree's terms.** It is an
 * empty element with `aria-hidden` and `pointer-events-none`, inside the `<nav>`
 * and outside the `<ul>`, so it is not a list item, it is not announced, it never
 * takes a press and it never reaches a Tab stop. A keyboard reader scrolls the
 * region with the arrow keys exactly as before and reaches every entry, and a
 * screen-reader user is told nothing at all, which is the right answer: the cut is
 * a fact about ink, and announcing it would put a sentence in the middle of a
 * list of a consumer's own pages.
 *
 * **Below `lg` there was no navigation at all, and the fix is a native
 * disclosure.** At 768 and at 1024 both rails were `hidden` and the only
 * navigation left inside `<main>` was the two-item pager at the foot of the
 * article, so a reader on a thirty-one document reference at tablet width had no
 * contents, no on-this-page and no way to a sibling page except Previous and
 * Next. The disclosure is `<details>` and `<summary>`, which is the one
 * disclosure widget that needs no runtime at all: it is expanded and collapsed by
 * the platform, it is a real control in the Tab order with a real expanded state,
 * and adding a client boundary to a server Component to reinvent it would put
 * bytes on every documentation page in the family to save a reader one click.
 *
 * The tree is rendered twice, once in each arrangement, and only one of them is
 * in the document at any width: the rail is `hidden lg:block` and the disclosure
 * is `lg:hidden`, so the other one is `display: none` and is out of the
 * accessibility tree and out of the tab order rather than a second copy a reader
 * meets. The summary carries `navLabel` or `tocLabel`, which is the caller's own
 * word for that navigation and therefore the one word on the control that cannot
 * be wrong in a language the consumer did not write in.
 *
 * **The frame is three columns from `lg`, and the third is the consumer's to
 * fill.** The rail is 15rem, the document takes the rest, and the contents rail
 * is 13rem. The third track exists only when `toc` is passed, because the
 * document takes the second track by auto-placement and a template that named a
 * track no child occupies would leave the document in the 15rem one. Below `lg`
 * the frame is a single column: the document fills it and the two navigations sit
 * above it behind their disclosures.
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
 * and hands it the document their pipeline produced. The sub-`lg` disclosure is
 * the reason that stays true under pressure: it is the one feature on this Page
 * that a hand would be tempted to write as a client Component, and it is written
 * as markup instead.
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
  readTree(nav, 'nav')
  readTree(toc, 'toc')

  const rail = nav && nav.length > 0 ? nav : undefined
  const contents = toc && toc.length > 0 ? toc : undefined
  const neighbours = currentHref === undefined ? undefined : deriveNeighbours(nav ?? [], currentHref)
  const unnamedNav = unnamedIn(nav)
  const unnamedToc = unnamedIn(toc)

  return (
    <div data-slot="docs-shell" className={cn('mx-auto w-full max-w-page px-6 py-10 lg:px-8', className)}>
      {header}

      <div
        data-slot="docs-shell-frame"
        className={cn(
          'flex flex-col gap-8 lg:flex-row lg:gap-10',
          // One track for the rail, one for the document, and a third for the
          // contents rail when there is one. The template names exactly the
          // tracks the children occupy rather than a fixed three-column grid,
          // because the document takes the second track by auto-placement: a
          // tree with no contents rail has two children, so a three-track
          // template would leave the document in the 15rem first track.
          //
          // The third track is at the same width as the two-column frame, and
          // that is a fact about the token package rather than a preference: the
          // emitted theme closes `xl` with `initial`, so a third track written
          // against a wider screen compiled to no media query at all, and the
          // contents rail landed in an implicit `auto` track rather than the
          // 13rem one. `check-breakpoint-variants.mjs` is the gate that says so
          // to the next class written against a screen the theme does not emit.
          contents ? 'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)_13rem]' : 'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]',
        )}
      >
        {/*
          The narrow arrangement, first in the document so it is what a reader at
          768 or 1024 meets before the text rather than after it. It is
          `lg:hidden` because the rail below is `hidden lg:block`, so exactly one
          of the two is displayed at any width and neither is a second copy in the
          accessibility tree.
        */}
        {rail || contents ? (
          <div data-slot="docs-nav-compact" className="flex flex-col gap-4 lg:hidden">
            {rail ? (
              <Disclosure label={navLabel} unnamed={unnamedNav}>
                <NavList entries={rail} currentHref={currentHref} depth={0} />
              </Disclosure>
            ) : null}
            {contents ? (
              <Disclosure label={tocLabel} unnamed={unnamedToc}>
                <NavList entries={contents} currentHref={currentHref} depth={0} />
              </Disclosure>
            ) : null}
          </div>
        ) : null}

        {rail ? (
          <aside
            data-slot="docs-rail"
            className="hidden lg:col-start-1 lg:row-start-1 lg:block"
          >
            <Rail label={navLabel} entries={rail} currentHref={currentHref} unnamed={unnamedNav} />
          </aside>
        ) : null}

        <article data-slot="docs-article" className="flex min-w-0 flex-col gap-8">
          {title ? (
            <header className="flex flex-col gap-3">
              <Heading as="h1" className={headingSizeClass('h1')}>
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
            <Rail label={tocLabel} entries={contents} currentHref={currentHref} unnamed={unnamedToc} />
          </aside>
        ) : null}
      </div>

      {footer}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * The two rails at lg
 * ------------------------------------------------------------------ */

/**
 * One rail: a region that scrolls inside a bound against the viewport, with the
 * cut at its foot marked so the rows below it are discoverable.
 *
 * **The sticky offset is on this wrapper and not on the scroll region, and the
 * reason is the fade.** The fade has to be pinned to the foot of the region while
 * the region scrolls, and nothing inside a scroll container stays put while that
 * container scrolls: a gradient or a mask written into the scrollport travels with
 * the content and so marks nothing once the reader has scrolled. The wrapper is
 * the element that travels, so the fade is absolutely positioned against it and
 * the `<nav>` inside is free to be nothing but the scroll region.
 *
 * The cap is `100svh` less the sticky offset plus the gap under it, and `svh` is
 * the smallest viewport height rather than the largest, which is the direction that
 * matters here. `dvh` would grow to the full height the moment a mobile browser's
 * URL bar retracted, and a sticky region measured against a viewport taller than
 * the one on screen is a region whose foot is below the bottom of the screen
 * while it is pinned, which is the one state the bound exists to prevent. `svh`
 * is never taller than what is visible, so `top` plus `max-h` is always inside the
 * viewport and the rail's foot always clears it. `top-20` is 5rem and the cap is
 * the viewport less 7rem, so the foot sits 2rem above the bottom edge at every
 * window height; a short window makes the rail shorter and does not make it
 * taller than the space it is pinned in.
 *
 * `padding-bottom` is the same height as the fade, and it is what makes the fade
 * honest. The gradient falls on the last 2rem of whatever the scrollport is
 * showing, so with the padding reserved it falls on empty space once the reader
 * has reached the end and on content only while there is more below. Without it
 * the same gradient permanently washes the bottom of the last row, which is the
 * usual cost of a fade and the reason the padding is part of the answer rather
 * than a detail.
 *
 * `unnamed` is carried on the `<nav>` rather than logged, for the reason
 * `unnamedIn` gives.
 */
function Rail({
  label,
  entries,
  currentHref,
  unnamed,
}: {
  label: string
  entries: readonly DocsNavEntry[]
  currentHref?: string
  unnamed: number
}) {
  return (
    <div className="relative lg:sticky lg:top-20">
      <nav
        aria-label={label}
        data-unnamed-entries={unnamed}
        className="lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pe-4 lg:pb-8"
      >
        <NavList entries={entries} currentHref={currentHref} depth={0} />
      </nav>
      {/*
        The cut, marked. Empty, hidden from assistive technology and transparent
        to a pointer, and it sits in the wrapper rather than inside the list, so
        it is neither a row nor a thing a screen reader reaches. `from-background`
        is the page ground the rail is drawn on, which is what the library's own
        base layer puts on `<body>`; a consumer that puts the Page on a surface of
        its own is the one arrangement where that wash is the wrong value, and it
        is a Page that paints no surface of its own precisely so that this holds.
      */}
      <div
        aria-hidden="true"
        data-slot="docs-rail-fade"
        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent"
      />
    </div>
  )
}

/**
 * One tree behind a native disclosure, for the widths where there is no rail.
 *
 * `<details>` rather than a Component, and the whole argument is that it needs no
 * runtime: the platform holds the expanded state, the control is in the Tab order
 * with a real expanded state, and the Page stays a server Component. A Page that
 * shipped a client disclosure for this would put JavaScript on every documentation
 * page in the family to replace a browser feature that has been in the platform
 * since 2018.
 *
 * **The summary's word is the caller's.** `navLabel` and `tocLabel` are already
 * required props and already name these two navigations for a screen reader, so
 * the control that opens one says the same thing the region inside it is called
 * and the Page ships no word of its own. Nothing suppresses the browser's own
 * disclosure marker or its own focus ring: the marker is the cheapest honest
 * signal that the row is a disclosure, and `py-3` puts the target at 44 pixels for
 * a coarse pointer without a variant.
 */
function Disclosure({
  label,
  unnamed,
  children,
}: {
  label: string
  unnamed: number
  children: ReactNode
}) {
  return (
    <details data-slot="docs-nav-disclosure">
      <summary className="text-foreground cursor-pointer py-3 text-sm font-medium">{label}</summary>
      <nav aria-label={label} data-unnamed-entries={unnamed} className="pb-4">
        {children}
      </nav>
    </details>
  )
}

/* ------------------------------------------------------------------ *
 * The tree
 * ------------------------------------------------------------------ */

/**
 * The address an entry has, or `undefined` when it has none.
 *
 * Blank counts as none, which is not pedantry. All three consumer adapters write
 * `url: node.index?.url ?? ''` for a folder holding no index, so the empty string
 * is how they spell "this group is not a route", and a guard that read only
 * `=== undefined` let that same spelling through to the renderer on the arm where
 * it means something else entirely.
 */
function addressOf(href: string | undefined): string | undefined {
  return href !== undefined && href.trim() !== '' ? href : undefined
}

/**
 * Whether an entry has words to be called by.
 *
 * Blank counts as none, for the same reason `addressOf` counts it: all three
 * consumer adapters build a title out of whatever their content pipeline produced,
 * and one of them maps a heading whose title arrives as a React element to the
 * empty string. A row is rendered from a string, and a string of spaces is not a
 * name. It is read here rather than at each use because `destinationOf` decides
 * between a link and a label, the renderer decides between a row and nothing, and
 * the counter decides how many rows went missing, and three answers to one
 * question is how a fourth grows.
 */
function named(entry: { title: string }): boolean {
  return entry.title.trim() !== ''
}

/**
 * The address an entry is reachable at, or `undefined` when it is not a
 * destination at all.
 *
 * An entry is a destination only when it has an address AND words, and both
 * halves live here so that one rule answers for both surfaces that read a tree.
 * The rail asks it to decide between an anchor and a label; the pager asks it to
 * decide between a neighbour and nothing. Two places deciding that separately is
 * how one malformed row becomes a nameless anchor in the rail and a nameless
 * `Next` link under it.
 */
function destinationOf(entry: DocsNavPage | DocsNavGroup): string | undefined {
  return named(entry) ? addressOf(entry.href) : undefined
}

/**
 * How many entries in a tree the Page cannot name, and therefore did not draw.
 *
 * **It is counted rather than swallowed, and the place it is counted on is the
 * rail itself.** `Diagram` answers a dropped relation the same way, with
 * `data-unresolved-relations` on the drawing, and the argument is the same one: a
 * row that did not draw is a fact about the caller's data, and a fact that leaves
 * no trace is a defect the next reader has to rediscover from a screenshot. The
 * number is on the element rather than in a console because a caller reads the
 * element and does not read the console.
 *
 * Three things are counted, because three things go missing rather than two:
 * a page with no words, which is dropped whole; a group with no words, whose
 * label is not rendered while its pages still are; and a group with neither words
 * nor children, which has nothing left to draw and is dropped whole.
 */
function unnamedIn(entries: readonly DocsNavEntry[] | undefined): number {
  let count = 0
  for (const entry of entries ?? []) {
    if (entry.type === 'divider') continue
    if (!named(entry)) count += 1
    if (entry.type === 'group') count += unnamedIn(entry.items)
  }
  return count
}

/**
 * Reads a tree before any of it renders, and refuses the one shape it cannot
 * render honestly.
 *
 * A page entry whose address is empty or blank is an entry whose whole content is
 * a route the consumer does not have. There is no honest rendering of it: a label
 * in its place would hide a page the tree is missing rather than report it, and an
 * anchor would be a control a reader can focus and cannot operate. So the Page
 * throws, naming the entry, which is the opposite of copy and reaches a developer
 * rather than a reader.
 *
 * Two things are deliberate here. The pass is in the component and not in a
 * renderer, so it runs once for both trees and cannot be reached only on the path
 * that happens to draw the bad row. And a GROUP is not refused: no address is a
 * documented state for a group and the empty string is how all three consumers
 * already spell it, so it renders as a label. Only the arm where an address is
 * the entire entry is a fault.
 */
function readTree(entries: readonly DocsNavEntry[] | undefined, source: 'nav' | 'toc'): void {
  for (const entry of entries ?? []) {
    if (entry.type === 'divider') continue
    if (entry.type === 'group') {
      readTree(entry.items, source)
      continue
    }
    if (addressOf(entry.href) === undefined) {
      throw new Error(
        `docs-shell: a page entry in the ${source} has no address, and an anchor with no address is a ` +
          'control a reader can focus and cannot follow. Give the entry the address its page is read at, or ' +
          `remove it from the tree. Its title is ${JSON.stringify(entry.title)}.`,
      )
    }  }
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

  const href = destinationOf(entry)

  if (entry.type === 'group') {
    // A group with no words and no pages has nothing left to draw, and a `<li>`
    // holding an empty `<div>` is the same empty row the page arm used to render.
    // Dropping it costs nothing, because there was nothing in it.
    if (!named(entry) && entry.items.length === 0) return null
    return (
      <li data-slot="docs-nav-group">
        <div className="flex flex-col gap-1">
          {/*
            The one rule this whole arrangement turns on, and it has two halves
            rather than one. An entry is a destination when it has an address AND
            words to call it by; anything else is a label, which carries no `href`,
            is not focusable, and cannot be reached by Tab. There is no third arm
            and no anchor with an empty `href`, because both publish an address
            that resolves to nothing. `destinationOf` is the whole of that rule and
            the pager asks it the same question, so a row that is a label here is
            not a neighbour there.

            A group whose title cannot be rendered draws no label at all rather than
            an empty one, and keeps its pages: the heading went missing, not the
            section, and the count of headings that went missing is on the rail.
          */}
          {!named(entry) ? null : href === undefined ? (
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
              href={href}
              aria-current={currentHref === href ? 'page' : undefined}
              className={cn(
                'hover:text-foreground rounded-sm text-sm font-semibold tracking-tight transition-colors duration-fast ease-out',
                under(href, currentHref) ? 'text-foreground' : 'text-muted-foreground',
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

  // The page arm, and there is one shape of it left. `readTree` refused a page
  // with no address above and named the entry, so every page that reaches here has
  // one, and a page with no words is not rendered at all rather than rendered as
  // a label: a link with no accessible name is announced as "link" and nothing
  // else, and a blank row is not a label either because a label is words.
  if (!named(entry)) return null
  return (
    <li data-slot="docs-nav-page">
      <a
        data-slot="docs-nav-link"
        href={href}
        aria-current={currentHref === href ? 'page' : undefined}
        className={cn(
          '-ms-px block border-l-2 py-1 ps-3 text-sm transition-colors duration-fast ease-out',
          currentHref === href
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
 *
 * The row a reader can click and the row the pager can reach are decided by the
 * SAME function, `destinationOf`, and a row with no words is now dropped from the
 * rail as well, so the two surfaces agree twice over rather than once by accident.
 * The defect this replaced was a nameless anchor in the rail and a `Next` link
 * under it carrying the text of whichever entry happened to follow, published
 * from one malformed row. Deriving without asking produced the first and a
 * separate opinion produced the second; asking once produces neither.
 */
function flatten(entries: readonly DocsNavEntry[], into: Neighbour[] = []): Neighbour[] {
  for (const entry of entries) {
    if (entry.type === 'divider') continue
    const href = destinationOf(entry)
    if (href !== undefined) into.push({ title: entry.title, href })
    if (entry.type === 'group') flatten(entry.items, into)
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
 *
 * The group's own address is read through `addressOf`, like every other read of
 * it. A group whose `href` is the empty string is a label, and a blank string
 * handed to `under` as though it were a route matches every absolute address on
 * the site, which is every label-only section claiming to be the current one at
 * once.
 */
function containsHref(group: DocsNavGroup, currentHref: string | undefined): boolean {
  if (under(addressOf(group.href), currentHref)) return true
  return group.items.some((entry) => {
    if (entry.type === 'page') return under(entry.href, currentHref)
    if (entry.type === 'group') return containsHref(entry, currentHref)
    return false
  })
}

export default DocsShell

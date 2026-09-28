/**
 * The Section manifest: the seven Sections, in reading order, and every route
 * they moved from.
 *
 * **One list, four consumers.** The header row, the Catalogue's own segments,
 * the Worker's mirrored-document prefixes and the redirect table all read this
 * module. They were four hand-kept lists that could each fall behind the other
 * three, and two of the four failed silently: a stale prefix in the Worker's
 * list is a 404 on a machine-readable surface, and a route added to the content
 * tree with no entry in the redirect table is a bookmark that dead-ends. The
 * site's content-join gate now reads the same module, which is what makes the
 * comparison between "what was published", "what is published" and "what
 * redirects" a set comparison rather than a spot check. A fifth list joined it,
 * the live routes below, because the same silence applies to a route no
 * navigation links. The search index reads it too, for `searched` below, because
 * which pages a reader can find is a fact about the Sections rather than a
 * detail of the search module.
 *
 * **This module imports nothing.** That is load-bearing in two directions. The
 * header's row is rendered by a client component, so this file must not reach
 * for the routing tree or `fumadocs-core` or the generated artefacts, or a list
 * of Section segments would drag the docs library into the browser. And the
 * Worker's bundler pulls this file in beside its own routing predicates, where a
 * module graph is not wanted either. Everything here is a literal, a type and a
 * pure function over those literals, and `test/routes.test.ts` asserts the
 * absence of an import rather than trusting this paragraph.
 *
 * **Plurality is the rule that names the segments.** A prose Section is one body
 * of knowledge and takes a singular route; a catalogue Section is a collection of
 * many Items and takes a plural one. That is why `/overview`, `/foundation` and
 * `/content` sit beside `/components`, `/blocks`, `/pages` and `/changelogs`, and
 * why `/foundation` corrects a live inconsistency in which `/foundations` was
 * plural beside a singular `/content`. The rule is stated here as data because
 * the gate reads it: a Section declared prose that holds many pages of its own,
 * or a catalogue Section holding one, is a finding rather than a naming habit
 * nobody checks.
 *
 * **The moves are a rule, not a list of URLs.** Each move is a prefix and its
 * replacement, so a page added to a moved Section tomorrow is redirected by the
 * same line that redirects today's. The one exception is a page that moved
 * *within* its Section, which is stated by its route after the prefix rule has
 * been applied, because that is the only order in which the pair can be read.
 * `/docs/agent-workflow` therefore becomes `/overview/agent-workflow` by the
 * prefix rule and `/overview/using-llms` by the rename, and a reader holding the
 * old link lands on the page about using LLMs rather than on a page that no
 * longer exists.
 */

/** A Section of the documentation, in the order a reader meets them. */
export type SiteSection = {
  /** The route segment the Section is published at, with no leading slash. */
  segment: string
  /** The label a reader is shown, in the header and in the sidebar. */
  title: string
  /** True for a Section that is one body of knowledge rather than a collection. */
  prose: boolean
  /**
   * False for a Section that is a dated record of what changed rather than
   * reference material, so the client's search index does not carry its pages.
   *
   * This is the only field here that is about discovery rather than routing, and
   * it is here because it is a fact about the Section rather than about the
   * search module: a Section a reader searches for and a Section a reader walks
   * to are different claims, and only the manifest knows which is which. A
   * Section added tomorrow states its answer here rather than inheriting one.
   *
   * Out of the index is not out of the site. The routes, the navigation, the
   * Corpus, the Markdown mirror and the MCP tools are separate surfaces and none
   * of them reads this field, which is the point: a page a reader is given by
   * link, by URL or by an agent is a page the site still publishes.
   */
  searched: boolean
}

/**
 * The seven Sections, in reading order: start here, then the raw materials, then
 * the rules for writing, then the parts, then the history.
 *
 * The catalogue Sections nest under Components by Category, which is the one
 * asymmetry in the tree, and the Foundation Section holds the live pack reader as
 * a route inside it. Neither is visible here: the nesting is `catalogue.ts`'s
 * ordering, and the reader is `LIVE_ROUTES` below.
 *
 * The last Section is the one a reader does not search. `searched` is what says
 * so, and it is the only entry here that answers false.
 */
export const SECTIONS: readonly SiteSection[] = [
  { segment: 'overview', title: 'Overview', prose: true, searched: true },
  { segment: 'foundation', title: 'Foundation', prose: true, searched: true },
  { segment: 'content', title: 'Content', prose: true, searched: true },
  { segment: 'components', title: 'Components', prose: false, searched: true },
  { segment: 'blocks', title: 'Blocks', prose: false, searched: true },
  { segment: 'pages', title: 'Pages', prose: false, searched: true },
  { segment: 'changelogs', title: 'Changelogs', prose: false, searched: false },
] as const

/** The one Section by its route segment, or undefined when no Section claims it. */
export function sectionFor(segment: string): SiteSection | undefined {
  return SECTIONS.find((section) => section.segment === segment)
}

/**
 * The Section segments the client's search index does not carry, read off the
 * manifest rather than listed.
 *
 * A set rather than a filter over `SECTIONS` on every call, because this module
 * is in the header's client bundle and the answer is asked once per page on
 * every build. The values are the manifest's own segments, so the exclusion
 * cannot name a Section the manifest does not declare.
 */
const UNSEARCHED = new Set(SECTIONS.filter((section) => !section.searched).map((section) => section.segment))

/**
 * Whether the client's search index carries the page at a route.
 *
 * True by default, and the exclusion has to be asked for, because every route
 * the site publishes is a page a reader may be looking for until a Section says
 * otherwise. Two things follow from that default and both matter:
 *
 * A Section that is out of the index keeps its landing page, because the landing
 * page is authored prose that says what the Section is and links what is inside
 * it, so a reader who searches for a changelog still lands somewhere that
 * answers. Only the pages inside it go.
 *
 * A route no Section claims is in the index, which covers a live reader and
 * anything published outside a Section. The predicate is a pure function over
 * the manifest's own literals, so it costs the header's bundle one Set and no
 * module graph.
 */
export function isSearchedRoute(route: string): boolean {
  const segment = route.split('/')[1] ?? ''
  return !UNSEARCHED.has(segment) || route === `/${segment}`
}

/**
 * A route inside a Section that renders a live reader rather than a document.
 *
 * The pack reader is the reason this exists. It is a component that reads the
 * token package's emitted output at build time, so there is no content file for
 * the corpus to walk, nothing for a `meta.json` to order and no document behind
 * it in the routing tree. It is a page of the Foundation Section all the same,
 * and this is the one place that says so.
 *
 * **It is listed in its Section, not in the header row.** A live reader is a
 * page of the Section that owns it, beside that Section's own pages, so a
 * reader who opens Foundation finds it in the one navigation scoped to
 * Foundation. The header row is the shape of the whole documentation, where a
 * control is a peer of the seven Sections, and the reader is not a Section and
 * does not claim to be one.
 *
 * **The routing tree is not asked to hold it, and that is deliberate.** A folder
 * cannot list a page it has no file for, so the route is added to the navigation
 * rather than to the tree, and `nav.ts` places it. The trade is why the site's
 * gate reads this list: a route the navigation links and no document backs is
 * exactly the failure this restructure exists to catch, so the gate asserts that
 * every route here is served by a specific App Router page, is linked by the
 * published navigation, is linked from its Section's index, and is not also a
 * content file's route.
 */
export type SectionLiveRoute = {
  /** The route segment of the Section it is listed inside. */
  section: string
  /** The label a reader is shown beside that Section's own pages. */
  title: string
  /** The route it is answered at, with a leading slash and no trailing one. */
  href: string
}

/**
 * The live routes, one per Section that holds one.
 *
 * Themes is a foundational concern made live, so it sits in Foundation beside
 * the token pages it renders, at the route the redirect table already sends
 * `/themes` to. The old route keeps resolving through `MOVES` below, which is
 * generated rather than hand-kept, so this list and the redirect serving it are
 * one decision stated twice and compared once by `test/routes.test.ts`.
 */
export const LIVE_ROUTES: readonly SectionLiveRoute[] = [
  { section: 'foundation', title: 'Themes', href: '/foundation/themes' },
] as const

/**
 * The live routes one Section lists, in the order this module declares them.
 *
 * Matched on the Section's own route, so a live route declared inside a Section
 * the tree does not publish as a top-level group is simply not placed. That is
 * not a silent omission: the gate asserts every route here is linked by the
 * published navigation, and a route the tree has no place for is one the
 * navigation does not link.
 */
export function liveRoutesFor(section: string): readonly SectionLiveRoute[] {
  return LIVE_ROUTES.filter((entry) => entry.section === section)
}

/**
 * A route that moved, as a prefix and its replacement.
 *
 * Three entries, and two of them are a whole Section rather than a page, so the
 * rule covers every page under it. The third is `/themes`, a single route that
 * joined the Foundation Section, and the same prefix rule serves it: it has no
 * children today, and if it ever does they come with it.
 *
 * That entry's destination is the live route's own address, so the fact is stated
 * in two lists here. A table of prefix rules cannot be derived from a list of
 * routes, and joining the two would mean computing the table at import time, which
 * this module deliberately does not do: it is literals and pure functions over
 * them, because the header's row is a client bundle. So the duplication is
 * compared instead, by `test/routes.test.ts`, which is why a reader's route
 * cannot move without the redirect following it.
 */
export type SectionMove = {
  /** The route, or route prefix, a reader or an agent may still be holding. */
  from: string
  /** What it is at now, with no trailing slash. */
  to: string
}

export const MOVES: readonly SectionMove[] = [
  { from: '/docs', to: '/overview' },
  { from: '/foundations', to: '/foundation' },
  { from: '/themes', to: '/foundation/themes' },
] as const

/**
 * A page that moved within its Section, keyed by the route it has after the
 * prefix rule has been applied.
 *
 * The page becomes the page about using LLMs, and the old name is not merely a
 * Section the redirect points at: `/docs/agent-workflow` resolves, so it has to
 * resolve to the page that exists rather than to a Section landing page that
 * does not mention it.
 */
const RENAMED: Readonly<Record<string, string>> = {
  '/overview/agent-workflow': '/overview/using-llms',
}

/** The rest of a pathname below a prefix, including the slash, or null. */
function restUnder(prefix: string, pathname: string): string | null {
  if (pathname === prefix) return ''
  if (!pathname.startsWith(`${prefix}/`)) return null
  return pathname.slice(prefix.length)
}

/**
 * Where a moved route now lives, or null when nothing moved.
 *
 * A 301 rather than a 302 because the move is permanent: a cached index an agent
 * read before the change names the old route, and the correct answer to that is
 * the route the page has now, every time, for as long as the old link exists.
 * There is no pointer page and no 404, because both would be a reader or an
 * agent being told the change happened when it did not ask.
 */
export function redirectFor(pathname: string): string | null {
  for (const move of MOVES) {
    const rest = restUnder(move.from, pathname)
    if (rest === null) continue
    const moved = `${move.to}${rest}`
    return RENAMED[moved] ?? moved
  }
  return null
}

/**
 * Every route segment that carries a mirrored Markdown document.
 *
 * The Corpus writes one mirror per page under `md/<segment>/<slug>.md`, and the
 * Worker serves it at `/<segment>/<slug>.md` by rewriting the path. The set of
 * segments that rewrite is therefore the set of Sections, and it used to be a
 * hand-kept list of six that had already fallen behind by one: the Changelogs
 * Section is advertised in `llms.txt` as `https://prism.nanisoft.com/changelogs/
 * prism-ui.md`, and that URL answered 404 because `changelogs` was not in the
 * list. A stale entry in either direction is a 404 on a surface an agent reads
 * rather than a page a person reads, which is why the site gate now asserts this
 * list against `wrangler.jsonc` rather than leaving the two to be kept in step
 * by eye.
 */
export const MD_SECTIONS: readonly string[] = SECTIONS.map((section) => section.segment)

/**
 * The prefixes the Worker has to be invoked for, in the order the config lists
 * them.
 *
 * Two families and the MCP route. A mirrored document, because the mirror lives
 * under `out/md/**` and Cloudflare only serves it if the Worker is invoked
 * first. A moved route, because the route it moved from has no asset behind it
 * any more, so asset-first serving would answer 404 before the Worker ever saw
 * the request. Both are globs rather than route patterns on purpose: a
 * route-style `:slug*.md` silently never matches, which is why the config uses
 * globs and why this list is compared against it as a set.
 */
export const RUN_WORKER_FIRST: readonly string[] = [
  '/mcp',
  '/mcp/*',
  ...MOVES.flatMap((move) => [move.from, `${move.from}/*`]),
  ...MD_SECTIONS.map((segment) => `/${segment}/*.md`),
]

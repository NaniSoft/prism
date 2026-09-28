/**
 * The site Worker's routing predicates.
 *
 * Static assets are served asset-first, so the Worker is invoked only for the
 * lanes that cannot be an asset: the MCP endpoint (which needs POST and DELETE),
 * the pretty `.md` mirror rewrite, and the routes that moved, which have no
 * asset behind them any more and would be answered with the 404 page before this
 * code ran.
 *
 * Neither list is written here any more. The mirrored-document prefixes and the
 * moved routes both come from `src/lib/sections.ts`, the manifest the header row
 * and the Catalogue's segments are read from, so a Section that exists is a
 * Section whose mirror resolves and a route that moves is a route that
 * redirects. The set of prefixes the Worker has to be invoked for is derived from
 * the same module, and the site's content-join gate asserts that
 * `wrangler.jsonc`'s `run_worker_first` equals it: a stale entry in either is a
 * 404 on a machine-readable surface, and a route-style `:slug*.md` pattern
 * silently never matches, which is why the config uses globs.
 */
import { MD_SECTIONS } from '../src/lib/sections'

export { MD_SECTIONS }

/** The exact MCP route, plus its subtree. `/mcp/` is not the route. */
export function isMcpPathname(pathname: string): boolean {
  return pathname === '/mcp' || pathname.startsWith('/mcp/')
}

/**
 * The mirrored Markdown document a pretty path names, or null.
 *
 * A mirror is always one route segment deeper than the Section it belongs to, so
 * `/<section>/<slug>.md` is the only shape that can name one and the pattern says
 * so rather than matching a path that does not exist. The query and the fragment
 * are not part of the name: `url.pathname` carries neither, so the Worker is
 * handed a path with nothing to strip and a pattern that fails on one is a
 * finding rather than a rewrite that never happens.
 */
export function rewriteMdPathname(pathname: string): string | null {
  const match = /^\/([^/]+)\/(.+)\.md$/.exec(pathname)
  if (!match) return null
  const [, section, rest] = match
  if (!section || !rest) return null
  if (!(MD_SECTIONS as readonly string[]).includes(section)) return null
  return `/md/${section}/${rest}.md`
}

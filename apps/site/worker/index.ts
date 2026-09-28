import { redirectFor } from '../src/lib/sections'

import { handleMcp } from './mcp'
import { isMcpPathname, rewriteMdPathname } from './router'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

/**
 * The site Worker.
 *
 * Static assets are served asset-first, so only the lanes that cannot be an
 * asset come through here: the `/mcp` endpoint, which needs POST and DELETE and
 * is served by the MCP handler (ticket 13); the pretty `.md` rewrite, which has
 * to catch a path before `not_found_handling` turns it into a 404; and a route
 * that moved, which has no asset behind it at all and would be answered with the
 * 404 page if asset serving got there first.
 *
 * Every one of those three needs to be in `wrangler.jsonc`'s `run_worker_first`
 * to be reached, which is why the config's list is generated from the same
 * manifest the predicates read and the site's content-join gate compares the two
 * as sets.
 *
 * **The redirect is a 301 and it is the whole of the contract.** The Corpus is
 * rebuilt per release and points at the new routes, and every route that was
 * ever published still resolves, so an agent holding a cached `llms.txt` from
 * before the move is not told anything has changed and is not sent to a pointer
 * page that would tell it. There is no query of the user and no 404: the move is
 * permanent, and a permanent move answers permanently.
 */
const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (isMcpPathname(url.pathname)) {
      return handleMcp(request, env, ctx)
    }

    const moved = redirectFor(url.pathname)
    if (moved !== null) {
      // Absolute, because the `Location` of a permanent redirect is read by
      // fetchers, by `curl -L` and by an agent resolving a cached URL, and a
      // relative one is resolved against whatever base the client happened to
      // use. The query and the fragment are carried over: a link with either
      // names the same page, and dropping them would silently change what a
      // reader or an agent asked for.
      const target = new URL(moved, url)
      target.search = url.search
      target.hash = url.hash
      return new Response(null, {
        status: 301,
        headers: { location: target.toString() },
      })
    }

    const mirrored = rewriteMdPathname(url.pathname)
    if (mirrored) {
      return env.ASSETS.fetch(new Request(new URL(mirrored, url), request))
    }

    return env.ASSETS.fetch(request)
  },
}

export const handleRequest = worker.fetch
export default worker

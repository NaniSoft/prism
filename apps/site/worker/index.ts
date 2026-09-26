import { rewriteMdPathname } from './router'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

/**
 * The site Worker.
 *
 * Static assets are served asset-first, so only the two things that cannot be an
 * asset come through here: the `/mcp` endpoint, which needs POST and DELETE, and
 * the pretty `.md` rewrite, which has to catch a path before
 * `not_found_handling` turns it into a 404.
 *
 * The MCP tool surface is ticket 13's; until it lands the endpoint answers 501
 * rather than pretending to be a 404 of a missing asset.
 */
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/mcp' || url.pathname.startsWith('/mcp/')) {
      return new Response(
        JSON.stringify({
          error: 'The MCP endpoint ships with the corpus projection (ticket 13).',
        }),
        { status: 501, headers: { 'content-type': 'application/json' } },
      )
    }

    const mirrored = rewriteMdPathname(url.pathname)
    if (mirrored) {
      return env.ASSETS.fetch(new Request(new URL(mirrored, url), request))
    }

    return env.ASSETS.fetch(request)
  },
}

export default worker

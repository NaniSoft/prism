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
 * is served by the MCP handler (ticket 13), and the pretty `.md` rewrite, which
 * has to catch a path before `not_found_handling` turns it into a 404.
 *
 * `/mcp` and `/mcp/*` are also in `wrangler.jsonc`'s `run_worker_first`, so the
 * request reaches this Worker before asset serving can answer it.
 */
const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (isMcpPathname(url.pathname)) {
      return handleMcp(request, env, ctx)
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

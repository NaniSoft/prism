// Worker routing (tickets 03 + 05 + 16): one Worker serves the static site,
// the prism-llms `.md` mirror, and — from ticket 22 — the MCP endpoint.
//
// `run_worker_first` in wrangler.jsonc limits Worker invocations to `/mcp`
// and the five sections' `.md` requests; everything else is served straight
// from Static Assets without touching this code. The `.md` recovery is
// ticket 16's single prefix rule: `/<section>/<slug>.md` →
// `/md/<section>/<slug>.md` (prism-llms' mirror tree).

/**
 * The Static Assets binding (wrangler.jsonc `assets.binding`). Typed
 * structurally — the worker typechecks in the same TS program as the site, so
 * `@cloudflare/workers-types` (whose globals clash with the DOM lib) is not a
 * dependency.
 */
export interface AssetsFetcher {
  fetch: (request: Request) => Promise<Response>;
}

export interface Env {
  /** Workers Static Assets (wrangler.jsonc `assets.binding`). */
  ASSETS: AssetsFetcher;
}

/** The five content sections whose `.md` URLs negotiate prism-llms artifacts. */
export const MD_SECTIONS = ['docs', 'components', 'blocks', 'pages', 'blog'] as const;

/**
 * The one prefix rule. Returns the asset pathname to fetch, or undefined when
 * the request is not an `.md` negotiation for a known section.
 */
export function rewriteMdPathname(pathname: string): string | undefined {
  if (!pathname.endsWith('.md')) return undefined;
  const isKnownSection = MD_SECTIONS.some(
    (section) => pathname === `/${section}` || pathname.startsWith(`/${section}/`),
  );
  if (!isKnownSection) return undefined;
  return `/md${pathname}`;
}

function isMcpPath(pathname: string): boolean {
  return pathname === '/mcp' || pathname.startsWith('/mcp/');
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (isMcpPath(url.pathname)) {
    // Ticket 22 replaces this stub's module with createMcpHandler over
    // createPrismMcpServer(data.json) — no config or routing changes needed.
    const { handleMcp } = await import('./mcp.js');
    return handleMcp(request);
  }

  const mdPath = rewriteMdPathname(url.pathname);
  if (mdPath) {
    return env.ASSETS.fetch(new Request(new URL(mdPath, url.origin), request));
  }

  return env.ASSETS.fetch(request);
}

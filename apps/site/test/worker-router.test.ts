// Worker routing (ticket 21): the one `.md` prefix rule and the /mcp seam,
// exercised through the real handleRequest against a stubbed ASSETS binding.

import { describe, expect, it, vi } from 'vitest';

import { MD_SECTIONS, handleRequest, rewriteMdPathname, type Env } from '../worker/router.js';

function stubEnv(html = '<html>asset</html>'): { env: Env; calls: Request[] } {
  const calls: Request[] = [];
  const env: Env = {
    ASSETS: {
      fetch: vi.fn(async (input: Request | string | URL) => {
        const request = input instanceof Request ? input : new Request(input);
        calls.push(request);
        return new Response(html, { status: 200 });
      }),
    } as unknown as Env['ASSETS'],
  };
  return { env, calls };
}

function requestFor(path: string, method = 'GET', headers: Record<string, string> = {}): Request {
  // Host is pinned explicitly: Node's fetch hides it on absolute URLs, but the
  // MCP lane's hostname allowlist (and a real Worker) always see one.
  return new Request(`https://prism.nanisoft.com${path}`, { method, headers: { host: 'prism.nanisoft.com', ...headers } });
}

describe('rewriteMdPathname', () => {
  it('rewrites the five sections by the single prefix rule', () => {
    expect(rewriteMdPathname('/docs/getting-started.md')).toBe('/md/docs/getting-started.md');
    expect(rewriteMdPathname('/components/button.md')).toBe('/md/components/button.md');
    expect(rewriteMdPathname('/blocks/component-demo.md')).toBe('/md/blocks/component-demo.md');
    expect(rewriteMdPathname('/pages/docs-shell.md')).toBe('/md/pages/docs-shell.md');
    expect(rewriteMdPathname('/blog/hello-world.md')).toBe('/md/blog/hello-world.md');
  });

  it('covers the whole prism-llms mirror: theme atoms and nested slugs', () => {
    expect(rewriteMdPathname('/docs/a/b/c.md')).toBe('/md/docs/a/b/c.md');
  });

  it('ignores non-md requests, unknown sections, and md-shaped noise', () => {
    expect(rewriteMdPathname('/components/button')).toBeUndefined();
    expect(rewriteMdPathname('/llms.txt')).toBeUndefined();
    expect(rewriteMdPathname('/md/components/button.md')).toBeUndefined(); // already-mirrored path
    expect(rewriteMdPathname('/unknown/button.md')).toBeUndefined();
    expect(rewriteMdPathname('/componentsx/button.md')).toBeUndefined();
  });

  it('exports exactly the five sections the wrangler config covers', () => {
    expect(MD_SECTIONS).toEqual(['docs', 'components', 'blocks', 'pages', 'blog']);
  });
});

describe('handleRequest', () => {
  it('serves plain asset requests untouched', async () => {
    const { env, calls } = stubEnv();
    const response = await handleRequest(requestFor('/components/button'), env);
    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe('https://prism.nanisoft.com/components/button');
  });

  it('rewrites .md requests into the /md mirror, preserving method', async () => {
    const { env, calls } = stubEnv('# mirrored markdown');
    const response = await handleRequest(requestFor('/components/button.md'), env);
    expect(await response.text()).toBe('# mirrored markdown');
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe('https://prism.nanisoft.com/md/components/button.md');
    expect(calls[0]!.method).toBe('GET');

    await handleRequest(requestFor('/blog/hello.md', 'HEAD'), env);
    expect(calls[1]!.method).toBe('HEAD');
  });

  it('routes /mcp into the live MCP lane — never to assets (ticket 22)', async () => {
    const { env, calls } = stubEnv();
    // A stateless transport answers a bare GET (no server stream to offer) and
    // an unknown method with a protocol-level 405 — proof the lane is wired,
    // not stubbed. Full protocol round-trips: worker-mcp.test.ts.
    for (const method of ['GET', 'PUT']) {
      const response = await handleRequest(requestFor('/mcp', method), env);
      expect(response.status, method).toBe(405);
      expect(calls, method).toHaveLength(0);
    }

    const trailing = await handleRequest(requestFor('/mcp/', 'POST'), env);
    expect(trailing.status).toBe(404); // the handler's route match is exact
    expect(calls).toHaveLength(0);
  });
});

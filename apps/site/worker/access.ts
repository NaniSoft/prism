/**
 * The Cloudflare Access escalation for `/mcp`, pre-written but not enabled.
 *
 * Version one is public read-only: the corpus is public (npm ships it too), the
 * tools are pure reads over an immutable blob, and the primary client wants
 * zero-friction auth. This wrapper is applied to the handler already, so
 * enabling it is a flip plus the verification body, not a rewiring.
 *
 * The flip trigger, named so it is not inherited by silence: a tool gains
 * anything non-public (`org-internal examples`, write-back, telemetry, or a
 * per-user quota).
 *
 * To enable:
 *   1. Put a Cloudflare Access application in front of `prism.nanisoft.com/mcp`
 *      with an OIDC IdP and the redirect URI `<worker>/callback`.
 *   2. Provide the secrets `ACCESS_CLIENT_ID`, `ACCESS_CLIENT_SECRET`,
 *      `ACCESS_TOKEN_URL`, `ACCESS_AUTHORIZATION_URL`, `ACCESS_JWKS_URL` and
 *      `COOKIE_ENCRYPTION_KEY`, plus a service token for CI.
 *   3. Verify the `Cf-Access-Jwt-Assertion` header against `ACCESS_JWKS_URL`
 *      and the application audience in the block below, then set
 *      `MCP_ACCESS_ENABLED` to `true`.
 *
 * The factory and all eight tools are pure and do not change; only this wrapper
 * does. `@cloudflare/workers-oauth-provider` is deliberately not adopted.
 */
import type { StatelessMcpHandler } from 'agents/mcp/server'

export const MCP_ACCESS_ENABLED = false

/**
 * Wrap a stateless MCP handler with the Access gate. While the escalation is
 * disabled this is a pass-through, so the applied handler and the unwrapped one
 * are identical in behaviour.
 */
export function withCloudflareAccess(handler: StatelessMcpHandler): StatelessMcpHandler {
  if (!MCP_ACCESS_ENABLED) return handler

  return Object.assign(
    async (request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> => {
      const assertion = request.headers.get('cf-access-jwt-assertion')
      if (!assertion) {
        return new Response('Cloudflare Access required', { status: 401 })
      }
      // Verify `assertion` against `ACCESS_JWKS_URL` and the Access application
      // audience before delegating. Omitted until the escalation is enabled.
      return handler(request, env, ctx)
    },
    { fetch: handler.fetch, notify: handler.notify },
  )
}

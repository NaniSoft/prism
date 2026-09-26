/**
 * The Cloudflare Workers execution context, declared locally.
 *
 * The site's tsconfig includes the DOM lib for React and Next, and adding
 * `@cloudflare/workers-types` alongside it invites duplicate global
 * declarations for `Request`, `Response` and friends. The Worker only uses
 * `waitUntil` (and `passThroughOnException` through the handler), so a minimal
 * global declaration is enough and keeps the two libs from colliding.
 */
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException(): void
}

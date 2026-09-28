/**
 * The protocol identity the MCP lane reports.
 *
 * The name is the protocol identity and does not move with a release, so it is
 * authored here. The version does move, so it is not authored here: it is
 * stamped from this package's own `package.json` by `scripts/stamp-built.mjs`,
 * which the build, the type-check and the tests all run first. Written by hand
 * it was a second place every release had to remember, and it stayed `0.1.0`
 * through a `0.2.0` release, so the server told every consumer a version it had
 * stopped being.
 */
import { SERVER_VERSION as STAMPED_VERSION } from './generated/server-version.js'

export const SERVER_NAME = 'prism-mcp-server'
export const SERVER_VERSION: string = STAMPED_VERSION

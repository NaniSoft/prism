/**
 * The MCP server identity (`serverInfo` in the protocol handshake).
 *
 * Keep in sync with `package.json` — this is a literal because importing the
 * package JSON would drag a file outside `rootDir` into the tsc build. This is
 * *protocol* metadata, not the corpus version: `list_items` echoes the store's
 * own `prismVersion` so agents can detect a corpus/installed-version mismatch.
 */
export const SERVER_NAME = 'prism-mcp-server';
export const SERVER_VERSION = '0.3.0';

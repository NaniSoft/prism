/**
 * Tool logic for the Prism MCP server.
 *
 * Deliberately transport-free: the HTTP transport is a stateless
 * `createMcpHandler(factory)` in the apps/site Worker (map ticket 05), and an
 * optional stdio shim reuses this same factory. The real tool surface (search,
 * component API/usage, theme tokens, docs) is specified by the MCP tool-surface
 * ticket (map ticket 13) and implemented against it.
 */
export interface PrismMcpDocs {
  /** Component names the docs know about, e.g. `Button`. Placeholder shape. */
  readonly components?: readonly string[];
}

export interface PrismMcpServer {
  readonly name: 'prism-mcp-server';
  readonly version: string;
  /** Tool names registered on the server. Empty until the tool spec lands. */
  readonly tools: readonly string[];
}

export function createPrismMcpServer(_docs: PrismMcpDocs = {}): PrismMcpServer {
  return {
    name: 'prism-mcp-server',
    version: '0.1.0',
    tools: [],
  };
}

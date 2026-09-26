/**
 * @nanisoft/prism-mcp-server public surface.
 *
 * One factory, eight tools, no transport: the Worker connects it to
 * `createMcpHandler`, and the protocol tests connect it to an in-memory
 * transport. The build stamp ships beside the factory so `list_items` can echo
 * how fresh the bundled corpus is.
 */
export { createPrismMcpServer } from './server.js'
export type { PrismMcpServerOptions } from './server.js'
export { BUILT, BUILT_CORPUS } from './generated/built.js'
export { IMPORT_RULE, NO_INVENTION_RULE, SURFACE_RULE, describe } from './rules.js'
export { SERVER_NAME, SERVER_VERSION } from './version.js'
export { TOOL_ORDER } from './descriptions.js'

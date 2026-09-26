import { defineConfig } from 'vitest/config'

/**
 * The MCP lane is transport-free, so the suite runs in plain Node. The protocol
 * round-trips build a real `McpServer` and connect a real `Client` over an
 * `InMemoryTransport`; nothing here touches the network or the filesystem except
 * the corpus hash check, which reads `packages/llms/dist/data.json`.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    testTimeout: 20000,
  },
})

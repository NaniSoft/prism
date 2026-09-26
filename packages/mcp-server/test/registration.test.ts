import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { TOOL_ORDER } from '../src/descriptions.js'
import { IMPORT_RULE, SURFACE_RULE } from '../src/rules.js'
import { SERVER_NAME, SERVER_VERSION } from '../src/version.js'
import { connect, readCorpusRaw, type Harness } from './helpers.js'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  name: string
  version: string
}

async function withServer(run: (harness: Harness) => Promise<void>): Promise<void> {
  const harness = await connect(readCorpusRaw())
  try {
    await run(harness)
  } finally {
    await harness.close()
  }
}

describe('the tool registry', () => {
  it('registers exactly the eight unprefixed tools in order', async () => {
    await withServer(async ({ client }) => {
      const { tools } = await client.listTools()
      expect(tools.map((tool) => tool.name)).toEqual([...TOOL_ORDER])
    })
  })

  it('reports the protocol identity prism-mcp-server', async () => {
    await withServer(async ({ client }) => {
      expect(client.getServerVersion()).toMatchObject({ name: SERVER_NAME, version: SERVER_VERSION })
    })
  })

  it('keeps the protocol version in sync with package.json', () => {
    expect(SERVER_VERSION).toBe(pkg.version)
  })

  it('advertises tools and no resources capability', async () => {
    await withServer(async ({ client }) => {
      const capabilities = client.getServerCapabilities()
      expect(capabilities?.tools).toBeDefined()
      expect(capabilities?.resources).toBeUndefined()
    })
  })

  it('advertises no prompts capability', async () => {
    await withServer(async ({ client }) => {
      expect(client.getServerCapabilities()?.prompts).toBeUndefined()
    })
  })

  it('carries the import rule on every description', async () => {
    await withServer(async ({ client }) => {
      const { tools } = await client.listTools()
      for (const tool of tools) expect(tool.description ?? '').toContain(IMPORT_RULE)
    })
  })

  it('carries the surface rule on every description', async () => {
    await withServer(async ({ client }) => {
      const { tools } = await client.listTools()
      for (const tool of tools) expect(tool.description ?? '').toContain(SURFACE_RULE)
    })
  })

  it('describes every input parameter a client must pass', async () => {
    await withServer(async ({ client }) => {
      const { tools } = await client.listTools()
      for (const tool of tools) {
        const schema = tool.inputSchema as { properties?: Record<string, { description?: string }> }
        for (const [name, property] of Object.entries(schema.properties ?? {})) {
          expect(property.description, `${tool.name}.${name} has no description`).toBeTruthy()
        }
      }
    })
  })
})

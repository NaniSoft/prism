import { describe, expect, it } from 'vitest'

import { connect, readCorpusRaw, type Harness } from './helpers.js'

async function withServer(run: (harness: Harness) => Promise<void>): Promise<void> {
  const harness = await connect(readCorpusRaw())
  try {
    await run(harness)
  } finally {
    await harness.close()
  }
}

describe('tool argument validation', () => {
  it('rejects an over-limit search as an isError result', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'search_docs',
        arguments: { query: 'button', limit: 99 },
      })
      expect(result.isError).toBe(true)
    })
  })

  it('rejects a zero search limit as an isError result', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'search_docs',
        arguments: { query: 'button', limit: 0 },
      })
      expect(result.isError).toBe(true)
    })
  })

  it('rejects a kind outside the closed union', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'list_items',
        arguments: { kind: 'widget' },
      })
      expect(result.isError).toBe(true)
    })
  })

  it('rejects a category on a block with the mismatch named', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'list_items',
        arguments: { kind: 'block', category: 'Layout' },
      })
      expect(result.isError).toBe(true)
      expect(result.content[0]).toMatchObject({ type: 'text' })
    })
  })

  it('rejects a category on a page', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'list_items',
        arguments: { kind: 'page', category: 'Layout' },
      })
      expect(result.isError).toBe(true)
    })
  })

  it('rejects a missing name', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({ name: 'get_item_doc', arguments: {} })
      expect(result.isError).toBe(true)
    })
  })

  it('accepts a category without a kind', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'list_items',
        arguments: { category: 'Layout' },
      })
      expect(result.isError).toBeFalsy()
    })
  })
})

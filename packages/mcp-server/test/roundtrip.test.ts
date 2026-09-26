import { describe, expect, it } from 'vitest'

import { IMPORT_RULE } from '../src/rules.js'
import { connect, emptyStore, readCorpusRaw, readStore, readText, type Harness } from './helpers.js'

async function withServer(
  run: (harness: Harness) => Promise<void>,
  raw: unknown = readCorpusRaw(),
  options = {},
): Promise<void> {
  const harness = await connect(raw, options)
  try {
    await run(harness)
  } finally {
    await harness.close()
  }
}

describe('protocol round-trips over InMemoryTransport', () => {
  it('list_items reports the header, counts and groups', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({ name: 'list_items', arguments: {} })
      const body = readText(result)
      expect(result.isError).toBeFalsy()
      expect(body).toContain('# Prism 0.5.0 - 28 components, 10 blocks, 4 pages')
      expect(body).toContain('## Components')
      expect(body).toContain('## Blocks')
      expect(body).toContain('## Pages')
      expect(body).toContain('- **Button** - The action control for commands, links and loading states. _(Call to action)_')
    })
  })

  it('list_items echoes the build stamp when one is passed', async () => {
    await withServer(
      async ({ client }) => {
        const result = await client.callTool({ name: 'list_items', arguments: {} })
        expect(readText(result)).toContain('(built 2026-01-02)')
      },
      readCorpusRaw(),
      { built: '2026-01-02' },
    )
  })

  it('list_items filters by kind', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({ name: 'list_items', arguments: { kind: 'block' } })
      const body = readText(result)
      expect(body).toContain('Filtered to kind = `block`')
      expect(body).toContain('## Blocks')
      expect(body).not.toContain('## Components')
    })
  })

  it('list_items filters Components by category', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'list_items',
        arguments: { category: 'Forms and inputs' },
      })
      const body = readText(result)
      expect(body).toContain('Filtered to category = `Forms and inputs`')
      expect(body).toContain('**Input**')
      expect(body).not.toContain('**Button**')
    })
  })

  it('list_items tolerates an empty corpus', async () => {
    await withServer(
      async ({ client }) => {
        const result = await client.callTool({ name: 'list_items', arguments: {} })
        const body = readText(result)
        expect(result.isError).toBeFalsy()
        expect(body).toContain('0 components, 0 blocks, 0 pages')
        expect(body).toContain('No items in this build.')
      },
      emptyStore(),
    )
  })

  it('get_item_doc returns the item doc verbatim plus its footer', async () => {
    const store = readStore()
    const button = store.items.find((item) => item.name === 'Button')
    expect(button).toBeTruthy()
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'get_item_doc',
        arguments: { name: 'Button' },
      })
      const body = readText(result)
      expect(result.isError).toBeFalsy()
      expect(body).toContain(button?.doc.trimEnd() ?? '')
      expect(body).toContain('Public import:')
      expect(body).toContain(IMPORT_RULE)
    })
  })

  it('get_item_doc misses with a did-you-mean list', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'get_item_doc',
        arguments: { name: 'Buton' },
      })
      expect(result.isError).toBe(true)
      expect(readText(result)).toContain('Button')
    })
  })

  it('search_docs ranks a name hit first and reports the matched field', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'search_docs',
        arguments: { query: 'accordion' },
      })
      const body = readText(result)
      expect(result.isError).toBeFalsy()
      expect(body).toContain('**Accordion** (component)')
      expect(body).toContain('matched: name')
    })
  })

  it('search_docs caps the hits at the requested limit', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'search_docs',
        arguments: { query: 'the', limit: 3 },
      })
      const body = readText(result)
      expect(body).toContain('3 hits')
      expect(body.split('\n').filter((line) => line.startsWith('- **'))).toHaveLength(3)
    })
  })

  it('search_docs returns guidance rather than an error for an empty result', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'search_docs',
        arguments: { query: 'xyzzyplugh' },
      })
      expect(result.isError).toBeFalsy()
      expect(readText(result)).toContain('No matches')
    })
  })

  it('search_docs filters to the doc lane', async () => {
    await withServer(async ({ client }) => {
      const result = await client.callTool({
        name: 'search_docs',
        arguments: { query: 'motion', kind: 'doc' },
      })
      const body = readText(result)
      expect(body).toContain('**Motion** (doc)')
      expect(body).not.toContain('(component)')
    })
  })

  it('serves two independent servers over one store at once', async () => {
    const raw = readCorpusRaw()
    const first = await connect(raw)
    const second = await connect(raw)
    try {
      const one = await first.client.callTool({ name: 'list_pages', arguments: {} })
      const two = await second.client.callTool({ name: 'get_page', arguments: { url: '/docs/quickstart' } })
      expect(readText(one)).toContain('# Prism pages')
      expect(readText(two)).toContain('# Quickstart')
    } finally {
      await first.close()
      await second.close()
    }
  })
})

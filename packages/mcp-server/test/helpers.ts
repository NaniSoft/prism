import { readFileSync } from 'node:fs'

import { Client } from '@modelcontextprotocol/client'
import { InMemoryTransport, type CallToolResult, type McpServer } from '@modelcontextprotocol/server'
import {
  parsePrismDocsStore,
  type PrismChangelog,
  type PrismDocsStore,
  type PrismDocsStoreEntry,
} from '@nanisoft/prism-llms'

import { createPrismMcpServer, type PrismMcpServerOptions } from '../src/server.js'

/** The emitted corpus, read from the built package. `pretest` compiles first. */
export const CORPUS_PATH = new URL('../../llms/dist/data.json', import.meta.url)

/** The corpus as the MCP lane reads it: through the package export. */
export const BUNDLED_PATH = new URL(
  '../node_modules/@nanisoft/prism-llms/dist/data.json',
  import.meta.url,
)

export function readCorpusRaw(): unknown {
  return JSON.parse(readFileSync(CORPUS_PATH, 'utf8'))
}

export function readText(result: CallToolResult): string {
  const block = result.content.find((entry) => entry.type === 'text')
  return block && block.type === 'text' ? block.text : ''
}

export function readStore(): PrismDocsStore {
  return parsePrismDocsStore(readCorpusRaw())
}

export interface Harness {
  server: McpServer
  client: Client
  close: () => Promise<void>
}

/** A real `McpServer` and a real `Client` over one linked in-memory pair. */
export async function connect(
  raw: unknown,
  options: PrismMcpServerOptions = {},
): Promise<Harness> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = createPrismMcpServer(raw, options)
  const client = new Client({ name: 'prism-test-client', version: '0.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return {
    server,
    client,
    close: async () => {
      await client.close()
      await server.close()
    },
  }
}

/** The full valid tokens projection, empty. */
export function emptyTokens(): PrismDocsStore['tokens'] {
  return {
    packs: ['default'],
    modes: ['light'],
    themes: [{ pack: 'default', mode: 'light', semantic: [] }],
    scales: { motion: [], typography: [], spacing: [], shadow: [], breakpoint: [], container: [] },
  }
}

export function emptyStore(version = '9.9.9'): PrismDocsStore {
  return { version, items: [], pages: [], changelogs: [], tokens: emptyTokens() }
}

/**
 * One changelog entry, the shape the corpus emits.
 *
 * `versions` and `releases` are stated together because the store's guard
 * refuses a store where the two disagree, so a fixture that set only one of them
 * would fail the guard rather than the assertion under test.
 */
export function makeChangelog(
  name: string,
  overrides: Partial<PrismChangelog> = {},
): PrismChangelog {
  const slug = name.startsWith('@') ? (name.split('/')[1] ?? name) : name
  const releases = overrides.releases ?? [
    { version: '1.0.0', body: `The first published line of ${name}.` },
  ]
  return {
    package: name,
    slug,
    route: `/changelogs/${slug}`,
    title: name,
    versions: releases.map((release) => release.version),
    releases,
    text: `# ${name}\n\n## 1.0.0\n\nThe first published line of ${name}.\n`,
    ...overrides,
  }
}

export function makeItem(
  overrides: Partial<PrismDocsStoreEntry> & Pick<PrismDocsStoreEntry, 'name' | 'kind'>,
): PrismDocsStoreEntry {
  const { name, kind, ...rest } = overrides
  return {
    id: name.toLowerCase(),
    slug: name.toLowerCase(),
    kind,
    name,
    category: kind === 'component' ? 'Miscellaneous' : null,
    status: 'stable',
    description: `${name} description.`,
    url: `/${kind}s/${name.toLowerCase()}`,
    mirror: `/${kind}s/${name.toLowerCase()}.md`,
    source: `src/${kind}s/${name.toLowerCase()}/index.tsx`,
    exports: [name],
    importLine: `import { ${name} } from '@nanisoft/prism-ui/${kind}s/${name.toLowerCase()}'`,
    doc: `# ${name}\n\n${name} description.`,
    references: { blocks: [], pages: [] },
    ...rest,
  }
}

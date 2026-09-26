import { describe, expect, it } from 'vitest'

import { createPrismMcpServer } from '../src/server.js'
import { readCorpusRaw } from './helpers.js'

type Mutable = {
  version: unknown
  items: Array<Record<string, unknown>>
  pages: unknown
  tokens: unknown
}

function clone(): Mutable {
  return JSON.parse(JSON.stringify(readCorpusRaw())) as Mutable
}

describe('the inherited store guard at the factory door', () => {
  it('throws on an unknown kind with the offending path', () => {
    const document = clone()
    const item = document.items[12]
    if (item) item.kind = 'widget'
    expect(() => createPrismMcpServer(document)).toThrow(/items\[12\]\.kind/)
  })

  it('throws on a non-string version', () => {
    const document = clone()
    document.version = 42
    expect(() => createPrismMcpServer(document)).toThrow(/version/)
  })

  it('throws on a missing items field', () => {
    const document = clone()
    delete (document as { items?: unknown }).items
    expect(() => createPrismMcpServer(document)).toThrow(/items/)
  })

  it('throws through the prism-llms guard rather than a second check', () => {
    const document = clone()
    const item = document.items[0]
    if (item) item.kind = 'widget'
    expect(() => createPrismMcpServer(document)).toThrow(/prism-llms: data\.json/)
  })

  it('rejects a structurally valid document whose kind is widened to string', () => {
    expect(() =>
      createPrismMcpServer({ version: '1.0.0', items: [{ kind: 'widget' }], pages: [], tokens: {} }),
    ).toThrow(/items\[0\]\.kind/)
  })

  it('accepts the emitted store and returns a disconnected server', () => {
    const server = createPrismMcpServer(readCorpusRaw())
    expect(typeof server.registerTool).toBe('function')
    expect(server.isConnected()).toBe(false)
  })
})

import { afterEach, describe, expect, it } from 'vitest'

import { PrismThemeScript } from '../src/provider'
import {
  DEFAULT_STORAGE_KEY,
  LEGACY_MODE_STORAGE_KEYS,
  PACK_ATTRIBUTE,
  THEME_ORIGIN_ATTRIBUTE,
  THEME_ORIGINS,
  parseStoredTheme,
  readLegacyMode,
  resolveTheme,
} from '../src/theming'

/**
 * The origin attribute, run as the real script against the real DOM.
 *
 * The equivalence gate proves the string and the rule agree. It runs the string
 * in a hand-rolled document, so this suite is the other half: the same string,
 * evaluated by jsdom against a real `document.documentElement` and a real
 * `localStorage`, asserting the attribute contract the ticket asks for. Two
 * readers, two substrates, one answer.
 *
 * The retired key is the one the old line's mode setter wrote: a bare mode
 * string, not a pair. The migration exists because that key is the only record
 * a reader who chose a mode on the old line has.
 */
const LEGACY_KEY = LEGACY_MODE_STORAGE_KEYS[0]

const SCRIPT = PrismThemeScript({}).props.dangerouslySetInnerHTML.__html

/**
 * Put the root element into the state a server would have rendered, then run the
 * string against it. The reset comes first because the test states what the
 * server rendered, and a test that inherited the previous one's attributes would
 * be asserting on a document it did not describe.
 */
function run({
  documentPack = null,
  documentDark = false,
  props = {},
}: { documentPack?: string | null; documentDark?: boolean; props?: Record<string, unknown> } = {}) {
  document.documentElement.removeAttribute(PACK_ATTRIBUTE)
  document.documentElement.removeAttribute(THEME_ORIGIN_ATTRIBUTE)
  document.documentElement.classList.remove('dark')
  if (documentPack !== null) document.documentElement.setAttribute(PACK_ATTRIBUTE, documentPack)
  if (documentDark) document.documentElement.classList.add('dark')
  // The string is an IIFE with no module scope, so a plain call is the whole
  // contract a Server Component relies on when it renders it into `<head>`.
  new Function(props.script ?? SCRIPT)()
}

const origin = () => document.documentElement.getAttribute(THEME_ORIGIN_ATTRIBUTE)
const pack = () => document.documentElement.getAttribute(PACK_ATTRIBUTE)
const isDark = () => document.documentElement.classList.contains('dark')

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute(PACK_ATTRIBUTE)
  document.documentElement.removeAttribute(THEME_ORIGIN_ATTRIBUTE)
  document.documentElement.classList.remove('dark')
})

describe('the root origin attribute', () => {
  it('is named data-theme-origin, which is not the retired data-theme selector', () => {
    expect(THEME_ORIGIN_ATTRIBUTE).toBe('data-theme-origin')
    expect(THEME_ORIGIN_ATTRIBUTE).not.toBe('data-theme')
  })

  it('is a closed set of five values, and a retired value is not among them', () => {
    expect([...THEME_ORIGINS]).toEqual(['stored', 'legacy', 'document', 'default', 'unparsed'])
    expect(THEME_ORIGINS).not.toContain('rose')
    expect(THEME_ORIGINS).not.toContain('beam-dark')
  })

  it('records stored when the key holds a valid pair', () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, '{"pack":"mint","mode":"dark"}')

    run()

    expect(pack()).toBe('mint')
    expect(isDark()).toBe(true)
    expect(origin()).toBe('stored')
  })

  it('records default when nothing is stored and the document carries no theme', () => {
    run()

    expect(pack()).toBeNull()
    expect(isDark()).toBe(false)
    expect(origin()).toBe('default')
  })

  it('records document when the server-rendered attributes supplied the theme', () => {
    run({ documentPack: 'sky', documentDark: true })

    expect(pack()).toBe('sky')
    expect(isDark()).toBe(true)
    expect(origin()).toBe('document')
  })

  it('records unparsed, and leaves the value in place, when the key holds something that is not a pair', () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, '{"mode":"dark"}')

    run()

    // The half a per-field reader would have applied, and the reason the two
    // readers disagreed: the mode is valid on its own and the pack is absent.
    expect(isDark()).toBe(false)
    expect(pack()).toBeNull()
    expect(origin()).toBe('unparsed')
    // The value is the only record that this reader ever chose anything.
    expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('{"mode":"dark"}')
  })

  it('records legacy, and retires the key it recovered from, when only a retired key holds a mode', () => {
    localStorage.setItem(LEGACY_KEY, 'dark')

    run()

    expect(origin()).toBe('legacy')
    expect(isDark()).toBe(true)
    expect(JSON.parse(localStorage.getItem(DEFAULT_STORAGE_KEY) ?? 'null')).toEqual({
      pack: 'default',
      mode: 'dark',
    })
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()
  })

  it('is written on every path, so an absent origin is never an unread one', () => {
    for (const stored of [null, '{"pack":"mint","mode":"dark"}', '{}', 'garbage', '', '[]', '"blue-dark"']) {
      if (stored === null) localStorage.removeItem(DEFAULT_STORAGE_KEY)
      else localStorage.setItem(DEFAULT_STORAGE_KEY, stored)

      run()

      expect(origin()).not.toBeNull()
      expect(THEME_ORIGINS).toContain(origin() as (typeof THEME_ORIGINS)[number])
      localStorage.clear()
    }
  })

  it('never writes to storage when no decision was made', () => {
    run()

    expect(localStorage.length).toBe(0)
  })

  it('cannot break the page when storage throws on read', () => {
    const getItem = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    try {
      expect(() => run()).not.toThrow()
    } finally {
      Storage.prototype.getItem = getItem
    }
  })
})

describe('the migration clause', () => {
  it('expires by removing the key it read, so a reader is migrated once', () => {
    localStorage.setItem(LEGACY_KEY, 'light')
    run()
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()

    // A second load finds nothing to recover and writes nothing.
    const before = localStorage.getItem(DEFAULT_STORAGE_KEY)
    run()
    expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe(before)
    expect(origin()).toBe('stored')
  })

  it('leaves a retired key holding an unusable value alone rather than destroying the record', () => {
    localStorage.setItem(LEGACY_KEY, 'beam-dark')

    run()

    expect(localStorage.getItem(LEGACY_KEY)).toBe('beam-dark')
    expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull()
    expect(origin()).toBe('default')
  })

  it('is reachable only while a retired key is still listed, so the list is the clause', () => {
    expect(LEGACY_MODE_STORAGE_KEYS).toEqual(['prism-theme-mode'])
    expect(SCRIPT).toContain(JSON.stringify(LEGACY_KEY))
    // No date and no version constant bounds it.
    expect(SCRIPT).not.toMatch(/20\d\d-\d\d-\d\d/)
  })
})

describe('resolveTheme', () => {
  const base = {
    legacy: null,
    documentPack: null,
    documentDark: false,
    defaultPack: 'default' as const,
    defaultMode: 'light' as const,
  }

  it('takes a valid pair whole, and never repairs one field', () => {
    expect(resolveTheme({ ...base, stored: '{"pack":"mint","mode":"dark"}' })).toEqual({
      pack: 'mint',
      mode: 'dark',
      origin: 'stored',
    })
    expect(resolveTheme({ ...base, stored: '{"mode":"dark"}' }).mode).toBe('light')
    expect(resolveTheme({ ...base, stored: '{"pack":"mint"}' }).pack).toBe('default')
  })

  it('treats a retired pack as unparseable rather than half-right', () => {
    const resolution = resolveTheme({ ...base, stored: '{"pack":"rose","mode":"dark"}' })

    expect(resolution).toEqual({ pack: 'default', mode: 'light', origin: 'unparsed' })
  })

  it('does not read a retired key while the key it writes holds a value', () => {
    expect(
      resolveTheme({ ...base, stored: '{"pack":"rose","mode":"dark"}', legacy: 'dark' }),
    ).toEqual({ pack: 'default', mode: 'light', origin: 'unparsed' })
  })

  it('reads a retired key only when the key it writes is empty', () => {
    expect(resolveTheme({ ...base, stored: null, legacy: 'dark' })).toEqual({
      pack: 'default',
      mode: 'dark',
      origin: 'legacy',
    })
  })

  it('lets the rendered document survive above the defaults', () => {
    expect(resolveTheme({ ...base, stored: null, documentPack: 'sky' })).toEqual({
      pack: 'sky',
      mode: 'light',
      origin: 'document',
    })
    expect(resolveTheme({ ...base, stored: null, documentDark: true })).toEqual({
      pack: 'default',
      mode: 'dark',
      origin: 'document',
    })
  })

  it('ignores a rendered pack id that is not one of this line', () => {
    expect(resolveTheme({ ...base, stored: null, documentPack: 'rose' })).toEqual({
      pack: 'default',
      mode: 'light',
      origin: 'default',
    })
  })
})

describe('readLegacyMode', () => {
  it('returns the key it read, so the recovery retires that key and no other', () => {
    const values = new Map<string, string>([[LEGACY_KEY, 'dark']])

    expect(readLegacyMode((key) => values.get(key) ?? null)).toEqual({ key: LEGACY_KEY, mode: 'dark' })
  })

  it('returns null for a value that is not one of the two modes', () => {
    expect(readLegacyMode(() => 'beam-dark')).toBeNull()
    expect(readLegacyMode(() => null)).toBeNull()
  })
})

describe('parseStoredTheme', () => {
  it('is unchanged: a pair or nothing, so the retired string value is not a pair', () => {
    expect(parseStoredTheme('{"pack":"mint","mode":"dark"}')).toEqual({ pack: 'mint', mode: 'dark' })
    expect(parseStoredTheme('"blue-dark"')).toBeNull()
    expect(parseStoredTheme('{"pack":"rose","mode":"dark"}')).toBeNull()
  })
})

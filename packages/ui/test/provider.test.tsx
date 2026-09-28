import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLayoutEffect } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PrismProvider, usePrismTheme } from '../src/provider'
import {
  DEFAULT_STORAGE_KEY,
  LEGACY_MODE_STORAGE_KEYS,
  PACK_ATTRIBUTE,
  THEME_ORIGIN_ATTRIBUTE,
} from '../src/theming'

const LEGACY_KEY = LEGACY_MODE_STORAGE_KEYS[0]

function Probe() {
  const { pack, mode, setPack, setMode, toggleMode } = usePrismTheme()
  return (
    <div>
      <span>{`${pack}:${mode}`}</span>
      <button type="button" onClick={() => setPack('mint')}>
        Use mint
      </button>
      <button type="button" onClick={() => setMode('dark')}>
        Use dark
      </button>
      <button type="button" onClick={toggleMode}>
        Toggle mode
      </button>
    </div>
  )
}

/** What the store holds, read out rather than asserted through a call. */
function store() {
  return Object.fromEntries(
    Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)] as const),
  )
}

const mount = (props: Record<string, unknown> = {}) =>
  render(
    <PrismProvider {...props}>
      <Probe />
    </PrismProvider>,
  )

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute(PACK_ATTRIBUTE)
  document.documentElement.removeAttribute(THEME_ORIGIN_ATTRIBUTE)
  document.documentElement.classList.remove('dark')
})

describe('PrismProvider resolution', () => {
  it('resolves the default pack and mode on mount', async () => {
    mount({ defaultPack: 'default', defaultMode: 'light' })

    expect(await screen.findByText('default:light')).toBeInTheDocument()
  })

  it('keeps a server-rendered pack through hydration instead of flashing to the default', async () => {
    document.documentElement.setAttribute(PACK_ATTRIBUTE, 'sky')

    mount({ defaultPack: 'sky' })

    expect(await screen.findByText('sky:light')).toBeInTheDocument()
  })

  it('takes a stored choice over the server-rendered pack', async () => {
    document.documentElement.setAttribute(PACK_ATTRIBUTE, 'sky')
    localStorage.setItem(DEFAULT_STORAGE_KEY, '{"pack":"mint","mode":"dark"}')

    mount({ defaultPack: 'sky' })

    expect(await screen.findByText('mint:dark')).toBeInTheDocument()
  })

  it('falls through whole when the stored value names a retired pack, rather than keeping the valid mode', async () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, '{"pack":"rose","mode":"dark"}')

    mount({ defaultPack: 'default', defaultMode: 'light' })

    expect(await screen.findByText('default:light')).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

describe('PrismProvider writes', () => {
  it('ends a first visit with an empty store, so a site that changes its default reaches everyone who has not chosen', async () => {
    mount({ defaultPack: 'peach', defaultMode: 'dark' })

    expect(await screen.findByText('peach:dark')).toBeInTheDocument()
    expect(store()).toEqual({})
    expect(localStorage.length).toBe(0)
  })

  it('leaves the store empty when the theme came from the server-rendered attributes', async () => {
    document.documentElement.setAttribute(PACK_ATTRIBUTE, 'sky')

    mount({ defaultPack: 'sky' })

    expect(await screen.findByText('sky:light')).toBeInTheDocument()
    expect(store()).toEqual({})
  })

  it('writes the chosen pack', async () => {
    mount()

    await screen.findByText('default:light')
    await userEvent.click(screen.getByRole('button', { name: 'Use mint' }))

    expect(document.documentElement.getAttribute(PACK_ATTRIBUTE)).toBe('mint')
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"mint","mode":"light"}' })
  })

  it('writes the chosen mode', async () => {
    mount()

    await screen.findByText('default:light')
    await userEvent.click(screen.getByRole('button', { name: 'Use dark' }))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"default","mode":"dark"}' })
  })

  it('writes the toggle, and toggles back to the other of the two modes', async () => {
    mount()

    await screen.findByText('default:light')
    await userEvent.click(screen.getByRole('button', { name: 'Toggle mode' }))
    expect(await screen.findByText('default:dark')).toBeInTheDocument()
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"default","mode":"dark"}' })

    await userEvent.click(screen.getByRole('button', { name: 'Toggle mode' }))
    expect(await screen.findByText('default:light')).toBeInTheDocument()
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"default","mode":"light"}' })
  })

  it('keeps a choice across a reload, because the reload reads what the decision wrote', async () => {
    mount({ defaultPack: 'peach' })
    await screen.findByText('peach:light')
    await userEvent.click(screen.getByRole('button', { name: 'Use mint' }))
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"mint","mode":"light"}' })

    cleanup()
    document.documentElement.removeAttribute(PACK_ATTRIBUTE)

    mount({ defaultPack: 'peach' })

    expect(await screen.findByText('mint:light')).toBeInTheDocument()
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"mint","mode":"light"}' })
  })

  it('does not clear a stored value it could not parse, because that value is the only record of an intent', async () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, '{"pack":"rose","mode":"dark"}')

    mount()

    await screen.findByText('default:light')
    await userEvent.click(screen.getByRole('button', { name: 'Toggle mode' }))

    // The decision replaced it, which is a decision and not a clear. What must
    // not happen is the unparseable value being removed with no decision made.
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"default","mode":"dark"}' })
  })

  it('pairs a decision taken before the store has been read with the site default, not with the neutral pack', async () => {
    // A layout effect runs before the provider's own effect, so this is a real
    // ordering rather than a hypothetical one.
    function DecidingChild() {
      const { setMode } = usePrismTheme()
      useLayoutEffect(() => setMode('dark'), [setMode])
      return null
    }

    render(
      <PrismProvider defaultPack="peach" defaultMode="light">
        <DecidingChild />
        <Probe />
      </PrismProvider>,
    )

    expect(await screen.findByText('peach:dark')).toBeInTheDocument()
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"peach","mode":"dark"}' })
  })

  it('survives a store that throws on write, applying the attributes regardless', async () => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('full')
    }
    try {
      mount()
      await screen.findByText('default:light')
      await userEvent.click(screen.getByRole('button', { name: 'Use mint' }))
      expect(document.documentElement.getAttribute(PACK_ATTRIBUTE)).toBe('mint')
      expect(store()).toEqual({})
    } finally {
      Storage.prototype.setItem = setItem
    }
  })
})

describe('PrismProvider and the origin attribute', () => {
  it('never writes the origin attribute, because the boot script is its only writer', async () => {
    document.documentElement.setAttribute(THEME_ORIGIN_ATTRIBUTE, 'document')

    mount({ defaultPack: 'peach', defaultMode: 'dark' })
    await screen.findByText('peach:dark')
    await userEvent.click(screen.getByRole('button', { name: 'Use mint' }))

    expect(document.documentElement.getAttribute(THEME_ORIGIN_ATTRIBUTE)).toBe('document')
  })
})

describe('PrismProvider and the retired key', () => {
  it('recovers the decision from the key this line no longer writes, and retires that key', async () => {
    localStorage.setItem(LEGACY_KEY, 'dark')

    mount({ defaultPack: 'peach', defaultMode: 'light' })

    expect(await screen.findByText('peach:dark')).toBeInTheDocument()
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"peach","mode":"dark"}' })
  })

  it('retires the key once, so a second visit is an ordinary stored decision', async () => {
    localStorage.setItem(LEGACY_KEY, 'dark')
    mount({ defaultPack: 'peach' })
    await screen.findByText('peach:dark')
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"peach","mode":"dark"}' })

    cleanup()
    mount({ defaultPack: 'peach' })

    expect(await screen.findByText('peach:dark')).toBeInTheDocument()
    expect(store()).toEqual({ [DEFAULT_STORAGE_KEY]: '{"pack":"peach","mode":"dark"}' })
  })

  it('does not read the retired key while the key it writes holds a value', async () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, '{"pack":"rose","mode":"dark"}')
    localStorage.setItem(LEGACY_KEY, 'dark')

    mount({ defaultPack: 'peach', defaultMode: 'light' })

    expect(await screen.findByText('peach:light')).toBeInTheDocument()
    expect(store()).toEqual({
      [DEFAULT_STORAGE_KEY]: '{"pack":"rose","mode":"dark"}',
      [LEGACY_KEY]: 'dark',
    })
  })

  it('leaves the retired key alone when its value is not one of the two modes', async () => {
    localStorage.setItem(LEGACY_KEY, 'beam-dark')

    mount({ defaultPack: 'peach' })

    expect(await screen.findByText('peach:light')).toBeInTheDocument()
    expect(store()).toEqual({ [LEGACY_KEY]: 'beam-dark' })
  })
})

describe('usePrismTheme', () => {
  it('throws when read outside a provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/PrismProvider/)
    error.mockRestore()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PrismProvider, usePrismTheme } from '../src/provider'

function Probe() {
  const { pack, mode, setPack, toggleMode } = usePrismTheme()
  return (
    <div>
      <span>{`${pack}:${mode}`}</span>
      <button type="button" onClick={() => setPack('mint')}>
        Use mint
      </button>
      <button type="button" onClick={toggleMode}>
        Toggle mode
      </button>
    </div>
  )
}

describe('PrismProvider', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-pack')
    document.documentElement.classList.remove('dark')
  })

  it('resolves the default pack and mode on mount', async () => {
    render(
      <PrismProvider defaultPack="default" defaultMode="light">
        <Probe />
      </PrismProvider>,
    )
    expect(await screen.findByText('default:light')).toBeInTheDocument()
  })

  it('applies the chosen pack to the document element and persists it', async () => {
    render(
      <PrismProvider>
        <Probe />
      </PrismProvider>,
    )
    await screen.findByText('default:light')
    await userEvent.click(screen.getByRole('button', { name: 'Use mint' }))
    expect(document.documentElement.getAttribute('data-pack')).toBe('mint')
    expect(JSON.parse(localStorage.getItem('prism-theme') ?? '{}')).toMatchObject({ pack: 'mint' })
  })

  it('toggles the mode and marks the document element dark', async () => {
    render(
      <PrismProvider>
        <Probe />
      </PrismProvider>,
    )
    await screen.findByText('default:light')
    await userEvent.click(screen.getByRole('button', { name: 'Toggle mode' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('throws when read outside a provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/PrismProvider/)
    error.mockRestore()
  })
})

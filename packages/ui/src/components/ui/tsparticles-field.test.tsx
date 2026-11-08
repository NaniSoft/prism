import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const inits: Array<(engine: unknown) => Promise<void>> = []

vi.mock('@tsparticles/react', () => ({
  default: () => null,
  ParticlesProvider: ({ init, children }: { init: (engine: unknown) => Promise<void>; children: React.ReactNode }) => {
    inits.push(init)
    return <>{children}</>
  },
}))

vi.mock('@tsparticles/slim', () => ({
  loadSlim: vi.fn(async () => {}),
}))

import { TsparticlesField } from './tsparticles-field'

describe('TsparticlesField', () => {
  it('passes a stable init callback to ParticlesProvider across re-renders', () => {
    const { rerender } = render(<TsparticlesField />)
    rerender(<TsparticlesField />)
    rerender(<TsparticlesField count={80} />)
    expect(inits.length).toBeGreaterThan(0)
    // ParticlesProvider keeps the first init it receives and throws when a
    // later one differs, so every render must hand it the same function.
    for (const init of inits) {
      expect(init).toBe(inits[0])
    }
  })

  it('renders the static floor the engine stands in for', () => {
    const { container } = render(<TsparticlesField />)
    expect(container.querySelector('[data-slot="tsparticles-field-floor"]')).not.toBeNull()
    expect(container.querySelectorAll('[data-slot="tsparticles-field-mark"]').length).toBeGreaterThan(0)
  })
})

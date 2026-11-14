import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * The engine, as the field meets it. The load is held so a test can decide
 * whether it resolves, rejects, or resolves after the field has unmounted,
 * which is the race the field owns and the reason this file exists: the 1.8
 * audit caught the engine's rejection escaping as an uncaught page error, and
 * these tests hold the chain that keeps it from doing that again.
 */
const { engine, slim, tsParticles } = vi.hoisted(() => {
  const engine = {
    loadCalls: 0,
    rejectNextLoad: false,
    pendingLoads: [] as Array<(container: { destroy: () => void } | undefined) => void>,
  }
  const slim = { loadSlim: vi.fn(async () => {}) }
  const tsParticles = {
    load: vi.fn(() => {
      engine.loadCalls += 1
      if (engine.rejectNextLoad) {
        return Promise.reject(new Error('TSP-1101: the engine refused the canvas'))
      }
      return new Promise((resolve) => {
        engine.pendingLoads.push(resolve)
      })
    }),
  }
  return { engine, slim, tsParticles }
})

vi.mock('@tsparticles/engine', () => ({ tsParticles }))
vi.mock('@tsparticles/slim', () => ({ loadSlim: slim.loadSlim }))

import { TsparticlesField } from './tsparticles-field'

beforeEach(() => {
  engine.loadCalls = 0
  engine.rejectNextLoad = false
  engine.pendingLoads.length = 0
  slim.loadSlim.mockClear()
  tsParticles.load.mockClear()
})

describe('TsparticlesField', () => {
  it('renders the static floor the engine stands in for', () => {
    const { container, unmount } = render(<TsparticlesField />)
    expect(container.querySelector('[data-slot="tsparticles-field-floor"]')).not.toBeNull()
    expect(container.querySelectorAll('[data-slot="tsparticles-field-mark"]').length).toBeGreaterThan(0)
    // The element the engine loads its canvas into exists and carries the id
    // the field passes to the engine, so the lookup cannot miss.
    expect(container.querySelector('[data-slot="tsparticles-field-canvas"]')).not.toBeNull()
    unmount()
  })

  it('arms the engine at most once for the app lifecycle, across mounts and re-renders', async () => {
    // The arming promise lives at module scope and is shared by every field
    // the page renders, so the invariant is that further mounts and re-renders
    // add no registration: whatever this file has armed so far is all there is.
    const registered = slim.loadSlim.mock.calls.length
    const first = render(<TsparticlesField />)
    await vi.waitFor(() => expect(tsParticles.load).toHaveBeenCalled())
    first.unmount()
    const second = render(<TsparticlesField />)
    second.rerender(<TsparticlesField />)
    second.rerender(<TsparticlesField count={80} />)
    expect(slim.loadSlim.mock.calls.length).toBe(registered)
    second.unmount()
  })

  it('holds an engine rejection where the page cannot see it', async () => {
    engine.rejectNextLoad = true
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { unmount } = render(<TsparticlesField />)
    await vi.waitFor(() => expect(warn).toHaveBeenCalled())
    expect(warn.mock.calls[0]?.[0]).toContain('the static floor stands in')
    warn.mockRestore()
    unmount()
  })

  it('destroys a container that arrives after the field has unmounted', async () => {
    const destroy = vi.fn()
    const { unmount } = render(<TsparticlesField />)
    await vi.waitFor(() => expect(engine.pendingLoads.length).toBe(1))
    unmount()
    // The load settles after the field is gone; the container it produced is
    // destroyed on arrival rather than left running behind a dead element.
    engine.pendingLoads[0]?.({ destroy })
    await vi.waitFor(() => expect(destroy).toHaveBeenCalled())
  })
})

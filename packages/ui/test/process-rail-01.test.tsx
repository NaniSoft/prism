import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProcessRail01, type ProcessStep } from '../src/blocks/process-rail-01'

/**
 * The contested shape this Block ships is the length of its rail, and the claim
 * is that the refusal is the type's own work rather than a runtime check.
 *
 * A runtime check would truncate a fifth step and draw a rail that lied about the
 * process, so the tests below do both halves: the four admissible lengths render
 * a column each, and a five-step array is proved not to typecheck. The second
 * half is proved by a `@ts-expect-error` on a call that does not compile, so a
 * tuple that silently widened to an array would turn that line into an unused
 * directive and the test would fail.
 */
const step = (name: string): ProcessStep => ({ name, description: `${name}, in one line.` })

const TWO = [step('Collect'), step('Conform')] as const
const THREE = [step('Collect'), step('Conform'), step('Serve')] as const
const FOUR = [step('Collect'), step('Conform'), step('Verify'), step('Serve')] as const
const FIVE = [step('Collect'), step('Conform'), step('Verify'), step('Publish'), step('Serve')] as const

const columns = (container: HTMLElement) =>
  container.querySelector('[data-slot="process-rail"]')?.className ?? ''

describe('a process drawn as a rail', () => {
  it.each([
    ['two', TWO, 'sm:grid-cols-2'],
    ['three', THREE, 'sm:grid-cols-3'],
    ['four', FOUR, 'sm:grid-cols-2 lg:grid-cols-4'],
  ])('draws a %s-step rail with a column each and no empty track', (_label, steps, track) => {
    const { container } = render(<ProcessRail01 steps={steps} title="The path" />)

    const rendered = container.querySelectorAll('[data-slot="process-step"]')
    expect(rendered).toHaveLength(steps.length)
    expect(columns(container)).toContain(track)
  })

  it('numbers each step from its own position rather than from a prop', () => {
    const { container } = render(<ProcessRail01 steps={FOUR} />)

    const ordinals = [...container.querySelectorAll('[data-slot="process-step"] .font-mono')].map(
      (node) => node.textContent,
    )
    expect(ordinals).toEqual(['01', '02', '03', '04'])
  })

  it('labels only the last step, and labels nothing when no label was passed', () => {
    const { container, rerender } = render(<ProcessRail01 steps={THREE} finalLabel="serving" />)
    const labels = [...container.querySelectorAll('[data-slot="process-step"]')].map(
      (node) => node.querySelectorAll('.font-mono')[1]?.textContent ?? '',
    )
    expect(labels).toEqual(['', '', 'serving'])

    rerender(<ProcessRail01 steps={THREE} />)
    expect(container.textContent).not.toContain('serving')
  })

  it('refuses a fifth step in the type rather than truncating it at render', () => {
    // The call below does not compile. If `steps` ever widens to an array the
    // directive becomes unused and this test fails, which is the point.
    const rail = (
      // @ts-expect-error a five-step rail is a compile error, by design
      <ProcessRail01 steps={FIVE} />
    )
    expect(rail).toBeTruthy()
  })

  it('ships no step and no label of its own', () => {
    const { container } = render(<ProcessRail01 steps={[step('Collect'), step('Conform')]} />)

    // Every word on the rail came from a step: there is no default stage name, no
    // default ordinal caption and no label for the end of the rail.
    expect(container.textContent).toContain('Collect, in one line.')
    expect(container.textContent).toContain('Conform, in one line.')
    expect(container.textContent).not.toMatch(/\bmerged\b|\bserving\b|\bPopular\b/)
  })
})

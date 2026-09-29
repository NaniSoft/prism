/**
 * A pipeline of any length, drawn in order, and a sequence that survives wrapping.
 *
 * **The gap this was written for.** `ProcessRail01` holds two, three or four stages
 * and refuses a fifth in its type, which is a good decision and is not in question.
 * A company site states six stages and was drawing them as a grid of short points,
 * where the six ordinals and the terminal label were lost: a set read where a
 * sequence had been, and the ordinal is the thing that said it was a sequence. So
 * the repair is a second shape rather than a wider tuple, because raising the rail's
 * ceiling to six would make the fourth column unrepresentable as a type error, which
 * is the property that made the original decision good.
 *
 * **The two assertions that matter are about the sequence, not the picture.** A flow
 * that wrapped into a row per group would be several lists, and a screen reader
 * would announce three lists of two, which is the set-where-a-sequence-was this
 * Block exists to avoid. So the stages are one ordered list, and the ordinals run
 * `01` to the last with no restart. Both are asserted structurally: the number of
 * lists, and the ordinals themselves, rather than a class or a snapshot of markup.
 */
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProcessFlow01, type ProcessStage } from '../src/blocks/process-flow-01'

/** The six stages the ticket names, as a pipeline of an awkward length. */
const six: ProcessStage[] = [
  { name: 'Intake', description: 'The request arrives and is recorded.' },
  { name: 'Plan', description: 'The work is broken into steps.' },
  { name: 'Build', description: 'The steps are executed.' },
  { name: 'Verify', description: 'The result is checked against the plan.' },
  { name: 'Review', description: 'A person signs off on the result.' },
  { name: 'Merge', description: 'The change lands on the main line.' },
]

/** The ordinals the flow rendered, in the order it rendered them. */
const ordinals = () =>
  [...document.querySelectorAll('[data-slot="process-stage"]')].map((stage) =>
    stage.getAttribute('data-ordinal'),
  )

describe('ProcessFlow01 draws a pipeline of arbitrary length', () => {
  it('draws six stages, which the rail refuses as a type error', () => {
    render(<ProcessFlow01 title="The pipeline" stages={six} finalLabel="merged" />)
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    for (const stage of six) {
      expect(screen.getByText(stage.name)).toBeInTheDocument()
    }
  })

  it('and draws two, and nine, because the length is content rather than a layout claim', () => {
    const { unmount } = render(<ProcessFlow01 stages={six.slice(0, 2)} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    unmount()

    render(
      <ProcessFlow01
        stages={[...six, ...six.slice(0, 3).map((s, i) => ({ ...s, name: `${s.name} ${i}` }))]}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(9)
  })

  it('refuses fewer than two stages, because a line through one stage says nothing', () => {
    // A flow of one is a label. Refusing it is the same reason the rail's type
    // refuses a fifth: the shape has nothing left to claim.
    expect(() => render(<ProcessFlow01 stages={six.slice(0, 1)} />)).toThrow(/fewer than two/)
    expect(() => render(<ProcessFlow01 stages={[]} />)).toThrow(/fewer than two/)
  })
})

describe('a wrapped flow is still one sequence', () => {
  it('is one ordered list, not one per line', () => {
    // This is the assertion the Block is built around. Three lists of two is what a
    // set of stages looks like to a screen reader, and it is the loss the company
    // site's grid of short points caused.
    const { container } = render(<ProcessFlow01 stages={six} columns={3} />)
    expect(container.querySelectorAll('ol')).toHaveLength(1)
    expect(container.querySelectorAll('ul')).toHaveLength(0)
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
  })

  it('runs the ordinals from 01 to the last stage with no restart', () => {
    // The ordinal is the continuity mechanism. A reader who lands on stage four sees
    // `04` and knows it continues stage three, at whatever column count their width
    // gives them, which is why nothing else in the Block needs to know where a line
    // broke.
    render(<ProcessFlow01 stages={six} columns={3} />)
    expect(ordinals()).toEqual(['01', '02', '03', '04', '05', '06'])
  })

  it('keeps counting past nine, rather than restarting or truncating', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      name: `Stage ${i + 1}`,
      description: 'One line.',
    }))
    render(<ProcessFlow01 stages={many} columns={3} />)
    expect(ordinals()).toEqual([
      '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
    ])
  })

  it('and states the ordinal as text, so it is announced rather than only drawn', () => {
    // An ordinal in a data attribute is a test convenience. If it were only there,
    // a screen reader would hear six stages with no order at all, which is the
    // original failure arriving by another route.
    render(<ProcessFlow01 stages={six.slice(0, 2)} />)
    const list = screen.getByRole('list')
    expect(within(list).getByText('01')).toBeInTheDocument()
    expect(within(list).getByText('02')).toBeInTheDocument()
  })
})

describe('the terminal label lands on the last stage', () => {
  it('and on no other', () => {
    render(<ProcessFlow01 stages={six} finalLabel="merged" />)
    expect(screen.getAllByText('merged')).toHaveLength(1)

    // Asserted against the last stage rather than by counting, because a label on
    // every stage is the failure and counting alone would not see which one it was.
    const last = screen.getByText('Merge').closest('[data-slot="process-stage"]')
    expect(last).toHaveTextContent('merged')
    const first = screen.getByText('Intake').closest('[data-slot="process-stage"]')
    expect(first).not.toHaveTextContent('merged')
  })

  it('and is absent when the pipeline has not finished', () => {
    const { container } = render(<ProcessFlow01 stages={six.slice(0, 3)} />)
    expect(container.querySelector('[data-slot="process-stage"]:last-child')).not.toHaveTextContent(
      /merged/,
    )
  })
})

describe('the column count is the Block layout, not the caller data', () => {
  it('renders the tracks the declared count asks for', () => {
    const { container: two } = render(<ProcessFlow01 stages={six} columns={2} />)
    expect(two.querySelector('[data-slot="process-flow"]')?.className).toContain('sm:grid-cols-2')

    const { container: four } = render(<ProcessFlow01 stages={six} columns={4} />)
    expect(four.querySelector('[data-slot="process-flow"]')?.className).toContain('lg:grid-cols-4')
  })

  it('defaults to three, and no column count empties a track at the end of a row', () => {
    // A rail's tuple length picks its own tracks, so a four-step rail has four and
    // not five with one empty. A flow's length does not, so the tracks come from
    // `columns` and the tail row is simply short. Asserted so that a track count
    // that is one too many is caught here rather than as a blank column.
    const { container } = render(<ProcessFlow01 stages={six} />)
    expect(container.querySelector('[data-slot="process-flow"]')?.className).toContain(
      'lg:grid-cols-3',
    )
    // Six over three is two full rows, so there is no tail to be short.
    expect(ordinals()).toHaveLength(6)
  })

  it('narrows rather than widens, so a phone gets one column per line', () => {
    // Three stage names side by side at phone width is three columns of two words
    // each, which is why the tracks step down rather than up.
    const { container } = render(<ProcessFlow01 stages={six} columns={3} />)
    const flow = container.querySelector('[data-slot="process-flow"]')?.className ?? ''
    expect(flow).toContain('sm:grid-cols-2')
    expect(flow).not.toContain('grid-cols-6')
  })
})

describe('the headings and the section', () => {
  it('render the section title at the level the caller chose', () => {
    render(<ProcessFlow01 title="The pipeline" headingLevel="h3" stages={six.slice(0, 2)} />)
    expect(screen.getByRole('heading', { name: 'The pipeline' })).toHaveProperty('tagName', 'H3')
  })

  it('render nothing above the flow when no title is passed', () => {
    // A flow composed under its own heading draws no second one, and the stage names
    // are not headings either: the sequence is the list, and promoting each stage
    // to a heading would put six headings in the outline for one process.
    const { container } = render(<ProcessFlow01 stages={six.slice(0, 3)} />)
    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    expect(container.querySelector('[data-slot="process-flow"]')).toBeInTheDocument()
  })
})

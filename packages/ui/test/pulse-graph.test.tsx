import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PulseGraph, type PulseNode, type PulseRelation } from '../src/components/ui/pulse-graph'

import { shippedSheet, valueOf } from './sheet-reader'

/**
 * The two properties a PulseGraph holds itself to, read out of the markup it
 * renders.
 *
 * Both are about the space between things and neither is visible in a class name,
 * a snapshot, or anything jsdom can compute, because jsdom resolves no cascade
 * and lays nothing out. What it does render is the drawing's own arithmetic: every
 * mark's centre, every label's baseline and size, and every stroke's two end
 * points, all as numbers. So the tests reconstruct the geometry from those and ask
 * the two questions about it, which is the same shape `diagram.test.tsx` takes and
 * the same reason: a snapshot would have passed on the defective version, because
 * the defective version looks like a drawing.
 *
 *   1. No label is drawn below `text-xs`, because the drawing holds a floor of its
 *      own coordinate space and a container narrower than that scrolls rather than
 *      shrinking it. The arithmetic is read out of the emitted token source and the
 *      shipped stylesheet rather than restated here, so a test cannot rot the
 *      moment the canvas or the type step moves.
 *   2. No stroke crosses a label, and the rail clears every note's box, because a
 *      label printed under a mark is crossed by any line leaving that mark
 *      downward and a lane whose mark lands low used to put its note under the
 *      rail.
 */
const REPO = path.resolve(import.meta.dirname, '..', '..', '..')

/**
 * Four stages that climb and fall across the canvas, a note on each, and every
 * edge carrying.
 *
 * It is the shape the documentation Demo and the hero-01 Demo both draw, and the
 * two properties it is worst at are the two this file asks about: two of its four
 * edges leave a node downward, so each of them ran through the name printed under
 * the node it left, and its last stage sits on the bottom of the fitted area, which
 * is where a note reaches furthest down.
 */
const STAGES: PulseNode[] = [
  { id: 'intake', name: 'intake', note: 'one request', x: 0, y: 0, lane: 0 },
  { id: 'queue', name: 'queue', note: 'durable', x: 0.3, y: 0.55, lane: 1 },
  { id: 'run', name: 'run', note: 'isolated', x: 0.62, y: 0.15, lane: 2, emphasis: true },
  { id: 'report', name: 'report', note: 'signed', x: 1, y: 1, lane: 3 },
]

const STAGE_EDGES: PulseRelation[] = [
  { from: 'intake', to: 'queue', carries: true },
  { from: 'queue', to: 'run', carries: true },
  { from: 'run', to: 'report', carries: true },
  { from: 'intake', to: 'report', indirect: true },
]

/**
 * Three stages whose middle one sits four fifths of the way down the canvas.
 *
 * It is here for one number. The rail is a fixed distance up from the bottom of
 * the canvas and a note reaches a fixed distance below its mark, so the two meet
 * on one range of mark positions and nowhere else: the mark has to land close
 * enough to the rail for its note to straddle it. Four fifths is inside that
 * range, which is what makes this the drawing the rail defect is measurable on
 * rather than a fixture invented to fail.
 */
const SPINE: PulseNode[] = [
  { id: 'top', name: 'top', note: 'the first', x: 0, y: 0, lane: 0 },
  { id: 'middle', name: 'middle', note: 'the second', x: 0.5, y: 0.79, lane: 1 },
  { id: 'low', name: 'low', note: 'the third', x: 1, y: 1, lane: 2 },
]

const SPINE_EDGES: PulseRelation[] = [
  { from: 'top', to: 'middle', carries: true },
  { from: 'middle', to: 'low', carries: true },
]

/** A field: no lane anywhere, so no rail and no band reserved for one. */
const FIELD: PulseNode[] = [
  { id: 'a', name: 'a', note: 'left', x: 0.1, y: 0.2 },
  { id: 'b', name: 'b', note: 'below', x: 0.42, y: 0.72 },
  { id: 'c', name: 'c', note: 'the one', x: 0.72, y: 0.28, emphasis: true },
  { id: 'd', name: 'd', note: 'right', x: 0.9, y: 0.66 },
  { id: 'e', name: 'e', x: 0.24, y: 0.48 },
]

const FIELD_EDGES: PulseRelation[] = [
  { from: 'a', to: 'c' },
  { from: 'b', to: 'c', carries: true },
  { from: 'd', to: 'c', indirect: true },
]

/**
 * The metrics of the face every label in a figure is set in, restated because they
 * are private to the package and restated rather than imported because exporting a
 * private constant to a test is a public surface added for the test's sake. They
 * are the metrics of the monospaced face rather than a decision about this
 * drawing, so a label's width is its character count.
 *
 * `INK_CLEARANCE` is restated on the same terms and for the same reason. It is the
 * one number the trim rule turns on, so it is the one number a test that checks the
 * trim cannot leave to chance, and it is restated rather than derived because a
 * figure cannot derive it either: it is a decision, not a measurement.
 */
const MONO_ADVANCE = 0.6
const LABEL_ASCENT = 0.8
const LABEL_DESCENT = 0.25
const INK_CLEARANCE = 7

/** Half a stroke width, the tolerance every geometric assertion below is held to. */
const EPSILON = 0.01

type Box = { l: number; r: number; t: number; b: number }
type Point = { x: number; y: number }

/** The ink box of one rendered label, from the three numbers the markup carries. */
function labelBox(text: Element): Box {
  expect(text.getAttribute('text-anchor')).toBe('middle')
  const size = Number(text.getAttribute('font-size'))
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const half = (text.textContent ?? '').length * MONO_ADVANCE * size * 0.5
  return { l: x - half, r: x + half, t: y - LABEL_ASCENT * size, b: y + LABEL_DESCENT * size }
}

/** The two ends of one rendered `<line>`, from the four numbers the markup carries. */
function segmentOf(line: Element): { from: Point; to: Point } {
  return {
    from: { x: Number(line.getAttribute('x1')), y: Number(line.getAttribute('y1')) },
    to: { x: Number(line.getAttribute('x2')), y: Number(line.getAttribute('y2')) },
  }
}

/** Whether a stroke passes through a box, which is the question both rules are about. */
function crosses(from: Point, to: Point, box: Box): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  let enter = 0
  let leave = 1
  for (const [origin, delta, low, high] of [
    [from.x, dx, box.l, box.r],
    [from.y, dy, box.t, box.b],
  ]) {
    if (delta === 0) {
      if (origin < low || origin > high) return false
      continue
    }
    const near = (low - origin) / delta
    const far = (high - origin) / delta
    enter = Math.max(enter, Math.min(near, far))
    leave = Math.min(leave, Math.max(near, far))
    if (enter > leave) return false
  }
  return true
}

/**
 * Every label the drawing prints, tagged with which of the two it is.
 *
 * Read by position rather than by slot, because a node group prints its name first
 * and its note second and that order is what the two claims are about. A node with
 * no note contributes its name alone, because a gap is not a line.
 */
function labels(container: HTMLElement): { kind: string; text: Element }[] {
  return [...container.querySelectorAll('[data-slot="pulse-graph-node"]')].flatMap((node) =>
    [...node.querySelectorAll('text')].map((text, index) => ({
      kind: index === 0 ? 'name' : 'note',
      text,
    })),
  )
}

/** Every connector in one rendered drawing, as `label against relation`. */
function crossings(container: HTMLElement): string[] {
  const groups = [...container.querySelectorAll('[data-relation]')]
  const strokes = groups.map((group) => segmentOf(group.querySelector('line') as Element))
  const hits: string[] = []
  for (const { kind, text } of labels(container)) {
    const box = labelBox(text)
    groups.forEach((group, index) => {
      if (crosses(strokes[index].from, strokes[index].to, box)) {
        hits.push(`${kind} "${text.textContent}" against ${group.getAttribute('data-relation')}`)
      }
    })
  }
  return hits
}

/** Every note the rail's own stroke runs through. */
function railCrossings(container: HTMLElement): string[] {
  const rail = container.querySelector('[data-slot="pulse-graph-rail-line"]')
  if (!rail) return []
  const { from, to } = segmentOf(rail)
  return labels(container)
    .filter(({ kind }) => kind === 'note')
    .filter(({ text }) => crosses(from, to, labelBox(text)))
    .map(({ text }) => `rail against note "${text.textContent}"`)
}

/**
 * The six stages the company site's pipeline band draws, and the figure it draws
 * them as: six nodes on one rail, every edge carrying.
 *
 * It is the shape `DESIGN.md`'s ink-avoidance rule turns on, and it is here rather
 * than a fixture invented for the assertion because it is the case the first form of
 * the trim rule got wrong. Every connector on it is horizontal, every label on it
 * sits below its mark, and a stroke leaving sideways therefore never enters any of
 * them: so every connector has to reach both of the marks it joins, and the only
 * gap allowed between a stroke's end and a mark's edge is the ink clearance.
 */
const PIPELINE_STAGE_NAMES = [
  'Idea',
  'Planning',
  'Architecture',
  'Implementation',
  'Testing',
  'Deployment',
]

const PIPELINE: PulseNode[] = PIPELINE_STAGE_NAMES.map((stage, index) => ({
  id: stage.toLowerCase(),
  name: stage.toLowerCase(),
  x: index / (PIPELINE_STAGE_NAMES.length - 1),
  y: 0.5,
  lane: index,
  emphasis: stage === 'Implementation',
}))

const PIPELINE_EDGES: PulseRelation[] = PIPELINE_STAGE_NAMES.slice(0, -1).map((stage, index) => ({
  from: stage.toLowerCase(),
  to: PIPELINE_STAGE_NAMES[index + 1]!.toLowerCase(),
  carries: true,
}))

/** One drawn node's mark and the labels printed under it, read off the markup. */
type Drawn = { id: string; at: Point; r: number; labels: Box[] }

/** Every drawn node in one rendering, addressed by the id its own group carries. */
function drawn(container: HTMLElement): Map<string, Drawn> {
  const found = new Map<string, Drawn>()
  for (const node of container.querySelectorAll('[data-slot="pulse-graph-node"]')) {
    // The halo is a circle of the same size as the mark, and it is behind the mark
    // rather than being one, so it is named out rather than taken by position.
    const mark = node.querySelector('circle:not([data-slot="pulse-graph-halo"])') as Element
    found.set(node.getAttribute('data-node') as string, {
      id: node.getAttribute('data-node') as string,
      at: { x: Number(mark.getAttribute('cx')), y: Number(mark.getAttribute('cy')) },
      r: Number(mark.getAttribute('r')),
      labels: [...node.querySelectorAll('text')].map(labelBox),
    })
  }
  return found
}

/** The clearance the drawing keeps around one label's ink. */
function clearanceAround(box: Box): Box {
  return {
    l: box.l - INK_CLEARANCE,
    r: box.r + INK_CLEARANCE,
    t: box.t - INK_CLEARANCE,
    b: box.b + INK_CLEARANCE,
  }
}

/** Whether a point is strictly inside a box, so a point on its edge is clear of it. */
function within(point: Point, box: Box): boolean {
  return point.x > box.l && point.x < box.r && point.y > box.t && point.y < box.b
}

/**
 * The stretch of the ray out of `from` that lies inside `box`, measured as a
 * distance along the ray from `from`, or `null` for a ray that misses it.
 *
 * The same two-axes-and-intersect arithmetic `crosses` uses, over the ray rather
 * than over one fixed pair of points, because the trim rule is a question about how
 * far along a direction a stroke may go rather than about one fixed pair of points.
 * The division is by the length rather than left as a share of the segment, because
 * every distance this file compares the answer against is measured from the mark in
 * user units, and a share of a segment is not one.
 */
function alongRay(from: Point, toward: Point, box: Box): { enter: number; leave: number } | null {
  const length = Math.hypot(toward.x - from.x, toward.y - from.y)
  if (length === 0) return null
  const dx = (toward.x - from.x) / length
  const dy = (toward.y - from.y) / length
  let enter = 0
  let leave = Number.POSITIVE_INFINITY
  for (const [origin, delta, low, high] of [
    [from.x, dx, box.l, box.r],
    [from.y, dy, box.t, box.b],
  ]) {
    if (delta === 0) {
      if (origin < low || origin > high) return null
      continue
    }
    const near = (low - origin) / delta
    const far = (high - origin) / delta
    enter = Math.max(enter, Math.min(near, far))
    leave = Math.min(leave, Math.max(near, far))
    if (enter > leave) return null
  }
  return { enter, leave }
}

/**
 * Everything wrong with one end of one rendered connector, as sentences.
 *
 * **This is the trim rule as three properties of the drawing rather than as the
 * Component's arithmetic**, so a test can hold the rule without holding the
 * implementation of it. An endpoint has to be:
 *
 *   1. *on the way*: between the two mark centres, so a stroke that overshot its
 *      own target is a finding rather than a longer line.
 *   2. *clear*: outside its mark's own edge plus the clearance, and clear of every
 *      label printed under that mark. So nothing runs through anything, which is the
 *      rule's first half.
 *   3. *stopped by something*: either the endpoint is at its mark's own edge plus
 *      the clearance, which is where an unobstructed stroke must end, or it is at
 *      the far side of a label the ray actually ran through. A ray that runs
 *      through a label's clearance is stopped there, and only there.
 *
 * Property 3 is the one that catches a detached connector. A stroke trimmed to the
 * widest label at its node is clear and on the way, and it stops tens of units
 * before its mark with open canvas the whole way, so 1 and 2 pass and 3 fails.
 */
function faultsAt(endpoint: Point, here: Drawn, toward: Point): string[] {
  const faults: string[] = []
  const at = `${endpoint.x.toFixed(2)},${endpoint.y.toFixed(2)}`
  const length = Math.hypot(toward.x - here.at.x, toward.y - here.at.y)
  const along = Math.hypot(endpoint.x - here.at.x, endpoint.y - here.at.y)
  if (length === 0) return [`${here.id} and its target share a mark, so no trim is measurable`]

  const on = (toward.x - here.at.x) * (endpoint.x - here.at.x) +
    (toward.y - here.at.y) * (endpoint.y - here.at.y)
  if (on <= 0 || along >= length) {
    faults.push(`the end at ${at} is not between the two marks`)
  }

  const floor = here.r + INK_CLEARANCE
  if (along < floor - EPSILON) {
    faults.push(`the end at ${at} is ${(floor - along).toFixed(2)} inside ${here.id}'s mark clearance`)
  }

  // Every label the ray reaches before it stops has to be behind it or stopped at,
  // and one of them has to be the reason it stopped, or the stroke is short for
  // nothing at all.
  let stoppedBy: string | null = null
  for (const box of here.labels) {
    const span = alongRay(here.at, toward, clearanceAround(box))
    if (span === null || span.enter >= along - EPSILON) continue
    if (span.leave > along + EPSILON) {
      faults.push(`${here.id} has a label the stroke ends inside, so the stroke crosses it`)
      continue
    }
    if (Math.abs(span.leave - along) <= EPSILON) stoppedBy = 'a label'
  }
  if (stoppedBy === null && Math.abs(along - floor) > EPSILON) {
    faults.push(
      `the end at ${at} is ${(along - floor).toFixed(2)} past ${here.id}'s mark and past no label, so it stops in open canvas`,
    )
  }
  return faults
}

/** Every fault on every end of every connector in one rendering, as sentences. */
function detached(container: HTMLElement): string[] {
  const nodes = drawn(container)
  const faults: string[] = []
  for (const group of container.querySelectorAll('[data-relation]')) {
    const key = group.getAttribute('data-relation') as string
    const [fromId, toId] = key.split('-')
    const here = nodes.get(fromId)
    const there = nodes.get(toId)
    if (!here || !there) continue
    const { from, to } = segmentOf(group.querySelector('line') as Element)
    for (const fault of faultsAt(from, here, there.at)) faults.push(`${key} start: ${fault}`)
    for (const fault of faultsAt(to, there, here.at)) faults.push(`${key} end: ${fault}`)
  }
  return faults
}

describe('no label is drawn below text-xs', () => {
  it('holds the drawing at its own coordinate space and lets the container scroll', () => {
    // The floor is on the drawing and the scroll is on its container, and both are
    // asserted on the rendered markup because both are decisions about layout that a
    // class name is the whole of. A container narrower than the floor must move
    // under the drawing rather than the drawing shrinking below what it says.
    const { container } = render(
      <PulseGraph nodes={STAGES} relations={STAGE_EDGES} label="the pipeline" />,
    )

    const region = container.querySelector('[data-slot="pulse-graph-container"]')
    expect(region?.getAttribute('class')).toContain('overflow-x-auto')

    const svg = container.querySelector('svg') as SVGSVGElement
    const floor = [...svg.classList].find((name) => name.startsWith('min-w-'))
    expect(floor, 'the drawing carries no floor of its own').toBeTruthy()
    expect(svg.getAttribute('class')).toContain('w-full')
  })

  it('renders the smallest label at no less than the smallest step the interface sets type at', () => {
    // The arithmetic, read from four places rather than asserted in prose: the
    // canvas and the label sizes off the rendered markup, the floor off the
    // rendered class and the shipped stylesheet, and the size the claim is against
    // off the emitted token source. A label's rendered size is its size in user
    // units times the rendered width over the canvas, so holding the drawing at its
    // own coordinate space makes that product the label's own size, and the claim
    // is that the smallest of those is no less than `text-xs`.
    const { container } = render(
      <PulseGraph nodes={STAGES} relations={STAGE_EDGES} label="the pipeline" />,
    )

    const svg = container.querySelector('svg') as SVGSVGElement
    const canvas = Number(/0 0 (\d+)/.exec(svg.getAttribute('viewBox') ?? '')?.[1])
    const smallest = Math.min(
      ...[...container.querySelectorAll('text')].map((text) =>
        Number(text.getAttribute('font-size')),
      ),
    )
    const floor = [...svg.classList].find((name) => name.startsWith('min-w-')) as string
    // The last hyphen, because `min-w-` has two of them.
    const multiple = Number(floor.slice(floor.lastIndexOf('-') + 1))

    // The floor as the stylesheet emits it, so the class on the markup and the rule
    // in the sheet are held to each other rather than either being taken on trust.
    // `dist/` exists whenever this runs: `turbo.json` gives this package's `test` a
    // `dependsOn` on its own `build`.
    const rule = shippedSheet.rules.find((entry) => entry.selector === `.${floor}`)
    expect(rule, `the shipped sheet emits no rule for \`.${floor}\``).toBeTruthy()
    expect(valueOf(rule!, 'min-width')).toBe(`calc(var(--spacing) * ${multiple})`)

    // The rem the floor is, and the pixels a rem is. Sixteen is the initial font
    // size in CSS, which is what every `rem` in this repository is measured
    // against, and it is stated rather than imported because nothing in the token
    // source declares it.
    const theme = readFileSync(path.join(REPO, 'packages', 'tokens', 'dist', 'theme.css'), 'utf8')
    const spacing = Number(/--spacing:\s*([\d.]+)rem/.exec(theme)?.[1])
    const smallestStep = Number(/--text-xs:\s*([\d.]+)rem/.exec(theme)?.[1])
    const PX_PER_REM = 16
    expect(spacing, 'the emitted spacing base does not parse').toBeGreaterThan(0)
    expect(smallestStep, 'the emitted smallest type step does not parse').toBeGreaterThan(0)

    // One user unit in CSS pixels at the floor, and the smallest label in them.
    const pixelsPerUnit = (multiple * spacing * PX_PER_REM) / canvas
    expect(pixelsPerUnit, 'the drawing is held below its own coordinate space').toBeGreaterThanOrEqual(
      1,
    )
    expect(smallest * pixelsPerUnit).toBeGreaterThanOrEqual(smallestStep * PX_PER_REM)
  })

  it('holds the same floor on a field, which reserves no band for a rail', () => {
    // The two arms of the drawing take different fits, so the floor is asserted on
    // both rather than on the one the fixture that found the defect happened to be.
    const { container } = render(<PulseGraph nodes={FIELD} relations={FIELD_EDGES} label="the field" />)

    const svg = container.querySelector('svg') as SVGSVGElement
    const floor = [...svg.classList].find((name) => name.startsWith('min-w-'))
    expect(floor, 'the field drawing carries no floor of its own').toBeTruthy()
  })
})

describe('no stroke crosses a label', () => {
  it('keeps every connector clear of every name and every note', () => {
    const { container } = render(
      <PulseGraph nodes={STAGES} relations={STAGE_EDGES} label="the pipeline" />,
    )

    // Eight labels, four connectors, thirty-two pairs. Before the connectors were
    // trimmed to the box each node occupies, eight of those pairs intersected, and
    // all eight belonged to the two stages nearest the top of the canvas: each of
    // them had its own name and its own note struck through by the two edges that
    // meet it.
    expect(crossings(container)).toEqual([])
  })

  it('keeps them clear on a field, where a node has no lane and one node has no note', () => {
    const { container } = render(
      <PulseGraph nodes={FIELD} relations={FIELD_EDGES} label="the field" />,
    )

    // Eight labels, three connectors, twenty-four pairs, and two of them met: the
    // note under the emphasised node, which both edges arriving at it ran through.
    expect(crossings(container)).toEqual([])
  })

  it('keeps them clear where two nodes are close enough that the boxes meet', () => {
    // The case the trim has to survive rather than solve. Trimming a stroke to two
    // occupied boxes can in principle leave nothing, and a relation that silently
    // did not draw is the one failure this Component exists to make impossible, so
    // the fallback to the mark boundaries is asserted as well as the clearance.
    const { container } = render(
      <PulseGraph
        nodes={[
          { id: 'a', name: 'a', note: 'left', x: 0.4, y: 0.5, lane: 0 },
          { id: 'b', name: 'b', note: 'right', x: 0.6, y: 0.5, lane: 1 },
        ]}
        relations={[{ from: 'a', to: 'b', carries: true }]}
        label="a close pair"
      />,
    )

    expect(crossings(container)).toEqual([])

    const lines = [...container.querySelectorAll('[data-relation] line')]
    expect(lines).toHaveLength(1)
    expect(segmentOf(lines[0]).from).not.toEqual(segmentOf(lines[0]).to)
  })

  it('leaves every relation drawn, because a trimmed line is still a declared line', () => {
    const { container } = render(
      <PulseGraph nodes={STAGES} relations={STAGE_EDGES} label="the pipeline" />,
    )

    const lines = [...container.querySelectorAll('[data-relation] line')]
    expect(lines).toHaveLength(STAGE_EDGES.length)
    for (const line of lines) {
      const { from, to } = segmentOf(line)
      expect(Math.hypot(to.x - from.x, to.y - from.y)).toBeGreaterThan(0)
    }
    expect(container.querySelectorAll('[data-slot="pulse-graph-flow"]')).toHaveLength(3)
  })
})

describe('the rail clears every note', () => {
  it('keeps the rail clear of the notes on the drawing whose middle stage lands low', () => {
    const { container } = render(
      <PulseGraph nodes={SPINE} relations={SPINE_EDGES} label="the spine" />,
    )

    // One rail, three notes. Before the fit reserved the rail's band, the middle
    // stage's note straddled the rail's own stroke.
    expect(container.querySelectorAll('[data-slot="pulse-graph-rail-line"]')).toHaveLength(1)
    expect(railCrossings(container)).toEqual([])
  })

  it('keeps it clear on the pipeline too, whose last stage sits on the fitted floor', () => {
    const { container } = render(
      <PulseGraph nodes={STAGES} relations={STAGE_EDGES} label="the pipeline" />,
    )

    expect(railCrossings(container)).toEqual([])
  })

  it('has no rail to clear on a field, and draws none', () => {
    const { container } = render(
      <PulseGraph nodes={FIELD} relations={FIELD_EDGES} label="the field" />,
    )

    expect(container.querySelector('[data-slot="pulse-graph-rail-line"]')).toBeNull()
    expect(railCrossings(container)).toEqual([])
  })
})

describe('every connector reaches the marks it joins', () => {
  it('touches both marks of all five connectors on the six-stage rail, at the ink clearance', () => {
    // The headline number, measured rather than asserted about: every end of every
    // connector sits one ink clearance from the edge of the mark it belongs to, and
    // on the side of it the connector comes from.
    //
    // Before the trim stopped asking a label it was never going to enter, four of
    // the five connectors floated free of both their marks: the ends were backed
    // off by the half-width of the name at that node, so `implementation` alone,
    // at a hundred units wide, held both of its connectors fifty units clear of a
    // six-unit mark. The gaps were 16.6 and 32.2 units, then 32.2 and 47.8, then
    // 55.6 and 28.3, then 28.3 and 40, against an allowance of seven.
    const { container } = render(
      <PulseGraph nodes={PIPELINE} relations={PIPELINE_EDGES} label="the factory pipeline" />,
    )

    const nodes = drawn(container)
    const gaps: string[] = []
    for (const group of container.querySelectorAll('[data-relation]')) {
      const key = group.getAttribute('data-relation') as string
      const [fromId, toId] = key.split('-')
      const here = nodes.get(fromId)
      const there = nodes.get(toId)
      expect(here, `${fromId} is not on the markup`).toBeTruthy()
      expect(there, `${toId} is not on the markup`).toBeTruthy()
      const { from, to } = segmentOf(group.querySelector('line') as Element)
      for (const [end, own, other] of [
        [from, here!, there!],
        [to, there!, here!],
      ] as const) {
        // Between the two marks, so an end that overshot its own target is a
        // finding rather than a longer line.
        expect(end.x).toBeGreaterThan(Math.min(own.at.x, other.at.x))
        expect(end.x).toBeLessThan(Math.max(own.at.x, other.at.x))
        const gap = Math.hypot(end.x - own.at.x, end.y - own.at.y) - own.r
        gaps.push(`${key}: ${gap.toFixed(2)}`)
        expect(Math.abs(gap - INK_CLEARANCE)).toBeLessThanOrEqual(EPSILON)
      }
    }
    expect(gaps).toHaveLength(10)
  })

  it('leaves no connector short of a mark on any other drawing the graph takes', () => {
    // The same rule read as a property rather than as a number, so it holds on the
    // drawings whose connectors leave downward and diagonal as well as on the one
    // where every connector is horizontal. A downward connector is stopped by the
    // name under the node it leaves, and that is the only thing allowed to stop it:
    // it must still be the first clear point, and it must still arrive.
    for (const [nodes, edges] of [
      [STAGES, STAGE_EDGES],
      [SPINE, SPINE_EDGES],
      [FIELD, FIELD_EDGES],
    ] as const) {
      const { container } = render(
        <PulseGraph nodes={nodes} relations={edges} label="a drawing" />,
      )
      expect(detached(container), nodes.map((node) => node.id).join(', ')).toEqual([])
    }
  })

  it('lets a diagonal clip a label without clearing the whole node for it', () => {
    // The third case of the rule, and the one a union box cannot express at all.
    // One node with a name wide enough to matter, and two connectors leaving it in
    // different directions: one heading up, which runs away from the name printed
    // under the mark and so reaches that mark, and one heading straight down, which
    // runs into it and so stops below it. The two answers differ by the width of the
    // name and nothing else about the drawing differs.
    const nodes: PulseNode[] = [
      { id: 'hub', name: 'a very wide stage name', note: 'and a very wide note too', x: 0.5, y: 0.6 },
      { id: 'above', name: 'above', x: 0.02, y: 0.3 },
      { id: 'below', name: 'below', x: 0.5, y: 1 },
    ]
    const { container } = render(
      <PulseGraph
        nodes={nodes}
        relations={[
          { from: 'hub', to: 'above', carries: true },
          { from: 'hub', to: 'below', carries: true },
        ]}
        label="a diagonal"
      />,
    )

    expect(detached(container)).toEqual([])
    expect(crossings(container)).toEqual([])

    // The two connectors are trimmed differently at the same mark, which is the
    // whole of the point: the upward one leaves at the mark's own edge, and the
    // downward one leaves past the note printed under the mark it leaves.
    const hub = drawn(container).get('hub') as Drawn
    const leaving = ['hub-above', 'hub-below'].map((key) => {
      const group = container.querySelector(`[data-relation="${key}"]`) as Element
      const { from } = segmentOf(group.querySelector('line') as Element)
      return Math.hypot(from.x - hub.at.x, from.y - hub.at.y)
    })
    expect(Math.abs(leaving[0] - (hub.r + INK_CLEARANCE))).toBeLessThanOrEqual(EPSILON)
    expect(leaving[1]).toBeGreaterThan(leaving[0])
  })
})
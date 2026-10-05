import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Diagram, type DiagramNode, type DiagramRelation } from '../src/components/ui/diagram'

import { shippedSheet, valueOf } from './sheet-reader'

/**
 * A Diagram is a server Component that draws only with the token contract.
 *
 * Three claims are load-bearing and each is asked here through the rendered
 * output rather than through the source, because a source assertion about a
 * class string is a restatement of the source.
 *
 *   1. Every node and every relation is drawn, with its name and its label. The
 *      node's base edges are the part that fails silently: a shape left to its
 *      defaults paints opaque black, and a shape whose stroke colour resolves to
 *      the surface it sits on is an invisible rectangle. A component whose nodes
 *      do not draw is worse than no component, so it is asserted that each mark
 *      carries a stroke width, a fill and a stroke, and that no mark relies on
 *      an initial value.
 *   2. Every one of those inks is a semantic utility, so a scoped `data-pack`
 *      boundary restyles the drawing through the cascade. This is asserted
 *      against the EMITTED contract rather than against a list written here, so
 *      a token rename is a change in the token package and not a change in this
 *      file, and so a class that is not a role at all cannot pass by being
 *      spelled the same way as one that is.
 *   3. It ships no client code. Asserted over the emitted module, because a
 *      `'use client'` line is invisible to a test that only renders the
 *      Component, and it is the one thing here that would put the drawing in the
 *      all-client bundle.
 *   4. A node's second line and a node's pack reach the DOM. Both are props a
 *      migration needed and the Component had nowhere to put, so a type assertion
 *      would have proved nothing: what matters is the second line on the picture
 *      and the boundary on the mark.
 */

const REPO = path.resolve(import.meta.dirname, '..', '..', '..')
const UI = path.join(REPO, 'packages', 'ui')

/** The published token names, read from the emitted contract in both modes. */
function contract(): Set<string> {
  const names = new Set<string>()
  for (const mode of ['light', 'dark']) {
    const css = readFileSync(path.join(REPO, 'packages', 'tokens', 'dist', `${mode}.css`), 'utf8')
    for (const match of css.matchAll(/^\s*(--[a-z0-9-]+):/gm)) names.add(match[1].slice(2))
  }
  return names
}

const NODES: DiagramNode[] = [
  { id: 'issue', name: 'issue', x: 0, y: 0.2 },
  { id: 'factory', name: 'factory', x: 1, y: 0.5, emphasis: true },
  { id: 'review', name: 'review', x: 2, y: 0.8 },
]

const RELATIONS: DiagramRelation[] = [
  { from: 'issue', to: 'factory', label: 'queued' },
  { from: 'factory', to: 'review', label: 'built', indirect: true },
]

/**
 * A schematic of the shape the company site draws: every thing named, and two of
 * the three carrying the one-line role it plays. The third deliberately does
 * not, because a node with no second line is the case a first-class field has to
 * render rather than leave a gap.
 */
const DESCRIBED: DiagramNode[] = [
  { id: 'tokens', name: 'Tokens', subtitle: 'the shared language', x: 0, y: 0.2 },
  { id: 'pipeline', name: 'Pipeline', subtitle: 'the engine', x: 1, y: 0.5, emphasis: true },
  { id: 'twins', name: 'Twins', x: 2, y: 0.8 },
]

/** Three nodes, three answers about a pack: one wears it, one is the base, one has none. */
const PACKED: DiagramNode[] = [
  { id: 'alpha', name: 'Alpha', x: 0, y: 0.2, pack: 'mint' },
  { id: 'beta', name: 'Beta', x: 1, y: 0.5, pack: 'default' },
  { id: 'gamma', name: 'Gamma', x: 2, y: 0.8 },
]

/** Every paint utility in the rendered output, across the whole tree. */
function paintClasses(container: HTMLElement): string[] {
  return [...container.querySelectorAll('*')].flatMap((element) =>
    [...element.classList].filter((name) => /^(?:fill|stroke)-/.test(name)),
  )
}

describe('a Diagram draws what its data names', () => {
  it('renders every node with its name, addressed by its own id', () => {
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    for (const node of NODES) {
      const drawn = container.querySelector(`[data-node="${node.id}"]`)
      expect(drawn, `${node.id} is not on the markup`).not.toBeNull()
      expect(drawn?.textContent).toBe(node.name)
    }
  })

  it('renders every relation with its label', () => {
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    for (const relation of RELATIONS) {
      const drawn = container.querySelector(
        `[data-relation="${relation.from}-${relation.to}"]`,
      )
      expect(drawn, `${relation.from} to ${relation.to} is not on the markup`).not.toBeNull()
      expect(drawn?.textContent).toBe(relation.label)
    }
  })

  it('dashes a relation marked indirect and leaves a direct one solid', () => {
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    const direct = container.querySelector('[data-relation="issue-factory"] path')
    const indirect = container.querySelector('[data-relation="factory-review"] path')
    expect(direct).not.toHaveAttribute('stroke-dasharray')
    expect(indirect).toHaveAttribute('stroke-dasharray')
  })

  it('draws the same shape from any coordinate scale the caller uses', () => {
    // The reason the canvas is fixed rather than derived from the caller's
    // numbers: a viewBox taken from the caller's coordinates would make the
    // label size a function of how large a number the caller happened to use.
    const scaled = NODES.map((node) => ({ ...node, x: node.x * 4000, y: node.y * 4000 }))

    const small = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)
    const large = render(<Diagram nodes={scaled} relations={RELATIONS} label="the loop" />)

    const at = (container: HTMLElement, id: string) =>
      container.querySelector(`[data-node="${id}"] circle`)?.getAttribute('cx')
    for (const node of NODES) {
      expect(at(small.container, node.id)).toBe(at(large.container, node.id))
    }
  })

  it('reports a relation that names a node it does not have, rather than dropping it silently', () => {
    const { container } = render(
      <Diagram
        nodes={NODES}
        relations={[...RELATIONS, { from: 'issue', to: 'nowhere', label: 'invented' }]}
        label="the loop"
      />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-unresolved-relations', '1')
    expect(container.querySelector('[data-relation="issue-nowhere"]')).toBeNull()
  })
})

describe('a node carries a second line, and the name is read off it', () => {
  it('draws the second line under the name, and draws none for a node with no second line', () => {
    const { container } = render(<Diagram nodes={DESCRIBED} relations={[]} label="the stack" />)

    for (const node of DESCRIBED) {
      const drawn = container.querySelector(`[data-node="${node.id}"]`)
      const second = drawn?.querySelector('[data-slot="diagram-node-subtitle"]')

      if (node.subtitle === undefined) {
        // No empty text element standing where a line would be: a gap is not a
        // line, and an empty `<text>` is ink a reader can see and a test counts.
        expect(second, `${node.id} drew a subtitle it was not given`).toBeNull()
        expect(drawn?.textContent).toBe(node.name)
        continue
      }

      expect(second, `${node.id} lost its second line`).not.toBeNull()
      expect(second?.textContent).toBe(node.subtitle)
      // The name is still the name, and the line is under it rather than instead
      // of it, which is the whole of what "a second line" is.
      expect([...drawn!.querySelectorAll('text')].map((text) => text.textContent)).toEqual([
        node.name,
        node.subtitle,
      ])
      expect(Number(second?.getAttribute('y'))).toBeGreaterThan(
        Number(drawn?.querySelector('text')?.getAttribute('y')),
      )
    }
  })

  it('keeps the second line inside the canvas, because the band pays for it once', () => {
    // A server Component cannot measure text, so PADDING is a band of user units
    // paid once for the deepest thing a node draws. A second line that came out
    // under the band's floor would put a node's own words off the bottom of the
    // drawing, and the failure would be a drawing that looks finished.
    const { container } = render(<Diagram nodes={DESCRIBED} relations={[]} label="the stack" />)

    const viewBox = container.querySelector('svg')?.getAttribute('viewBox')
    const floor = Number(/0 0 \d+ (\d+)/.exec(viewBox ?? '')?.[1])
    expect(floor).toBeGreaterThan(0)

    for (const text of container.querySelectorAll('[data-slot="diagram-node-subtitle"]')) {
      expect(Number(text.getAttribute('y'))).toBeLessThan(floor)
    }
  })

  it('names the drawing from the nodes own text when the caller names it nowhere', () => {
    // The defect this replaces: a role description that existed only inside the
    // accessible name, which served a screen reader and gave a sighted reader
    // looking at the picture nothing. The name is now read off the marks, so the
    // drawn line and the announced one are the same field and cannot disagree.
    render(<Diagram nodes={DESCRIBED} relations={[]} />)

    const image = screen.getByRole('img')
    expect(image.getAttribute('aria-label')).toBe(
      'Tokens (the shared language), Pipeline (the engine), Twins',
    )
    // Every word of it is a word on the picture, which is what makes it derived
    // rather than a second sentence about the same drawing.
    for (const node of DESCRIBED) expect(image.getAttribute('aria-label')).toContain(node.name)
  })

  it('still lets the caller name the drawing, because a label says what it is', () => {
    render(<Diagram nodes={DESCRIBED} relations={[]} label="How a finding is published" />)

    expect(screen.getByRole('img', { name: 'How a finding is published' })).toBeTruthy()
  })

  it('falls back to the derived name rather than announcing an unnamed image', () => {
    // An empty label is the same answer as no label. Announcing it would be the
    // one value an accessible name must never take, and the caller who passed it
    // has said no more than the caller who passed nothing.
    render(<Diagram nodes={DESCRIBED} relations={[]} label="" />)

    expect(screen.getByRole('img', { name: /Tokens/ })).toBeTruthy()
  })

  it('leaves a decorative drawing with no name even when its nodes have text', () => {
    const { container } = render(<Diagram nodes={DESCRIBED} relations={[]} decorative />)

    expect(container.querySelector('svg')).not.toHaveAttribute('aria-label')
    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('a node wears its own pack, on the mark and nowhere else', () => {
  it('lands the boundary on the circle the node draws', () => {
    const { container } = render(<Diagram nodes={PACKED} relations={[]} label="the set" />)

    expect(container.querySelector('[data-node="alpha"] circle')).toHaveAttribute('data-pack', 'mint')
  })

  it('puts the boundary nowhere else, so one node cannot re-ink the drawing', () => {
    const { container } = render(<Diagram nodes={PACKED} relations={[]} label="the set" />)

    // Not on the drawing and not on the node's group. A boundary on the `<svg>`
    // would restyle every mark in the picture from one node's pack, which is the
    // per-diagram answer the JSDoc rules out rather than forgets to offer.
    expect(container.querySelector('svg')).not.toHaveAttribute('data-pack')
    expect(container.querySelector('[data-node="alpha"]')).not.toHaveAttribute('data-pack')
    // And the marks that were not given a pack are untouched.
    expect(container.querySelector('[data-node="gamma"] circle')).not.toHaveAttribute('data-pack')
  })

  it('expresses the base pack as the absence of the attribute, as the token build spells it', () => {
    const { container } = render(<Diagram nodes={PACKED} relations={[]} label="the set" />)

    // `default` is a real pack and it is a boundary matching no emitted rule if it
    // is written as an attribute, so it is written as nothing and the mark
    // resolves from the page. ProductMark spells it the same way for the same
    // reason.
    expect(container.querySelector('[data-node="beta"] circle')).not.toHaveAttribute('data-pack')
  })

  it('keeps the boundary off every shape a pack could re-round', () => {
    const { container } = render(<Diagram nodes={PACKED} relations={[]} label="the set" />)

    // The pack-boundary law's own sentence: a boundary belongs on a fully
    // rounded element, on an element carrying no radius utility, or on a shape
    // with no radius concept. A circle is the third, so the boundary moves colour
    // and nothing else, and the gate reads the exempt shape off the tag.
    for (const boundary of container.querySelectorAll('[data-pack]')) {
      expect(boundary.tagName.toLowerCase()).toBe('circle')
      expect(boundary.getAttribute('class') ?? '').not.toMatch(/(?:^|\s)rounded/)
    }
  })

  it('lands on selectors the emitted contract publishes for that pack, in both modes', () => {
    // The attribute is only half of a boundary. The other half is that the
    // contract publishes the selector this Component writes, which is read from
    // the emitted CSS rather than asserted here, so a pack that stopped emitting
    // a form fails this rather than passing on a string written in this file.
    const emitted = (pack: string, mode: string) =>
      readFileSync(
        path.join(REPO, 'packages', 'tokens', 'dist', 'themes', pack, `${mode}.css`),
        'utf8',
      )

    // Light is the one-member list, and the boundary is a descendant of the
    // document, so a plain attribute selector is what it has to match.
    expect(emitted('mint', 'light')).toContain('[data-pack="mint"]')
    // Dark is the two-member list. A boundary carries the pack attribute alone and
    // wears its ancestor's mode, so it is the DESCENDANT form a boundary written
    // by a server Component depends on; the compound form is the published
    // sibling of it and the gate asserts both are one declaration.
    expect(emitted('mint', 'dark')).toContain('[data-pack="mint"].dark')
    expect(emitted('mint', 'dark')).toContain('.dark [data-pack="mint"]')
  })
})

describe("a node's base edges are guaranteed to draw", () => {
  it('gives every node mark an explicit stroke width, a fill and a stroke', () => {
    // The two ways a shape fails to draw, answered on every mark. `stroke-width`
    // has an initial value of 1, so the width is not what fails; what fails is a
    // mark whose stroke colour resolves to the surface it sits on, or a width
    // utility dropped in an edit. Nothing here relies on an initial value, and
    // nothing relies on `currentColor`.
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    const marks = [...container.querySelectorAll('[data-node] circle')]
    expect(marks).toHaveLength(NODES.length)
    for (const mark of marks) {
      // The attribute, not `className.baseVal`: jsdom exposes `className` on an
      // SVG element as a plain string rather than as an `SVGAnimatedString`, and
      // the attribute is the same string a stylesheet matches on.
      const classes = mark.getAttribute('class') ?? ''
      expect(mark.getAttribute('stroke-width')).toBeTruthy()
      expect(classes).toMatch(/fill-/)
      expect(classes).toMatch(/stroke-/)
    }
  })

  it('gives every relation path an explicit fill of none, so no path paints black', () => {
    // The other half: a path with no fill and no `fill: none` paints opaque
    // black over the whole line box, which would cover the labels.
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    const paths = [...container.querySelectorAll('[data-relation] path')]
    expect(paths).toHaveLength(RELATIONS.length)
    for (const path of paths) {
      expect(path.getAttribute('class')).toContain('fill-none')
      expect(path.getAttribute('stroke-width')).toBeTruthy()
    }
  })

  it('never resolves an ink through currentColor, which is what makes an edge invisible', () => {
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    for (const element of container.querySelectorAll('*')) {
      for (const attribute of ['fill', 'stroke', 'style']) {
        expect(element.getAttribute(attribute)).not.toBe('currentColor')
      }
      for (const name of element.classList) {
        expect(name).not.toMatch(/^(?:fill|stroke|border)-(?:current|currentColor)$/)
      }
    }
  })
})

describe('every ink a Diagram draws is a token', () => {
  it('names a published contract role for every fill and stroke', () => {
    // Read against the emitted contract rather than a list written here, so a
    // token rename is a change in the token package and not a change in this
    // file, and so a class that is not a role at all cannot pass by being
    // spelled like one that is.
    const published = contract()
    expect(published.size).toBeGreaterThan(0)

    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)
    const used = paintClasses(container)
    expect(used.length).toBeGreaterThan(0)

    for (const name of used) {
      const [, role] = name.match(/^(?:fill|stroke)-(.+)$/) ?? []
      expect(
        role === 'none' || published.has(role),
        `"${name}" names no published token, so a scoped pack boundary cannot restyle it`,
      ).toBe(true)
    }
  })

  it('holds no colour of its own anywhere in the module', () => {
    // The source half of the same claim, and the half a rendered assertion
    // cannot make: a value that is never rendered is still a value that would
    // stop moving when a pack boundary lands above it. The gate that holds this
    // over the whole file is `scripts/check-vector-ink.mjs`.
    const source = readFileSync(path.join(UI, 'src', 'components', 'ui', 'diagram.tsx'), 'utf8')
    const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')

    expect(code).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(code).not.toMatch(/\b(?:rgba?|hsla?|hwb|oklch|oklab|color-mix)\s*\(/)
    for (const match of code.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
      expect(contract().has(match[1].slice(2)), `var(${match[1]}) is not published`).toBe(true)
    }
  })

  it('draws a shape the pack cannot re-round, so a boundary moves colour and nothing else', () => {
    // The corrected half of the pack-boundary law: a `<rect>`'s corner attribute
    // is a CSS property and does follow a boundary, and no utility pins it. So
    // the node mark is a circle and a relation is a path, both of which have no
    // radius concept at all.
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    expect(container.querySelectorAll('[data-node] circle')).toHaveLength(NODES.length)
    expect(container.querySelectorAll('[data-relation] path')).toHaveLength(RELATIONS.length)
    expect(container.querySelector('rect')).toBeNull()
  })
})

describe('a Diagram is accessible without a hook, a mode or a provider', () => {
  it('is one named image, and says nothing twice', () => {
    render(<Diagram nodes={NODES} relations={RELATIONS} label="how an issue becomes a merge" />)

    // role="img" collapses the subtree, so the node names and relation words are
    // drawn for sighted readers and the name is the one thing a screen reader
    // reads. There is no `<title>`, so no name is stranded in the tree.
    const image = screen.getByRole('img', { name: 'how an issue becomes a merge' })
    expect(image.tagName.toLowerCase()).toBe('svg')
    expect(image.querySelector('title')).toBeNull()
  })

  it('leaves the tree entirely when decorative, naming nothing inside it', () => {
    const { container } = render(
      <Diagram nodes={NODES} relations={RELATIONS} decorative />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
    expect(svg).not.toHaveAttribute('aria-label')
    expect(svg?.querySelector('title')).toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('ships no client code, so a consumer renders it from a server file', () => {
    // Read from the SOURCE, not from `dist/`. A `'use client'` line is written in
    // the source and the build does not add one, so the emitted module proves
    // nothing extra - and `dist/` is this package's own build output, which turbo
    // does not build before its own `test` task (`test` depends on `^build`, the
    // dependencies' builds). An earlier version of this assertion read `dist/`
    // and failed in CI on a clean runner for the want of a file, having passed
    // everywhere it ran after a local build. A test that only passes once
    // something else has run is a test of the order things ran in.
    const source = readFileSync(path.join(UI, 'src', 'components', 'ui', 'diagram.tsx'), 'utf8')
    // The same classification `check-client-budget.mjs` uses, so a directive
    // added here would put the drawing on the client roster.
    expect(/^['"]use client['"]/m.test(source)).toBe(false)
    expect(/from ['"]react['"].*\buse(State|Effect|Memo|Callback|Ref|Reducer|Context)\b/.test(source)).toBe(
      false,
    )
  })

  it('spreads no other prop, so a caller cannot hand the drawing a stroke of its own', () => {
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    const svg = container.querySelector('svg') as SVGSVGElement
    for (const attribute of [...svg.attributes].map((entry) => entry.name)) {
      expect(['class', 'role', 'aria-label', 'aria-hidden', 'viewBox', 'xmlns', 'data-slot',
        'data-unresolved-relations']).toContain(attribute)
    }
  })

  it('accepts className for layout only and keeps it off the drawing', () => {
    const { container } = render(
      <Diagram nodes={NODES} relations={RELATIONS} label="the loop" className="w-1/2" />,
    )

    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.getAttribute('class')).toContain('w-1/2')
    expect(svg.getAttribute('class')).toContain('h-auto')
  })
})

/**
 * The geometry a Diagram holds itself to, read out of the markup it renders.
 *
 * **Why this is measured rather than read off the class strings.** The two
 * claims below are about the space between things: a stroke that does not cross a
 * label, and a label that does not render below `text-xs`. Neither is visible in
 * a class name, a snapshot, or anything jsdom can compute, because jsdom resolves
 * no cascade and lays nothing out. What it does render is the drawing's own
 * arithmetic: every mark's centre, every label's baseline and size, and every
 * stroke's two end points, all as numbers. So the test reconstructs the geometry
 * from those and asks the two questions about it.
 *
 * The three face metrics below are the Component's, restated because they are
 * private to it, and restated rather than exported because exporting a private
 * constant to a test is a public surface added for the test's sake. They are the
 * metrics of the monospaced face every label carries rather than a decision about
 * this drawing, so they are stated once here and used by every box below.
 *
 * `INK_CLEARANCE` is restated on the same terms and for the same reason, and it is
 * the one number the trim rule turns on. `EPSILON` is half a stroke width and is
 * the tolerance every geometric assertion below is held to.
 */
const MONO_ADVANCE = 0.6
const LABEL_ASCENT = 0.8
const LABEL_DESCENT = 0.25
const INK_CLEARANCE = 7
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

/** The two ends of one rendered stroke, from the `d` the Component wrote. */
function strokeOf(path: Element): { from: Point; to: Point } {
  const numbers = (path.getAttribute('d') ?? '').match(/-?\d+(?:\.\d+)?/g) ?? []
  expect(numbers).toHaveLength(4)
  return {
    from: { x: Number(numbers[0]), y: Number(numbers[1]) },
    to: { x: Number(numbers[2]), y: Number(numbers[3]) },
  }
}

/** Whether a stroke passes through a box, which is the question the rule is about. */
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

/** Every label against every stroke in one rendered drawing, as `label against relation`. */
function crossings(container: HTMLElement): string[] {
  const groups = [...container.querySelectorAll('[data-relation]')]
  const strokes = groups.map((group) => strokeOf(group.querySelector('path') as Element))
  const hits: string[] = []
  for (const label of container.querySelectorAll('text')) {
    const box = labelBox(label)
    groups.forEach((group, index) => {
      if (crosses(strokes[index].from, strokes[index].to, box)) {
        hits.push(`"${label.textContent}" against ${group.getAttribute('data-relation')}`)
      }
    })
  }
  return hits
}

/** One drawn node's mark and the labels printed under it, read off the markup. */
type Drawn = { id: string; at: Point; r: number; labels: Box[] }

/** Every drawn node in one rendering, addressed by the id its own group carries. */
function drawn(container: HTMLElement): Map<string, Drawn> {
  const found = new Map<string, Drawn>()
  for (const node of container.querySelectorAll('[data-node]')) {
    const mark = node.querySelector('circle') as Element
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

/**
 * The stretch of the line out of `from` that lies inside `box`, measured as a
 * distance along it, or `null` for a line that misses the box.
 *
 * The same two-axes-and-intersect arithmetic `crosses` uses, over the whole line
 * rather than over one fixed pair of points, because the trim rule is a question
 * about how far along a direction a stroke may go rather than about one fixed pair
 * of points.
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
 * Everything wrong with one end of one rendered relation, as sentences.
 *
 * **This is the trim rule as three properties of the drawing rather than as the
 * Component's arithmetic**, so a test can hold the rule without holding the
 * implementation of it. An endpoint has to be:
 *
 *   1. *on the way*: between the two mark centres, so a relation that overshot its
 *      own target is a finding rather than a longer line.
 *   2. *clear*: outside its mark's own edge plus the clearance. So nothing runs
 *      through anything, which is the rule's first half.
 *   3. *stopped by something*: either the endpoint is at its mark's own edge plus
 *      the clearance, which is where an unobstructed relation must end, or it is at
 *      the far side of a label the line actually ran through. A relation that runs
 *      through a label is stopped there, and only there.
 *
 * Property 3 is the one that catches a detached relation. A stroke trimmed to the
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

  let stoppedBy = false
  for (const box of here.labels) {
    const span = alongRay(here.at, toward, clearanceAround(box))
    if (span === null || span.enter >= along - EPSILON) continue
    if (span.leave > along + EPSILON) {
      faults.push(`${here.id} has a label the stroke ends inside, so the stroke crosses it`)
      continue
    }
    if (Math.abs(span.leave - along) <= EPSILON) stoppedBy = true
  }
  if (!stoppedBy && Math.abs(along - floor) > EPSILON) {
    faults.push(
      `the end at ${at} is ${(along - floor).toFixed(2)} past ${here.id}'s mark and past no label, so it stops in open canvas`,
    )
  }
  return faults
}

/** Every fault on every end of every relation in one rendering, as sentences. */
function detached(container: HTMLElement): string[] {
  const nodes = drawn(container)
  const faults: string[] = []
  for (const group of container.querySelectorAll('[data-relation]')) {
    const key = group.getAttribute('data-relation') as string
    const [fromId, toId] = key.split('-')
    const here = nodes.get(fromId)
    const there = nodes.get(toId)
    if (!here || !there) continue
    const { from, to } = strokeOf(group.querySelector('path') as Element)
    for (const fault of faultsAt(from, here, there.at)) faults.push(`${key} start: ${fault}`)
    for (const fault of faultsAt(to, there, here.at)) faults.push(`${key} end: ${fault}`)
  }
  return faults
}

/**
 * The shape the company site draws: five nodes, a spine down the middle, two
 * products off it and one thing under both.
 *
 * It is here rather than a fixture invented for the assertion because this is the
 * drawing the defect was measured on, and the two properties it exercises are
 * exactly the two the shape is worst at: all five of its edges leave a node
 * downward, so all five crossed the name printed under the node they left, and
 * one of its relations is vertical, so its label's own width runs across the
 * line rather than along it.
 */
const SPINE: DiagramNode[] = [
  { id: 'prism', name: 'Prism', x: 380, y: 62 },
  { id: 'nexus', name: 'Nexus', x: 380, y: 196 },
  { id: 'atlas', name: 'Atlas', x: 205, y: 330 },
  { id: 'alphalens', name: 'AlphaLens', x: 555, y: 330 },
  { id: 'future', name: 'Future Products', x: 380, y: 442 },
]

const SPINE_RELATIONS: DiagramRelation[] = [
  { from: 'prism', to: 'nexus', label: 'feeds' },
  { from: 'nexus', to: 'atlas', label: 'builds' },
  { from: 'nexus', to: 'alphalens', label: 'builds' },
  { from: 'atlas', to: 'future', label: 'points at', indirect: true },
  { from: 'alphalens', to: 'future', label: 'points at', indirect: true },
]

/** A loop with a second line under three of its four nodes, so the deepest band is in play. */
const LOOP: DiagramNode[] = [
  { id: 'capture', name: 'Capture', subtitle: 'the first draft', x: 0.12, y: 0.3 },
  { id: 'read', name: 'Read', subtitle: 'a person decides', x: 0.5, y: 0.62, emphasis: true },
  { id: 'review', name: 'Review', subtitle: 'the automated pass', x: 0.88, y: 0.3 },
  { id: 'publish', name: 'Publish', x: 0.5, y: 0.12 },
]

const LOOP_RELATIONS: DiagramRelation[] = [
  { from: 'capture', to: 'read', label: 'feeds' },
  { from: 'read', to: 'review', label: 'raises' },
  { from: 'review', to: 'publish', label: 'confirms', indirect: true },
  { from: 'publish', to: 'capture', label: 'returns' },
]

/**
 * Three things on one baseline, every one of them named at length, and two
 * relations along the row.
 *
 * It is here for one property the spine cannot exercise. Every relation on the
 * spine leaves a node downward, so every one of them is stopped by the name printed
 * under the node it leaves and none of them is stopped by the width of that name.
 * A relation along a row is the opposite: nothing is in front of it at all, so
 * nothing may trim it, and before the trim stopped asking each label on its own the
 * four ends of these two relations stood sixty units clear of their marks because
 * the names beside them were long.
 */
const BASELINE: DiagramNode[] = [
  { id: 'future', name: 'Future Products', x: 0, y: 0.5 },
  { id: 'alphalens', name: 'AlphaLens', x: 0.5, y: 0.5, emphasis: true },
  { id: 'atlas', name: 'Digital Twin Platform', x: 1, y: 0.5 },
]

const BASELINE_RELATIONS: DiagramRelation[] = [
  { from: 'future', to: 'alphalens', label: 'builds' },
  { from: 'alphalens', to: 'atlas', label: 'builds' },
]

describe('no stroke crosses a label', () => {
  it('keeps every stroke clear of every label on the drawing that shipped the defect', () => {
    const { container } = render(
      <Diagram nodes={SPINE} relations={SPINE_RELATIONS} label="the architecture" />,
    )

    // Five labels, five strokes, twenty-five pairs. Before the strokes were
    // trimmed to the box each node occupies, ten of those pairs intersected: every
    // one of the five node names was struck through by an edge leaving its own
    // node, and every one of the five relation labels sat on its own line.
    expect(crossings(container)).toEqual([])
  })

  it('keeps them clear on a loop with second lines, which is the deepest ink a node draws', () => {
    const { container } = render(
      <Diagram nodes={LOOP} relations={LOOP_RELATIONS} label="the loop" />,
    )

    expect(crossings(container)).toEqual([])
  })

  it('keeps them clear on a horizontal pair, where a relation label runs along its line', () => {
    // The other orientation. A label's width runs along a horizontal line and
    // across a vertical one, so a single offset that clears the first leaves the
    // second sitting on its own stroke.
    const { container } = render(
      <Diagram
        nodes={[
          { id: 'left', name: 'Left', x: 0, y: 0.5 },
          { id: 'right', name: 'Right', x: 1, y: 0.5 },
        ]}
        relations={[{ from: 'left', to: 'right', label: 'hands to' }]}
        label="a pair"
      />,
    )

    expect(crossings(container)).toEqual([])
  })

  it('leaves every relation drawn, because a trimmed line is still a declared line', () => {
    // The other half of the same rule. Trimming a stroke to two occupied boxes
    // can in principle leave nothing, and a relation that silently did not draw is
    // the one failure this Component exists to make impossible.
    const { container } = render(
      <Diagram nodes={SPINE} relations={SPINE_RELATIONS} label="the architecture" />,
    )

    const paths = [...container.querySelectorAll('[data-relation] path')]
    expect(paths).toHaveLength(SPINE_RELATIONS.length)
    for (const path of paths) {
      const { from, to } = strokeOf(path)
      expect(Math.hypot(to.x - from.x, to.y - from.y)).toBeGreaterThan(0)
    }
  })
})

describe('every relation reaches the marks it joins', () => {
  it('touches both marks of both relations on a row, at the ink clearance', () => {
    // The headline number, measured rather than asserted about: where nothing is in
    // front of a relation, both of its ends sit one ink clearance from the edge of
    // the mark they belong to, and on the side of it the relation comes from.
    //
    // Before the trim stopped asking each label on its own, the four ends of these
    // two relations stood 60.5 units clear of their marks rather than seven, because
    // each was backed off by the half-width of the longest name beside it.
    const { container } = render(
      <Diagram nodes={BASELINE} relations={BASELINE_RELATIONS} label="the row" />,
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
      const { from, to } = strokeOf(group.querySelector('path') as Element)
      for (const [end, own, other] of [
        [from, here!, there!],
        [to, there!, here!],
      ] as const) {
        expect(end.x).toBeGreaterThan(Math.min(own.at.x, other.at.x))
        expect(end.x).toBeLessThan(Math.max(own.at.x, other.at.x))
        const gap = Math.hypot(end.x - own.at.x, end.y - own.at.y) - own.r
        gaps.push(`${key}: ${gap.toFixed(2)}`)
        expect(Math.abs(gap - INK_CLEARANCE)).toBeLessThanOrEqual(EPSILON)
      }
    }
    expect(gaps).toHaveLength(4)
  })

  it('reaches the mark at the end of the vertical relation, and stops below the name at the one it leaves', () => {
    // The other case, and the one the rule's direction clause is about. The stroke
    // runs straight down the spine, so the name printed under `Prism` is directly in
    // front of it and it must stop below that name rather than run through it; the
    // name printed under `Nexus` is behind the stroke's far end, so nothing about it
    // may shorten the stroke, and that end sits one clearance from the mark.
    //
    // The two ends are therefore not the same distance from their marks, and the
    // drawing is only right when it says so. The near end cannot be pulled in to the
    // clearance without putting the line through the word `Prism`, so the rule is not
    // "every end is one clearance from its mark" and never was.
    const { container } = render(
      <Diagram nodes={SPINE} relations={SPINE_RELATIONS} label="the architecture" />,
    )

    const nodes = drawn(container)
    const prism = nodes.get('prism') as Drawn
    const nexus = nodes.get('nexus') as Drawn
    const group = container.querySelector('[data-relation="prism-nexus"]') as Element
    const { from, to } = strokeOf(group.querySelector('path') as Element)

    // Far end: one clearance from the mark it arrives at.
    const atNexus = Math.hypot(to.x - nexus.at.x, to.y - nexus.at.y) - nexus.r
    expect(Math.abs(atNexus - INK_CLEARANCE)).toBeLessThanOrEqual(EPSILON)

    // Near end: below the name printed under `Prism`, and further out than the
    // clearance, because that name is the reason.
    const prismName = prism.labels[0] as Box
    expect(from.y).toBeGreaterThan(prismName.b + INK_CLEARANCE - EPSILON)
    expect(from.x).toBeCloseTo(prism.at.x, 6)
    const atPrism = Math.hypot(from.x - prism.at.x, from.y - prism.at.y) - prism.r
    expect(atPrism).toBeGreaterThan(INK_CLEARANCE)

    // And nothing about `Nexus`'s own name shortened that end, which is the half of
    // the rule that has to hold for a name printed below the mark a stroke arrives
    // at: the stroke stops above the name rather than after it.
    const nexusName = nexus.labels[0] as Box
    expect(to.y).toBeLessThan(nexusName.t - INK_CLEARANCE + EPSILON)
  })

  it('leaves no relation short of a mark on any drawing the Component takes', () => {
    // The same rule read as a property rather than as a number, so it holds on the
    // drawings whose relations leave downward and diagonal as well as on the one
    // where every relation is along a row. A relation leaving downward is stopped by
    // the name under the node it leaves, and that is the only thing allowed to stop
    // it: it must still be the first clear point, and it must still arrive.
    for (const [nodes, edges] of [
      [SPINE, SPINE_RELATIONS],
      [LOOP, LOOP_RELATIONS],
      [DESCRIBED, []],
    ] as const) {
      const { container } = render(<Diagram nodes={nodes} relations={edges} label="a drawing" />)
      expect(detached(container), nodes.map((node) => node.id).join(', ')).toEqual([])
    }
  })
})

describe('no label is drawn below text-xs', () => {
  it('holds the drawing at its own coordinate space and lets the container scroll', () => {
    // The floor is on the drawing and the scroll is on its container, and both are
    // asserted on the rendered markup because both are decisions about layout
    // that a class name is the whole of. A container narrower than the floor must
    // move under the drawing rather than the drawing shrinking below what it says.
    const { container } = render(<Diagram nodes={NODES} relations={RELATIONS} label="the loop" />)

    const region = container.querySelector('[data-slot="diagram-container"]')
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
    // units times the rendered width over the canvas, so holding the drawing at
    // its own coordinate space makes that product the label's own size, and the
    // claim is that the smallest of those is no less than `text-xs`.
    const { container } = render(
      <Diagram nodes={LOOP} relations={LOOP_RELATIONS} label="the loop" />,
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

    // The floor as the stylesheet emits it, so the class on the markup and the
    // rule in the sheet are held to each other rather than either being taken on
    // trust. `dist/` exists whenever this runs: `turbo.json` gives this package's
    // `test` a `dependsOn` on its own `build`.
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
})

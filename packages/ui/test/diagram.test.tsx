import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Diagram, type DiagramNode, type DiagramRelation } from '../src/components/ui/diagram'

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

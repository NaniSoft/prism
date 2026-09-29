import { cn } from '../../lib/utils'

/**
 * One named thing in a Diagram, at a position the caller chooses.
 *
 * `x` and `y` are in the caller's own coordinate space and are normalised into
 * the Diagram's canvas, so fractions, pixels or any other monotonic scale all
 * draw the same shape. Two nodes given the same position collapse onto one
 * another, so a caller that means a column spreads it rather than repeating a
 * number.
 *
 * `emphasis` marks the one node the drawing is about, and it is the only
 * difference a node may carry: the emphasised node takes the brand ink, which
 * DESIGN.md's Brand Ink Rule names as the colour for something that must read
 * as the brand rather than as body text. Two emphasised nodes are a caller's
 * mistake, not a second emphasis level.
 */
export type DiagramNode = {
  /**
   * A key unique within the diagram. Relations name a node by this, and it is
   * carried on the markup as `data-node` so a test can address one node rather
   * than the first one.
   */
  id: string
  /**
   * The name printed under the node. It is a label on a picture, so a screen
   * reader does not read it: see `DiagramProps` for what carries the meaning.
   */
  name: string
  /** The node's position along the horizontal axis, in the caller's space. */
  x: number
  /** The node's position along the vertical axis, in the caller's space. */
  y: number
  /** Marks the node the diagram is about. See the Brand Ink Rule. */
  emphasis?: boolean
}

/**
 * One relation between two nodes, with the word that says what it is.
 *
 * A relation is drawn as a straight line between the two node marks, so the
 * geometry a caller lays out is the geometry a reader sees. The label is placed
 * beside the line rather than on it, because a label drawn over a line has to
 * be knocked out with a halo, and a halo has to be filled with the colour of
 * the surface the diagram happens to sit on, which the component is not told.
 *
 * `indirect` draws the line dashed. That is the standing convention for "this
 * holds, but not by this route", and it is chosen over fading the line because
 * a dashed line keeps its contrast while a faded one does not.
 */
export type DiagramRelation = {
  /** The `id` of the node the relation leaves. */
  from: string
  /** The `id` of the node the relation arrives at. */
  to: string
  /** The word printed beside the line. */
  label: string
  /** Draws the line dashed, for a relation that holds but not by this route. */
  indirect?: boolean
}

/** What both arms of `DiagramProps` carry. */
type DiagramFigure = {
  /** The things drawn. At least one, or the Diagram renders an empty canvas. */
  nodes: readonly DiagramNode[]
  /** The relations drawn between them. A relation naming a node that is not in `nodes` is dropped. */
  relations: readonly DiagramRelation[]
  /**
   * Layout only, exactly as on every Component: grid placement and width.
   * Changing a Prism-owned visual property from here is prohibited, and this
   * Component spreads no other prop, so there is no second way to do it.
   */
  className?: string
}

/**
 * The props a Diagram takes.
 *
 * The name is required unless the drawing is decorative, and it is forbidden
 * when it is. That is a union rather than `label?: string` because only a union
 * lets the type system see the exception: an optional label on one type can
 * only be optional everywhere or required everywhere, and both halves of that
 * are wrong. `Separator` takes the same shape as `decorative`.
 */
export type DiagramProps = DiagramFigure &
  (
    | {
        /**
         * Hides the drawing from assistive technology and drops the name. Use it
         * when the surrounding sentence already says what the diagram shows, and
         * nothing inside the hidden tree is named either: there is no `<title>`
         * here, so there is no name stranded inside an `aria-hidden` subtree.
         */
        decorative: true
        label?: never
      }
    | {
        /** The name of the drawing, and the only thing a screen reader reads from it. */
        label: string
        decorative?: false
      }
  )

/**
 * The canvas the Diagram draws into, in its own user units.
 *
 * A fixed canvas rather than a viewBox derived from the caller's numbers, for
 * one reason: type inside a scaled SVG is sized in the SVG's own user units, so
 * a viewBox derived from a caller's coordinates would make the label size a
 * function of how large a number the caller happened to use, and the same
 * drawing would come out with 3px labels in one call and 40px labels in another.
 * Fitting the caller's points into a fixed canvas makes the label a constant
 * and makes the drawing a function of the shape rather than of the scale.
 */
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 400

/**
 * The band left empty around the fitted points, in user units.
 *
 * It reserves room for what is drawn beside a node rather than for the node: a
 * node mark is 5 units in radius and its name is set about 20 units below it,
 * and a name is wider than the mark. The band is the honest cost of a server
 * component not being able to measure text, and it is why a name that runs long
 * still lands inside the canvas rather than off its edge.
 */
const PADDING = 56

/** The node mark's radius. A circle, so there is no corner radius for the pack to move. */
const NODE_RADIUS = 5

/**
 * Type sizes, in user units rather than in `rem`.
 *
 * The authored type scale is in `rem` and cannot be used inside a viewBox, where
 * a font size is a coordinate and not a length on the page. These are geometry,
 * the one thing Tailwind stays authoritative for, and they are the only numbers
 * in this file that are not a token.
 */
const NODE_NAME_SIZE = 13
const NODE_NAME_OFFSET = 20
const RELATION_NAME_SIZE = 11

/**
 * How far a relation's label sits off its line, in user units. Perpendicular to
 * the line, so the label never sits on the stroke it belongs to.
 */
const RELATION_NAME_LIFT = 7

/** A node's position in the canvas, after the caller's coordinates are fitted. */
type Placed = { x: number; y: number }

/**
 * The caller's points, fitted into the canvas with their aspect ratio kept and
 * the leftover shared out evenly.
 *
 * A caller whose points span one axis only, or who passes a single node, gets
 * the other axis centred rather than a division by zero: the scale is taken
 * over the axes that have an extent, and a diagram with no extent at all keeps
 * the caller's own numbers.
 */
function fit(nodes: readonly DiagramNode[]): (node: DiagramNode) => Placed {
  if (nodes.length === 0) return () => ({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 })

  const xs = nodes.map((node) => node.x)
  const ys = nodes.map((node) => node.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const spanX = Math.max(...xs) - minX
  const spanY = Math.max(...ys) - minY

  const roomX = CANVAS_WIDTH - PADDING * 2
  const roomY = CANVAS_HEIGHT - PADDING * 2
  const scale = Math.min(
    spanX === 0 ? Number.POSITIVE_INFINITY : roomX / spanX,
    spanY === 0 ? Number.POSITIVE_INFINITY : roomY / spanY,
  )
  const unit = Number.isFinite(scale) && scale > 0 ? scale : 1

  const offsetX = PADDING + (roomX - spanX * unit) / 2 - minX * unit
  const offsetY = PADDING + (roomY - spanY * unit) / 2 - minY * unit

  return (node) => ({ x: node.x * unit + offsetX, y: node.y * unit + offsetY })
}

/**
 * A diagram of named things and the relations between them.
 *
 * Data in, vector markup out. Every stroke and every fill is a semantic token
 * named as a utility, never a value read from anywhere, so a scoped `data-pack`
 * boundary above the drawing restyles it through the cascade exactly as it
 * restyles a heading. That is the whole reason this is a Component and the
 * reason a canvas was not: a canvas paints pixels it has already resolved, and
 * a resolved value does not move when the pack beneath it does.
 *
 * It is a server Component. It ships no client code, takes no hook, has no mode
 * of its own and reads no context, so a consumer renders it from a server file
 * with no provider mounted. `check-client-budget.mjs` keeps it off the client
 * roster, and a `'use client'` line added here would put it back on that roster.
 *
 * **Accessibility.** A diagram carries meaning, so by default it is one image
 * with a name: `role="img"` and the `label` the caller passes. Everything inside
 * a `role="img"` is presentational, so the node names and relation words are
 * drawn for sighted readers and the surrounding sentence is what a screen reader
 * gets. Pass `decorative` when the sentence already says what the drawing
 * shows, and the whole tree leaves the accessibility tree with nothing named
 * inside it.
 *
 * **Shape.** Nodes are circles and relations are paths. Both are shapes with no
 * radius concept, so no corner radius here is a function of `--radius` and a
 * pack boundary above the drawing moves nothing about its shape. A `<rect>` was
 * rejected for the opposite reason: its corner attribute is a CSS property and
 * does follow a boundary, and no utility pins it.
 *
 * **The node mark's base edges must draw.** Two things go wrong when a shape is
 * left to its defaults, and this file answers both explicitly on every mark.
 *
 *   1. A shape with no `fill` and no `fill: none` paints opaque black, which
 *      hides every label behind it. A relation path therefore names `fill-none`
 *      and a node circle names a fill, and neither relies on an initial value.
 *   2. A stroke only exists if something draws it. `stroke-width`'s initial
 *      value is 1 rather than 0, so the width is not what fails here; what fails
 *      is a mark whose stroke colour is `currentColor` on a surface whose text
 *      colour is that same surface, which is an invisible edge, or a width
 *      utility dropped in an edit. So every mark names an explicit width, an
 *      explicit stroke from a token, and never `current` or `currentColor`.
 *
 * A Component whose nodes render as invisible rectangles is worse than no
 * Component, so this is stated here and covered by `test/diagram.test.tsx`.
 *
 * It spreads no other prop. `Separator` and `Kbd` spread a native element's
 * props because there is no other route to them; a Diagram whose entire claim
 * is that every ink is a token would be undermined by a spread that hands a
 * caller `stroke`, so the surface is `nodes`, `relations`, `label`,
 * `decorative` and `className` and nothing else.
 *
 * Positions are the caller's: the Component fits and draws, and it does not lay
 * out a graph, so it cannot know that two labels will not collide. A relation
 * naming a node that is not in `nodes` is dropped, and the count of dropped
 * relations is on the element as `data-unresolved-relations` rather than
 * swallowed, because a line that silently did not draw is the failure this
 * Component exists to make impossible.
 */
function Diagram({
  nodes,
  relations,
  label,
  decorative = false,
  className,
}: DiagramProps) {
  const place = fit(nodes)
  const byId = new Map(nodes.map((node) => [node.id, node]))

  const drawn = relations.flatMap((relation) => {
    const from = byId.get(relation.from)
    const to = byId.get(relation.to)
    return from && to ? [{ relation, from: place(from), to: place(to) }] : []
  })

  return (
    <svg
      data-slot="diagram"
      data-unresolved-relations={relations.length - drawn.length}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn('h-auto w-full', className)}
    >
      {drawn.map(({ relation, from, to }) => {
        // A label placed beside its line rather than on it. The offset is the
        // line's normal, so a vertical relation's label sits beside it and a
        // horizontal one's sits above it, and neither ever sits on the stroke.
        const dx = to.x - from.x
        const dy = to.y - from.y
        const length = Math.hypot(dx, dy)
        const lift = length === 0 ? 0 : RELATION_NAME_LIFT / length
        return (
          <g
            data-slot="diagram-relation"
            data-relation={`${relation.from}-${relation.to}`}
            key={`${relation.from}-${relation.to}`}
          >
            <path
              d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
              strokeWidth={1}
              strokeDasharray={relation.indirect ? '4 4' : undefined}
              className="stroke-muted-foreground fill-none"
            />
            <text
              x={(from.x + to.x) / 2 - dy * lift}
              y={(from.y + to.y) / 2 + dx * lift}
              fontSize={RELATION_NAME_SIZE}
              textAnchor="middle"
              className="fill-muted-foreground font-mono"
            >
              {relation.label}
            </text>
          </g>
        )
      })}

      {nodes.map((node) => {
        const at = place(node)
        return (
          <g
            data-slot="diagram-node"
            data-node={node.id}
            data-emphasis={node.emphasis || undefined}
            key={node.id}
          >
            <circle
              cx={at.x}
              cy={at.y}
              r={NODE_RADIUS}
              strokeWidth={node.emphasis ? 2 : 1}
              className={cn(
                node.emphasis ? 'fill-accent stroke-brand-ink' : 'fill-card stroke-border',
              )}
            />
            <text
              x={at.x}
              y={at.y + NODE_NAME_OFFSET}
              fontSize={NODE_NAME_SIZE}
              textAnchor="middle"
              className="fill-foreground font-mono"
            >
              {node.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export { Diagram }

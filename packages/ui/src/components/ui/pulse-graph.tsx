import type { CSSProperties } from 'react'

import { cn } from '../../lib/utils'

/**
 * One named thing in a PulseGraph, at a position the caller chooses.
 *
 * The coordinate contract is `Diagram`'s, deliberately and unchanged: `x` and
 * `y` are in the caller's own space and are fitted into the canvas, so fractions,
 * pixels or any monotonic scale draw the same shape. A caller migrating a
 * `Diagram` to a `PulseGraph` passes the identical array and only sees the
 * difference in what the drawing does.
 *
 * `lane` is the one addition, and it is the reason this Component exists rather
 * than a `Diagram` with a class added. A node on a lane is a stage in a
 * sequence, which is a claim the drawing makes about the relationship between
 * two nodes: this one runs before that one, and a marker is going to travel
 * between them. A node with no lane is a point in a system with no stated
 * order, and the graph draws it as one: no rail under it, nothing carried
 * between it and anything else. Both shapes are wanted, and a single Component
 * that can draw either is one item in the catalogue rather than two, and one
 * fit, one canvas and one set of ink rules to keep true.
 */
export type PulseNode = {
  /** A key unique within the graph. Relations name a node by this. */
  id: string
  /**
   * The name printed beside the node. It is a label on a picture, so a screen
   * reader does not read it; see `PulseGraphProps` for what carries the
   * meaning.
   */
  name: string
  /** The node's position along the horizontal axis, in the caller's space. */
  x: number
  /** The node's position along the vertical axis, in the caller's space. */
  y: number
  /**
   * The stage this node belongs to, as a number. Nodes sharing a lane are
   * stages of one sequence and the marker travels between them in lane order.
   * Omit it for a node that belongs to no sequence, which the drawing renders
   * as a point in a field rather than a stop on a rail.
   */
  lane?: number
  /** Marks the node the drawing is about. See the Brand Ink Rule. */
  emphasis?: boolean
  /**
   * A second line under the name, in the mono face, for the thing that
   * qualifies the node: a stage's role, a component's version, a window's
   * cadence. It is drawn and not announced, on the same terms as `name`, and it
   * is the reason a caller does not have to reach for a second component to
   * put a caption under a node.
   */
  note?: string
}

/**
 * One relation between two nodes.
 *
 * `carries` is the difference from `Diagram`'s relation and the reason a
 * caller reaches for this Component: a relation that carries something gets a
 * marker travelling along it, and one that merely holds does not. That is the
 * whole claim the graph makes about the pair, expressed as a property of the
 * edge rather than inferred from whether a marker happens to be drawn there, so
 * a reader who turns motion off can still read which edges were carrying.
 */
export type PulseRelation = {
  /** The `id` of the node the relation leaves. */
  from: string
  /** The `id` of the node the relation arrives at. */
  to: string
  /** Draws the line dashed, for a relation that holds but not by this route. */
  indirect?: boolean
  /** The line carries a marker travelling from `from` to `to`. */
  carries?: boolean
}

/** What both arms of `PulseGraphProps` carry. */
type PulseFigure = {
  /**
   * The things drawn. At least one, or the graph renders an empty canvas. This
   * is a claim the type makes rather than a runtime guard, because a figure
   * with nothing in it is a mistake in the caller's data and not a state worth
   * rendering a friendly empty message for.
   */
  nodes: readonly PulseNode[]
  /**
   * The relations drawn between them. A relation naming a node that is not in
   * `nodes` is dropped, and the count of dropped relations is on the element as
   * `data-unresolved-relations` rather than swallowed, because a line that
   * silently did not draw is the failure this Component exists to make
   * impossible.
   */
  relations?: readonly PulseRelation[]
  /**
   * Layout only, exactly as on every Component: grid placement and width.
   * Changing a Prism-owned visual property from here is prohibited.
   */
  className?: string
}

/**
 * The props a PulseGraph takes.
 *
 * The name is required unless the drawing is decorative, and it is forbidden
 * when it is. That is a union rather than `label?: string` for the reason
 * `Diagram` states: only a union lets the type system see the exception.
 */
export type PulseGraphProps = PulseFigure &
  (
    | {
        /**
         * Hides the drawing from assistive technology and drops the name. Use it
         * when the surrounding sentence already says what the graph shows, and
         * nothing inside the hidden tree is named either.
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
 * The canvas the graph draws into, in its own user units.
 *
 * A fixed canvas rather than a viewBox derived from the caller's numbers, for
 * the reason `Diagram` gives: type inside a scaled SVG is sized in the SVG's
 * own user units, so a viewBox derived from a caller's coordinates would make
 * the label size a function of how large a number the caller happened to use.
 */
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 360

/**
 * The band left empty around the fitted points, in user units.
 *
 * Wider than `Diagram`'s, and the extra is on the bottom rather than split. A
 * pulse graph is read as a sequence running left to right, so the bottom band
 * carries the rail, the lane marks and the stage names set under them, and all
 * three are horizontal extents that a graph with more vertical spread would
 * collide with. Reserving it once here is cheaper than every caller learning
 * where not to put a node.
 */
const PADDING = 56

/** The node mark's radius. A circle, so no corner radius for the pack to move. */
const NODE_RADIUS = 6

/**
 * Type sizes, in user units rather than in `rem`.
 *
 * The authored type scale is in `rem` and cannot be used inside a viewBox, where
 * a font size is a coordinate and not a length on the page. These are geometry,
 * the one thing Tailwind stays authoritative for.
 */
const NODE_NAME_SIZE = 13
const NODE_NAME_OFFSET = 22
const NODE_NOTE_SIZE = 10
const NODE_NOTE_OFFSET = 35

/**
 * The rail the marker rides, in user units, measured from the bottom of the
 * fitted area.
 *
 * It is a separate element from the edges because it is a different claim: the
 * edges say what connects to what, and the rail says there is an order. A graph
 * whose nodes are not in lanes has no rail, which is why this is drawn from the
 * lane count rather than always being present.
 */
const RAIL_OFFSET = 74
const RAIL_THICKNESS = 1.5

/** A node's position in the canvas, after the caller's coordinates are fitted. */
type Placed = { x: number; y: number }

/**
 * The caller's points, fitted into the canvas with their aspect ratio kept and
 * the leftover shared out evenly.
 *
 * A caller whose points span one axis only, or who passes a single node, gets
 * the other axis centred rather than a division by zero.
 */
function fit(nodes: readonly PulseNode[]): (node: PulseNode) => Placed {
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
 * The lanes present, in ascending order.
 *
 * A lane number is the caller's own indexing and is not required to start at
 * zero or to be contiguous, so the set is derived and sorted rather than
 * assumed. A caller that skipped a lane gets a rail with the lanes it named
 * and no invented one between them, which is the only answer that does not
 * draw a stage that is not there.
 */
function lanesOf(nodes: readonly PulseNode[]): number[] {
  return [...new Set(nodes.flatMap((node) => (node.lane === undefined ? [] : [node.lane])))].sort(
    (a, b) => a - b,
  )
}

/**
 * A three-stop stagger for the ambient cycles.
 *
 * A figure of nodes that all breathe on the same beat is a heartbeat, and a
 * heartbeat is decoration: it is the same signal everywhere and so it carries
 * no information about this system. Offsetting by lane means the rhythm runs
 * along the rail instead, which is a claim about the sequence. The classes are
 * the three the stylesheet publishes, chosen by lane position rather than by
 * anything about the node, so a caller cannot accidentally author an
 * unsynchronised field.
 */
function stagger(lane: number): string {
  return ['prism-ambient-delay-1', 'prism-ambient-delay-2', 'prism-ambient-delay-3'][
    Math.abs(lane) % 3
  ]
}

/**
 * A graph of named things, the relations between them, and a marker travelling
 * the sequence.
 *
 * This is the Component the four NaniSoft product sites each lost when they
 * moved off the retired line, rebuilt rather than recovered. Their old heroes
 * drew the right thing, in the wrong way: a `<canvas>` with a
 * `requestAnimationFrame` loop, its colours read out of the DOM once at mount,
 * and numbers invented by a sine hash so the drawing would have something to
 * show. Every part of that was a defect with a real cost, and this file is the
 * argument for each of them in turn.
 *
 * **It is a server Component.** No `'use client'`, no hook, no effect, no
 * context, no runtime. The motion is CSS on the server-rendered markup, so a
 * consumer gets a running figure in a static export with zero bytes of
 * JavaScript, and `check-client-budget.mjs` keeps it off the client roster. The
 * old heroes needed a client runtime on a static-export site; this one needs
 * nothing.
 *
 * **It is SVG, not a canvas, and that is the pack-boundary reason.** A canvas
 * paints pixels it has already resolved, and a `data-pack` boundary is an
 * attribute on an ancestor, so a resolved value does not move when the pack
 * beneath it does. Every stroke and fill below names a semantic token as a
 * utility, so a scoped pack boundary above the drawing restyles it through the
 * cascade exactly as it restyles a heading. This is why `check-vector-ink.mjs`
 * scans this file.
 *
 * **Nothing is hidden and nothing waits.** No rule sets `opacity: 0`; the
 * figure is complete and fully legible at first paint; and the animation only
 * moves things that are already visible. A reader with scripting off, a slow
 * connection, a print stylesheet, or a crawler sees the whole drawing. The
 * reduced-motion block in the stylesheet is one `animation: none`, and because
 * every element's resting state is its full form, that reader gets the same
 * figure, still. This is the `hidden-state` gate's requirement met by the
 * design rather than by an exception, which is why a consumer needs no
 * exception to enable it.
 *
 * **The motion is the token scale's.** Every `prism-ambient-*` class reads its
 * length from `var(--ambient-*)`; nothing in this file states a duration, an
 * easing, or a keyframe name in a shorthand. The one distance this file does set
 * is a geometry length in user units, because the keyframe that consumes it
 * translates by a distance and that distance is a property of this drawing's
 * coordinates rather than a timing.
 *
 * **What it will not do.** It does not invent data. The old canvas filled itself
 * with a sine hash, and every site that shipped it inherited a chart of numbers
 * nobody collected; a reader who screenshotted one and read the axis got a lie
 * with a real typeface on it. Here, a node is a node a caller named, an edge is
 * an edge a caller declared, and an empty graph is an empty graph. The motion
 * says a system is running. It does not say what the numbers were.
 *
 * **The rail.** Nodes carrying a `lane` are stages of one sequence, and the
 * graph draws a rail under them with a marker travelling it, so the order is
 * visible as an order rather than inferred from left-to-right spacing. Nodes
 * with no lane are a field: no rail, no marker, and every node present from the
 * first frame. A graph may have both, and the rail then describes only the lanes
 * that exist.
 *
 * **Accessibility.** `role="img"` with the `label` the caller passes, the same
 * contract `Diagram` holds. Everything inside a `role="img"` is presentational,
 * so node names and notes are drawn for sighted readers and the surrounding
 * sentence is what a screen reader gets. Pass `decorative` when that sentence
 * already says what the drawing shows.
 *
 * Positions are the caller's. The Component fits and draws, and it does not lay
 * out a graph, so it cannot know that two labels will not collide. A relation
 * naming a node that is not in `nodes` is dropped and counted on the element.
 */
function PulseGraph({
  nodes,
  relations = [],
  label,
  decorative = false,
  className,
}: PulseGraphProps) {
  const place = fit(nodes)
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const lanes = lanesOf(nodes)

  const drawn = relations.flatMap((relation) => {
    const from = byId.get(relation.from)
    const to = byId.get(relation.to)
    return from && to ? [{ relation, from: place(from), to: place(to) }] : []
  })

  /**
   * The rail's two ends, taken from the lanes that exist rather than from the
   * canvas. A rail as wide as the canvas regardless of where the nodes are would
   * say the sequence continues past its first and last stage, which is a claim
   * about a caller's data that the caller did not make.
   */
  const railNodes = nodes.filter((node) => node.lane !== undefined)
  const railAt = railNodes.length
    ? {
        x0: Math.min(...railNodes.map((node) => place(node).x)) - NODE_RADIUS - 10,
        x1: Math.max(...railNodes.map((node) => place(node).x)) + NODE_RADIUS + 10,
      }
    : null
  const railY = CANVAS_HEIGHT - RAIL_OFFSET

  return (
    <svg
      data-slot="pulse-graph"
      data-unresolved-relations={relations.length - drawn.length}
      data-lanes={lanes.length}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn('h-auto w-full', className)}
    >
      {/*
        The rail, drawn first so every node and edge sits above it. Its head and
        tail are the marks that say the sequence has a beginning and an end; a
        rail that runs off both edges of the canvas reads as a fragment of a
        longer process, which is a different and much larger claim.
      */}
      {railAt ? (
        <g data-slot="pulse-graph-rail">
          <line
            data-slot="pulse-graph-rail-line"
            x1={railAt.x0}
            y1={railY}
            x2={railAt.x1}
            y2={railY}
            strokeWidth={RAIL_THICKNESS}
            className="stroke-border"
          />
          {/*
            The travelling marker. `prism-ambient-travel` reads its length from
            `--ambient-travel` and its easing from `--ambient-ease-linear`, and
            the distance it crosses is this drawing's own rail length. It is a
            rectangle rather than a dot because a dot on a one-pixel rail at this
            size is a smudge, and because a mark with a little vertical extent
            reads as travelling along the rail rather than sitting on it.
          */}
          <g
            data-slot="pulse-graph-marker"
            className="prism-ambient-travel prism-ambient-delay-1"
            style={{ '--ambient-travel-distance': `${railAt.x1 - railAt.x0}px` } as CSSProperties}
          >
            <rect
              x={railAt.x0 - 2.5}
              y={railY - 2.5}
              width={5}
              height={5}
              rx={2.5}
              className="fill-brand-ink"
            />
          </g>
        </g>
      ) : null}

      {drawn.map(({ relation, from, to }) => (
        <g
          data-slot="pulse-graph-relation"
          data-relation={`${relation.from}-${relation.to}`}
          data-carries={relation.carries || undefined}
          key={`${relation.from}-${relation.to}`}
        >
          {/*
            The line. `fill-none` and an explicit stroke from a token, never
            `current`, because a mark whose stroke is the same value as the text
            on the surface it sits on is an invisible edge, and a shape left to
            paint itself opaque black hides every label behind it.
          */}
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            strokeWidth={1}
            strokeDasharray={relation.indirect ? '4 4' : undefined}
            className="stroke-muted-foreground/50 fill-none"
          />
          {/*
            A carrying edge gets a second mark: a head, drawn at the end of the
            line and pointing along it.

            This is the one piece of the drawing that earns its place by being
            static. An edge that carries something has to say so to a reader who
            has turned every animation off, and a dashed overlay read as
            direction only while the dashes were moving, so the claim vanished
            for exactly the reader who most needed it. A head does not move, so
            it does not need a cycle, and it is legible in a printed page. The
            rail's travelling marker is then free to be pure atmosphere rather
            than the only thing carrying the meaning.
          */}
          {relation.carries
            ? (() => {
                const dx = to.x - from.x
                const dy = to.y - from.y
                const length = Math.hypot(dx, dy)
                if (length === 0) return null
                // The head sits back from the target mark so it never overlaps
                // it, and is scaled to the line's own length so a short edge and
                // a long one get the same size head rather than a stretched one.
                const inset = NODE_RADIUS + 4
                const ux = dx / length
                const uy = dy / length
                const hx = to.x - ux * inset
                const hy = to.y - uy * inset
                const head = 5
                return (
                  <path
                    data-slot="pulse-graph-flow"
                    d={`M ${hx - uy * head} ${hy + ux * head} L ${hx} ${hy} L ${hx + uy * head} ${hy - ux * head}`}
                    strokeWidth={1.5}
                    fill="none"
                    className="stroke-brand-ink"
                  />
                )
              })()
            : null}
        </g>
      ))}

      {nodes.map((node) => {
        const at = place(node)
        return (
          <g
            data-slot="pulse-graph-node"
            data-node={node.id}
            data-emphasis={node.emphasis || undefined}
            data-lane={node.lane}
            key={node.id}
          >
            {/*
              The breathing halo, behind the mark. It is the emphasised node
              that breathes and the emphasis is the caller's, so the figure's
              focal point is the one place the motion is strongest rather than
              the one place it happens to fall.
            */}
            {node.emphasis ? (
              <circle
                data-slot="pulse-graph-halo"
                cx={at.x}
                cy={at.y}
                r={NODE_RADIUS}
                strokeWidth={0}
                className={cn('fill-brand-ink/25', 'prism-ambient-pulse', stagger(node.lane ?? 0))}
              />
            ) : null}
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
            {node.note ? (
              <text
                x={at.x}
                y={at.y + NODE_NOTE_OFFSET}
                fontSize={NODE_NOTE_SIZE}
                textAnchor="middle"
                className="fill-muted-foreground font-mono"
              >
                {node.note}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

export { PulseGraph }

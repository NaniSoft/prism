import type { CSSProperties } from 'react'

import {
  INK_CLEARANCE,
  LABEL_DESCENT,
  fitPoints,
  strokeBetween,
  type FigureLabel,
  type FigurePoint,
  type FigureStroke,
} from '../../lib/figure'
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
   * Changing a Prism-owned visual property from here is prohibited, and this
   * Component spreads no other prop, so there is no second way to do it.
   *
   * It lands on the drawing inside the sideways region rather than on the region
   * itself, so a caller narrowing the figure narrows the drawing and the region
   * still holds the floor.
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
 *
 * **A fixed canvas fixes the ratio, and the ratio was the half of the argument
 * that was missing.** Every label's rendered size is its size in user units times
 * the rendered width over this number, so a drawing that is right at a desktop
 * width shrinks with its container until it says nothing. In the 356 pixels a
 * phone leaves a PulseGraph, a stage name came to 7.23 pixels and a node's note
 * to 5.56, which is a picture of a shape with nothing written on it. The canvas
 * is still the right answer and it is what keeps a label a constant rather than a
 * function of the caller's arithmetic; what it does not do is set a floor, and
 * `LEGIBLE_MIN_WIDTH` is that floor. `DESIGN.md` states the rule under The figure
 * floor.
 */
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 360

/**
 * The width below which the drawing stops being legible, as a spacing multiple.
 *
 * The floor is `CANVAS_WIDTH` itself, so the rule is one sentence: the drawing is
 * never rendered narrower than its own coordinate space, one user unit is
 * therefore never less than one pixel, and the smallest label in it is
 * `NODE_NOTE_SIZE`, which is the size `--text-xs` resolves to. So no label this
 * drawing sets is smaller than `text-xs`, and at the floor the smallest is
 * exactly it.
 *
 * **A container narrower than the floor scrolls rather than shrinking, and that
 * is the answer this repository already gives a table and a board.** A table that
 * restacks has stopped being a table, and a graph whose stage names are seven
 * pixels tall has stopped being a graph: it is the shape with nothing written on
 * it a reader can read. So the drawing holds its size and the container moves
 * under it, which is what `Table` does with seven columns and what `Gantt01`
 * does with a schedule of names and bars.
 *
 * `160` is `CANVAS_WIDTH` as a multiple of the authored spacing base, which is
 * how a width nobody held a separate decision for is written.
 */
const LEGIBLE_MIN_WIDTH = 'min-w-160'

/**
 * The band left empty around the fitted points, in user units.
 *
 * The same band `Diagram` keeps on its top and its two sides, and the foot
 * carries more than that: a pulse graph is read as a sequence running left to
 * right, so the band below the fitted area holds the rail, and a lane whose mark
 * lands low puts its note in the gap `RAIL_BAND` left rather than under the rail.
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
 *
 * The note is twelve user units, which is what `--text-xs` resolves to, so at
 * `LEGIBLE_MIN_WIDTH` it renders at exactly that step and never below it. It was
 * ten, and ten is not a step this system sets interface type at, so a note was the
 * smallest type the whole package emitted anywhere, a figure included. The name is
 * one unit larger, which is the same hierarchy the two have always drawn.
 */
const NODE_NAME_SIZE = 13
const NODE_NAME_OFFSET = 22
const NODE_NOTE_SIZE = 12

/**
 * The note's baseline, measured down from the mark's centre.
 *
 * The name's baseline, then the note's own size, then a line of leading, so the
 * second line sits under the first rather than on it. It is the deepest any node
 * draws, and the rail band below is measured from it.
 */
const NODE_NOTE_OFFSET = NODE_NAME_OFFSET + NODE_NOTE_SIZE + 5

/** The deepest ink a node draws below its mark's centre, in user units. */
const NODE_NOTE_DEPTH = NODE_NOTE_OFFSET + LABEL_DESCENT * NODE_NOTE_SIZE

/**
 * The rail the marker rides, in user units, measured from the bottom of the
 * canvas.
 *
 * It is a separate element from the edges because it is a different claim: the
 * edges say what connects to what, and the rail says there is an order. A graph
 * whose nodes are not in lanes has no rail, which is why this is drawn from the
 * lane count rather than always being present.
 */
const RAIL_OFFSET = 74
const RAIL_THICKNESS = 1.5

/**
 * The band the rail reserves at the foot of the canvas, in user units.
 *
 * It is the rail's own distance up from the bottom, then half its thickness, then
 * the clearance the drawing keeps between two pieces of ink, then the deepest ink
 * a node draws below its mark. The fitted area stops above the whole of it, so a
 * lane whose mark lands on the bottom of that area puts its note in the gap this
 * band left rather than on the rail's own stroke. It is arithmetic rather than a
 * number because every term in it has its own reason, and retuning the rail or the
 * type moves the fit with it rather than leaving the band behind.
 */
const RAIL_BAND = RAIL_OFFSET + RAIL_THICKNESS / 2 + INK_CLEARANCE + NODE_NOTE_DEPTH

/**
 * The labels this drawing prints under one node, which are what a stroke leaving it
 * has to be trimmed against.
 *
 * Each label is its own obstacle rather than one box enclosing both, and that is the
 * whole of the trim rule as it applies here: a node's name and note are both below
 * its mark, so an edge leaving sideways runs along the mark's centre line and never
 * enters either of them, while an edge leaving downward enters both. The arithmetic
 * is `lib/figure`, which is where the shared answer lives; what is left here is the
 * two labels this drawing prints and where it prints them.
 */
function nodeLabels(node: PulseNode): FigureLabel[] {
  const labels: FigureLabel[] = [{ text: node.name, size: NODE_NAME_SIZE, offset: NODE_NAME_OFFSET }]
  if (node.note !== undefined) {
    labels.push({ text: node.note, size: NODE_NOTE_SIZE, offset: NODE_NOTE_OFFSET })
  }
  return labels
}

/**
 * The head a carrying edge grows, at the end of the stroke a reader can see.
 *
 * The head is part of the stroke rather than part of the target mark, so it is
 * placed at the stroke's own end and not at an inset from the mark's centre. A
 * head measured from the centre would sit inside the clearance the stroke stops at
 * and the two would read as two marks with a gap between them rather than as one
 * arrow. Measured from the stroke's own end the tip is one ink clearance from the
 * mark it points at, which is the same gap every other end of every other connector
 * on the rail keeps.
 *
 * This is the one piece of the drawing that earns its place by being static. An
 * edge that carries something has to say so to a reader who has turned every
 * animation off, and a dashed overlay read as direction only while the dashes
 * were moving, so the claim vanished for exactly the reader who most needed it.
 * A head does not move, so it does not need a cycle, and it is legible in a
 * printed page. The rail's travelling marker is then free to be pure atmosphere
 * rather than the only thing carrying the meaning.
 */
function flowHead(line: FigureStroke) {
  const dx = line.to.x - line.from.x
  const dy = line.to.y - line.from.y
  const length = Math.hypot(dx, dy)
  if (length === 0) return null
  const ux = dx / length
  const uy = dy / length
  const head = 5
  return (
    <path
      data-slot="pulse-graph-flow"
      d={`M ${line.to.x - uy * head} ${line.to.y + ux * head} L ${line.to.x} ${line.to.y} L ${line.to.x + uy * head} ${line.to.y - ux * head}`}
      strokeWidth={1.5}
      fill="none"
      className="stroke-brand-ink"
    />
  )
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
 * **No stroke crosses a label, and every connector still reaches the marks it
 * joins.** An edge used to run from one mark's centre to the other, and a node's
 * name is printed under its mark, so every edge heading downward struck through the
 * name of the node it left. Each label a node prints is now its own obstacle rather
 * than part of one box enclosing the whole node, and an edge is trimmed only against
 * the labels it would actually enter. That direction is the whole of the rule: a
 * name and a note both sit below their mark, so an edge leaving sideways runs along
 * the mark's centre line and clears both, and it stops at the mark's own edge with
 * the ink clearance between. Backing every edge off the widest label at its node
 * instead detached all five connectors on a six-stage rail from the circles they
 * connect, which is a drawing of a shape with no relations on it. The Component
 * cannot know that two labels will not collide with one another, which is the
 * caller's positions to settle, and it does know every mark's radius, both label
 * offsets and every label's own width, because a monospaced label's width is its
 * character count. The rail is held to
 * the same clearance rather than to a fixed distance from the canvas bottom,
 * because a note is the deepest ink a node draws and a lane whose mark lands low
 * put it under the rail. `test/pulse-graph.test.tsx` asserts both halves as
 * geometry rather than the presence of a class name.
 *
 * **No label is drawn below `text-xs`.** The drawing is wrapped in a container
 * that scrolls sideways, and the drawing itself holds a floor of its own
 * coordinate space, so a phone sees the whole graph at a legible size rather than
 * the whole graph at six pixels. That is the same bargain `Table` strikes with
 * seven columns, and it is a bargain rather than an accident because the
 * alternative is a picture of a shape with nothing written on it.
 *
 * Positions are the caller's, and two labels crossing one another is still the
 * caller's to settle. A relation naming a node that is not in `nodes` is dropped
 * and counted on the element.
 */
function PulseGraph({
  nodes,
  relations = [],
  label,
  decorative = false,
  className,
}: PulseGraphProps) {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const lanes = lanesOf(nodes)

  /**
   * The rail's two ends, taken from the lanes that exist rather than from the
   * canvas. A rail as wide as the canvas regardless of where the nodes are would
   * say the sequence continues past its first and last stage, which is a claim
   * about a caller's data that the caller did not make.
   */
  const railNodes = nodes.filter((node) => node.lane !== undefined)

  // A lane's note is the deepest ink a node draws, and the rail sits below the
  // fitted area, so the fit stops above the band the rail reserves. A field has
  // no rail, nothing reserves the foot, and the fit is the same band the top and
  // the two sides get.
  const place = fitPoints(nodes, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    padding: PADDING,
    bottom: railNodes.length ? CANVAS_HEIGHT - RAIL_BAND : undefined,
  })

  const drawn = relations.flatMap((relation) => {
    const from = byId.get(relation.from)
    const to = byId.get(relation.to)
    if (!from || !to) return []
    // Each end carries its mark's centre and the labels printed under it, because
    // a stroke is trimmed against the labels it would enter and the two are not the
    // same thing.
    const end = (node: PulseNode) => ({ at: place(node), labels: nodeLabels(node) })
    return [{ relation, from: end(from), to: end(to) }]
  })

  const railAt = railNodes.length
    ? {
        x0: Math.min(...railNodes.map((node) => place(node).x)) - NODE_RADIUS - 10,
        x1: Math.max(...railNodes.map((node) => place(node).x)) + NODE_RADIUS + 10,
      }
    : null
  const railY = CANVAS_HEIGHT - RAIL_OFFSET

  return (
    // The sideways region, for the reason `LEGIBLE_MIN_WIDTH` states: the drawing
    // holds a legible floor and a container narrower than it moves under the
    // drawing rather than the drawing shrinking below what it says.
    <div data-slot="pulse-graph-container" className="w-full overflow-x-auto">
      <svg
        data-slot="pulse-graph"
        data-unresolved-relations={relations.length - drawn.length}
        data-lanes={lanes.length}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
        className={cn('h-auto w-full', LEGIBLE_MIN_WIDTH, className)}
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
              style={
                { '--ambient-travel-distance': `${railAt.x1 - railAt.x0}px` } as CSSProperties
              }
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

        {drawn.map(({ relation, from, to }) => {
          const line = strokeBetween(from.at, to.at, NODE_RADIUS, from.labels, to.labels)
          return (
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
                paint itself opaque black hides every label behind it. Its two end
                points are where the ink runs out, so a node's own name is never the
                thing an edge runs through and an edge still reaches the mark it
                joins.
              */}
              <line
                x1={line.from.x}
                y1={line.from.y}
                x2={line.to.x}
                y2={line.to.y}
                strokeWidth={1}
                strokeDasharray={relation.indirect ? '4 4' : undefined}
                className="stroke-muted-foreground/50 fill-none"
              />
              {relation.carries ? flowHead(line) : null}
            </g>
          )
        })}

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
                  data-slot="pulse-graph-node-note"
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
    </div>
  )
}

export { PulseGraph }

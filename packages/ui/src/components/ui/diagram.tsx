import type { PackId } from '../../theming'

import {
  INK_CLEARANCE,
  fitPoints,
  labelHalfHeight,
  labelHalfWidth,
  strokeBetween,
  type FigureLabel,
  type FigurePoint as Placed,
  type FigureStroke as Segment,
} from '../../lib/figure'
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
 * A node carries two differences and no more. `emphasis` marks the one node the
 * drawing is about, and it is the emphasised node that takes the brand ink,
 * which is what DESIGN.md's Brand Ink Rule names as the colour for something
 * that must read as the brand rather than as body text; two emphasised nodes are
 * a caller's mistake, not a second emphasis level. `pack` is the node's own hue,
 * and it is per node for the reasons given on that field.
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
  /**
   * The second line printed under the name, which is the one-line role the thing
   * plays: "the shared language", "the engine", "built next".
   *
   * It is a field rather than a word written into `label`, because the two
   * audiences are different and a role description that exists only inside the
   * accessible name has been given to one of them and withheld from the other.
   * It is drawn on the picture, it is read aloud as part of the name when the
   * caller passes no `label`, and because both come out of the same field they
   * are the same words and cannot drift.
   */
  subtitle?: string
  /** The node's position along the horizontal axis, in the caller's space. */
  x: number
  /** The node's position along the vertical axis, in the caller's space. */
  y: number
  /** Marks the node the diagram is about. See the Brand Ink Rule. */
  emphasis?: boolean
  /**
   * The node's pack, which is the hue its mark wears.
   *
   * `PackId` rather than `string`, because a pack is one of the six published
   * packs: a free-text field would accept a name matching no emitted rule, and a
   * mark under a boundary nothing matches keeps the colour of whatever pack is
   * above it, which is a silent wrong answer rather than a rejected one.
   *
   * **It is per node, and that is settled rather than incidental.** A pack on
   * the Diagram would be one boundary on the section, and the boundary is the
   * unit of a second pack on a MARK: `ProductMark` is the item that established
   * it, and a mark here is a node. Per node is also what a schematic wants. One
   * drawing of a product set shows one mark per product and each wears its own
   * hue, which a single boundary could not express at all.
   *
   * The boundary lands on the `<circle>` this node draws, and not on the `<svg>`
   * and not on the node's `<g>`, so it moves that one mark's fill and stroke and
   * nothing else. A circle has no radius concept, so the pack re-inks the mark
   * and cannot re-round it, which is the half of the pack boundary law a
   * consumer implementing only the colour half gets wrong. `default` is the
   * absence of the attribute, exactly as `themeAttributes` spells it, so a node
   * on the base pack carries no `data-pack` and resolves from the page.
   */
  pack?: PackId
}

/**
 * One relation between two nodes, with the word that says what it is.
 *
 * A relation is drawn as a straight line from one mark towards another, so the
 * geometry a caller lays out is the geometry a reader sees. The line stops at the
 * mark's own edge with the ink clearance between, or at whichever label printed
 * under that mark the line would otherwise run through, which is what keeps an edge
 * heading downward from running through the name printed under its own node while a
 * relation leaving sideways still reaches the mark it joins.
 *
 * The label is placed beside the line rather than on it, because a label drawn
 * over a line has to be knocked out with a halo, and a halo has to be filled with
 * the colour of the surface the diagram happens to sit on, which the component is
 * not told. How far beside is the label's own extent measured across the line,
 * not a fixed number, because a label's width runs along a horizontal line and
 * across a vertical one, and one number clears the first and not the second.
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

/** What every arm of `DiagramProps` carries. */
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
 * The name is required unless the drawing is decorative or the nodes can be read
 * as the name, and it is forbidden when the drawing is decorative. That is a
 * union rather than `label?: string` because only a union lets the type system
 * see the exception: an optional label on one type can only be optional
 * everywhere or required everywhere, and both halves of that are wrong.
 * `Separator` takes the same shape as `decorative`.
 *
 * The third arm is the one that makes the name derivable. It spells the absence
 * as `label?: never` rather than `label?: string`, so "the caller named it" and
 * "the caller passed nothing" cannot be confused for one another and a caller
 * cannot hand the drawing an empty name by passing one: an unnamed image is the
 * one outcome this prop must not have.
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
    | {
        /**
         * No name is passed, so the drawing is named by what its own marks say:
         * every node's `name`, and its `subtitle` where it has one, in the order
         * the caller drew them. A caller who gives a node a role description is
         * describing the picture, and a picture's own words are the honest source
         * for the name announced over it.
         */
        label?: never
        decorative?: false
      }
  )

/**
 * The drawing's accessible name, derived from the text its own marks carry.
 *
 * Derived rather than passed because the two audiences are different and a
 * Component able to reach only one of them reaches neither. Everything inside a
 * `role="img"` is presentational, so the words drawn on the marks are words no
 * screen reader reads, and the label is the one thing it does read. A caller who
 * put a node's role description into the label and not onto the node had
 * published half of it: the half a sighted reader loses. Reading the name off the
 * marks is what makes that drift impossible rather than merely discouraged, and
 * it is why the drawn line and the announced line are the same field.
 *
 * Relation words are not part of it, and that is the honest limit of a
 * derivation rather than an oversight. A derived name says what the drawing
 * holds; a caller whose relations matter to a screen reader user passes a
 * `label` that says so. Inventing a sentence out of the relations would be this
 * Component writing the words, which is the one thing it does not do.
 */
function derivedName(nodes: readonly DiagramNode[]): string {
  return nodes.reduce((name, node) => {
    // Parentheses between a thing and its role, commas between things, so a
    // reader hearing the list can tell which words belong to which mark. Both
    // are punctuation assembled here rather than a word this Component wrote.
    const words = node.subtitle ? `${node.name} (${node.subtitle})` : node.name
    return name === '' ? words : `${name}, ${words}`
  }, '')
}

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
 *
 * **A fixed canvas fixes the ratio, and the ratio was the half of the argument
 * that was missing.** Every label's rendered size is its size in user units times
 * the rendered width over this number, so a drawing that is right at a desktop
 * width shrinks with its container until it says nothing. In the 342 pixels a
 * phone leaves a Diagram, the largest label drawn here came to just under seven
 * pixels. The canvas is still the right answer and it is what keeps a label a
 * constant rather than a function of the caller's arithmetic; what it does not do
 * is set a floor, and `LEGIBLE_MIN_WIDTH` is that floor.
 */
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 400

/**
 * The width below which the drawing stops being legible, as a spacing multiple.
 *
 * The floor is `CANVAS_WIDTH` itself, so the rule is one sentence: the drawing is
 * never rendered narrower than its own coordinate space, and one user unit is
 * therefore never less than one pixel. Every label is then at least its own size
 * in user units, and the smallest of them is `RELATION_NAME_SIZE`, which is the
 * size `--text-xs` resolves to. So no label this drawing sets is smaller than
 * `text-xs`, and at the floor the smallest is exactly it.
 *
 * **A container narrower than the floor scrolls rather than shrinking, and that
 * is the answer this repository already gives a table and a board.** A table that
 * restacks has stopped being a table, and a schematic whose labels are six pixels
 * tall has stopped being a schematic: it is the shape with nothing written on it
 * a reader can read. So the drawing holds its size and the container moves under
 * it, which is what `Table` does with seven columns and what `Gantt01` does with
 * a schedule of names and bars.
 *
 * `160` is `CANVAS_WIDTH` as a multiple of the authored spacing base, which is
 * how a width nobody held a separate decision for is written.
 */
const LEGIBLE_MIN_WIDTH = 'min-w-160'

/**
 * The band left empty around the fitted points, in user units.
 *
 * It reserves room for what is drawn beside a node rather than for the node: a
 * node mark is 5 units in radius and its name is set about 20 units below it,
 * and a name is wider than the mark. The band is the honest cost of a server
 * component not being able to measure text, and it is why a name that runs long
 * still lands inside the canvas rather than off its edge.
 *
 * A node's subtitle, where it has one, is the deepest ink a node draws, at
 * `NODE_SUBTITLE_OFFSET` below the mark, and that is inside the band too. The
 * cost of not being able to measure text is paid once rather than per line, and
 * paying it for the second line is what keeps the two-line node inside the
 * canvas rather than under its own floor.
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
 *
 * The two supporting sizes are twelve user units, which is what `--text-xs`
 * resolves to, so at `LEGIBLE_MIN_WIDTH` they render at exactly that step and
 * never below it. The name is one unit larger, which is the same ratio between
 * the two this drawing has always drawn, so the hierarchy between a name and the
 * line under it is the hierarchy it was.
 */
const NODE_NAME_SIZE = 13
const NODE_NAME_OFFSET = 20
const NODE_SUBTITLE_SIZE = 12
const RELATION_NAME_SIZE = 12

/**
 * The subtitle's baseline, measured down from the mark's centre.
 *
 * The name's baseline, then the subtitle's own size, then a line of leading. It is
 * the deepest any node draws and it is why `PADDING` has to be what it is; a
 * second line that were placed on the name rather than below it would collide
 * with it on every node that had one.
 */
const NODE_SUBTITLE_OFFSET = NODE_NAME_OFFSET + NODE_SUBTITLE_SIZE + 5

/**
 * Where a relation's label sits, which is beside the line and never on it.
 *
 * The offset is the label's own half-width measured across the line plus its half
 * height, then the clearance. A single number cannot do this: on a horizontal
 * line a label's width runs along the line and its height across it, and on a
 * vertical line those two swap, so a constant that clears a horizontal relation
 * leaves a vertical one sitting on its own stroke.
 *
 * It is measured from the middle of the stroke a reader can see rather than of
 * the line between the two mark centres, so the label stays beside the line that
 * was drawn.
 */
function relationLabel(label: string, segment: Segment): Placed {
  const dx = segment.to.x - segment.from.x
  const dy = segment.to.y - segment.from.y
  const length = Math.hypot(dx, dy)
  const middle = {
    x: (segment.from.x + segment.to.x) / 2,
    y: (segment.from.y + segment.to.y) / 2,
  }
  if (length === 0) return middle
  const across = { x: -dy / length, y: dx / length }
  const extent =
    Math.abs(across.x) * labelHalfWidth(label, RELATION_NAME_SIZE) +
    Math.abs(across.y) * labelHalfHeight(RELATION_NAME_SIZE)
  const offset = extent + INK_CLEARANCE
  return { x: middle.x + across.x * offset, y: middle.y + across.y * offset }
}

/**
 * The labels this drawing prints under one node, which are what a stroke leaving it
 * has to be trimmed against.
 *
 * Each label is its own obstacle rather than one box enclosing both, and that is the
 * whole of the trim rule as it applies here: a node's name and its second line are
 * both below its mark, so a relation leaving sideways runs along the mark's centre
 * line and clears both, while one leaving downward enters both. The arithmetic is
 * `lib/figure`, which is where the shared answer lives; what is left here is the two
 * labels this drawing prints and where it prints them.
 */
function nodeLabels(node: DiagramNode): FigureLabel[] {
  const labels: FigureLabel[] = [{ text: node.name, size: NODE_NAME_SIZE, offset: NODE_NAME_OFFSET }]
  if (node.subtitle !== undefined) {
    labels.push({ text: node.subtitle, size: NODE_SUBTITLE_SIZE, offset: NODE_SUBTITLE_OFFSET })
  }
  return labels
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
 * with a name: `role="img"` and the drawing's name. Everything inside a
 * `role="img"` is presentational, so the node names, the node subtitles and the
 * relation words are drawn for sighted readers and the name is what a screen
 * reader gets. That is why the name is derived from the nodes' own text when the
 * caller passes no `label`: everything on the marks is invisible to the one
 * reader who is not looking at the picture, so a role description written only
 * into a label is a role description a sighted reader never sees. Pass `label`
 * when the drawing needs a name that says what it is rather than what it holds,
 * and omit it when the two would be the same sentence written twice. Pass
 * `decorative` when the surrounding sentence already says what the drawing
 * shows, and the whole tree leaves the accessibility tree with nothing named
 * inside it.
 *
 * **A node may wear its own pack.** `pack` on a node puts the boundary on the
 * circle that node draws, which is the mark, and the mark is the one place a
 * pack boundary belongs without moving anything but colour: a circle has no
 * radius concept, so the pack re-inks the mark and cannot re-round it. Nothing
 * else in the drawing answers to it, the node's name beside the mark keeps the
 * page's ink, and a page that files two pack regions can make a diagram section
 * the second one rather than moving it to the header's product switcher.
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
 * **No stroke crosses a label, and every relation still reaches the marks it
 * joins.** A relation used to run from one mark's centre to the other, and a node's
 * name is printed under its mark, so every edge heading downward struck through the
 * name of the node it left. Each label a node prints is now its own obstacle rather
 * than part of one box enclosing the whole node, and a relation is trimmed only
 * against the labels it would actually enter. That direction is the whole of the
 * rule: a name and its second line both sit below their mark, so a relation
 * leaving sideways runs along the mark's centre line and clears both, and it stops
 * at the mark's own edge with the ink clearance between. Backing every relation off
 * the widest label at its node instead detached them from the marks they connect,
 * which is a drawing of a shape with no relations on it. The Component cannot know
 * that two labels will not collide with one another, which is the caller's
 * positions to settle, and it does know every mark's radius, both label offsets and
 * every label's own width, because a monospaced label's width is its character
 * count. A relation's
 * own label is offset by its own extent across the line. Those are two pieces of
 * geometry the drawing had and did not use, and `test/diagram.test.tsx` asserts
 * both halves as geometry rather than the presence of a class name.
 *
 * **No label is drawn below `text-xs`.** The drawing is wrapped in a container
 * that scrolls sideways, and the drawing itself holds a floor of its own
 * coordinate space, so a phone sees the whole diagram at a legible size rather
 * than the whole diagram at six pixels. That is the same bargain `Table` strikes
 * with seven columns, and it is a bargain rather than an accident because the
 * alternative is a picture of a shape with nothing written on it. A relation
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
  const place = fitPoints(nodes, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, padding: PADDING })
  const byId = new Map(nodes.map((node) => [node.id, node]))

  // An empty `label` is the same answer as no `label`, so the drawing is named by
  // what its own marks carry rather than announced as an unnamed image. A blank
  // string is the one value the accessible name must never take, and the caller
  // who passed it has said no more than the caller who passed nothing.
  const name = label !== undefined && label.trim() !== '' ? label : derivedName(nodes)

  const drawn = relations.flatMap((relation) => {
    const from = byId.get(relation.from)
    const to = byId.get(relation.to)
    if (!from || !to) return []
    // Each end carries its mark's centre and the labels printed under it, because
    // a stroke is trimmed against the labels it would enter and the two are not the
    // same thing.
    const end = (node: DiagramNode) => ({ at: place(node), labels: nodeLabels(node) })
    return [{ relation, from: end(from), to: end(to) }]
  })

  return (
    // The sideways region, for the reason `LEGIBLE_MIN_WIDTH` states: the drawing
    // holds a legible floor and a container narrower than it moves under the
    // drawing rather than the drawing shrinking below what it says.
    <div data-slot="diagram-container" className="w-full overflow-x-auto">
      <svg
        data-slot="diagram"
        data-unresolved-relations={relations.length - drawn.length}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : name}
        aria-hidden={decorative || undefined}
        className={cn('h-auto w-full', LEGIBLE_MIN_WIDTH, className)}
      >
        {drawn.map(({ relation, from, to }) => {
          const line = strokeBetween(from.at, to.at, NODE_RADIUS, from.labels, to.labels)
          const at = relationLabel(relation.label, line)
          return (
            <g
              data-slot="diagram-relation"
              data-relation={`${relation.from}-${relation.to}`}
              key={`${relation.from}-${relation.to}`}
            >
              <path
                d={`M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`}
                strokeWidth={1}
                strokeDasharray={relation.indirect ? '4 4' : undefined}
                className="stroke-muted-foreground fill-none"
              />
              <text
                x={at.x}
                y={at.y}
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
          // `default` is the absence of the attribute, spelled the way the token
          // build spells it, so a node on the base pack resolves its fill and its
          // stroke from the page rather than from a selector nothing emits.
          const boundary =
            node.pack !== undefined && node.pack !== 'default' ? node.pack : undefined
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
                data-pack={boundary}
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
              {node.subtitle ? (
                <text
                  data-slot="diagram-node-subtitle"
                  x={at.x}
                  y={at.y + NODE_SUBTITLE_OFFSET}
                  fontSize={NODE_SUBTITLE_SIZE}
                  textAnchor="middle"
                  // Muted ink rather than the name's own: the line below a name is
                  // supporting, and a reader's eye reaches the name first. Both are
                  // contract roles, so a boundary above either moves it.
                  className="fill-muted-foreground font-mono"
                >
                  {node.subtitle}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export { Diagram }

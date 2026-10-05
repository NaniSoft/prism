/**
 * The arithmetic every Component that draws a figure shares.
 *
 * **One copy rather than one per Component.** Two Components in this package draw
 * labelled marks into a fixed canvas and both have to answer the same three
 * questions: where a label's ink box is, where a stroke leaving a mark has to stop
 * before it enters one, and how a caller's own coordinate space is fitted into the
 * canvas. Two copies of that
 * arithmetic are two answers to one question, and the disagreement between them is
 * invisible until a reader puts the two figures side by side and finds that one of
 * them runs a line through a word. What stays with each Component is the half that
 * is genuinely its own: the numbers its own drawing uses and the labels it prints.
 *
 * **How any of this is reachable from a server Component.** A Component that cannot
 * measure text still knows a monospaced label's width, because a monospaced face has
 * one advance width for every character and so a label's width is its character
 * count. That is a property of the face every label in a figure is set in rather
 * than of this module, and it is what makes a label's box arithmetic instead of a
 * measurement. A label set in a proportional face would have no such answer, which
 * is a limit of the rule rather than of the Component.
 *
 * **Two rules these serve, and the second one has a direction clause.** The
 * legibility floor in DESIGN.md, and the ink-avoidance rule beside it: a stroke
 * takes the longest stretch of the line between two marks that no label blocks, so a
 * label a stroke does not run through costs it nothing. Nothing here draws and
 * nothing here knows a colour, a token or a class name. A geometry helper that
 * also held an ink would be holding a token, which is the one thing a figure in
 * this system never does.
 */

/** A point in a figure's own coordinate space. */
export type FigurePoint = { x: number; y: number }

/** An axis-aligned rectangle in a figure's own coordinate space. */
export type FigureBox = { l: number; r: number; t: number; b: number }

/** The two ends of a drawn stroke. */
export type FigureStroke = { from: FigurePoint; to: FigurePoint }

/** A stretch of a line between two points, measured as a distance from the first. */
type Span = { enter: number; leave: number }

/**
 * One label a Component prints beside a mark, in the three numbers the arithmetic
 * below reads it by.
 *
 * A label is passed as its own text rather than as a measured box because there is
 * no measurement to pass: the text is the measurement, and the Component that owns
 * the label is the only one that knows its size and its baseline.
 */
export type FigureLabel = {
  /** The label's own text, whose character count is its width. */
  text: string
  /** Its type size, in user units. */
  size: number
  /** Its baseline, measured down from the mark's centre. */
  offset: number
}

/**
 * The canvas a caller's points are fitted into.
 *
 * `bottom` is separate from `height` because a figure that draws something along its
 * foot reserves a band there, and the fitted area stops above that band rather than
 * the canvas growing to fit both.
 */
export type FigureFrame = {
  width: number
  height: number
  /** The band left empty on the top and on the two sides. */
  padding: number
  /** The fitted area's lower edge, which defaults to `height - padding`. */
  bottom?: number
}

/**
 * The metrics of the face every label in a figure is set in, as fractions of the
 * type size, and the gap the drawing keeps between one piece of ink and the next.
 *
 * A monospaced face has one advance width for every character, so `MONO_ADVANCE` is
 * what turns a label's character count into a width, and `LABEL_ASCENT` and
 * `LABEL_DESCENT` are what turn a baseline into a box. The three are the face's own
 * rather than a decision about any one drawing, and they are a little generous on
 * purpose: a box wider or deeper than the ink it stands for costs a little length on
 * a stroke, while a box narrower or shallower costs a word a reader has to guess at.
 *
 * `INK_CLEARANCE` is the space the box adds around that ink, so it is both the gap
 * between a stroke and the label it would otherwise run through and the margin the
 * box keeps around the mark's own centre line. One constant rather than two because
 * it is one fact: no two pieces of ink in a figure touch.
 */
export const MONO_ADVANCE = 0.6
export const LABEL_ASCENT = 0.8
export const LABEL_DESCENT = 0.25
export const INK_CLEARANCE = 7

/** Half the width of a monospaced label of `size` user units, in user units. */
export function labelHalfWidth(label: string, size: number): number {
  return (label.length * MONO_ADVANCE * size) / 2
}

/** Half the height of a label of `size` user units, in user units. */
export function labelHalfHeight(size: number): number {
  return ((LABEL_ASCENT + LABEL_DESCENT) * size) / 2
}

/**
 * The box one label's ink occupies, with the clearance around it.
 *
 * One label rather than a node's whole set of them, and that is the whole of the
 * trim rule: a stroke is stopped by the labels it would actually enter, so the
 * clearance around one label has to be findable on its own rather than only as
 * part of a rectangle enclosing all of them.
 */
function labelBox(at: FigurePoint, label: FigureLabel): FigureBox {
  const half = labelHalfWidth(label.text, label.size)
  return {
    l: at.x - half - INK_CLEARANCE,
    r: at.x + half + INK_CLEARANCE,
    t: at.y + label.offset - LABEL_ASCENT * label.size - INK_CLEARANCE,
    b: at.y + label.offset + LABEL_DESCENT * label.size + INK_CLEARANCE,
  }
}

/**
 * The stretch of a ray that is inside one box, measured as a distance along the ray
 * from where it starts, or `null` for a ray that misses it.
 *
 * The two axes are taken separately and intersected, so a ray running exactly along
 * an axis is not a division by zero and a ray that clips a corner enters and leaves
 * in the same place rather than entering at all.
 */
function raySpan(from: FigurePoint, toward: FigurePoint, box: FigureBox): Span | null {
  const length = Math.hypot(toward.x - from.x, toward.y - from.y)
  if (length === 0) return null
  const ux = (toward.x - from.x) / length
  const uy = (toward.y - from.y) / length
  let enter = 0
  let leave = Number.POSITIVE_INFINITY
  for (const [origin, delta, low, high] of [
    [from.x, ux, box.l, box.r],
    [from.y, uy, box.t, box.b],
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
 * The stretches of the line between two marks that no label's clearance blocks, in
 * order along it and with the two marks themselves as its ends.
 *
 * Two of the boxes a caller hands over can block the same stretch, and one box can
 * block two, so the stretches are merged before they are compared: the answer is a
 * set of gaps rather than a set of obstacles, and a gap that counted twice would be
 * a gap that won twice.
 */
function freeStretches(
  from: FigurePoint,
  to: FigurePoint,
  boxes: readonly FigureBox[],
): Span[] {
  const length = Math.hypot(to.x - from.x, to.y - from.y)
  const blocked = boxes
    .map((box) => raySpan(from, to, box))
    .filter((span): span is Span => span !== null)
    .map((span) => ({
      enter: Math.max(0, span.enter),
      leave: Math.min(length, span.leave),
    }))
    .filter((span) => span.leave > span.enter)
    .sort((a, b) => a.enter - b.enter)

  const merged: Span[] = []
  for (const span of blocked) {
    const open = merged[merged.length - 1]
    if (open && span.enter <= open.leave) {
      open.leave = Math.max(open.leave, span.leave)
    } else {
      merged.push({ ...span })
    }
  }

  const gaps: Span[] = []
  let walked = 0
  for (const span of merged) {
    if (span.enter > walked) gaps.push({ enter: walked, leave: span.enter })
    walked = span.leave
  }
  gaps.push({ enter: walked, leave: length })
  return gaps
}

/**
 * The visible part of a stroke between two marks: the longest stretch of the line
 * between them that no label blocks, held off each mark by the mark's own clearance.
 *
 * **Trim a segment against what it would actually enter, and nothing else.** A label
 * is an obstacle only where the stroke runs, so each label is its own box and a
 * stroke that misses it pays nothing for it. A name is printed under its mark and a
 * note under that, so both sit below it, and a stroke leaving sideways runs along
 * the mark's own centre line and enters neither. Backing a stroke off the mark by
 * the half-width of the widest label at the node anyway pushed every connector on a
 * six-stage rail back by up to fifty units from a six-unit mark: a row of circles
 * with short line segments floating between them, which is a drawing of a shape and
 * none of its relations. So the whole rail reaches both of its marks and nothing is
 * trimmed there at all.
 *
 * **The stretch is the one the whole stroke fits in, and not two trims taken one at a
 * time, because a label can block the corridor behind a mark rather than the mark
 * itself.** A node's name and note sit below it at two different depths, so a
 * stroke arriving from below runs through the name, out of it, and then back into the
 * note further along: stopping where the name ends leaves the stroke sitting on top
 * of the note. The drawn stroke is what has to be clear, so the whole line between
 * the two marks is divided once and the longest unblocked stretch of it is drawn.
 *
 * **A mark's own edge plus the clearance is where an end sits when nothing blocks
 * it.** A mark is a circle, so its edge is `mark` away in every direction, and the
 * clearance is the gap that holds a stroke off the ink it belongs to. A line with no
 * label on it therefore starts one clearance from the first mark and ends one
 * clearance from the second, and that pair is the whole of what a stroke leaving a
 * node sideways is allowed to cost.
 *
 * Two blocked stretches can leave nothing between them when a caller puts two marks
 * close together, and a line trimmed away entirely is a line that silently did not
 * draw, which is the one failure a figure in this package exists to make impossible.
 * The mark boundaries are then the shortest stroke that still joins the two marks,
 * and a caller who has put two marks on top of one another has already been told what
 * that draws.
 */
export function strokeBetween(
  from: FigurePoint,
  to: FigurePoint,
  mark: number,
  fromLabels: readonly FigureLabel[],
  toLabels: readonly FigureLabel[],
): FigureStroke {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy)
  if (length === 0) return { from, to }
  const ux = dx / length
  const uy = dy / length

  // Both nodes' labels, in one list, because the corridor between the marks is one
  // corridor and a label of either end can be what blocks it. Each label is anchored
  // to the mark it is printed under, which for one of them is not where this line
  // starts.
  const gaps = freeStretches(from, to, [
    ...fromLabels.map((label) => labelBox(from, label)),
    ...toLabels.map((label) => labelBox(to, label)),
  ])
  const room = gaps.reduce((best, gap) =>
    gap.leave - gap.enter > best.leave - best.enter ? gap : best,
  )

  const head = Math.max(room.enter, mark + INK_CLEARANCE)
  const tail = Math.min(room.leave, length - mark - INK_CLEARANCE)
  if (tail > head) {
    return {
      from: { x: from.x + ux * head, y: from.y + uy * head },
      to: { x: from.x + ux * tail, y: from.y + uy * tail },
    }
  }
  return {
    from: { x: from.x + ux * mark, y: from.y + uy * mark },
    to: { x: to.x - ux * mark, y: to.y - uy * mark },
  }
}

/**
 * The caller's points, fitted into the frame with their aspect ratio kept and the
 * leftover shared out evenly.
 *
 * A caller whose points span one axis only, or who passes one item, gets the other
 * axis centred rather than a division by zero: the scale is taken over the axes that
 * have an extent, and a figure with no extent at all keeps the caller's own numbers.
 */
export function fitPoints<T extends FigurePoint>(
  items: readonly T[],
  frame: FigureFrame,
): (item: T) => FigurePoint {
  const bottom = frame.bottom ?? frame.height - frame.padding
  if (items.length === 0) {
    return () => ({ x: frame.width / 2, y: (frame.padding + bottom) / 2 })
  }

  const xs = items.map((item) => item.x)
  const ys = items.map((item) => item.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const spanX = Math.max(...xs) - minX
  const spanY = Math.max(...ys) - minY

  const roomX = frame.width - frame.padding * 2
  const roomY = bottom - frame.padding
  const scale = Math.min(
    spanX === 0 ? Number.POSITIVE_INFINITY : roomX / spanX,
    spanY === 0 ? Number.POSITIVE_INFINITY : roomY / spanY,
  )
  const unit = Number.isFinite(scale) && scale > 0 ? scale : 1

  const offsetX = frame.padding + (roomX - spanX * unit) / 2 - minX * unit
  const offsetY = frame.padding + (roomY - spanY * unit) / 2 - minY * unit

  return (item) => ({ x: item.x * unit + offsetX, y: item.y * unit + offsetY })
}
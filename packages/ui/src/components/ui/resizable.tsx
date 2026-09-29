'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/utils'

/**
 * The divider's position, as a percentage along the group's main axis.
 *
 * A percentage rather than a pixel count because the group is a proportion of
 * whatever the page gives it, and a divider measured in pixels is wrong the
 * moment the window is resized or the group is put in a narrower column. A
 * percentage is wrong for one case and that case is a pane whose content must
 * not reflow, and a caller who needs one is measuring their content rather than
 * asking for a split.
 */
type Position = number

/** How the panes are laid out, and therefore which pair of arrows moves a divider. */
type ResizableOrientation = 'horizontal' | 'vertical'

/** The window the divider may travel in, as a percentage of the group. */
const MIN = 10
const MAX = 90

/** How far one arrow-key press moves the divider, as a percentage of the group. */
const STEP = 5

type ResizableContextValue = {
  orientation: ResizableOrientation
  /** The divider's position, as a percentage along the group's main axis. */
  position: Position
  /** Move the divider to an absolute position, clamped to its window. */
  moveTo: (next: Position) => void
  /** Move the divider by a relative amount, clamped to its window. */
  moveBy: (delta: number) => void
  min: Position
  max: Position
  disabled: boolean
  /** Whether a pointer is down on the divider, for the drag styling. */
  dragging: boolean
  setDragging: (dragging: boolean) => void
  /** The element the drag measures against. */
  groupElement: () => HTMLDivElement | null
}

const ResizableContext = createContext<ResizableContextValue | null>(null)

/**
 * The group context, which a pane and a divider are both children of.
 *
 * The part name is a machine value and lowercase on purpose: it reaches a
 * developer in a console and never a reader, and the gate that refuses shipped
 * copy cannot tell a part's own name from a sentence. The diagnostic is the
 * house's own shape, an error thrown when a caller has composed a part outside
 * the group it belongs to, and the useful half of it is what to do about it.
 */
function useResizableContext(part: string): ResizableContextValue {
  const context = useContext(ResizableContext)
  if (context === null) {
    throw new Error(
      `Resizable: the ${part} must be rendered inside a Resizable, because the split is owned by the group and neither part can know it on its own.`,
    )
  }
  return context
}

/** The props the Resizable group accepts. */
export interface ResizableProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /**
   * The accessible name of the group.
   *
   * Required rather than defaulted, because a resizable is announced as two
   * panes with a divider between them, and two unnamed panes side by side are a
   * page where a reader is told "region" twice and cannot tell which is which.
   */
  label: string
  /** Whether the panes sit side by side or stacked. @defaultValue horizontal */
  orientation?: ResizableOrientation
  /**
   * The divider's starting position, as a percentage along the main axis.
   * @defaultValue 50
   */
  defaultPosition?: Position
  /**
   * The controlled divider position, as a percentage along the main axis.
   *
   * The position is a prop and a callback rather than something the group keeps
   * to itself, and that is the decision this Component makes: **a split is
   * worth remembering, and this Component will not remember it for you.** A
   * reader who drags a sidebar to where their work fits and comes back to a
   * reset split has been told the preference did not count, and the honest fix is
   * the caller reading this and persisting it, because a design system cannot
   * know a reader's storage, cannot know which of a reader's panes this one is,
   * and cannot know whether a second reader of the same account wants the same
   * number. Pass the stored value back as `position` and this is a controlled
   * group with no storage of its own anywhere.
   */
  position?: Position
  /** Called when the divider moves, with the new position. */
  onPositionChange?: (position: Position) => void
  /** Whether the divider ignores user interaction. @defaultValue false */
  disabled?: boolean
  /** The panes and the divider between them. */
  children?: ReactNode
}

/** The props ResizablePanel accepts. */
export interface ResizablePanelProps extends ComponentProps<'div'> {
  /** The pane's share of the group, as a percentage. @defaultValue 50 */
  size?: Position
}

/**
 * Two panes with a divider between them that both a pointer and a keyboard move.
 *
 * **The divider is the Component, and everything about it is a decision a
 * consumer would otherwise make badly.** It is an ARIA separator that is
 * focusable, so the split is operable without a pointer at all, and it reports
 * `aria-valuenow` as the position along the split, so a reader is told where the
 * divider is rather than only being able to feel it. Arrow keys move it by a
 * small step, Home takes it to one end and End to the other, and both are
 * clamped, so a reader who holds the key stops at the end rather than pushing a
 * pane to nothing and being unable to get it back.
 *
 * **It remembers nothing across a reload, and that is deliberate.** The position
 * is a prop and a callback, so a caller who wants a reader's split to survive a
 * reload persists it and passes it back, and a design system that wrote to a
 * reader's storage unasked would be making a claim about the product it does not
 * know. The failure this prevents is a sidebar that silently resets, which is the
 * same class of defect as a control that forgets a setting the reader chose and
 * nobody can explain.
 *
 * **A divider has a name and it is the caller's word.** There is no default,
 * because a default would be the same word on every divider on every page and
 * would be true of none of them.
 *
 * This is the one Component here that is not composed on a Base UI primitive,
 * because Base UI 1.8.0 ships none: the package has no `Resizable` in it, so the
 * separator role, the focusable-divider keyboard model and the drag are authored
 * here rather than wrapped. Every other overlay in this batch is composed, and a
 * hand-rolled focus trap or portal would be a second and worse answer; a divider
 * is none of those five things.
 */
function Resizable({
  className,
  label,
  orientation = 'horizontal',
  defaultPosition = 50,
  position: positionProp,
  onPositionChange,
  disabled = false,
  ...props
}: ResizableProps) {
  const [internal, setInternal] = useState<Position>(defaultPosition)
  const [dragging, setDragging] = useState(false)
  const group = useRef<HTMLDivElement | null>(null)
  const { ref: callerRef, ...rest } = props

  // Both refs, rather than mine and then the caller's. The drag measures the
  // pointer against this element's box, so a caller who forwarded a ref and
  // silently replaced ours would get a divider the keyboard moves and the pointer
  // does not, which is a split that only half works.
  const setGroup = useCallback(
    (element: HTMLDivElement | null) => {
      group.current = element
      if (typeof callerRef === 'function') callerRef(element)
      else if (callerRef !== null && callerRef !== undefined) callerRef.current = element
    },
    [callerRef],
  )

  const controlled = positionProp !== undefined
  const position = controlled ? positionProp : internal

  /**
   * The position every move is measured from, kept in a ref rather than read
   * from the rendered value.
   *
   * This is the whole of the keyboard model and it is not a style choice. A
   * reader who holds ArrowRight produces four key events before React has
   * re-rendered, and a move that read the rendered position each time would see
   * the same number four times and travel one step instead of four. The divider
   * would then feel broken to exactly the reader using it the way it is meant to
   * be used, and a drag would run behind the pointer.
   */
  const latest = useRef<Position>(position)
  latest.current = position

  const moveTo = useCallback(
    (next: Position) => {
      if (disabled) return
      const clamped = Math.min(MAX, Math.max(MIN, next))
      latest.current = clamped
      if (!controlled) setInternal(clamped)
      onPositionChange?.(clamped)
    },
    [controlled, disabled, onPositionChange],
  )

  const moveBy = useCallback(
    (delta: number) => {
      if (disabled) return
      moveTo(latest.current + delta)
    },
    [disabled, moveTo],
  )

  const value = useMemo<ResizableContextValue>(
    () => ({
      orientation,
      position,
      moveTo,
      moveBy,
      min: MIN,
      max: MAX,
      disabled,
      dragging,
      setDragging,
      groupElement: () => group.current,
    }),
    [orientation, position, moveTo, moveBy, disabled, dragging],
  )

  return (
    <ResizableContext.Provider value={value}>
      <div
        data-slot="resizable"
        role="group"
        aria-label={label}
        data-orientation={orientation}
        data-dragging={dragging ? 'true' : undefined}
        ref={setGroup}
        className={cn(
          'flex h-full w-full',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          'data-[dragging]:select-none',
          className,
        )}
        {...rest}
      />
    </ResizableContext.Provider>
  )
}

/**
 * One pane of the split.
 *
 * `size` is a prop rather than something computed from the content, because a
 * pane whose width depends on what is in it is how a split ends up reporting a
 * different position after a reload than before one, and the divider is measured
 * against a box the reader cannot predict.
 */
function ResizablePanel({ className, size = 50, style, ...props }: ResizablePanelProps) {
  const { orientation, disabled } = useResizableContext('panel')

  return (
    <div
      data-slot="resizable-panel"
      data-orientation={orientation}
      data-disabled={disabled ? 'true' : undefined}
      style={{
        flexBasis: `${size}%`,
        flexGrow: 0,
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,
        ...style,
      }}
      className={cn('overflow-hidden', className)}
      {...props}
    />
  )
}

/**
 * The divider, and the whole of the Component's behaviour.
 *
 * A focusable ARIA separator with a value, so the split is operable and
 * announced: `role="separator"`, `aria-valuenow` for the position, and
 * `aria-orientation` for the axis, which is what tells a reader whether the left
 * and right arrows or the up and down ones are the ones to press.
 */
function ResizableHandle({ className, label, onKeyDown, ...props }: ResizableHandleProps) {
  const {
    orientation,
    position,
    moveTo,
    moveBy,
    min,
    max,
    disabled,
    dragging,
    setDragging,
    groupElement,
  } = useResizableContext('divider')
  const last = useRef<number | null>(null)

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    // The pointer's own coordinate, and not the divider's, because a drag is a
    // distance travelled and the first event is a press rather than a move.
    last.current = orientation === 'horizontal' ? event.clientX : event.clientY
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (last.current === null) return
    const box = groupElement()?.getBoundingClientRect()
    if (box === undefined) return
    // Measured along the group's own axis, so a horizontal split follows the x
    // and a vertical one follows the y, and a caller that passes the wrong
    // `orientation` cannot get a divider that tracks the wrong coordinate.
    const here = orientation === 'horizontal' ? event.clientX : event.clientY
    const delta = here - last.current
    const travel = orientation === 'horizontal' ? box.width : box.height
    if (travel === 0) return
    moveBy((delta / travel) * 100)
    last.current = here
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (last.current === null) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    last.current = null
    setDragging(false)
  }

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const decrease = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const increase = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
    if (event.key === decrease) moveBy(-STEP)
    else if (event.key === increase) moveBy(STEP)
    else if (event.key === 'Home') moveTo(min)
    else if (event.key === 'End') moveTo(max)
    else return
    // Only the keys this Component owns are prevented, so a reader who binds
    // something else to the divider still gets it.
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div
      data-slot="resizable-handle"
      role="separator"
      aria-label={label}
      aria-orientation={orientation}
      aria-valuenow={Math.round(position)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : 0}
      data-orientation={orientation}
      data-dragging={dragging ? 'true' : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={(event) => {
        onKey(event)
        onKeyDown?.(event)
      }}
      className={cn(
        'bg-border relative shrink-0 touch-none outline-none',
        orientation === 'vertical' ? 'h-px w-full cursor-row-resize' : 'h-full w-px cursor-col-resize',
        'transition-colors duration-fast ease-out',
        'hover:bg-ring focus-visible:bg-ring data-[dragging]:bg-ring',
        'focus-visible:ring-ring focus-visible:ring-[3px]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The props ResizableHandle accepts.
 *
 * The `label` is required for the same reason the group's is, and it is a prop
 * rather than a default because there is no honest default: a divider named
 * "Resize" in a page with a file tree, a preview and a comment thread tells a
 * reader nothing about which one they are holding, and the words that would
 * tell them are the words for that product's panes.
 */
export interface ResizableHandleProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /**
   * The accessible name of this divider.
   *
   * Required. A divider with no name is announced as "separator", and a page
   * with three of them is a page where a screen reader user cannot tell which
   * one they are about to move.
   */
  label: string
}

export { Resizable, ResizablePanel, ResizableHandle }

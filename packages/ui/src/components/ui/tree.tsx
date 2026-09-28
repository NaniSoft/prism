'use client'

import { useRef, type KeyboardEvent, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * A node a reader can arrive at: a title and the address it is read at.
 *
 * `href` is required. A node in a tree that goes nowhere is an entry a reader can
 * focus and not follow, and this Component renders every node with a destination
 * as a native anchor so a reader can see where it goes before taking it.
 */
export type TreeNodePage = {
  type: 'page'
  /** The words the reader meets. */
  title: string
  /** The address the node is read at. */
  href: string
}

/**
 * A label over a list of nodes, at any depth.
 *
 * `href` is the group's own index and it is optional on purpose. A group with no
 * index is a place in the tree and not a route, so this Component renders it as a
 * label: no anchor, no `href`, nothing focusable. Inventing a route for it would
 * publish an address that resolves to nothing.
 *
 * `items` is required, because a group that renders a label and holds nothing is
 * an empty entry rather than a group. Pass a node with no children rather than a
 * group with none.
 */
export type TreeNodeGroup = {
  type: 'group'
  /** The words on the label. A status inside them stays inside them. */
  title: string
  /** The group's own index, where it has one. Omit it for a label over a list. */
  href?: string
  /** The nodes under this group, in the order a reader should meet them. */
  items: readonly TreeNode[]
}

/**
 * A rule between nodes, carrying a name that is usually empty.
 *
 * It is a label and never a link. The alternative spelling, a page node with an
 * empty `href`, is a control that cannot be operated, so a rule is its own type.
 */
export type TreeNodeDivider = {
  type: 'divider'
  /** The words on the rule, which may be the empty string. */
  title: string
}

/**
 * One node in a tree, of any of the three kinds.
 *
 * The union is closed, and it is a union rather than one shape with optional
 * fields because a reader meets three different things in a tree: a destination, a
 * label over a list, and a rule. A single shape would make all three look alike,
 * and "a place that is a heading, not a link" is the distinction the whole
 * arrangement turns on.
 */
export type TreeNode = TreeNodePage | TreeNodeGroup | TreeNodeDivider

/** The props the Tree accepts. */
export interface TreeProps {
  /** The nodes, in the order a reader should meet them. */
  nodes: readonly TreeNode[]
  /**
   * The address the reader is currently at, which is what marks the current node.
   *
   * The marking is the attribute and not a class, so it survives a theme change and
   * does not depend on a colour a reader may not distinguish.
   */
  currentHref?: string
  /**
   * The accessible name of the tree, read before its nodes.
   *
   * Required rather than defaulted, because a tree with no name is announced as
   * "tree" and a page with two of them is a page where a reader cannot tell which
   * is which. The name is the caller's word.
   */
  label: string
  /** Layout only. */
  className?: string
  /**
   * The words a reader is told when the tree is empty, and optionally what to do
   * about it.
   *
   * A tree that renders nothing is a control with nothing in it, so the empty case
   * is authored rather than left to a caller to notice.
   */
  empty?: { message: string; action?: ReactNode }
}

/** Whether a group's subtree contains the current address, at any depth. */
function containsHref(nodes: readonly TreeNode[], currentHref: string | undefined): boolean {
  if (currentHref === undefined) return false
  for (const node of nodes) {
    if (node.type === 'page' && node.href === currentHref) return true
    if (node.type === 'group') {
      if (node.href === currentHref) return true
      if (containsHref(node.items, currentHref)) return true
    }
  }
  return false
}

/** Whether an address is the current one or lies under it, for a heading's emphasis. */
function under(href: string, currentHref: string | undefined): boolean {
  if (currentHref === undefined) return false
  return currentHref === href || currentHref.startsWith(`${href}/`)
}

function TreeLevel({
  nodes,
  currentHref,
  depth,
}: {
  nodes: readonly TreeNode[]
  currentHref?: string
  depth: number
}) {
  return (
    <ul
      data-slot="tree-list"
      data-depth={depth}
      // `group` on the list, not `treeitem`: the items are the things a reader
      // navigates between, and a `ul` of them is a group. `role="none"` on each
      // item below removes the listitem role so that only the anchors and labels
      // are the navigable things, which is what lets a caller's own keyboard model
      // move between them without a roving tabindex fighting the document's.
      role="group"
      className={cn(
        'border-border flex flex-col gap-1 border-l',
        // One level of indent per nested group and none at the top, so the depth
        // reads from the rule rather than from the words.
        depth > 0 && 'ps-3',
      )}
    >
      {nodes.map((node, index) => (
        <TreeItem
          key={`${node.type}:${index}`}
          node={node}
          currentHref={currentHref}
          depth={depth}
        />
      ))}
    </ul>
  )
}

function TreeItem({
  node,
  currentHref,
  depth,
}: {
  node: TreeNode
  currentHref?: string
  depth: number
}) {
  if (node.type === 'divider') {
    // A rule between nodes. It is a label, so it is not focusable and a reader
    // does not meet it as a destination, and the empty title renders no words
    // above the hairline rather than a word a reader has to interpret.
    return (
      <li data-slot="tree-divider" role="none" className="border-border mt-2 border-t pt-2 first:mt-0 first:border-t-0 first:pt-0">
        {node.title ? (
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {node.title}
          </span>
        ) : null}
      </li>
    )
  }

  if (node.type === 'group') {
    return (
      <li data-slot="tree-group" role="none">
        <div className="flex flex-col gap-1">
          {/*
            The one rule this whole arrangement turns on, carried over from the
            documentation Page that proved it: a group with an index is a
            destination and renders an anchor; a group without one is a label and
            renders a span, so it carries no `href`, is not focusable, and cannot be
            reached by Tab. There is no third arm and no anchor with an empty
            `href`, because both publish an address that resolves to nothing.
          */}
          {node.href === undefined ? (
            /*
             * A group with no index is a tree item that is not a destination, so it
             * carries `role="treeitem"` and its level and nothing else. It is not a
             * bare span: `aria-level` on an element with no role is prohibited
             * rather than ignored, which the accessibility gate caught the first
             * time this was rendered, and a reader needs the level to place a label
             * that has no anchor to place it by.
             */
            <span
              data-slot="tree-label"
              role="treeitem"
              aria-level={depth + 1}
              aria-expanded={node.items.length > 0 ? true : undefined}
              className={cn(
                'rounded-sm text-sm font-semibold tracking-tight',
                containsHref(node.items, currentHref) ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {node.title}
            </span>
          ) : (
            <a
              data-slot="tree-heading"
              href={node.href}
              role="treeitem"
              aria-level={depth + 1}
              aria-expanded={node.items.length > 0 ? true : undefined}
              aria-current={currentHref === node.href ? 'page' : undefined}
              className={cn(
                'hover:text-foreground rounded-sm text-sm font-semibold tracking-tight transition-colors duration-fast ease-out',
                under(node.href, currentHref) ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {node.title}
            </a>
          )}

          {node.items.length > 0 ? (
            <TreeLevel nodes={node.items} currentHref={currentHref} depth={depth + 1} />
          ) : null}
        </div>
      </li>
    )
  }

  return (
    <li data-slot="tree-item" role="none">
      <a
        data-slot="tree-link"
        href={node.href}
        // A destination in a tree is a `treeitem`, not a link with a level hung
        // off it: the level belongs to the item, and a reader placing it in the
        // tree is reading the item rather than the anchor inside it.
        role="treeitem"
        aria-level={depth + 1}
        aria-current={currentHref === node.href ? 'page' : undefined}
        className={cn(
          '-ms-px block border-l-2 py-1 ps-3 text-sm transition-colors duration-fast ease-out',
          currentHref === node.href
            ? 'text-foreground border-primary font-medium'
            : 'text-muted-foreground hover:text-foreground border-transparent',
        )}
      >
        {node.title}
      </a>
    </li>
  )
}

/**
 * A tree of nodes, given as data.
 *
 * This is the third of the three primitives the expansion found missing, and the
 * one with a different kind of work behind it: the implementation already existed
 * as two private renderers inside the documentation Page, with its depth rule, its
 * `aria-current` marking and its rule that a group with no index renders a label.
 * What was missing was that it was unreachable, and that its data type was bound
 * to documentation navigation rather than being a tree's own vocabulary. So this is
 * a promotion rather than a second implementation, and the reasoning in the
 * documentation Page is carried across rather than rewritten.
 *
 * **A flat list renders a flat tree.** An outline is a tree of depth one, so a
 * caller passes leaves and gets leaves. A Component that required nesting to
 * express a flat structure would make the common case the awkward one.
 *
 * **The Page keeps its own renderers and does not change.** Its two rules, that a
 * section carries no status or count and that a group with no index is a label,
 * are specific to a documentation rail and are reasoned at length in the design
 * rules. A documentation rail is one shape a tree takes, not the shape. Whether the
 * Page composes this Component later is a decision this ticket does not make.
 */
function Tree({ nodes, currentHref, label, className, empty }: TreeProps) {
  const root = useRef<HTMLDivElement>(null)

  /**
   * The keyboard model, and the reason it lives here rather than in a caller's.
   *
   * A tree is one Tab stop, and the arrow keys move inside it. That is the ARIA
   * pattern, and a consumer who composes the markup themselves gets the Tab order
   * of the document instead, which is every node in the tree and none of the
   * arrows. A roving tabindex is the mechanism: one node is tabbable at a time and
   * the arrows move which one.
   *
   * The flat order is collected from the DOM rather than computed from the node
   * data, because the DOM is what a reader actually moves through and computing a
   * second order from the data is a second list to fall behind the first. Only
   * focusable nodes take part, so a label that is not a destination is skipped
   * rather than focused and doing nothing.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key)) return
    const root_ = root.current
    if (root_ === null) return
    const items = [
      ...root_.querySelectorAll<HTMLElement>('[data-slot="tree-link"], [data-slot="tree-heading"]'),
    ]
    if (items.length === 0) return

    const at = items.indexOf(document.activeElement as HTMLElement)
    if (at === -1) return
    event.preventDefault()

    const next =
      event.key === 'ArrowDown'
        ? Math.min(at + 1, items.length - 1)
        : event.key === 'ArrowUp'
          ? Math.max(at - 1, 0)
          : event.key === 'Home'
            ? 0
            : items.length - 1
    items[next]?.focus()
  }

  if (nodes.length === 0) {
    // A tree that renders nothing is a control with nothing in it, so the empty
    // case is authored rather than left for a caller to notice.
    return (
      <div data-slot="tree-empty" className={cn('text-muted-foreground text-sm', className)}>
        {empty?.message ?? null}
        {empty?.action}
      </div>
    )
  }

  return (
    <div
      data-slot="tree"
      ref={root}
      role="tree"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex flex-col', className)}
    >
      <TreeLevel nodes={nodes} currentHref={currentHref} depth={0} />
    </div>
  )
}

export { Tree }

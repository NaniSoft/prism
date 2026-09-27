import Link from 'next/link'

import type { NavEntry, NavItem, NavSection } from '@/lib/nav'

/**
 * The documentation sidebar, recursive and server-rendered.
 *
 * It recurses over the projected tree rather than over a section and its items,
 * because the tree is now the shape the navigation has: a group is a heading and
 * a list, at any depth, and one level of that is the whole component. A reader
 * sees the same sidebar as before because nothing nests yet, not because the
 * nesting is special-cased away.
 *
 * There is no `'use client'` and no state, so the recursion is rendered on the
 * server and ships no JavaScript. A client island for a nested sidebar would
 * spend the headroom the client budget has left on a list of links, which is
 * what the budget is for.
 *
 * The group heading is the one rule worth stating: it links to the folder's own
 * index page when the folder has one, and renders as a plain label when it does
 * not. A group is a place in the tree and no route is invented for it.
 */
export function SectionNav({
  sections,
  currentUrl,
}: {
  sections: NavSection[]
  currentUrl: string
}) {
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-8">
      {sections.map((section) => (
        <NavGroup key={section.id} group={section} currentUrl={currentUrl} depth={0} />
      ))}
    </nav>
  )
}

function NavGroup({
  group,
  currentUrl,
  depth,
}: {
  group: NavSection
  currentUrl: string
  depth: number
}) {
  const active = contains(group, currentUrl)

  return (
    <div className="flex flex-col gap-2">
      {group.url ? (
        <Link
          href={group.url}
          aria-current={currentUrl === group.url ? 'page' : undefined}
          className={headingClass(active)}
        >
          {group.title}
        </Link>
      ) : (
        <span className={labelClass(active)}>{group.title}</span>
      )}

      {group.items.length ? (
        <ul
          className={
            // One level of indent per nested group, and none at the top, so the
            // depth reads from the rule rather than from the text.
            depth > 0
              ? 'border-border flex flex-col gap-1 border-l pl-3'
              : 'border-border flex flex-col gap-1 border-l'
          }
        >
          {group.items.map((entry) => (
            <Entry key={entryKey(entry)} entry={entry} currentUrl={currentUrl} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Entry({
  entry,
  currentUrl,
  depth,
}: {
  entry: NavEntry
  currentUrl: string
  depth: number
}) {
  if (entry.type === 'group') {
    return (
      <li>
        <NavGroup group={entry} currentUrl={currentUrl} depth={depth} />
      </li>
    )
  }

  if (entry.type === 'divider') {
    // A rule between entries, from a meta file. It carries a name, which is
    // usually empty, and it is a label rather than a link, so it is not focusable
    // and a reader does not meet it as a destination.
    return (
      <li className="border-border mt-1 border-t pt-1">
        <span className="text-muted-foreground text-sm font-medium tracking-tight">
          {entry.title}
        </span>
      </li>
    )
  }

  return (
    <li>
      <PageLink item={entry} currentUrl={currentUrl} />
    </li>
  )
}

function PageLink({ item, currentUrl }: { item: NavItem; currentUrl: string }) {
  const current = item.url === currentUrl
  return (
    <Link
      href={item.url}
      aria-current={current ? 'page' : undefined}
      className={
        current
          ? 'text-foreground border-primary -ml-px block border-l-2 py-1 pl-3 text-sm font-medium'
          : 'text-muted-foreground hover:text-foreground border-transparent -ml-px block border-l-2 py-1 pl-3 text-sm transition-colors'
      }
    >
      {item.title}
    </Link>
  )
}

function headingClass(active: boolean): string {
  return active
    ? 'text-foreground text-sm font-semibold tracking-tight'
    : 'text-muted-foreground hover:text-foreground text-sm font-semibold tracking-tight transition-colors'
}

/**
 * The same type as a heading, without the hover affordance: a label is not a
 * destination, so it must not look like it is about to become one.
 */
function labelClass(active: boolean): string {
  return active
    ? 'text-foreground text-sm font-semibold tracking-tight'
    : 'text-muted-foreground text-sm font-semibold tracking-tight'
}

/** A stable key per entry. A page's route is its identity; a group carries one. */
function entryKey(entry: NavEntry): string {
  return entry.type === 'page' ? entry.url : entry.id
}

/**
 * Whether the current page is inside this group.
 *
 * A group with a route answers for that route and everything under it. A group
 * without one has no route to answer with, so it asks its children, which is the
 * only way a label can still show that the reader is inside it.
 */
function contains(group: NavSection, currentUrl: string): boolean {
  if (under(group.url, currentUrl)) return true
  return group.items.some((entry) => {
    if (entry.type === 'page') return under(entry.url, currentUrl)
    if (entry.type === 'group') return contains(entry, currentUrl)
    return false
  })
}

/** Under a route, or at it, and never under a route that merely starts the same. */
function under(url: string | undefined, currentUrl: string): boolean {
  return url !== undefined && (currentUrl === url || currentUrl.startsWith(`${url}/`))
}

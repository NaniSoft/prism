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
 *
 * **The current page is marked on the `sidebar-primary` pair, and that is a
 * decision rather than a colour.** A rail of thirty links in which one is
 * different is a rail a reader has to read all of to find. Marking the current
 * Section's pages as well as its heading turns the rail into a map of where the
 * reader is rather than a list they have to hold: the reader sees the outline
 * lit around the page they are on, and the page they are on is the only thing
 * that is filled. Before this, only the page link was marked, so the Section
 * headings above it looked exactly as they do on a page the reader is not in.
 *
 * `contains()` already answers "is the reader inside this group", so no new
 * information is invented to mark it. The pair used is `sidebar-primary` on
 * `sidebar-accent`, both of which the contrast gate holds, and it is the only
 * filled element in the rail.
 */
export function SectionNav({
  sections,
  currentUrl,
}: {
  sections: NavSection[]
  currentUrl: string
}) {
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-7">
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
    <div className="flex flex-col gap-1.5">
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
            // depth reads from the rule rather than from the text. The rule is
            // `sidebar-border` rather than `border`, because the rail is on the
            // `sidebar` surface and a page-ground border on a sidebar surface is
            // a colour measured for a different ground.
            depth > 0
              ? 'border-sidebar-border flex flex-col gap-0.5 border-l pl-3'
              : 'flex flex-col gap-0.5'
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
      <li className="border-sidebar-border mt-2 border-t pt-2">
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
      className={current ? CURRENT_LINK : LINK}
    >
      {item.title}
    </Link>
  )
}

/**
 * The resting page link, and the one the current page replaces it with.
 *
 * Both carry their own focus treatment, because a plain link gets none from the
 * tree and a browser default is a focus ring belonging to no design system. The
 * ring is at full `ring` strength rather than `ring/50` for the reason the header
 * records: half alpha composites this `--ring` below 3:1 against every surface in
 * the palette, and the ring's threshold is 3:1.
 *
 * The link is `block` with vertical padding rather than a bare line, so its hit
 * area covers the row. Two adjacent links a line apart are two targets a pointer
 * has to be accurate about.
 */
const LINK =
  'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md -ml-1.5 block py-1 pl-1.5 pr-2 text-sm transition-colors focus-visible:border-sidebar-ring focus-visible:ring-sidebar-ring focus-visible:ring-[3px] focus-visible:outline-none'

/**
 * The current page. Filled rather than merely bolder, because a rail's current
 * page has to survive being glanced at rather than read.
 */
const CURRENT_LINK =
  'bg-sidebar-primary text-sidebar-primary-foreground rounded-md -ml-1.5 block py-1 pl-1.5 pr-2 text-sm font-medium focus-visible:border-sidebar-ring focus-visible:ring-sidebar-ring focus-visible:ring-[3px] focus-visible:outline-none'

/**
 * The same type as a heading, without the hover affordance: a label is not a
 * destination, so it must not look like it is about to become one.
 */
function headingClass(active: boolean): string {
  const base =
    'rounded-md text-sm font-semibold tracking-tight focus-visible:border-sidebar-ring focus-visible:ring-sidebar-ring focus-visible:outline-none focus-visible:ring-[3px]'
  return active
    ? `text-sidebar-foreground ${base}`
    : `text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent ${base}`
}

function labelClass(active: boolean): string {
  return active
    ? 'text-sidebar-foreground text-sm font-semibold tracking-tight'
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

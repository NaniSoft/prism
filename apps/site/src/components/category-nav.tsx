import Link from 'next/link'

/**
 * The category filter links for a section index.
 *
 * Links rather than a widget: the filter costs no JavaScript, survives a
 * reload, and can be shared. It renders nothing when there are fewer than two
 * categories to choose between.
 *
 * **Each option carries how many items it holds, which is the one piece of state
 * a reader can have without the page knowing anything.** Before this the row was
 * seven identical pills and the only thing a reader could learn from it was the
 * set of category names, in the order the Catalogue alphabetises them. Now a
 * reader can see that Forms and inputs holds six and Typography holds two before
 * choosing either, so a filter is a decision rather than a guess.
 *
 * **There is no marked active option, and that is a decision rather than an
 * omission.** Marking one needs to know which query parameter this request
 * carried. Reading `searchParams` on the server makes the route dynamic and fails
 * the static export this site is built for, and reading it on the client needs a
 * client island for a row of links, which is the same trade the nested sidebar
 * refused to make. A row of unmarked links whose own text says how many items are
 * behind each one is honest and needs no state; a row with one link quietly filled
 * in by a script that has not run yet is not.
 *
 * The number is in the mono face for the reason `ItemGrid` uses it: it is a
 * number about a build rather than a word about the system. It is at reduced
 * opacity inside the pill so the label stays the thing a reader reads first.
 */
export function CategoryNav({
  segment,
  categories,
  items,
}: {
  segment: string
  categories: string[]
  items: { category: string | null }[]
}) {
  if (categories.length < 2) return null

  const countFor = (category: string | null) =>
    category === null ? items.length : items.filter((item) => item.category === category).length

  const option = (href: string, label: string, count: number) => (
    <Link
      href={href}
      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
    >
      {label}
      <span className="font-mono text-[10px] opacity-70">{count}</span>
    </Link>
  )

  return (
    <nav aria-label="Filter by category" className="flex flex-wrap items-center gap-2">
      {option(`/${segment}`, 'All', countFor(null))}
      {categories.map((category) =>
        option(`/${segment}?category=${encodeURIComponent(category)}`, category, countFor(category)),
      )}
    </nav>
  )
}

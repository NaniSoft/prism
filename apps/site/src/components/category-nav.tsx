import Link from 'next/link'

/**
 * The category filter links for a section index.
 *
 * Links rather than a widget: the filter costs no JavaScript, survives a
 * reload, and can be shared. It renders nothing when there are fewer than two
 * categories to choose between.
 */
export function CategoryNav({
  segment,
  categories,
}: {
  segment: string
  categories: string[]
}) {
  if (categories.length < 2) return null

  return (
    <nav aria-label="Filter by category" className="flex flex-wrap items-center gap-2">
      <Link
        href={`/${segment}`}
        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full border px-3 py-1.5 text-sm transition-colors"
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/${segment}?category=${encodeURIComponent(category)}`}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full border px-3 py-1.5 text-sm transition-colors"
        >
          {category}
        </Link>
      ))}
    </nav>
  )
}

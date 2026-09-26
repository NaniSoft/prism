'use client'

import { useSearchParams } from 'next/navigation'

import { ItemGrid, type GridItem } from './item-grid'

/**
 * The client island that filters a section index by `?category=`.
 *
 * A server read of `searchParams` makes the route dynamic and fails the static
 * export, so the filter runs here instead. The same item metadata is inlined
 * once and shared with the server-rendered fallback, so this ships item
 * metadata, never demo code.
 */
export function CategoryGrid({ items }: { items: GridItem[] }) {
  const params = useSearchParams()
  const category = params.get('category')
  const visible = category ? items.filter((item) => item.category === category) : items
  return <ItemGrid items={visible} />
}

/**
 * Every table a Block draws is named, and the name is written in a way that can be
 * checked on all of them rather than on the one this lane can render.
 *
 * **A `<table>` is named by a caption, an `aria-label` or an `aria-labelledby`, and
 * by nothing else.** A heading that happens to sit above it does not name it: no
 * assistive technology derives a table's accessible name from a neighbouring
 * heading, so a reader listing the tables on a page found nineteen anonymous
 * entries while every element around them was named. `Table`'s own JSDoc asks for
 * one of the three, and a Block cannot compose the words itself, so each one takes
 * the name from the heading it already draws, by reference.
 *
 * **Why this file is one rendering test and one read of the source.** The rendering
 * test proves the mechanism end to end, including the case where a caller brings
 * their own caption and the case where they pass no heading at all. Nineteen Blocks
 * would need nineteen fixtures, and a fixture is a second description of a Block's
 * data that can go stale without anybody noticing, which is a worse trade than a
 * read of the file. So the other nineteen are held by the second half, which is a
 * source read and says exactly what it is: it proves the attribute is written on
 * every `<Table` element in the tree, and it cannot prove the reference resolves at
 * runtime. What resolves at runtime is covered for one Block above and reasoned for
 * the rest in the note on each table.
 *
 * **What this lane cannot hold.** jsdom has no accessibility tree, so
 * `getByRole('table', { name })` proves the role and the name are in the document and
 * not what a reader hears. It has no CSS engine either, so nothing here is a claim
 * about what any of it looks like.
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DataTable01, type DataTable01Labels } from '../src/blocks/data-table-01/data-table'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const BLOCKS = path.join(HERE, '..', 'src', 'blocks')

const LABELS: DataTable01Labels = {
  search: 'Search members',
  filters: 'Filters',
  reset: 'Clear filters',
  columns: 'Columns',
  viewColumns: 'View columns',
  selectAll: 'Select all',
  selectRow: (row) => `Select ${String(row.name)}`,
  rowActions: 'Row actions',
  sort: (column, direction) => `Sort ${column} ${direction}`,
  selectedCount: (count) => `${count} selected`,
  selectedAllMatching: (count) => `All ${count} matching selected`,
  clearedSelection: 'Selection cleared',
  dismissSelection: 'Clear selection',
  previous: 'Previous page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  empty: 'No members',
}

const COLUMNS = [{ key: 'name', header: 'Name', kind: 'slot' as const }]

describe('a Block table, end to end', () => {
  it('is named by the caller own caption when one is given', () => {
    render(
      <DataTable01
        title="Members"
        caption="Members props"
        columns={COLUMNS}
        rows={[{ name: 'Ada' }]}
        getRowId={(row) => String(row.name)}
        pageCount={1}
        labels={LABELS}
      />,
    )

    // A `<caption>` is the strongest of the three because it is the element the HTML
    // has always had for this, and it is what `apps/site`'s API table uses.
    expect(screen.getByRole('table', { name: 'Members props' })).toBeTruthy()
  })

  it('falls back to the heading when the caller brought no caption', () => {
    render(
      <DataTable01
        title="Members"
        columns={COLUMNS}
        rows={[{ name: 'Ada' }]}
        getRowId={(row) => String(row.name)}
        pageCount={1}
        labels={LABELS}
      />,
    )

    // The heading is a reference rather than a second copy of the words, so a
    // reference cannot drift from the heading and a caption cannot be read twice.
    expect(screen.getByRole('table', { name: 'Members' })).toBeTruthy()
  })

  it('writes no reference at all when the caller passed no heading either', () => {
    render(
      <DataTable01 columns={COLUMNS} rows={[{ name: 'Ada' }]} getRowId={(row) => String(row.name)} pageCount={1} labels={LABELS} />,
    )

    // The alternative was a reference to an id nothing carries, which is the same
    // defect class as the dangling `aria-controls` this batch removed elsewhere.
    expect(screen.getByRole('table').hasAttribute('aria-labelledby')).toBe(false)
  })
})

function blocksUnder(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...blocksUnder(full))
    else if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) found.push(full)
  }
  return found
}

/**
 * Every `<Table` opening tag in a source file, with the two lines after it, because
 * a caption is a CHILD of the table rather than an attribute on it.
 */
function tableTags(lines: string[]): string[] {
  const found: string[] = []
  for (const [index, line] of lines.entries()) {
    if (!/^\s*<Table[\s>]/.test(line)) continue
    found.push([line, ...lines.slice(index + 1, index + 3)].join('\n'))
  }
  return found
}

describe('every Block that draws a table', () => {
  const tables: { file: string; tag: string }[] = []
  for (const file of blocksUnder(BLOCKS)) {
    const lines = readFileSync(file, 'utf8').split('\n')
    for (const tag of tableTags(lines)) {
      tables.push({ file: path.relative(HERE, file).split(path.sep).join('/'), tag })
    }
  }

  it('names every one of them, and there are more than a handful', () => {
    // The count is asserted so that a Block which stops drawing a table, or a rename
    // that moves this file out of the tree, cannot turn the next assertion into a
    // clean run over nothing.
    expect(tables.length).toBeGreaterThan(15)

    // Either of the three `Table` asks for: a reference on the tag, or a caption
    // among its first children. `gantt-01` is the second shape and predates this
    // change; the other eighteen are the first.
    const unnamed = tables.filter(
      ({ tag }) => !tag.includes('aria-labelledby') && !tag.includes('<TableCaption'),
    )
    expect(
      unnamed.map(({ file, tag }) => `${file}: ${tag.split('\n')[0]?.trim()}`),
    ).toEqual([])
  })
})

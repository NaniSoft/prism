import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * The four cells a resource row can draw, and the four column names a caller
 * names them with.
 *
 * A closed set, and the closure is the point: the cells are the Block's, so a
 * table with a fifth column would be a table whose fifth column has nothing to
 * put in it. The names are the caller's, which is the other half of the same
 * thing. A resources index is a set of documents whose kinds differ by product,
 * and the words a reader needs beside them differ with it: "Format" and "Type"
 * and "Kind" are three names for one column and only the set's owner can say
 * which is right. So `header` is a prop and `id` is not.
 */
export type ResourceListCell = 'name' | 'kind' | 'detail' | 'href'

/**
 * One column of a resource index: which cell it draws, and the words above it.
 *
 * The `header` precedent is `DataTableColumn`'s, and the difference from it is
 * worth stating because a reader of both will notice it. `DataTableColumn` takes
 * a `cell` function, so the caller's words and the caller's markup travel
 * together and Prism renders whatever comes back. Here the cell is the Block's,
 * because the four cells above are fixed, and only the words travel. That is what
 * lets this Block keep a real table with a real row header while still letting a
 * product call its fourth column "Copy" and its second column "Type".
 *
 * `className` is layout, for alignment or a fixed width, and is the same
 * prop `DataTableColumn` carries and the same rule that applies: it changes where
 * a column sits and never what a cell looks like.
 */
export type ResourceListColumn = {
  /** Which of the four cells this column draws. */
  id: ResourceListCell
  /** The column's name, in the product's own words. */
  header: ReactNode
  /**
   * Layout classes for the column, applied to the header cell and to every cell
   * under it. Alignment and a fixed width are what this is for.
   */
  className?: string
}

/**
 * One document or download in the index: its name, what kind of thing it is, the
 * reading beside it, and where it goes.
 *
 * `name` and `kind` are required, and the reason is the table rather than the
 * reader's patience. A row with no name is a row nobody can be referred to, and a
 * row with no kind is a row that cannot be grouped, so a `groupBy: 'kind'` index
 * would silently drop it. `detail` is the reading and it is a node, which is the
 * whole reason the Block does not format a date or a size: a size, a page count,
 * a last-changed reading and a `RelativeTime` are four different things a caller
 * may put in that one cell, and the only three that agree are that they are the
 * caller's.
 */
export type ResourceList01Resource = {
  /** The resource's stable key within the set. */
  id: string
  /**
   * The resource's own name, as its authors spell it. It is the row's header,
   * so a reader who lands on one cell is told which document they are in.
   */
  name: string
  /**
   * What kind of thing this is, in the product's words: a format, a category, a
   * licence, a state. Also the group name when `groupBy` is `kind`.
   */
  kind: string
  /**
   * The reading beside the name: a size, a format, a page count, or a
   * last-changed moment.
   *
   * A node and not a string, and it is a node because the Block has no opinion
   * about it. `RelativeTime` is the Component that holds the decision about a
   * date and its locale; a size is a caller's own formatter; a page count is a
   * number. The Block draws whatever arrives inside the cell it already styles,
   * and a caller who passes a paragraph gets a paragraph in a table cell, which
   * is what they asked for.
   */
  detail?: ReactNode
  /** Where the resource goes. Its presence makes the row carry a link. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the file's name tells a reader nothing about what
   * activating it will do, which is the same defect `Download01` refuses and for
   * the same reason. The words are the caller's because they describe the
   * caller's destination.
   */
  hrefLabel?: string
}

/**
 * How a resource index is grouped, if it is.
 *
 * Two, and the second is the whole of one of the two arguments in this JSDoc: a
 * flat list and a list of groups are different readings of the same set, and a
 * flat list is the default because a group is a claim that the grouping matters
 * more than the order.
 */
export type ResourceList01GroupBy = 'none' | 'kind'

/** The classes each cell takes, before the caller's own layout classes merge in. */
const CELL: Record<ResourceListCell, string> = {
  name: 'font-medium whitespace-normal',
  kind: 'text-muted-foreground font-mono whitespace-nowrap',
  detail: 'text-muted-foreground whitespace-normal',
  href: 'text-right whitespace-nowrap',
}

/**
 * The props a ResourceList01 takes.
 *
 * Every string is a prop and the Block ships none: no document name, no kind, no
 * size, no link and not one column heading. `columns` is required for the same
 * reason `DataTable01`'s is, and a reader of both will find the same argument in
 * this JSDoc: a resource table whose columns are counted rather than named is
 * unreadable to a screen reader, and a block that invented the names would put one
 * product's vocabulary of file kinds into every consumer's page.
 */
export type ResourceList01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, and required.
   *
   * Not optional as the other Blocks' titles are, and the reason is the
   * rectangularity of a table. A table carries no `<caption>` here, because the
   * heading above it names it, which `table.tsx` states as the exception to its
   * own rule. A resource index with no heading above it is a table with no name,
   * and a table with no name is four columns a screen reader user has to be told
   * about out loud.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, in the order the reader should meet them.
   *
   * Order is the caller's because a resources index has two plausible orders and
   * the choice is a claim about the set: name first for a reader browsing, kind
   * first for a reader who knows what they want. The `name` column has to be
   * among them, and the run fails without it rather than drawing a header row one
   * cell shorter than every body row.
   */
  columns: ResourceListColumn[]
  /**
   * The resources, in the order a reader should meet them.
   *
   * Order is the caller's for the same reason, and the Block does not sort: a
   * resource index is very often already ordered by a build step that knows which
   * document is current, and a Block that sorted by name would undo that.
   */
  resources: ResourceList01Resource[]
  /**
   * Whether the rows are grouped by kind into a body each, or run as one body.
   *
   * @defaultValue 'none'
   */
  groupBy?: ResourceList01GroupBy
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The resources that share a kind, in the order each kind is first met.
 *
 * First appearance rather than sorted, for the reason the caller orders the list:
 * the order a set arrives in is a claim somebody has already made, and a Block that
 * sorted it would be a second opinion on a decision that was not its own. The key
 * is a `Map` rather than an object because a kind is any string a consumer wrote
 * and an object would coerce it.
 */
function groupsOf(resources: ResourceList01Resource[]): Map<string, ResourceList01Resource[]> {
  const groups = new Map<string, ResourceList01Resource[]>()
  for (const resource of resources) {
    const group = groups.get(resource.kind)
    if (group === undefined) groups.set(resource.kind, [resource])
    else group.push(resource)
  }
  return groups
}

/**
 * A document or download index: a name, a kind, a reading, and a link, in a real
 * table, optionally grouped into a body per kind.
 *
 * **It is `table.tsx` and not a grid of `div`s, and that is the decision the
 * whole Item rests on.** A resources index is the one section on a site where a
 * reader is comparing things rather than reading them, and comparison is what a
 * table is for. The three things a `<div>` grid gets wrong are the three a reader
 * of a file index needs: there is no `th` to navigate by, so a screen reader
 * announces cells as a bare run of values with no idea which is the size and which
 * is the kind; there is no association between a row's name and its cells, so a
 * reader who lands on one cell is not told which document they are in; and there
 * is nothing for a browser's own table commands to act on. So every header cell
 * is a `th` with `scope="col"` and every name is a `th` with `scope="row"`, and
 * the table is the one `table.tsx` draws, in the one scroll container it draws.
 *
 * **The column names are the caller's and the cells are this Block's, and the
 * split is what makes both possible.** `DataTableColumn` is the precedent for the
 * names being a prop, and this Block follows it exactly: a resource table whose
 * columns are counted rather than named is unreadable to a screen reader, and one
 * that named them itself would put a single product's vocabulary of file kinds
 * into every consumer's page. What this Block does not follow is the `cell`
 * function, because the four cells are closed: `name`, `kind`, `detail`, `href`.
 * A fifth column would be a column with nothing to put in it, so the type says
 * so rather than the type saying `string` and the render saying nothing. The
 * cost is real and worth naming: a consumer whose index has a fifth fact per
 * document, a licence, a version, a deprecation date, cannot render it here, and
 * the answer is `DataTable01`, which is a table section with the caller's own cells
 * and a toolbar, at the cost of every label on it.
 *
 * **A grouped table is a sequence of tables, and the markup says so with one body
 * per group rather than with a merged cell.** The claim is a screen reader's: a
 * reader navigates a table by its headers, and a cell that spans every row of a
 * group is a `<td rowspan="n">`, which is not a header at all. A group named in
 * one such cell is announced once, to nobody in particular, and every row beneath
 * it looks to a reader navigating by header like a row of the table above. The
 * same set rendered as a sequence of small tables has the group as each table's
 * own header, and a reader hears the group before the first row of it every
 * time. So there is a `<tbody>` per kind and the group name is a `th` in the
 * first row of that body, scoped to the row group, which is the one scope that
 * means "this names the rows below it" rather than "this names a column" or
 * "this names the row it is in".
 *
 * **It is one `<table>` and not one table per group, and the difference is worth
 * naming because it is the half of the argument that costs something.** The
 * groups are facets of one set rather than separate documents, and the columns
 * are the same in each, so a reader who has learned the columns in the first body
 * has learned them for the rest. A sequence of `<table>` elements would give each
 * group its own `<thead>` and its own announcement of the column names, which is
 * four repetitions of the same row of words, and it would put four separate scroll
 * containers on a phone where one set of four columns already needs all of the
 * width. So the sequence of tables is expressed as a sequence of bodies inside one
 * table with one header, and the honest cost is that a reader navigating by
 * column header meets the columns before the group, not after it. A consumer whose
 * groups are separate documents rather than facets of a set wants a Page, or
 * `groupBy: 'none'` with the group in the `name`.
 *
 * **The kind is a name and the detail is a node, and the Block formats neither.**
 * A kind is set in the mono face because a kind is very often a file extension or
 * a short code, which is machine notation. The detail cell is left entirely to the
 * caller, and that is the deliberate shape of it: a size, a page count, a licence
 * and a `RelativeTime` are four facts with four formats, and a Block that picked
 * one would be a Block that had chosen a locale.
 *
 * **The run fails on three ways a resources table can be wrong, and all three
 * reach a developer rather than a reader.** A `columns` array with no `name` in it
 * is a header row with a cell fewer than every body row. A `columns` array that
 * names the same cell twice is a table with two columns reading the same value. A
 * column no resource carries is a column of empty cells, which is a table a reader
 * scans twice. The link pair is a fourth, and it is `href` without `hrefLabel`:
 * a link with no words on it. Each message names the field rather than the index,
 * because a caller with forty resources needs to know which one and not which
 * number.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function ResourceList01({
  eyebrow,
  title,
  description,
  columns,
  resources,
  groupBy = 'none',
  headingLevel = 'h2',
  className,
}: ResourceList01Props) {
  // Checked before anything is drawn, so the run fails once with the name of the
  // field rather than once per resource with a malformed table on the page.
  const seen = new Set<ResourceListCell>()
  for (const column of columns) {
    if (seen.has(column.id)) {
      throw new Error(
        `ResourceList01: the column "${column.id}" is declared twice, so the table would have two columns ` +
          'reading the same value and every cell after the first would be read under the wrong name. Declare ' +
          'each cell once.',
      )
    }
    if (column.id === 'href' && resources.some((resource) => resource.href !== undefined)) {
      const unlabelled = resources.filter(
        (resource) => resource.href !== undefined && resource.hrefLabel === undefined,
      )
      if (unlabelled.length > 0) {
        throw new Error(
          `ResourceList01: ${unlabelled.length} resource(s) passed an href with no hrefLabel, including ` +
            `"${unlabelled[0]?.name}", so the table would carry a link with no words on it and a reader would ` +
            'not know what activating it does. Pass the words that say what it does, or omit the href.',
        )
      }
    }
    if (column.id === 'detail' && !resources.some((resource) => resource.detail !== undefined)) {
      throw new Error(
        'ResourceList01: the "detail" column was declared and no resource passed a detail, so the table would ' +
          'carry a column of empty cells, which is a column every reader scans twice. Pass a detail, or drop the ' +
          'column.',
      )
    }
    seen.add(column.id)
  }
  if (!seen.has('name')) {
    throw new Error(
      'ResourceList01: the columns name no "name" cell, so the header row would have a cell fewer than every ' +
        'body row and a reader who lands on one cell would not be told which document they are in. Declare the ' +
        'name column, which is also the row header for every row.',
    )
  }
  if (resources.length === 0) return null

  // The ungrouped form is one body under a group name no row is shown, so the
  // markup below is the same tree in both cases and the difference is whether the
  // group header row is drawn.
  const groups: Array<[string, ResourceList01Resource[]]> =
    groupBy === 'kind' ? [...groupsOf(resources)] : [['', resources]]

  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-12"
      />

      <div data-slot="resource-list" data-grouped={groupBy === 'kind'} className={cn('flex flex-col', className)}>
        <div className="border-border overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id} scope="col" className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {groups.map(([group, rows]) => (
              <TableBody key={group}>
                {/*
                  One body per kind, and the group named once in a header cell
                  scoped to the row group. The alternative, a cell with a `rowspan`
                  across every row of the group, is not a header: a screen reader
                  navigating by header passes straight over a data cell, so the
                  group would be announced once to nobody and every row beneath it
                  would look like a row of the group above. A `colgroup` scope is
                  wrong here for a second reason: these are the same columns in
                  every body, so no set of columns belongs to one group.
                */}
                {groupBy === 'kind' ? (
                  <TableRow>
                    <TableHead scope="rowgroup" colSpan={columns.length} className="bg-muted/50">
                      <span data-slot="resource-list-group" className="text-foreground text-sm font-semibold">
                        {group}
                      </span>
                    </TableHead>
                  </TableRow>
                ) : null}

                {rows.map((resource) => (
                  <TableRow key={resource.id} data-slot="resource-list-row">
                    {columns.map((column) =>
                      // The name is a row header, so a reader who navigates into a
                      // single cell is told which document they are looking at
                      // rather than hearing a value with nothing to attach it to.
                      column.id === 'name' ? (
                        <TableHead
                          key={column.id}
                          scope="row"
                          className={cn(CELL[column.id], column.className)}
                        >
                          {resource.name}
                        </TableHead>
                      ) : column.id === 'href' ? (
                        <TableCell
                          key={column.id}
                          className={cn(CELL[column.id], column.className)}
                        >
                          {resource.href === undefined || resource.hrefLabel === undefined ? null : (
                            <CtaLink href={resource.href} variant="ghost" size="sm">
                              {resource.hrefLabel}
                            </CtaLink>
                          )}
                        </TableCell>
                      ) : (
                        <TableCell
                          key={column.id}
                          className={cn(CELL[column.id], column.className)}
                        >
                          {column.id === 'kind' ? resource.kind : resource.detail}
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </div>
      </div>
    </Section>
  )
}

export default ResourceList01

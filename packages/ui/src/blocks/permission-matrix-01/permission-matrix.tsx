import { useId } from 'react'
import { Check, CircleHelp, X } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * One role, and everything the matrix needs to say about it beyond its name.
 *
 * `name` is a plain string and not a node, which is the one thing here that is
 * not obvious, and the reason is on `PermissionMatrixColumn.header`: the header is
 * display content and may carry a badge, a count styled as part of it, a node with
 * a link in it, and `name` is what `valueLabel` composes an accessible sentence
 * with. Those are two different jobs and one of them cannot be done with a node.
 */
export type PermissionMatrixRole = {
  /** Stable identity. Matched by `columns`, which is what puts the role in the table. */
  id: string
  /**
   * The role's own name, in the product's own vocabulary, and the string handed to
   * `valueLabel`.
   *
   * A short noun phrase, because a column of five role names is a column a reader
   * scans rather than reads, and a name that wraps is a column whose cells sit
   * against two lines of header.
   */
  name: string
  /** The line under the role's name: what the role is for, and what it inherits. */
  description?: ReactNode
  /**
   * How many people hold the role, when the product knows.
   *
   * A number and not a node because it is a count the product holds, and Prism
   * formats no number here; the sentence around it is `countLabel`.
   */
  count?: number
  /**
   * The words for the count, given the number.
   *
   * Required whenever `count` is given, because a bare figure in a heading is a
   * number a reader has to guess the unit of, which is the one thing a headline
   * figure cannot afford and the reason `metric` takes a node for its value.
   */
  countLabel?: (count: number) => string
}

/**
 * One column of the matrix, which is one role.
 *
 * The words above the column are the caller's and are a node, and the role's own
 * name beside them in the `roles` array is a string. The split is the whole design
 * and it is worth one sentence: a column heading is display content, and the
 * commonest thing a consumer puts in one is a count rendered as part of it or a
 * badge marking the role they are being walked towards, either of which is a node
 * and neither of which is a string a sentence can be composed from. So the header
 * is a node and `roles[].name` is the plain string, and the two are matched by
 * `id`.
 */
export type PermissionMatrixColumn = {
  /** The role's `id`. A column with no role, or a role with no column, is refused. */
  id: string
  /** The words above this role's column. */
  header: ReactNode
  /** Layout only: a width. */
  className?: string
}

/**
 * One permission, and one answer per role.
 *
 * `values` is positional and its length must equal the number of roles, and the
 * reason a mismatch is a thrown diagnostic rather than a short row is the Block's
 * own JSDoc: a permission matrix is the surface where a mistake is most expensive,
 * and a role quietly given no answer is a role a reader believes is refused.
 */
export type PermissionMatrixPermission = {
  /** Stable identity, used for the row's key. */
  id: string
  /**
   * The permission's own name, and the row header the table announces.
   *
   * A short noun phrase in the imperative a product's own settings page uses. This
   * is the cell a reader navigates to, and the one they read first, because it is
   * the question they arrived with.
   */
  label: string
  /**
   * The line under the permission's name: what it reaches, what turning it on
   * costs, why it is conditional for one role.
   *
   * A node because the conditional cell in this matrix almost always carries a
   * reference, and a caller who has to flatten theirs to a string loses the link
   * that explains the condition.
   */
  description?: ReactNode
  /**
   * One answer per role, in the order the columns were given.
   *
   * The union is the whole design of the cell and the Block's JSDoc argues for its
   * third member at length: `true` is granted, `false` is refused, and a string is
   * anything else, which is a category of its own rather than a spelling of the
   * first two.
   */
  values: readonly (boolean | string)[]
}

/**
 * A band of permissions under one name.
 *
 * Groups are the caller's because grouping is a claim about how the permissions
 * relate, which is a fact about the product's own model and not about the matrix.
 * Most matrices are one group, and that is a legitimate answer: pass one group with
 * an empty `title` and it is the only row of headers the table carries.
 */
export type PermissionMatrixGroup = {
  /** The group's own name, as the caller writes it. */
  title: string
  /** The permissions in this group, in the order a reader should meet them. */
  permissions: readonly PermissionMatrixPermission[]
}

/**
 * The three marks and the words they answer with.
 *
 * All three required, and the reason is the one `PricingCompare01Labels` is built
 * on: three marks in a matrix with no key is a matrix nobody can read. A check and
 * a cross and a question mark are three shapes a reader learns once and applies
 * forty times, and a matrix is the one place on a page where a reader is expected
 * to apply a shape forty times. Without the key the third shape in particular is
 * unreadable, because a question mark is a thing that went wrong to most readers
 * and a condition to a few, and the reader has no way to find out which this is.
 */
export type PermissionMatrixLegend = {
  /** Announced beside the check in a granted cell. */
  allowed: string
  /** Announced beside the cross in a refused cell. */
  denied: string
  /** Announced beside the question mark in a cell that depends on something else. */
  conditional: string
}

/**
 * The props a PermissionMatrix01 takes.
 *
 * Every string is a prop and the Block ships none. There is no role, no
 * permission, no cell value, no group name, no count sentence and not one of the
 * three words a cell answers with. A permission matrix is the densest arrangement
 * of claims a product makes about itself, and it is the arrangement where one
 * hardcoded word is hardest to notice, because the reader is looking at forty cells
 * and reading none of them.
 */
export type PermissionMatrix01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The section title. Required, because a matrix with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, one per role, in the order a reader should meet them.
   *
   * Required, and the `id` of each is matched against `roles`. The two arrays exist
   * rather than one because of the split documented on `PermissionMatrixColumn`: a
   * heading is a node and a role's name is a string, and a matrix that had to
   * derive one from the other would force every consumer to flatten a heading into
   * a string or to build a sentence out of a badge.
   */
  columns: readonly PermissionMatrixColumn[]
  /** The roles the columns name, keyed by the same ids. */
  roles: readonly PermissionMatrixRole[]
  /**
   * The permissions, grouped. Group order is the caller's, and so is the order
   * inside each group, for the same reason: both are claims about what matters
   * first.
   */
  groups: readonly PermissionMatrixGroup[]
  /**
   * The words one cell announces, given whether it is granted, the role it belongs
   * to and the permission it is about.
   *
   * Required, and a function of three arguments because the honest answer is a
   * sentence rather than a word in almost every case that is not a straight yes or
   * no. "Publish without a review" is the answer; "Own billing" is the answer, in
   * the reader's own words, in the reader's own language, with the reader's own
   * plural rules. Prism will not compose it, and the alternative was a record of
   * three English strings, which is exactly the defect the copy gate was written to
   * end.
   */
  valueLabel: (allowed: boolean, role: string, permission: string) => string
  /**
   * The key for the three marks.
   *
   * Required, because three marks with no key is a matrix nobody can read, and
   * because the third mark is the one that most needs it: a question mark reads as
   * a fault to most readers and as a condition to the few who have met one.
   */
  legend: PermissionMatrixLegend
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * One cell: the mark, and the words, and a string where the answer is neither.
 *
 * A component in the module and not a second Item, because it has no public
 * surface and nothing to document for a consumer. It exists so the two boolean
 * arms are written once, and they are written once because the span wrapping the
 * mark and the visually hidden words is the part that is easy to get subtly wrong
 * three times in a row.
 */
function MatrixCell({
  value,
  role,
  permission,
  valueLabel,
  conditionalLabel,
}: {
  value: boolean | string
  role: string
  permission: string
  valueLabel: (allowed: boolean, role: string, permission: string) => string
  conditionalLabel: string
}) {
  if (typeof value === 'boolean') {
    return value ? (
      <span data-slot="permission-matrix-answer" className="text-success inline-flex items-center gap-1.5">
        <Check aria-hidden className="size-4 shrink-0" />
        <span className="sr-only">{valueLabel(true, role, permission)}</span>
      </span>
    ) : (
      <span
        data-slot="permission-matrix-answer"
        className="text-muted-foreground inline-flex items-center gap-1.5"
      >
        <X aria-hidden className="size-4 shrink-0" />
        <span className="sr-only">{valueLabel(false, role, permission)}</span>
      </span>
    )
  }

  /*
    The third answer, and the sentence beside the mark is `legend.conditional`
    rather than `valueLabel`, which is a real distinction rather than a shortcut.
    `valueLabel` composes the answer for a cell that is granted or refused; this
    cell's answer is the string the caller wrote, and what the mark needs beside it
    is the name of the category, so that a reader knows the sentence is a condition
    to look up rather than a limit they have hit.
  */
  return (
    <span
      data-slot="permission-matrix-conditional"
      className="text-muted-foreground inline-flex items-center gap-1.5"
    >
      <CircleHelp aria-hidden className="size-4 shrink-0" />
      <span className="text-sm text-pretty">{value}</span>
      <span className="sr-only">{conditionalLabel}</span>
    </span>
  )
}

/**
 * Roles against capabilities: the roles across the top, the permissions down the
 * side, and one cell per intersection saying what that role does with that
 * permission.
 *
 * **It is a real `<table>`, and the rejected alternative is a grid of `div`s that
 * looks the same.** A permission matrix is the one table on a page where a mistake
 * is the most expensive kind of mistake a page can have. A reader who is not sure
 * whether the Billing role can publish will try to do it, and the failure arrives
 * later as somebody else's problem, and the matrix is the document that was
 * supposed to prevent it. So the structure has to be the platform's: a reader using
 * a screen reader asks the table for a column and hears the role's name, then
 * moves down the cells and hears each answer against that name, and asks for a row
 * and hears the permission and then its answers. A grid of `div`s has no header
 * cells to ask for, so the same reader receives forty cells of unlabelled marks
 * and has to hold the column in their head while reading down it, which is the
 * single task a matrix exists to remove, and on this particular table it is the
 * task whose failure is most expensive. The cost of the table is the one every
 * real table carries: `Table` wraps the whole thing in a horizontally scrollable
 * container, because five roles do not fit a phone, and a matrix that reflowed into
 * a stack would no longer be a matrix. The scroll is the price, and the alternative
 * is not a narrower matrix, it is a div grid.
 *
 * **`values` is `boolean | string`, and the string is a third answer rather than a
 * spelling of the other two.** `true` is granted and `false` is refused, and those
 * two are marks the reader learns once. The third case is a permission that depends
 * on something the reader has to go and look up: it is granted to a role that
 * holds a particular licence, limited for a role in a particular plan, or granted
 * only where a second role is also held. That answer is neither a yes nor a no, and
 * a matrix that can only say yes or no forces a product to lie in one of the two
 * directions. It will draw the conditional cell as granted, because the role can
 * do the thing; and the reader goes away believing their role can publish, and
 * finds out at the moment they press the button, on a surface with no explanation.
 * Or it will draw it as refused, which is the worse of the two because it is
 * untrue in the direction that looks like a restriction rather than a gap, and a
 * reader who has been told twice that their role cannot do something stops asking
 * anyone. So the union has a third member, the mark is a question rather than a
 * tick or a cross, and the words are the caller's because only the caller knows
 * what the condition is. The cost is stated rather than hidden: a conditional cell
 * is wider than the two marks, so a matrix with many of them scrolls further, and
 * a caller who finds that painful has an obvious and wrong answer available, which
 * is to call the condition a limit and print a number.
 *
 * **A `values` array that does not match the columns throws.** Four roles and
 * three values renders perfectly: the markup is valid, the header row is correct,
 * the styling is right, and a column is simply not there. A silent truncation in a
 * permission matrix is a claim about a role nobody made, on the one table where a
 * reader will act on the claim, and nothing in the rendered result says a value is
 * missing. So the Block refuses the props. The cost is a render that throws in
 * development rather than a matrix that lies in production, and the alternative
 * was considered and refused: a pad of empty cells would turn a caller's mistake
 * into a document in which a role has no opinion about a permission, which is
 * indistinguishable from a role that has been refused one.
 *
 * **The group is a row group, and a group's name is a table header rather than a
 * heading.** Each group is its own `<tbody>` and its name is a `th` with
 * `scope="rowgroup"`, which is what HTML offers for a header that names the rows
 * below it, so a screen reader announces the group when the reader enters it
 * rather than repeating it over every column. It is deliberately not in the page
 * outline: a group name is a band of rows and not a section of the page, and seven
 * group names in the outline would be seven entries for a reader navigating by
 * heading who expected sections.
 *
 * **A role's name is a heading, at `childLevel(headingLevel)`.** The role is the
 * column's title, a reader who navigates by heading wants to reach the role rather
 * than the permissions under it, and a matrix embedded one level deeper than it was
 * written for has to carry its role names with it. The count, when there is one, is
 * inside the same element, because a role and the number of people holding it are
 * one thing a reader takes together, and a count in a separate column would be a
 * column of numbers a reader has to match back to a name.
 *
 * **The legend is drawn under the table and required, because three marks with no
 * key is a matrix nobody can read.** This is the cheapest thing on the Block and
 * the one whose absence costs the most: a reader who has met a check, a cross and a
 * question mark in one matrix has learned three things and will apply them to the
 * next forty cells, and a reader who has met two of them has learned a binary and
 * will misread the third. The legend is a `tfoot` so it is inside the table and
 * travels with it in the accessibility tree, rather than a row of prose below that
 * a reader navigating the table never meets.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * three marks are drawn as vectors, so a matrix costs no JavaScript.
 */
export function PermissionMatrix01({
  eyebrow,
  title,
  description,
  columns,
  roles,
  groups,
  valueLabel,
  legend,
  headingLevel = 'h2',
  className,
}: PermissionMatrix01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  if (roles.length === 0) {
    throw new Error(
      'PermissionMatrix01: roles is empty, so the matrix has no columns and the table would render a header ' +
        'row and nothing else. Pass the roles a reader is choosing between.',
    )
  }
  if (columns.length === 0) {
    throw new Error(
      'PermissionMatrix01: columns is empty, so the matrix has no headings and every cell would be a mark with ' +
        'nothing to attach it to. Name one column per role.',
    )
  }
  if (groups.length === 0) {
    throw new Error(
      'PermissionMatrix01: groups is empty, so the matrix has no rows. Pass one group, even when its title is ' +
        'empty, rather than leaving the reader with a row of role names and no permissions beside them.',
    )
  }

  for (const column of columns) {
    if (!roles.some((role) => role.id === column.id)) {
      throw new Error(
        `PermissionMatrix01: a column names the role ${JSON.stringify(column.id)} and no role carries that id, ` +
          'so the heading would sit over a column no answers belong to. Give the column the id of a role, or ' +
          'drop it.',
      )
    }
  }
  for (const role of roles) {
    if (!columns.some((column) => column.id === role.id)) {
      throw new Error(
        `PermissionMatrix01: the role ${JSON.stringify(role.name)} has no column, so the table would hold a ` +
          'row of answers for a role no reader can name. Give the role a column whose id is its own.',
      )
    }
    if (role.count !== undefined && role.countLabel === undefined) {
      throw new Error(
        `PermissionMatrix01: the role ${JSON.stringify(role.name)} declares a count and no countLabel, so a ` +
          'bare figure would sit in a column heading with nothing saying what it counts. Pass the function.',
      )
    }
  }
  for (const group of groups) {
    for (const permission of group.permissions) {
      if (permission.values.length !== columns.length) {
        throw new Error(
          `PermissionMatrix01: the permission ${JSON.stringify(permission.label)} has ` +
            `${permission.values.length} value(s) and there are ${columns.length} column(s). A short row ` +
            'renders a role with no answer, which on this table is a claim nobody made, so it is refused ' +
            'rather than padded.',
        )
      }
    }
  }

  // A role is a column, and a column is a title inside the section that
  // introduces the set, so five roles under one `h2` are five `h3`s.
  const RoleHeading = childLevel(headingLevel)
  const width = columns.length + 1
  // Read once rather than searched per cell, because `valueLabel` is called for
  // every cell and a linear search inside that is a cost the reader pays on the
  // render. The `id` is the join, and the loop above has already refused a column
  // or a role the other side does not carry.
  const byId = new Map(roles.map((role) => [role.id, role]))
  const nameOf = (id: string): string => byId.get(id)?.name ?? id

  return (
    <Section className={className} data-slot="permission-matrix">
      <SectionHeading
        as={headingLevel}
        id={headingId}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-12"
      />

      <div data-slot="permission-matrix-table" className="flex flex-col gap-4">
        <div className="border-border overflow-hidden rounded-xl border">

          {/*
           * The table takes its name from the heading above it rather than from a
           * second copy of the same words. A `<table>` is named by a caption, an
           * `aria-label` or an `aria-labelledby`, and none of the three is inferred
           * from a heading that happens to be nearby, so a reader listing the tables
           * on a page found this one anonymous while every other element around it was
           * named. A reference rather than a caption because a caption is drawn, and a
           * visible line repeating the heading is noise; a reference because `title`
           * is the caller own words and a Block may not compose a second set. See
           * `Table`, which asks for exactly one of the three.
           */}
          <Table aria-labelledby={headingId}>
            <TableHeader>
              <TableRow>
                {/*
                  The corner. Empty on purpose, for the reason
                  `pricing-compare-01` leaves its own: the first column holds row
                  headers, so a word here would name a column of permission names,
                  which is not what the column is.
                */}
                <TableHead className="w-56 align-bottom" />
                    {columns.map((column) => {
                      const role = byId.get(column.id)
                      return (
                        <TableHead
                          key={column.id}
                          scope="col"
                          data-role={column.id}
                          className={cn('w-44 whitespace-normal align-bottom', column.className)}
                        >
                          <RoleHeading className="flex flex-col items-start gap-1 text-base font-semibold tracking-tight text-balance">
                            <span data-slot="permission-matrix-role-name">{column.header}</span>
                            {role?.count === undefined || role.countLabel === undefined ? null : (
                              <span
                                data-slot="permission-matrix-role-count"
                                className="text-muted-foreground text-xs font-normal tabular-nums"
                              >
                                {role.countLabel(role.count)}
                              </span>
                            )}
                          </RoleHeading>
                          {role?.description === undefined ? null : (
                            <span
                              data-slot="permission-matrix-role-description"
                              className="text-muted-foreground mt-1 block text-sm font-normal text-pretty"
                            >
                              {role.description}
                            </span>
                          )}
                        </TableHead>
                      )
                    })}
              </TableRow>
            </TableHeader>

            {groups.map((group, groupIndex) => (
              // Positional, because a group title is display content and a caller
              // may legitimately split a model into two bands under one name.
              <TableBody key={groupIndex} data-slot="permission-matrix-group">
                <TableRow>
                  <TableHead scope="rowgroup" colSpan={width} className="bg-muted/50 whitespace-normal">
                    <span className="text-sm font-semibold">{group.title}</span>
                  </TableHead>
                </TableRow>
                {group.permissions.map((permission) => (
                  <TableRow
                    key={permission.id}
                    data-slot="permission-matrix-permission"
                    data-permission={permission.id}
                  >
                    <TableHead
                      scope="row"
                      className="text-foreground h-auto w-56 whitespace-normal font-medium"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{permission.label}</span>
                        {permission.description === undefined ? null : (
                          <span className="text-muted-foreground text-xs font-normal text-pretty">
                            {permission.description}
                          </span>
                        )}
                      </span>
                    </TableHead>
                    {columns.map((column, index) => (
                      <TableCell key={column.id} data-role={column.id}>
                        <MatrixCell
                          value={permission.values[index] ?? false}
                          role={nameOf(column.id)}
                          permission={permission.label}
                          valueLabel={valueLabel}
                          conditionalLabel={legend.conditional}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            ))}

            {/*
              The key, inside the table rather than under it, for the reason the
              Block JSDoc gives: a row of prose below the table is a row a reader
              navigating the table never meets, and the third mark is the one that
              most needs a key.
            */}
            <TableFooter>
              <TableRow>
                <TableCell colSpan={width} className="bg-muted/50 whitespace-normal">
                  <span className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <span className="text-success inline-flex items-center gap-1.5">
                      <Check aria-hidden className="size-4 shrink-0" />
                      <span className="text-foreground text-sm">{legend.allowed}</span>
                    </span>
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <X aria-hidden className="size-4 shrink-0" />
                      <span className="text-foreground text-sm">{legend.denied}</span>
                    </span>
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <CircleHelp aria-hidden className="size-4 shrink-0" />
                      <span className="text-foreground text-sm">{legend.conditional}</span>
                    </span>
                  </span>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </Section>
  )
}

export default PermissionMatrix01

import { useId, type ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { CtaLink } from '../../components/ui/cta-link'
import { Progress } from '../../components/ui/progress'
import { RelativeTime } from '../../components/ui/relative-time'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tag } from '../../components/ui/tag-group'
import { cn } from '../../lib/utils'

/**
 * The tone a project's state is drawn in, from the semantic contract and no other.
 *
 * This Block takes the state as the caller's own string rather than as a closed
 * union, and that is the one difference from `Project01` and it is deliberate: a
 * project index holds projects drawn from more than one source in most products,
 * and a tracker with its own state names will not match a five-value union. So
 * there is no tone to derive from here, and the table below is the caller's to
 * extend, which is a cost and not a convenience: a caller whose states are not
 * the five below has to map them, and a caller whose states *are* those five gets
 * the mapping for free by spelling the same words.
 *
 * The alternative, narrowing the state to the same five positions `Project01`
 * uses, would have been a Block that decided what a project may be in, and a
 * project index is exactly the surface where that decision does the most damage:
 * a row that renders an unrecognised state as neutral is a row that looks
 * deliberate and says nothing.
 */
const DEFAULT_TONE: Record<string, StatusTone> = {
  planning: 'info',
  active: 'success',
  blocked: 'warning',
  complete: 'success',
  archived: 'neutral',
}

/**
 * The tone a state is drawn in, falling back to the supporting ink.
 *
 * `neutral` for a state this table does not name, and the reason is that an
 * unrecognised state is not an emergency: it is a vocabulary this Block has not
 * been taught, and drawing it in the alarm colour would turn a naming mismatch
 * into a page of red rows. The fallback is visible in the markup as the state
 * value on the row, so a consumer reading their own page can see which states
 * need mapping rather than guessing.
 */
function toneOf(state: string): StatusTone {
  return DEFAULT_TONE[state] ?? 'neutral'
}

/**
 * The cells a project row can draw, and the four column names a caller names
 * them with in the table form.
 *
 * A closed set, and the closure is the point: the cells are the Block's, so a
 * table with a ninth column would be a table whose ninth column has nothing to
 * put in it. The names are the caller's, which is the other half of the same
 * thing. A projects index is a set of records whose vocabulary differs by
 * product, and "State", "Status" and "Stage" are three names for one column and
 * only the set's owner can say which is right. So `header` is a prop and `id` is
 * not.
 */
export type ProjectListCell =
  | 'name'
  | 'summary'
  | 'state'
  | 'owner'
  | 'progress'
  | 'updated'
  | 'tags'
  | 'href'

/**
 * One column of a projects table: which cell it draws, and the words above it.
 *
 * The `header` precedent is `ResourceListColumn`'s and the difference from
 * `DataTableColumn` is the same one that file states: `DataTableColumn` takes a
 * `cell` function because it has no idea what a row contains, and this Block knows
 * the eight cells a project has, so a caller that could write a `cell` function
 * could draw this table without this Block. What is left is the part that is
 * genuinely the caller's: the name of the column, its order, and where it sits.
 */
export type ProjectListColumn = {
  /** Which of the eight cells this column draws. */
  id: ProjectListCell
  /** The column's name, in the product's own words. */
  header: ReactNode
  /**
   * Layout classes for the column, applied to the header cell and to every cell
   * under it. Alignment and a fixed width are what this is for.
   */
  className?: string
}

/**
 * One project in a list: the same fields `Project01` takes, in the form a row can
 * carry.
 *
 * The field names are the same and the shapes are the same, and that is the whole
 * point of this Block existing beside that one. A consumer with a project model
 * has one model, so the same `Project` type renders a detail header and a list row
 * and the two Blocks cannot drift apart, because there is nothing to drift: a
 * caller maps their project onto the fields once and both Blocks read the same
 * names. The cost is stated rather than hidden: a list row has nowhere to put a
 * stage list, a span of dates and an action slot, so the fields a row drops are
 * dropped by this type rather than silently ignored, and a caller who needs a
 * project's stages in a list is looking for `Project01` for that project.
 */
export type ProjectListProject = {
  /** A stable key for the project, within this list. */
  id: string
  /** The project's own name. The anchor of the row and of its cell in a table. */
  name: string
  /** One sentence about what this project is. A node, and a node only. */
  summary?: ReactNode
  /**
   * Where the project stands, in the caller's own vocabulary.
   *
   * Required on every project, and a string rather than a union of five positions
   * for the reason the tone table above states: a projects index gathers from more
   * than one source in most products, and a Block that narrowed the state would be
   * a Block that decided what a project may be in.
   */
  state: string
  /**
   * The words for that state.
   *
   * Optional in the type and required in practice, and the run throws without it:
   * every project carries a state, so every project owes words for it, and a dot
   * with no sentence beside it is the one thing the copy gate and `Status` both
   * exist to prevent. The `?` is here so a caller arriving from JavaScript gets
   * this diagnostic rather than a crash inside a Component.
   */
  stateLabel?: string
  /** Who owns it, with the portrait where there is one. */
  owner?: {
    /** The person's own name. */
    name: string
    /** The portrait, with the name the initials come from. */
    avatar?: {
      /** The photograph. Omit it, or pass a URL that fails, for the initials. */
      src?: string
      /** The person's name, which is the initials' source. */
      name: string
    }
  }
  /**
   * How far along the project is, on `Progress`'s own scale of 0 to 100.
   *
   * Omit it for a project that is not measured, and the row draws no bar rather
   * than a bar at zero, because a bar at zero is a claim that nothing has
   * happened and a planning project is a thing that has not started.
   */
  progress?: number
  /**
   * The sentence the bar announces, given the value and the project's name.
   *
   * Optional in the type and required in practice whenever any project carries a
   * `progress`, and the run throws without it. The name is in the argument because
   * a list of forty projects is a page where a reader has to be told which bar is
   * which, and a bar at forty per cent means whatever the reader assumes.
   */
  progressLabel?: (value: number, name: string) => string
  /** When the project last moved, in whichever of the three forms the caller has. */
  updated?: number | string
  /**
   * The sentence for that moment, given the moment.
   *
   * Optional in the type and required in practice whenever any project carries an
   * `updated`, and the run throws without it. A moment handed to `RelativeTime`
   * with nothing beside it is a date in the reader's own locale and no claim about
   * how old it is, which is the honest reading and is not the one a list of
   * projects is for.
   */
  updatedLabel?: (value: number | string) => string
  /** The caller's own chips for this project, in the order they should be met. */
  tags?: { id: string; label: ReactNode }[]
  /** Where the row goes. Rendered as a native anchor, so the destination is real. */
  href?: string
  /**
   * The words on that link, and required whenever `href` is set.
   *
   * A link whose only words are a project's name tells a reader nothing about what
   * activating it will do. The words are the caller's because the destination is
   * theirs, and the trailing position rather than the whole row is deliberate: a
   * row whose accessible name is its name, its summary, its state and its date is
   * a name a reader cannot hear the end of.
   */
  hrefLabel?: string
}

/**
 * The classes each cell takes, before the caller's own layout classes merge in.
 *
 * The two prose cells are told to wrap and the rest keep the default, because
 * `table.tsx` sets every cell to `whitespace-nowrap` so a column of numbers lines
 * up, and a summary and a set of chips are not numbers. A table that scrolls a
 * sentence sideways to keep it on one line is a table nobody reads a whole row of.
 */
const CELL: Record<ProjectListCell, string> = {
  name: 'font-medium whitespace-normal',
  summary: 'text-muted-foreground whitespace-normal',
  state: 'whitespace-nowrap',
  owner: 'whitespace-nowrap',
  progress: 'min-w-40',
  updated: 'text-muted-foreground whitespace-nowrap text-sm',
  tags: 'whitespace-normal',
  href: 'text-right whitespace-nowrap',
}

/**
 * The props a ProjectList01 takes, and the one conditional pair among them.
 *
 * Every string and every number is a prop and the Block ships none: no project, no
 * state, no owner, no progress figure, no date, no chip and not one column heading.
 * A projects index that invented a set of them would be publishing somebody
 * else's portfolio, and the absence of the empty sentence is the sharpest version
 * of the rule: "no projects yet" is true of a new product and false of a filter
 * that matched nothing, so `empty` is required.
 */
export type ProjectList01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Required, because a list with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The projects, in the order a reader should meet them.
   *
   * Order is the caller's, and this Block does not sort: a projects index is very
   * often already ordered by a query that knows which project is live, which the
   * team wants at the top and which the reader is waiting for, and a Block that
   * sorted by name or by date would undo that decision without saying so.
   */
  projects: ProjectListProject[]
  /**
   * The controls that act on the whole list: a search field, a sort, a create
   * button, a `DataToolbar` the caller composed.
   *
   * A slot rather than a set of named controls, because which controls a list has
   * is the caller's fact, and because a slot keeps this Block a server Component:
   * a caller whose toolbar needs state renders a client component into it, and the
   * client boundary is theirs rather than this file's.
   */
  toolbar?: ReactNode
  /**
   * The filter column, beside the list rather than above it.
   *
   * A `FilterPanel` is what this slot is for, and a panel is a column, so it is
   * drawn in a narrow aside at the leading edge with the list beside it. A caller
   * whose filters are a popover trigger or a set of chips passes them in
   * `toolbar` and leaves this alone; a Block that drew the filters itself would be
   * deciding that a projects index is faceted, which most are not.
   */
  filters?: ReactNode
  /**
   * The band's slot under the list: pagination, a count, a load-more control.
   *
   * Under the list and not inside it, because it is the one part of the surface
   * that has to stay put while a reader works down a long list.
   */
  footer?: ReactNode
  /**
   * What the Block renders in place of the rows when there are none.
   *
   * Required, and a slot rather than a string, because the two empty states a
   * projects index has are different claims: a product with no projects yet and a
   * filter that matched nothing are opposite sentences, and a Block that wrote
   * either one would be wrong in half the products that installed it.
   */
  empty: ReactNode
  /**
   * Whether the list is a stack of rows or a real table.
   *
   * `rows` is for a short list where the summary is the point, and it is the
   * default because a list a reader scans top to bottom does not need column
   * semantics to be read. `table` is for a long one, where the reader is comparing
   * a value in one row against the same value in another, which is the moment a
   * row stops being a list and becomes a record set: it is the moment a screen
   * reader needs a column header to know which of six values it has landed on, and
   * it is the moment a caller starts wanting to sort.
   */
  variant?: 'rows' | 'table'
  /**
   * The caller's own columns, in the order the reader should meet them.
   *
   * Required in the table form and refused in the row form, and the union below is
   * what says so. The `name` column has to be among them and the run fails without
   * it, because it is the row header: a table whose rows have no row header is a
   * table where a reader who lands on one cell is not told which project they are
   * in. A column no project carries is a column of empty cells, which is a column
   * every reader scans twice, and the run fails on that too.
   */
  columns?: ProjectListColumn[]
  /**
   * Heading level for the section title. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Block. */
  className?: string
} & (
  | {
      /** A table declares its columns, because a header row is read out loud. */
      variant: 'table'
      columns: ProjectListColumn[]
    }
  | {
      /** A row list has no header row, so there is nothing to declare. */
      variant?: 'rows'
      columns?: never
    }
)

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. It is the same rule `AvatarGroup`, `Team01` and `Project01` apply
 * and it is repeated here for the reason `Team01` states in full: that helper is
 * private to its module and exporting it would make a private derivation part of
 * the published surface of a Component in order to save six lines in a Block. The
 * cost of the repetition is named rather than hidden, because four modules now
 * carry this rule and a change to it is a change in four.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * The cell one column draws for one project, in both forms of this Block.
 *
 * One function rather than one per variant, and that is what makes the two forms
 * the same Block rather than two Blocks that happen to share a heading. The rows
 * form draws every cell it has room for; the table form draws the ones the caller
 * declared; and the cell itself is written once, so a caller's state words, their
 * progress sentence and their moment reading are the same text in either form.
 */
function cellOf(id: ProjectListCell, project: ProjectListProject): ReactNode {
  switch (id) {
    case 'name':
      return project.name
    case 'summary':
      return project.summary ?? null
    case 'state':
      // The guard above the return has already refused a project with no words for
      // its state, so the second half of this fallback cannot be reached. It is
      // spelled rather than left to the type because `stateLabel` is optional in the
      // type on purpose: a caller arriving from JavaScript should get the diagnostic
      // from the guard, which names the project, rather than a bare machine value
      // drawn where the words belong.
      return <Status size="sm" tone={toneOf(project.state)} label={project.stateLabel ?? project.state} />
    case 'owner':
      if (project.owner === undefined) return null
      return (
        <span data-slot="project-list-owner" className="flex min-w-0 items-center gap-2">
          {project.owner.avatar === undefined ? null : (
            <Avatar className="size-6">
              {project.owner.avatar.src === undefined ? null : (
                <AvatarImage src={project.owner.avatar.src} alt="" />
              )}
              <AvatarFallback className="text-mono">
                {initialsOf(project.owner.avatar.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="truncate text-sm">{project.owner.name}</span>
        </span>
      )
    case 'progress':
      if (project.progress === undefined) return null
      return (
        <Progress
          value={project.progress}
          valueText={project.progressLabel?.(project.progress, project.name)}
        />
      )
    case 'updated':
      if (project.updated === undefined) return null
      return <RelativeTime date={project.updated} relative={project.updatedLabel?.(project.updated)} />
    case 'tags':
      if (project.tags === undefined) return null
      return (
        <span data-slot="project-list-tags" className="flex flex-wrap items-center gap-1.5">
          {project.tags.map((tag) => (
            <Tag key={tag.id} label={tag.label} />
          ))}
        </span>
      )
    case 'href':
      if (project.href === undefined || project.hrefLabel === undefined) return null
      return (
        <CtaLink href={project.href} size="sm" variant="ghost">
          {project.hrefLabel}
        </CtaLink>
      )
  }
}

/**
 * Whether any project in the set carries the fact a column draws.
 *
 * A declared column no project fills is a column of empty cells, and a column of
 * empty cells is a column every reader scans twice before deciding it is nothing.
 * It is invisible in review, because the header row looks finished and the body
 * rows look uniform, and it is the reason the run throws rather than rendering the
 * gap: a caller who declared a column meant to see something in it.
 *
 * A switch over the field rather than a call to `cellOf` and a null check, because
 * the question here is what the data holds and the other function's question is
 * what to draw, and asking one to answer the other builds a React element per
 * project per column to throw it away.
 */
function carries(id: ProjectListCell, projects: readonly ProjectListProject[]): boolean {
  switch (id) {
    case 'name':
    case 'state':
      // Both are on every project, so a list with a row in it always has them.
      return projects.length > 0
    case 'summary':
      return projects.some((project) => project.summary !== undefined)
    case 'owner':
      return projects.some((project) => project.owner !== undefined)
    case 'progress':
      return projects.some((project) => project.progress !== undefined)
    case 'updated':
      return projects.some((project) => project.updated !== undefined)
    case 'tags':
      return projects.some((project) => project.tags !== undefined)
    case 'href':
      return projects.some((project) => project.href !== undefined)
  }
}

/**
 * A list of projects, as rows or as a real table, with a toolbar, a filter column
 * and an empty state the caller writes.
 *
 * **This is the many-projects counterpart to `Project01`, and the two take the
 * same field names on purpose.** A consumer with a project model has one model: a
 * caller maps their project onto `name`, `state`, `owner`, `progress`, `updated`
 * and `tags` once, and that mapping feeds a detail header and a list row without
 * either Block knowing the other exists. The alternative, a list Block with its own
 * field names, gives every consumer two models to keep in step, and the two drift
 * within a release rather than across one, which is the failure mode this
 * repository is organised against. The cost is stated rather than hidden: a row has
 * nowhere to put a stage list, a span of dates and an action slot, so those fields
 * are absent from the row type instead of being quietly ignored.
 *
 * **The two variants answer different questions, and `rows` is the one that is
 * scanned while `table` is the one that is compared.** A short list where the
 * summary is the point wants the rows form: each row is one project read top to
 * bottom, its name and its sentence and its state, with no header row to announce
 * and no columns to align, and the reader's job is to find the one they want. A
 * long list wants the table form, and the moment that changes is the moment a
 * reader starts comparing a value in one row against the same value in another:
 * that is when the content is records with columns rather than a list of things,
 * which is the exact boundary `ListPanel` draws in its own documentation. The
 * three things a `<div>` grid gets wrong are the three a reader of forty projects
 * needs: there is no `th` to navigate by, so a screen reader announces a bare run
 * of values with no idea which is the state and which is the owner; there is no
 * row header, so a reader who lands on one cell is not told which project they are
 * in; and there is nothing for a browser's own table commands to act on.
 *
 * **The filter column is a slot, and it is a slot rather than a set of named
 * controls because a projects index is not always faceted.** `FilterPanel` is the
 * Component it is for, and the panel is a column, so the slot is drawn in a narrow
 * aside at the leading edge with the list beside it. A caller whose filters are a
 * popover trigger or a row of chips passes them in `toolbar` instead, and a Block
 * that drew its own filters would be deciding that every projects index is a
 * faceted browser, which most of them are not.
 *
 * **The order is the caller's and this Block does not sort.** The same argument
 * `ResourceList01` gives and the same one `Leaderboard01` gives harder: a projects
 * index is very often already ordered by a query that knows which project is live,
 * and a Block that sorted by name or by date would undo a decision it cannot see.
 * A `sort` prop would be a second derivation the caller then has to keep in step
 * with their own data, and two orderings of one list that disagree is a list whose
 * order nobody can fix without changing code in two places.
 *
 * **The run fails on five ways a projects table can be wrong, and every one of
 * them reaches a developer rather than a reader.** A `columns` array with no
 * `name` in it is a header row with a cell fewer than every body row and a table
 * whose rows have no identity. A `columns` array that names the same cell twice is
 * a table with two columns reading the same value. A column no project carries is
 * a column of empty cells. A project with a state and no words for it is a dot
 * with nothing beside it. And a project with a progress and no sentence for it, or
 * a moment and no sentence for it, or a link and no words on it, is a figure
 * announcing a bare number, a date with no claim about how old it is, and a link
 * announced by its address. Each message names the project rather than the index,
 * because a caller with forty projects needs to know which one.
 *
 * It is a server Component: no hook, no state, no client code of its own and no
 * router. The only client code it can pull in is one `Progress` island per project
 * that asks for a fill, and the portrait is `Avatar`, whose only client work is
 * measuring whether an image has loaded.
 */
export function ProjectList01({
  eyebrow,
  title,
  description,
  projects,
  toolbar,
  filters,
  footer,
  empty,
  variant = 'rows',
  columns,
  headingLevel = 'h2',
  className,
}: ProjectList01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  // Checked before anything is drawn, so the run fails once with the name of the
  // project rather than once per row with a malformed cell on the page.
  for (const project of projects) {
    if (!project.stateLabel) {
      throw new Error(
        `ProjectList01: the project "${project.name}" carries a state and no stateLabel, so its cell ` +
          'would be a dot with no sentence beside it, which is the one thing a reader who cannot see the ' +
          `tone learns nothing from. Pass the words your readers use for that state.`,
      )
    }
    if (project.progress !== undefined && !project.progressLabel) {
      throw new Error(
        `ProjectList01: the project "${project.name}" carries a progress and no progressLabel, so the ` +
          'bar would announce a bare number meaning whatever the reader assumes it is a percentage of. ' +
          `Pass the words for the value, or drop the progress.`,
      )
    }
    if (project.updated !== undefined && !project.updatedLabel) {
      throw new Error(
        `ProjectList01: the project "${project.name}" carries a moment and no updatedLabel, so the ` +
          'cell would be a date with nothing beside it and no claim about how old it is. Pass the ' +
          `sentence, or drop the moment.`,
      )
    }
    if (project.href !== undefined && !project.hrefLabel) {
      throw new Error(
        `ProjectList01: the project "${project.name}" carries an href with no hrefLabel, so the link ` +
          'would be announced by its address, which is punctuation rather than a name. Pass the words ' +
          `that say where it goes, or drop the href.`,
      )
    }
  }

  const heading = (
    <SectionHeading
      as={headingLevel}
      id={headingId}
      align="left"
      eyebrow={eyebrow}
      title={title}
      description={description}
    />
  )

  /*
   * The empty state, and it is drawn before the column checks rather than after.
   *
   * A caller whose filter matched nothing has a set of projects of length zero
   * and a set of columns they declared for the list that is not there, and the
   * two checks below would both refuse: a table with no `name` column, and eight
   * columns no project carries. Both refusals are right about a table with rows
   * and wrong about a table that is showing the caller's own sentence about there
   * being no rows, so the empty state is settled first.
   */
  if (projects.length === 0) {
    return (
      <Section data-slot="project-list-01" data-variant={variant} data-empty="true" className={cn(className)}>
        <div className="flex flex-col gap-8">
          {heading}
          <div data-slot="project-list-empty" className="text-muted-foreground text-pretty text-sm">
            {empty}
          </div>
        </div>
      </Section>
    )
  }

  if (variant === 'table') {
    const declared = columns ?? []
    const seen = new Set<ProjectListCell>()
    for (const column of declared) {
      if (seen.has(column.id)) {
        throw new Error(
          `ProjectList01: the column "${column.id}" is declared twice, so the table would have two ` +
            'columns reading the same value and every cell after the first would be read under the ' +
            `wrong name. Declare each cell once.`,
        )
      }
      if (!carries(column.id, projects)) {
        throw new Error(
          `ProjectList01: the "${column.id}" column was declared and no project in this list carries ` +
            'it, so the table would have a column of empty cells, which is a column every reader scans ' +
            `twice. Pass the field, or drop the column.`,
        )
      }
      seen.add(column.id)
    }
    if (!seen.has('name')) {
      throw new Error(
        'ProjectList01: the columns name no "name" cell, so the header row would have a cell fewer ' +
          'than every body row and a reader who lands on one cell would not be told which project they ' +
          'are in. Declare the name column, which is also the row header for every row.',
      )
    }
  }

  const list =
    variant === 'table' ? (
      <div data-slot="project-list" data-variant={variant}>
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
                {(columns ?? []).map((column) => (
                  <TableHead key={column.id} scope="col" className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} data-slot="project-list-row" data-project={project.id}>
                  {(columns ?? []).map((column) =>
                    // The name is a row header, so a reader who navigates into a
                    // single cell is told which project they are looking at rather
                    // than hearing a value with nothing to attach it to.
                    column.id === 'name' ? (
                      <TableHead
                        key={column.id}
                        scope="row"
                        className={cn(CELL[column.id], column.className)}
                      >
                        {cellOf(column.id, project)}
                      </TableHead>
                    ) : (
                      <TableCell key={column.id} className={cn(CELL[column.id], column.className)}>
                        {cellOf(column.id, project)}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    ) : (
      <ul data-slot="project-list" data-variant={variant} className="flex flex-col">
        {projects.map((project) => (
          <li
            key={project.id}
            data-slot="project-list-row"
            data-project={project.id}
            data-state={project.state}
            className="border-border flex flex-wrap items-start justify-between gap-x-8 gap-y-4 border-b py-5 first:border-t"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span data-slot="project-list-name" className="text-sm font-semibold">
                {project.name}
              </span>
              {project.summary === undefined ? null : (
                <span className="text-muted-foreground text-pretty text-sm">
                  {cellOf('summary', project)}
                </span>
              )}
              {project.tags === undefined ? null : (
                <span data-slot="project-list-tags" className="flex flex-wrap items-center gap-1.5">
                  {project.tags.map((tag) => (
                    <Tag key={tag.id} label={tag.label} />
                  ))}
                </span>
              )}
              {project.progress === undefined ? null : (
                <div data-slot="project-list-progress" className="max-w-64 pt-1">
                  <Progress
                    value={project.progress}
                    valueText={project.progressLabel?.(project.progress, project.name)}
                  />
                </div>
              )}
            </div>

            {/*
              The three facts a reader scans a row for, in the order they ask
              them: where it stands, who has it, and when it last moved. The
              destination sits at the end rather than wrapping the row, because a
              row's accessible name would otherwise be its name, its summary, its
              state and its date, and a reader hearing that cannot hear the end of
              it.
            */}
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              {cellOf('state', project)}
              {cellOf('owner', project)}
              {cellOf('updated', project)}
              {cellOf('href', project)}
            </div>
          </li>
        ))}
      </ul>
    )

  return (
    <Section data-slot="project-list-01" data-variant={variant} className={cn(className)}>
      <div className="flex flex-col gap-8">
        {heading}

        <div
          data-slot="project-list-body"
          className={cn(
            // The two arrangements get one display each rather than a base and an
            // override, because `flex` and `grid` are the same property and which
            // one wins is a question about the generated stylesheet rather than
            // about the order of the class names here.
            filters === undefined ? 'flex flex-col gap-6' : 'flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10',
          )}
        >
          {filters === undefined ? null : (
            <div data-slot="project-list-filters" className="w-full shrink-0 lg:max-w-72">
              {filters}
            </div>
          )}

          <div data-slot="project-list-main" className="flex min-w-0 flex-1 flex-col gap-4">
            {toolbar === undefined ? null : (
              <div data-slot="project-list-toolbar" className="flex flex-wrap items-center gap-2">
                {toolbar}
              </div>
            )}

            {list}

            {footer === undefined ? null : (
              <div data-slot="project-list-footer" className="flex flex-wrap items-center gap-3">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}

export default ProjectList01

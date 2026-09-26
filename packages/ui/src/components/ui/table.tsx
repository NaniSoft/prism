import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The semantic table components for tabular data.
 *
 * `Table` renders a real `<table>` inside a horizontally scrollable container,
 * so a wide set of columns stays reachable without breaking the page. Compose
 * it from `TableHeader`, `TableBody` and `TableRow`, name the columns with
 * `TableHead` and give the table a `TableCaption` unless an adjacent heading
 * already names it.
 */
function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

/** The column header row. */
function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  )
}

/** The data rows. */
function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

/** A summary row, for totals or a running count. */
function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-muted/50 border-t font-medium [&_tr:last-child]:border-0',
        className,
      )}
      {...props}
    />
  )
}

/** One row, which highlights on hover and while selected. */
function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors duration-fast ease-out',
        className,
      )}
      {...props}
    />
  )
}

/** A column header cell. */
function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap',
        className,
      )}
      {...props}
    />
  )
}

/** A data cell. */
function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('p-2 align-middle whitespace-nowrap', className)}
      {...props}
    />
  )
}

/** The table's caption, which names it for every reader. */
function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}

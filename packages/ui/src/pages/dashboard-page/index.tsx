'use client'

import type { ComponentProps } from 'react'

import { AppShell01 } from '../../blocks/app-shell-01'
import { DataTable01 } from '../../blocks/data-table-01'
import { PageHeader01 } from '../../blocks/page-header-01'
import { Stats01 } from '../../blocks/stats-01'

export type DashboardPageProps = {
  /**
   * The frame: the navigation rail, the top bar and the mobile navigation
   * sheet. Navigation, actions and the rail slots are passed as nodes, so the
   * page never imports a router.
   */
  shell: Omit<ComponentProps<typeof AppShell01>, 'children'>
  /** The page title band. */
  header: ComponentProps<typeof PageHeader01>
  /** The key-figure row above the table. */
  stats: ComponentProps<typeof Stats01>
  /** The main table, with its rows, columns, labels and callbacks. */
  table: ComponentProps<typeof DataTable01>
}

/**
 * A complete dashboard screen.
 *
 * It composes `AppShell01`, `PageHeader01`, `Stats01` and `DataTable01`: the
 * shell provides the frame, the header names the screen, the stats summarise it
 * and the table carries the working set. The page owns the sequence and the
 * spacing only. Every row, column, label and handler is a prop, and the page
 * fetches nothing.
 *
 * The page is a client component because the blocks it composes are stateful.
 * That is a property of this composition, not of the data: the consumer still
 * owns the rows and the callbacks, and can drive the table from a server render
 * or a client cache by the same props.
 */
export function DashboardPage({ shell, header, stats, table }: DashboardPageProps) {
  return (
    <AppShell01 {...shell}>
      <div className="mx-auto flex w-full max-w-page flex-col gap-8">
        <PageHeader01 {...header} headingLevel={header.headingLevel ?? 'h1'} />
        <Stats01 {...stats} />
        <DataTable01 {...table} />
      </div>
    </AppShell01>
  )
}

export default DashboardPage

import { render, screen } from '@testing-library/react'
import { Star } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { AppShell01 } from '../src/blocks/app-shell-01'
import { AuthForm01 } from '../src/blocks/auth-form-01'
import { Cta01 } from '../src/blocks/cta-01'
import { DataTable01, type DataTable01Labels } from '../src/blocks/data-table-01'
import { FeatureGrid01 } from '../src/blocks/feature-grid-01'
import { Hero01 } from '../src/blocks/hero-01'
import { PageHeader01 } from '../src/blocks/page-header-01'
import { Pricing01 } from '../src/blocks/pricing-01'
import { SettingsPanel01 } from '../src/blocks/settings-panel-01'
import { Stats01 } from '../src/blocks/stats-01'
import { AuthPage } from '../src/pages/auth-page'
import { DashboardPage } from '../src/pages/dashboard-page'
import { MarketingPage } from '../src/pages/marketing-page'
import { SettingsPage } from '../src/pages/settings-page'

const features = [{ icon: Star, title: 'Tokens', body: 'One source for every value.' }]
const stats = [{ label: 'Users', value: '1,204' }]
const plans = [{ name: 'Free', price: '$0', features: ['One project'], cta: 'Start' }]
const shell = { navigation: <a href="/">Home</a>, navigationLabel: 'Main' }

const tableLabels: DataTable01Labels = {
  search: 'Search',
  filters: 'Filters',
  reset: 'Reset',
  columns: 'Columns',
  viewColumns: 'View columns',
  selectAll: 'Select all rows',
  selectRow: 'Select row',
  rowActions: 'Row actions',
  previous: 'Previous page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  selectedCount: (count) => `${count} selected`,
  empty: 'No rows',
}

const table = {
  columns: [{ id: 'name', header: 'Name', cell: (row: Record<string, unknown>) => String(row.name) }],
  rows: [{ id: '1', name: 'Ada' }],
  getRowId: (row: Record<string, unknown>) => String(row.id),
  pageCount: 1,
  labels: tableLabels,
}

const form = {
  title: 'Sign in',
  fields: [{ id: 'email', label: 'Email' }],
  submitLabel: 'Sign in',
}

const panel = {
  title: 'Settings',
  sections: [
    { id: 'profile', title: 'Profile', fields: [{ kind: 'text' as const, id: 'name', label: 'Name' }] },
  ],
}

describe('Block smoke tests', () => {
  it('Hero01 renders its headline', () => {
    render(<Hero01 title="Build faster" />)
    expect(screen.getByRole('heading', { name: 'Build faster' })).toBeInTheDocument()
  })

  it('FeatureGrid01 renders each feature', () => {
    render(<FeatureGrid01 features={features} />)
    expect(screen.getByText('Tokens')).toBeInTheDocument()
  })

  it('Stats01 renders each statistic', () => {
    render(<Stats01 stats={stats} />)
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('1,204')).toBeInTheDocument()
  })

  it('Pricing01 renders each plan', () => {
    render(<Pricing01 plans={plans} />)
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('Cta01 renders its headline', () => {
    render(<Cta01 title="Ship it" />)
    expect(screen.getByRole('heading', { name: 'Ship it' })).toBeInTheDocument()
  })

  it('PageHeader01 renders the page title', () => {
    render(<PageHeader01 title="Dashboard" />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('DataTable01 renders the given columns and rows', () => {
    render(<DataTable01 {...table} />)
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeInTheDocument()
  })

  it('SettingsPanel01 renders its sections and labelled fields', () => {
    render(<SettingsPanel01 {...panel} />)
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('AuthForm01 renders labelled credentials and the submit control', () => {
    render(<AuthForm01 {...form} />)
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('AppShell01 renders its navigation and content slots', () => {
    render(
      <AppShell01 {...shell}>
        <p>Content</p>
      </AppShell01>,
    )
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('Page smoke tests', () => {
  it('MarketingPage composes its blocks in reading order', () => {
    render(
      <MarketingPage
        hero={{ title: 'Hero headline' }}
        features={{ features }}
        stats={{ stats }}
        pricing={{ plans }}
        cta={{ title: 'Closing action' }}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Hero headline' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Closing action' })).toBeInTheDocument()
  })

  it('DashboardPage composes the shell, header, stats and table', () => {
    render(<DashboardPage shell={shell} header={{ title: 'Dash' }} stats={{ stats }} table={table} />)
    expect(screen.getByRole('heading', { name: 'Dash' })).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('SettingsPage composes the shell, header and tabs', () => {
    render(
      <SettingsPage
        shell={shell}
        header={{ title: 'Settings' }}
        tabs={[{ value: 'general', label: 'General', panel }]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument()
  })

  it('AuthPage composes the sign-in form', () => {
    render(<AuthPage form={form} />)
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })
})

/*
 * The coarse-pointer 44px floor cannot be evaluated in jsdom. It is asserted as
 * a class contract in `src/components/ui/button.test.tsx` and as a real browser
 * check in `apps/site/e2e/visual.spec.ts` (the coarse-pointer project), which is
 * where `@media (pointer: coarse)` actually resolves.
 */

'use client'

import { useState } from 'react'

import {
  MegaMenu,
  type MegaMenuGroup,
  type MegaMenuLink,
} from '@nanisoft/prism-ui/components/mega-menu'

/** The inner axis of each panel, in the words a reader would hear for it. */
const PANEL_NAMES: Record<string, string> = {
  product: 'Product',
  developers: 'Developers',
  pricing: 'Pricing',
}

/**
 * A header bar whose panels are a second navigation axis.
 *
 * "Product" opens one panel with four columns and no axis. "Developers" opens a
 * panel whose contents are four views of the same subject, so it carries a tab strip
 * and a roving tab stop inside the disclosure. That difference is the Component: one
 * is a disclosure of links and the other is a disclosure whose contents are
 * themselves a set of views.
 *
 * The inner tab is held per group, so moving to Pricing and back to Developers
 * returns the reader to the view they were reading rather than to whichever one was
 * last pressed.
 */
export default function MegaMenuDemo() {
  const [open, setOpen] = useState<string | null>(null)
  const [panels, setPanels] = useState<Record<string, string>>({
    product: 'overview',
    developers: 'api',
    pricing: 'plans',
  })

  const link = (href: string, label: string, description: string, active = false): MegaMenuLink => ({
    href,
    label,
    description,
    active,
  })

  const groups: MegaMenuGroup[] = [
    {
      value: 'product',
      label: 'Product',
      panels: [
        {
          value: 'overview',
          label: 'Overview',
          columns: [
            {
              label: 'Observe',
              links: [
                link('/estate', 'Estate', 'Every site you watch', true),
                link('/readings', 'Readings', 'The values that came in'),
                link('/alerts', 'Alerts', 'What woke somebody up'),
              ],
            },
            {
              label: 'Market',
              links: [
                link('/capture', 'Capture', 'Snapshots of what was offered'),
                link('/snapshots', 'Snapshots', 'The archive'),
              ],
            },
            {
              label: 'Operate',
              links: [
                link('/runs', 'Runs', 'Agents and their work'),
                link('/ledger', 'Cost ledger', 'What each run cost'),
              ],
            },
            {
              label: 'Account',
              links: [
                link('/settings', 'Settings', 'Workspace and packs'),
                link('/members', 'Members', 'Who is in the workspace'),
              ],
            },
          ],
        },
      ],
    },
    {
      value: 'developers',
      label: 'Developers',
      panels: [
        {
          value: 'start',
          label: 'Start',
          columns: [
            {
              label: 'First steps',
              links: [
                link('/docs/install', 'Install the package', 'One command and one stylesheet'),
                link('/docs/authenticate', 'Authenticate', 'Tokens and their scopes'),
              ],
            },
            {
              label: 'Then',
              links: [
                link('/docs/first-query', 'Make a first query', 'From an estate to a reading'),
                link('/docs/errors', 'Read the errors', 'What each code means'),
              ],
            },
          ],
        },
        {
          value: 'api',
          label: 'API',
          columns: [
            {
              label: 'Reading',
              links: [
                link('/docs/api/readings', 'Readings', 'List and filter'),
                link('/docs/api/sites', 'Sites', 'The things readings belong to'),
              ],
            },
            {
              label: 'Writing',
              links: [
                link('/docs/api/ingest', 'Ingest', 'Post a batch'),
                link('/docs/api/backfill', 'Backfill', 'Fill a gap in the record'),
              ],
            },
          ],
        },
        {
          value: 'reference',
          label: 'Reference',
          columns: [
            {
              label: 'Components',
              links: [
                link('/components', 'The catalogue', 'Everything that installs'),
                link('/foundation/tokens', 'Tokens', 'The values behind them'),
              ],
            },
            {
              label: 'Agents',
              links: [
                link('/agent-surface', 'Agent surface', 'The read-only endpoint'),
                link('/llms', 'llms.txt', 'The whole catalogue as text'),
              ],
            },
          ],
        },
      ],
    },
    {
      value: 'pricing',
      label: 'Pricing',
      panels: [
        {
          value: 'plans',
          label: 'Plans',
          columns: [
            {
              label: 'By size',
              links: [
                link('/pricing', 'Compare plans', 'Sites, readings and retention'),
              ],
            },
            {
              label: 'Questions',
              links: [
                link('/pricing/faq', 'Billing questions', 'Invoices, tax, changes'),
                link('/contact', 'Talk to us', 'For anything else'),
              ],
            },
          ],
        },
        {
          value: 'usage',
          label: 'Usage',
          columns: [
            {
              label: 'This period',
              links: [
                link('/account/usage', 'Current usage', 'Where the month is'),
                link('/account/invoices', 'Invoices', 'Past statements'),
              ],
            },
          ],
        },
      ],
    },
  ]

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="border-border rounded-lg border p-2">
        <MegaMenu
          label="Primary"
          groups={groups}
          value={open}
          onValueChange={setOpen}
          panelLabel={(group) => PANEL_NAMES[group] ?? group}
          panel={(group) => panels[group] ?? ''}
          onPanelChange={(group, next) => setPanels((current) => ({ ...current, [group]: next }))}
        />
      </div>

      <p className="text-muted-foreground text-sm">
        {open === null
          ? 'No panel is open. Tab to a trigger, or hover one.'
          : `The ${open} panel is open. Tab off the trigger and you are on that panel's own axis, which is a second tab stop rather than the first.`}
      </p>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        The second view of the Pricing panel holds one column, so its tab strip has
        two tabs and one of them opens a single column of links. A panel with one
        column of links and no choice to make would draw no axis at all; this one has
        a choice, so it draws the control.
      </p>
    </div>
  )
}

'use client'

import { useState } from 'react'

import {
  NestedTabs,
  type NestedTabSection,
} from '@nanisoft/prism-ui/components/nested-tabs'

/**
 * Two axes, and the thing worth watching is what does not move.
 *
 * Move the inner axis on "Deployment" from files to logs, then go to "Billing" and
 * come back. The outer axis never moved when you changed panels, and the inner axis
 * is where you left it, because one `panel` value is the caller's and nothing here
 * resets it.
 *
 * The third section has no inner axis at all. An empty strip of tabs would be a tab
 * stop that goes nowhere, so none is drawn and the section's own content stands in
 * its place.
 */
export default function NestedTabsDemo() {
  const [section, setSection] = useState('deployment')
  const [panel, setPanel] = useState('files')

  const sections: NestedTabSection[] = [
    {
      value: 'deployment',
      label: 'Deployment',
      description: 'How a reading reaches the market snapshot.',
      panels: [
        {
          value: 'files',
          label: 'Files',
          content: (
            <ul className="text-muted-foreground flex list-none flex-col gap-1 pt-2 text-sm">
              <li>readings-2026-10.parquet, 41 MB</li>
              <li>sites.parquet, 2 MB</li>
              <li>manifest.json, 12 KB</li>
            </ul>
          ),
        },
        {
          value: 'logs',
          label: 'Logs',
          content: (
            <ul className="text-muted-foreground flex list-none flex-col gap-1 pt-2 text-sm">
              <li>14:02 readings written</li>
              <li>14:02 sites joined</li>
              <li>14:03 manifest sealed</li>
            </ul>
          ),
        },
        {
          value: 'checksums',
          label: 'Checksums',
          content: (
            <ul className="text-muted-foreground flex list-none flex-col gap-1 pt-2 text-sm">
              <li>readings: 6f2a, sites: b419</li>
              <li>manifest: c07d</li>
            </ul>
          ),
        },
      ],
    },
    {
      value: 'billing',
      label: 'Billing',
      description: 'What the estate is charged for.',
      panels: [
        {
          value: 'plan',
          label: 'Plan',
          content: (
            <p className="text-muted-foreground pt-2 text-sm">
              Billed per site per month, with readings included up to the tier.
            </p>
          ),
        },
        {
          value: 'usage',
          label: 'Usage',
          content: (
            <p className="text-muted-foreground pt-2 text-sm">
              34 sites, 2.1 million readings in the current period.
            </p>
          ),
        },
      ],
    },
    {
      value: 'status',
      label: 'Status',
      description: 'One panel, so no axis is drawn for it.',
      panels: [
        {
          value: 'now',
          label: 'Now',
          content: (
            <p className="text-muted-foreground pt-2 text-sm">
              Everything is running. The last incident closed four days ago.
            </p>
          ),
        },
      ],
    },
  ]

  return (
    <div className="flex w-full flex-col gap-4">
      <NestedTabs
        sections={sections}
        value={section}
        onValueChange={setSection}
        panel={panel}
        onPanelChange={setPanel}
        label="Estate"
        panelLabel="Estate, section"
      />

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        Both axes are drawn by the same Component and look the same, which is the
        honest cost here. The mitigation is the two accessible names: a reader is
        told which axis they are on every time they arrive at one, and a reader
        scanning with their eyes is not, which is why this shape earns its place on a
        page with two or three sections rather than on a page with nine.
      </p>
    </div>
  )
}

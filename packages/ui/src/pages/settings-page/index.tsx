'use client'

import type { ComponentProps, ReactNode } from 'react'

import { AppShell01 } from '../../blocks/app-shell-01'
import { PageHeader01 } from '../../blocks/page-header-01'
import { SettingsPanel01 } from '../../blocks/settings-panel-01'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export type SettingsPageTab = {
  /** The value shared by the trigger and its panel. */
  value: string
  /** The trigger label. */
  label: string
  /**
   * A saved settings form for this tab. Rendered through `SettingsPanel01`, so
   * the tab inherits the grouped sections, the field kinds and the save footer.
   */
  panel?: ComponentProps<typeof SettingsPanel01>
  /** Content for a tab that is not a saved form, such as a read-only summary. */
  content?: ReactNode
}

export type SettingsPageProps = {
  /** The frame: rail, top bar and mobile navigation sheet. */
  shell: Omit<ComponentProps<typeof AppShell01>, 'children'>
  /** The page title band. */
  header: ComponentProps<typeof PageHeader01>
  /** The tabs, in order. At least one is required. */
  tabs: SettingsPageTab[]
  /** The tab shown first, for uncontrolled tabs. Defaults to the first tab. */
  defaultValue?: string
  /** The controlled active tab. */
  value?: string
  onValueChange?: (value: string) => void
}

/**
 * A complete settings screen.
 *
 * It composes `AppShell01`, `PageHeader01`, `Tabs` and `SettingsPanel01`: the
 * shell provides the frame, the header names the screen, and each tab is a
 * saved settings form or a read-only panel. The page owns the sequence and the
 * tab wiring only. Every section, field, option and label is a prop, and the
 * page fetches nothing.
 *
 * A tab that carries a `panel` renders `SettingsPanel01`, so a settings screen
 * is a set of grouped forms rather than one long page. A tab that carries
 * `content` instead renders the node as-is. Both are optional, so a caller can
 * mix forms and read-only views in one screen.
 */
export function SettingsPage({
  shell,
  header,
  tabs,
  defaultValue,
  value,
  onValueChange,
}: SettingsPageProps) {
  return (
    <AppShell01 {...shell}>
      <div className="mx-auto flex w-full max-w-page flex-col gap-8">
        <PageHeader01 {...header} headingLevel={header.headingLevel ?? 'h1'} />

        <Tabs
          defaultValue={defaultValue ?? tabs[0]?.value}
          value={value}
          onValueChange={onValueChange}
        >
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.panel ? <SettingsPanel01 {...tab.panel} /> : tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell01>
  )
}

export default SettingsPage

import { DSIcon } from '@nanisoft/prism-ui/components/ds-icon'

/** The registry glyphs at three governed sizes. */
export default function DsIconDemo() {
  return (
    <div className="flex items-center gap-4">
      <DSIcon name="settings" size="lg" label="Settings" />
      <DSIcon name="search" size="md" label="Search" />
      <DSIcon name="menu" size="sm" />
    </div>
  )
}

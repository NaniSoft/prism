import { FactList } from '@nanisoft/prism-ui/components/fact-list'

/** Named facts, with one value that is a link and one that is a count. */
export default function FactListDemo() {
  return (
    <FactList
      label="Release"
      facts={[
        { label: 'Version', value: '0.5.1' },
        { label: 'Package', value: '@nanisoft/prism-ui' },
        { label: 'Axes', value: 'Two: pack and mode' },
        { label: 'Changelog', value: 'Read it', href: '/changelogs/prism-ui' },
      ]}
    />
  )
}

import { Diagram } from '@nanisoft/prism-ui/components/diagram'

/**
 * A four-node loop with one emphasised node, one indirect relation, a second
 * line under three of the nodes and a pack on one of them.
 *
 * Self-contained: the only import is from the package, and it has a default
 * export. No hook, no mode, no provider, which is the point of the component.
 * The coordinates are fractions, and they draw the same shape they would as
 * pixels.
 */
export default function DiagramDemo() {
  return (
    <Diagram
      label="How a finding is produced, checked and published"
      nodes={[
        { id: 'capture', name: 'Capture', subtitle: 'the first draft', x: 0.12, y: 0.3 },
        {
          id: 'read',
          name: 'Read',
          subtitle: 'a person decides',
          x: 0.5,
          y: 0.62,
          emphasis: true,
          pack: 'mint',
        },
        { id: 'review', name: 'Review', subtitle: 'the automated pass', x: 0.88, y: 0.3 },
        { id: 'publish', name: 'Publish', x: 0.5, y: 0.12 },
      ]}
      relations={[
        { from: 'capture', to: 'read', label: 'feeds' },
        { from: 'read', to: 'review', label: 'raises' },
        { from: 'review', to: 'publish', label: 'confirms', indirect: true },
        { from: 'publish', to: 'capture', label: 'returns' },
      ]}
    />
  )
}

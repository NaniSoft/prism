import {
  SpecTable01,
  type SpecTableColumn,
} from '@nanisoft/prism-ui/blocks/spec-table-01'

/**
 * The four columns, named by this Demo rather than by the Block.
 *
 * A capability's limits are read under whatever heading its own product uses, and
 * "Limit", "Measure" and "Property" are three names for one column. The one that has
 * to be declared is `label`, because it is the row header every other cell is read
 * under, and the run throws without it.
 */
const COLUMNS: readonly SpecTableColumn[] = [
  { id: 'label', header: 'What is measured', className: 'w-2/5' },
  { id: 'value', header: 'Value', className: 'text-right' },
  { id: 'unit', header: 'Unit' },
  { id: 'note', header: 'Measured under' },
]

/**
 * One capability's limits, in three caller-named groups, with a summary band.
 *
 * **Every figure here is a node this Demo composed, and three of them are the reason
 * the Block takes a node rather than a number.** The collection figure is grouped
 * thousands, the coverage figure is a percentage a caller rounded for itself, and the
 * ceiling is an integer. A Block that took `number` would make this Demo format
 * outside the Block or lose the precision each of those belongs to, and a Block that
 * took a `format` prop would have moved a locale and a rounding rule into this
 * package, which has no business choosing either.
 *
 * **The unit is beside the value rather than part of it, and the third row is the
 * demonstration.** "7,000,000" and "7 million" and "7M" are three renderings of one
 * number, and which is right is a fact about the audience rather than about the
 * measurement: a reader scanning the column wants the short one and a reader
 * reconciling a bill wants the long one. So `value` holds the rendering the caller
 * composed and `unit` holds the notation, as two cells a reader can compare down.
 */
export default function SpecTable01Demo() {
  return (
    <SpecTable01
      headingLevel="h3"
      eyebrow="Connector"
      title="What the historian connector handles"
      description="The limits as we can currently stand behind. Each row carries the condition it was measured under, because a figure with no condition is a claim about every case rather than the one it was taken in."
      columns={COLUMNS}
      groups={[
        {
          title: 'Collection',
          rows: [
            {
              id: 'points',
              label: 'Points per walk',
              value: '7,000,000',
              note: 'Every configured tag, every 15 minutes, per site',
            },
            {
              id: 'tags',
              label: 'Tags resolved per walk',
              value: '1,840',
              note: 'One spelling proposed per node, confirmed by a person',
            },
            {
              id: 'depth',
              label: 'Tag depth supported',
              value: '8',
              unit: 'levels',
              note: 'Deeper hierarchies are walked and left unproposed',
              emphasis: true,
            },
          ],
        },
        {
          title: 'Coverage',
          rows: [
            {
              id: 'historians',
              label: 'Historians supported',
              value: '4',
              note: 'Tested against the four we could get read access to',
            },
            {
              id: 'access',
              label: 'Write access required',
              value: 'None',
              note: 'The token asks for read only and the connector writes nothing',
            },
          ],
        },
        {
          title: 'Limits',
          rows: [
            {
              id: 'sites',
              label: 'Sites per connector',
              value: '1',
              note: 'One historian, one site, one token',
              emphasis: true,
            },
            {
              id: 'lag',
              label: 'Worst observed lag',
              value: '4.2',
              unit: 'minutes',
              note: 'Ninety fifth percentile across eleven months of walks',
            },
          ],
        },
      ]}
      summary={[
        { label: 'Points per walk, whole estate', value: '7.0M' },
        { label: 'Tag depth supported', value: '8 levels' },
        { label: 'Worst observed lag', value: '4.2 min' },
      ]}
      empty="We publish no limits for this connector yet. Write to us and we will send the ones we have measured."
    />
  )
}

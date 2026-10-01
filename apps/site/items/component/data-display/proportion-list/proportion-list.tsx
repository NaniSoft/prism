import { ProportionList, type ProportionListItem } from '@nanisoft/prism-ui/components/proportion-list'

/**
 * Where the quarter's estate budget went, in the caller's own units.
 *
 * The values are counts of credits rather than percentages, because that is what a
 * budget ledger holds: the share is one division this Component does and the total is
 * the sum the caller already had.
 */
const ITEMS: ProportionListItem[] = [
  {
    label: 'Estate observation',
    value: 482_400,
    status: { tone: 'success', label: 'On plan' },
  },
  {
    label: 'Market capture',
    value: 268_900,
    status: { tone: 'success', label: 'On plan' },
  },
  {
    label: 'Agent runners',
    value: 151_200,
    status: { tone: 'warning', label: 'Near the cap' },
  },
  {
    label: 'Retained history',
    value: 64_100,
    status: { tone: 'neutral', label: 'Held at the floor' },
  },
  {
    label: 'Storage overage',
    value: 18_700,
    status: { tone: 'destructive', label: 'Over the cap' },
  },
]

/**
 * The same measure with the whole named, and the count printed beside the share.
 *
 * `total` is passed because this list is not exhaustive: two smaller lines are left
 * out of the quarterly review, so a bar measured against the sum of what is shown
 * would overstate every category on the page. `text` is passed per row because the
 * reading a budget review wants is the count and the share together, and a
 * Component that assembled that sentence would be shipping a currency format into
 * four products.
 */
const REVIEW: ProportionListItem[] = [
  { label: 'Estate observation', value: 482_400, text: '482,400 credits' },
  { label: 'Market capture', value: 268_900, text: '268,900 credits' },
  { label: 'Agent runners', value: 151_200, text: '151,200 credits' },
  { label: 'Retained history', value: 64_100, text: '64,100 credits' },
  { label: 'Storage overage', value: 18_700, text: '18,700 credits' },
]

/** The rest of the quarter, which is what the five lines above leave out. */
const WHOLE = 1_240_000

export default function ProportionListDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Where the quarter went</span>
        <ProportionList
          label="Where the quarter estate budget went"
          items={ITEMS}
          caption="Of 985,300 credits committed in the quarter"
        />
        <span className="text-muted-foreground text-xs">
          Each bar is a share of the same total on the same width, so two categories
          can be compared without reading either number. The bar is decorative beside
          the number printed at its right: a shade is not something a screen reader
          can use, and every row prints the share it is drawn from.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">A list that is not the whole</span>
        <ProportionList
          label="The five largest lines of the quarterly estate budget"
          items={REVIEW}
          total={WHOLE}
          precision={0}
          caption="Of 1,240,000 credits committed, of which five lines are shown"
        />
        <span className="text-muted-foreground text-xs">
          The whole is passed rather than summed, because two smaller lines are left
          out of this review, and the printed form is passed per row because the
          reading a budget review wants is the count rather than the share. A
          Component that assembled either would be shipping a currency format into
          four products.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">A quarter with nothing in it</span>
        <ProportionList
          label="Where the quarter estate budget went"
          items={[]}
          empty="Nothing was committed this quarter. The ledger is open and the first line has not been drawn against it."
        />
        <span className="text-muted-foreground text-xs">
          An empty list renders the caller own sentence rather than nothing. A
          figure with no rows says the total is nothing, and hiding it leaves a
          reader wondering whether it had been missed.
        </span>
      </div>
    </div>
  )
}
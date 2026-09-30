import { Price } from '@nanisoft/prism-ui/components/price'

/**
 * Four prices, and between them every decision the Component makes.
 *
 * The second one is a currency with no fraction digits, which is the case a
 * hardcoded two-decimal formatter gets wrong in a way that is easy to miss: the
 * amount is a real number and the trailing `.00` is a claim about it that nobody
 * made. The third is the comparison, and the strikethrough is doing the work a
 * badge would have done with a filled surface and a colour.
 *
 * The fourth passes `format` and passes no currency at all, because the type is a
 * union: a caller who has said the platform is not formatting this price is not
 * also made to name a currency code for a formatter that will never read it.
 */
export default function PriceDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">Per seat, per month, with a comparison</span>
        <Price amount={19} currency="USD" locale="en-US" compareAt={29} period="/mo" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">A price with no meaningful cents</span>
        <Price amount={2400} currency="USD" locale="en-US" maximumFractionDigits={0} period="/mo" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">The same plan priced in another market</span>
        <Price amount={18} currency="EUR" locale="de-DE" compareAt={24} period="/Monat" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">A price the platform has no data for</span>
        <Price
          amount={450}
          size="sm"
          format={(amount) => `${new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 0,
          }).format(amount)} per workspace`}
        />
      </div>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        A fifth price sits below this line and renders nothing at all, because it
        has no amount. That is the whole of it: a dash or a zero would claim the
        price is zero, which is a claim about a product that no reader can
        disprove.
      </p>
      <Price amount={undefined} currency="USD" />
    </div>
  )
}

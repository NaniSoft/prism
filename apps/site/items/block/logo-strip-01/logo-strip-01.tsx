import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01'

/**
 * The transition band: one line of short phrases, as a list.
 *
 * **The items are kinds, not companies, and that is a correction rather than a
 * styling choice.** This demo used to name a real brokerage and a real exchange,
 * which is NaniSoft's own honest data stack and is also exactly the claim the
 * Block's JSDoc forbids shipping: a strip is read as a list of who is involved, so
 * naming four real organisations in one handed every reader who saw this page,
 * including a competitor, a false claim about NaniSoft's customers. The review in
 * `docs/history/licensing-review-shadcnblocks.md` recorded it as the one finding
 * on this site that was a fix rather than a note.
 *
 * Describing the kinds of source instead keeps the demo honest about what the
 * Block is for, which is showing a row of short names on a band, and the `label`
 * frames them as source kinds so nothing on the page can be read as a customer.
 */
export default function LogoStrip01Demo() {
  return (
    <LogoStrip01
      label="Source kinds"
      items={['Broker statements', 'Exchange filings', 'Vendor APIs', 'Archived exports']}
    />
  )
}

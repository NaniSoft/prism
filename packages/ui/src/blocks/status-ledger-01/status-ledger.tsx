import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The four tiers a StatusLedger01 row can be in.
 *
 * Four, and the fifth is refused deliberately. All four NaniSoft sites publish a
 * ledger of the same kind - what a product can do today, what is designed, what
 * is planned, and what is only a direction - and between them they use eight
 * different words for those four states: `live`, `available` and `complete` all
 * mean the same thing; `approved`, `specified` and `designed` all mean the next
 * one; `planned` means the one after; and `direction` means a research direction
 * that is explicitly not a capability. Eight words for four states is four tiers
 * with a per-product vocabulary, and the vocabulary belongs in the row's
 * `statusLabel`, not in the type.
 *
 * A fifth tier would be the one that splits a state that does not need splitting -
 * `deprecated` over `retired`, or a `live` that is not `complete`. Each such tier
 * is a colour a reader must learn and a word a maintainer must keep true, and a
 * ladder with more rungs than states is how a status column stops being readable.
 * The four below are the states; the words are the caller's.
 */
export const STATUS_TIERS = ['live', 'designed', 'planned', 'direction'] as const

/**
 * One of the four tiers a StatusLedger01 row is in.
 */
export type StatusTier = (typeof STATUS_TIERS)[number]

/**
 * The dot each tier draws, and the ring around it.
 *
 * The dot is `aria-hidden` and the row's words carry the state, so a tier is
 * never colour alone: a reader who cannot separate success from warning still
 * reads the label. The ring is `border-brand-ink` rather than `border-border`
 * because the mark is a signal, and a signal that reads as a hairline on a card
 * is not a signal. This is the mark the four sites draw by hand, and the reason
 * it is a ring around a fill rather than a filled dot is a measurement: a filled
 * pastel dot fails contrast against a light card, while a hairline ring in the
 * brand ink does not.
 */
const TIER_DOT = {
  live: 'bg-success border-success',
  designed: 'bg-warning border-warning',
  planned: 'border-muted-foreground',
  direction: 'border-border',
} as const

/**
 * One row of the ledger: a thing, the state it is in, the words for that state,
 * and an optional list of what it does.
 *
 * `statusLabel` is required and separate from `status` because the tier is a
 * colour and the words are a claim. A consumer that passed the tier alone would
 * ship four identical-looking rows to a reader who cannot see colour at all, and
 * a consumer that passed only the words would have no tier to draw.
 */
export type StatusRow = {
  /**
   * The name of the thing: a use case, a capability, a stage, a direction. It is
   * the anchor of the row, so it is the first thing a reader reads.
   */
  name: string
  /**
   * Which of the four tiers the thing is in. This is what the dot is drawn from;
   * it is not the text a reader sees. See `STATUS_TIERS`.
   */
  status: StatusTier
  /**
   * The words for the tier, in the product's own vocabulary. Required, and
   * deliberately not derived from `status`: a site that says "Flagship -
   * available today" and a site that says "Live" are both describing the same
   * tier, and neither word is Prism's to choose.
   */
  statusLabel: string
  /**
   * The detail line under the name, when the row needs one sentence about what
   * the thing does.
   */
  detail?: string
  /**
   * The bullets the row lists, when the row needs more than one line. A list
   * rather than a paragraph, because a row that lists four things and describes
   * them in prose is a paragraph with a bullet glyph.
   */
  bullets?: readonly string[]
}

/**
 * The props a StatusLedger01 takes.
 *
 * Every string is a prop and the Block ships none: no status word, no tier, no
 * row and no bullet. A ledger that hardcoded "available" would make every
 * consumer publish a claim about their own roadmap that they may not be able to
 * keep.
 */
export type StatusLedger01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a ledger composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The rows, in the order a reader should meet them. Order is the caller's
   * because it is a claim about what matters first, and a ledger that sorted
   * itself would be making that claim on the caller's behalf.
   */
  rows: readonly StatusRow[]
  /**
   * The line under the ledger, for the sentence that qualifies it: what is not
   * here, or where to read more.
   */
  caption?: string
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * A ledger of things and the state each is in: a hairline row per entry, a mark
 * for the tier, and the words for the state beside the name.
 *
 * All four NaniSoft sites publish this section, and three of them publish it as a
 * ledger of rows while the fourth publishes the same shape as a list of products;
 * the ledger appears twice in the fourth site as well, once for use cases and
 * once for research directions. Five ledgers across four sites, each one written
 * by hand, each one re-deciding the same four things: which tier words to use,
 * how the tier is drawn, whether the tier is announced, and whether the row
 * carries a detail line or a bullet list.
 *
 * **The tier is four and the words are the caller's.** The `status` prop takes
 * one of four tiers and the `statusLabel` prop takes the words. That split is the
 * whole design: the tier is a colour, and colour is not information a reader can
 * act on; the words are the information, and the words belong to the product. A
 * Block that rendered the tier's own name would force one vocabulary on five
 * products that between them already use eight, and a Block that took only the
 * words would have nothing to draw.
 *
 * The mark is a ring around a fill rather than a filled dot, which is the
 * contested shape this Block ships and the reason is a measurement: a filled
 * pastel dot fails contrast against a light card, and a dot that fails contrast
 * is a dot that does not exist for the reader it was meant to reassure. The ring
 * is in the brand ink, the fill is the tier's own semantic token, and the whole
 * mark is `aria-hidden`, so the row's `statusLabel` is the state a screen reader
 * hears and a reader who cannot see the dot at all still gets the same fact.
 *
 * A row is a `li` inside an `ol`, so the ledger is a list in the document's
 * outline rather than a grid of divs, and the detail line and the bullet list are
 * the two shapes a row takes. A row with neither is a name and a state and is a
 * valid row: most ledgers are mostly those.
 *
 * It is a server Component: no hook, no state, no client code and no router.
 */
export function StatusLedger01({
  eyebrow,
  title,
  description,
  rows,
  caption,
  headingLevel = 'h2',
}: StatusLedger01Props) {
  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <ol data-slot="status-ledger" className="flex flex-col">
        {rows.map((row) => (
          <li
            key={row.name}
            data-slot="status-ledger-row"
            data-status={row.status}
            className="border-border flex flex-col gap-2 border-b py-5 first:border-t sm:flex-row sm:items-baseline sm:gap-6"
          >
            <div className="flex shrink-0 items-center gap-3 sm:w-64">
              <span
                aria-hidden
                data-tier={row.status}
                className={cn(
                  'border-brand-ink inline-block size-3 shrink-0 rounded-full border',
                  TIER_DOT[row.status],
                )}
              />
              <span className="text-sm font-semibold">{row.name}</span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-muted-foreground font-mono text-xs">{row.statusLabel}</span>
              {row.detail ? (
                <span className="text-muted-foreground text-pretty text-sm">{row.detail}</span>
              ) : null}
              {row.bullets && row.bullets.length > 0 ? (
                <ul className="text-muted-foreground mt-1 flex list-disc flex-col gap-1 pl-5 text-sm">
                  {row.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {caption ? <p className="text-muted-foreground mt-6 text-pretty text-sm">{caption}</p> : null}
    </Section>
  )
}

export default StatusLedger01

import { CtaLink } from '@nanisoft/prism-ui'
import { Offer01 } from '@nanisoft/prism-ui/blocks/offer-01'

/** The band on the filled primary surface, which states its own ink. */
export default function Offer01Demo() {
  return (
    <Offer01
      headingLevel="h3"
      eyebrow="Through March"
      title="Two months of Observe, at the annual rate"
      description="Pay for twelve months once and the first two are not charged. The ledger and the single sign-on are in both months."
      code="OBSERVE12"
      codeLabel="Redemption code"
      tone="primary"
      actions={
        <CtaLink size="lg" variant="secondary" href="/signup?code=OBSERVE12">
          Redeem the code
        </CtaLink>
      }
      terms={
        <>
          New workspaces only, on the annual billing period, and one per billing
          entity. The credit is applied to the first invoice and does not carry
          over. An existing workspace that adds Observe at the end of a term is
          quoted directly.
        </>
      }
    />
  )
}

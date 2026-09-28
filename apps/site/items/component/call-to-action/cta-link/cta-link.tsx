import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'

/**
 * The call to action at each variant, same tab and new tab.
 *
 * Self-contained: the only import is from the package, and it has a default
 * export. The file is the source for the live preview, the copy control and the
 * corpus.
 */
export default function CtaLinkDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CtaLink href="/components/button">Read the guide</CtaLink>
      <CtaLink href="/components/button" variant="secondary">
        Compare variants
      </CtaLink>
      <CtaLink href="/components/button" variant="outline">
        See the API
      </CtaLink>
      <CtaLink href="https://example.com" newTab>
        Open the playground
      </CtaLink>
    </div>
  )
}

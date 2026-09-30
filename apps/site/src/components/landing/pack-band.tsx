import { ArrowRight } from 'lucide-react'

import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '@nanisoft/prism-ui/components/section'
import themes from '@nanisoft/prism-tokens/dist/themes.json'

/**
 * The landing page's pack band: every pack, drawn in its own values.
 *
 * **This is the band that answers "is this a design system or a theme kit".** The
 * other three bands on the landing page are words about the system, and words
 * about a design system are indistinguishable from words about any product. The
 * claim this band makes is checkable by looking at it: six cards, each one
 * painting its own compiled `primary` and its own border, in the same markup,
 * with nothing selected and no JavaScript involved.
 *
 * **The base pack is on this band, and it is the honest entry.** `themes.json`
 * carries the five pastels only; `default` is the absence of a `data-pack`
 * attribute, which is how the token build expresses it, so it is added here
 * rather than skipped. A row of five pastel fills with no neutral in it reads as
 * a theme gallery, and the neutral is the one a reader is most likely to be
 * using right now.
 *
 * **The boundary sits on an element with no radius utility, which is where
 * `DESIGN.md` says it may sit.** The card is `rounded-lg overflow-hidden` in the
 * site's own pack, and the `data-pack` boundary is on the inner `div`, so the
 * pack's colour re-points for the subtree while the card keeps the shape of the
 * page. A boundary on the rounded card itself would re-point `--radius` beneath
 * it and the whole scale is computed from that, so six cards on one row would
 * carry six different corner radii and a reader comparing packs would be
 * comparing shape as well as colour. `check-pack-boundary.mjs` reads this file,
 * and it is why the swatch carries `rounded-none` explicitly rather than
 * inheriting nothing: an element whose parent clips it needs no radius, and
 * saying so is cheaper than a comment saying so.
 *
 * **The pack's radius is shown as data, in the mono face, because it is a
 * property of the pack and the band above is what it looks like.** Each card
 * carries `r 0.875rem` and so on, read from `themes.json`, so the fact is on the
 * page rather than only in the token source.
 *
 * The one action leads to the reader that shows every pack in both modes. It is
 * the only theme intent on the page: the header's theme switcher changes the
 * page a reader is already on, and this leads somewhere else.
 */
export function PackBand({
  eyebrow,
  title,
  description,
  action,
  headingLevel = 'h2',
}: {
  eyebrow?: string
  title: string
  description?: string
  action: { label: string; href: string }
  headingLevel?: HeadingLevel
}) {
  const base = { id: 'default', name: 'Base', radius: '0.5rem' }
  const packs = [base, ...themes]

  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="left"
        className="max-w-measure mb-10"
      />

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {packs.map((pack) => (
          <li key={pack.id} className="border-border overflow-hidden rounded-lg border">
            {/*
              The boundary and the clip are two different jobs on two different
              elements, which is the whole of the pack-boundary rule: this `div`
              re-points `--primary` and `--border` and carries no radius utility,
              and the `li` above it owns the shape and the clip.

              `undefined` for the base pack rather than `"default"`, because the
              token build expresses the base pack as the absence of the attribute
              and emits no `[data-pack="default"]` block. Writing the id out would
              render an attribute that re-points nothing while reading as though it
              did, and the first cell in this row is the one a reader is most
              likely to be looking at, because it is the pack they are in.
            */}
            <div
              data-pack={pack.id === 'default' ? undefined : pack.id}
              className="bg-card flex flex-col gap-3 p-3"
            >
              <div className="bg-muted flex h-14 flex-col justify-between rounded-none p-2">
                <span className="bg-primary block h-3 w-full rounded-none" />
                <span className="bg-accent border-accent-foreground/20 block h-3 w-2/3 rounded-none border" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium tracking-tight">{pack.name}</span>
                <span className="text-muted-foreground font-mono text-[10px]">r {pack.radius}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <CtaLink href={action.href} variant="outline" className="group">
          {action.label}
          <ArrowRight
            className="motion-safe:transition-transform size-4 group-hover:translate-x-0.5"
            aria-hidden
          />
        </CtaLink>
      </div>
    </Section>
  )
}

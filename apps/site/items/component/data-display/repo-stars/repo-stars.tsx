import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { RepoStars } from '@nanisoft/prism-ui/components/repo-stars'
import { Separator } from '@nanisoft/prism-ui/components/separator'

/**
 * A neutral geometric mark, drawn here and nowhere else.
 *
 * The point of this Demo is that the mark is a slot, and the honest way to
 * demonstrate a slot is to fill it with something this repository is entitled to
 * draw. A real repository host's logo is a licensed trademark with rules about
 * its clear space and its colour, which is exactly the argument the Component's
 * documentation makes against shipping one, so reproducing one here would undo
 * the argument in the same commit. The mark is monochrome and takes its ink from
 * the surrounding text, so it also shows the frame doing its only job: holding
 * the space and clipping whatever the caller passes.
 */
const DECORATIVE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * The same mark, named rather than hidden.
 *
 * Two marks in one Demo because the decision is the consumer's: the Component
 * leaves the slot in the accessibility tree, so a mark that carries information
 * the words do not is announced, and a mark that is decoration is the consumer's
 * to mark as such. Passing an `aria-hidden` mark is the caller's own decision
 * and Prism is the only party that cannot make it.
 */
const NAMED = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    role="img"
    aria-label="Forge"
  >
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M8 15.5V9.5l4 3 4-3v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** The count this Demo reports, which is the same figure in all four readouts. */
const STARS = 18432

/**
 * Four readouts, and between them every decision the Component makes.
 *
 * The first is the fallback in the open: a bare number, ungrouped, because no
 * formatter was passed and Prism refuses to guess a locale or a compact form.
 * The second is the same number with the caller's own formatter, and the third
 * repeats the fallback on a link so the difference is visible on the same figure.
 * The fourth shows a named mark beside a decorative one.
 */
export default function RepoStarsDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle as="h3">A project header</CardTitle>
          <CardDescription>
            The mark is a slot. A repository host&apos;s own logo is a licensed
            asset with rules about its clear space and its colour, so the Consumer
            sources it and this Component draws the frame around it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <RepoStars count={STARS} mark={DECORATIVE} label="stars" />

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">No formatter passed</span>
            <RepoStars count={STARS} mark={DECORATIVE} label="stars" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              With the caller&apos;s compact formatter
            </span>
            <RepoStars
              count={STARS}
              mark={DECORATIVE}
              label="stars on this repository"
              format={(count) =>
                new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(count)
              }
              href="https://example.com/repos/prism"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              A link with no formatter, and a named mark beside a decorative one
            </span>
            <RepoStars
              count={STARS}
              mark={NAMED}
              label="stars"
              href="https://example.com/repos/prism"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        The second and the fourth readouts are the same number drawn two ways. The
        compact form is a locale and a judgement, so it is the caller&apos;s
        callback rather than a default, and the fallback is{' '}
        <code className="font-mono">String(count)</code> so a server-rendered
        figure is the same bytes in every deployment region.
      </p>

      <p className="text-muted-foreground text-sm">
        There is no navigation region here and no landmark: a count is not a place,
        so the readout is a span or an anchor and nothing else. The{' '}
        <code className="font-mono">href</code> is yours to resolve.
      </p>
    </div>
  )
}

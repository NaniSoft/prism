import { Ground01 } from '@nanisoft/prism-ui/blocks/ground-01'

/**
 * The ground as each surface wears it, framed rather than fixed: a transform on
 * the frame makes it the containing block for the ground's fixed layer, so the
 * same Block that paints a whole page paints a panel here and the reader can
 * hold both intensities at once. The bar's transparency is off in a frame, for
 * the same reason: it reaches the page's own bar, not the frame's.
 */
export default function Ground01Demo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card relative isolate transform-gpu overflow-hidden rounded-xl border">
        <Ground01 transparentBar={false} />
        <div className="relative flex min-h-80 flex-col items-start gap-4 p-10">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Present, at layout scope
          </p>
          <h3 className="max-w-measure text-3xl font-semibold tracking-tight text-balance">
            One ground behind every section, and a bar that turns to glass over it
          </h3>
          <p className="text-muted-foreground max-w-168 text-lg text-pretty">
            The landing wears this: light in the pack&apos;s own colours, a medium crossing
            it, and one page rather than a hero and a set of separate bands.
          </p>
        </div>
      </div>

      <div className="bg-card relative isolate transform-gpu overflow-hidden rounded-xl border">
        <Ground01 particles={false} intensity="subtle" transparentBar={false} />
        <div className="relative flex min-h-48 flex-col items-start gap-4 p-10">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Subtle, wash only
          </p>
          <h3 className="max-w-measure text-2xl font-semibold tracking-tight text-balance">
            The same light one rung down the veil ladder
          </h3>
          <p className="text-muted-foreground max-w-168 text-lg text-pretty">
            A working surface keeps the medium out from behind its instruments and the
            light one rung quieter, which is two props rather than a second component.
          </p>
        </div>
      </div>
    </div>
  )
}

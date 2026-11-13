import { AuroraWash } from '@nanisoft/prism-ui/components/aurora-wash'

/**
 * The wash as a ground, with type over it, in both intensities so the demo
 * shows the claim the component makes: the planes carry the ground's own
 * colours, and the quiet figure is the same ladder one rung down rather than a
 * second component or a wrapper opacity.
 */
export default function AuroraWashDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card relative overflow-hidden rounded-xl border p-10">
        <AuroraWash className="absolute inset-0" />
        <div className="relative">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Preview
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
            Light through the ground the page is wearing
          </h3>
          <p className="text-muted-foreground mt-4 max-w-168 text-lg text-pretty">
            Three planes on one long orbit, out of step with each other, each
            carrying a colour the page already resolved.
          </p>
        </div>
      </div>
      <div className="bg-card relative overflow-hidden rounded-xl border p-10">
        <AuroraWash intensity="subtle" className="absolute inset-0" />
        <div className="relative">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Subtle
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance">
            The same light, one rung down the veil ladder
          </h3>
          <p className="text-muted-foreground mt-4 max-w-168 text-lg text-pretty">
            Every plane steps down one named rung, which is how a working surface
            wears the wash: the figure keeps its shape and loses one measure of
            presence, and no value that is not a rung is ever painted.
          </p>
        </div>
      </div>
    </div>
  )
}

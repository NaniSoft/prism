import { AuroraWash } from '@nanisoft/prism-ui/components/aurora-wash'

/**
 * The wash as a ground, with type over it, and a pack boundary around the
 * second card so the demo shows the claim the component makes: the planes
 * carry the ground's own colours, and a wash in one pack is a different wash
 * in another.
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
    </div>
  )
}

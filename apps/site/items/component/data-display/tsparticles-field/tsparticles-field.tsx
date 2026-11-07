import { TsparticlesField } from '@nanisoft/prism-ui/components/tsparticles-field'

/**
 * The field as a ground, with type over it, and no other content competing for
 * the reader's eye.
 *
 * The demo is a server component; the field arms its engine in the reader's
 * browser and the floor renders with it.
 */
export default function TsparticlesFieldDemo() {
  return (
    <div className="bg-card relative overflow-hidden rounded-xl border p-10">
      <TsparticlesField className="absolute inset-0" />
      <div className="relative">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Preview
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
          A network the cursor reaches into
        </h3>
        <p className="text-muted-foreground mt-4 max-w-168 text-lg text-pretty">
          Move the cursor across this panel and the links grab toward it. Stop the
          engine, print the page, or ask for less motion, and the field it stands
          on is the same field at rest.
        </p>
      </div>
    </div>
  )
}

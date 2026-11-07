import { ParticleField } from '@nanisoft/prism-ui/components/particle-field'

/**
 * The field as a ground, with type over it, which is the only honest way to
 * preview a medium: a field on its own is a scatter and there is nothing to
 * judge.
 *
 * The demo is a server component. The field is a client component under it, so
 * the floor renders here and the loop arms in the reader's browser, which is
 * the arrangement a product composes.
 */
export default function ParticleFieldDemo() {
  return (
    <div className="bg-card relative overflow-hidden rounded-xl border p-10">
      <ParticleField count={56} className="absolute inset-0" />
      <div className="relative">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Preview
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
          A medium as a ground, with type over it
        </h3>
        <p className="text-muted-foreground mt-4 max-w-168 text-lg text-pretty">
          The points drift on linked paths and answer the pointer. Move the hand
          across this panel and the medium parts around it, and the field it
          falls back to when the loop is stopped is the same field at rest.
        </p>
      </div>
    </div>
  )
}

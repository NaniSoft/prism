import { SignalField } from '@nanisoft/prism-ui/components/signal-field'

/**
 * The field as a ground, with a heading over it.
 *
 * This is the only honest way to preview it: a field on its own is a grid of
 * dots and there is nothing to judge. Put type on it and the relationship the
 * component is for becomes visible, which is also the relationship it has to
 * hold in a product.
 */
export default function SignalFieldDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card relative overflow-hidden rounded-xl border p-10">
        <SignalField count={44} emphasisAt={0.6} className="absolute inset-0" />
        <div className="relative">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Preview
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
            A field as a ground, with type over it
          </h3>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-pretty">
            The marks are a texture the heading reads against. Still by default, because
            movement behind a reading passage is the first thing a reader asks to have
            gone.
          </p>
        </div>
      </div>

      <div className="bg-card relative overflow-hidden rounded-xl border p-10">
        <SignalField count={44} drift emphasisAt={0.28} className="absolute inset-0" />
        <div className="relative">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Preview, drifting
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
            The same field, with drift on
          </h3>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-pretty">
            Each mark drifts on its own long cycle and out of step with its neighbours, so
            the field reads as a system rather than as a loop.
          </p>
        </div>
      </div>
    </div>
  )
}

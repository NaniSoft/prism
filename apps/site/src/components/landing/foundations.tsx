import { Bento01 } from '@nanisoft/prism-ui/blocks/bento-01'

/**
 * The foundations band: the scale under the components, shown rather than named.
 *
 * The pack band already shows colour and radius as data on a card. This band
 * shows the other three foundations a consumer composes with: the type ladder,
 * the corner scale, and the two motion laws. Every value is drawn in the
 * component that uses it, so a reader can see what a step is before reading it.
 *
 * It is site apparatus rather than a Block. A foundations gallery is one site's
 * way of presenting its own tokens, and a Block shaped by this page would be a
 * Block no consumer could use.
 */
export function Foundations() {
  return (
    <Bento01
      headingLevel="h2"
      title="The foundations underneath"
      description="A neutral base and seven pastels, one type ladder, one radius scale and two laws of motion. Every step below is the token a component reads, not a sample of it."
      cells={[
        {
          id: 'type',
          span: 'lg',
          title: 'Type',
          body: (
            <div className="flex flex-col gap-3">
              <span className="text-3xl font-semibold tracking-tight">Display 600</span>
              <span className="text-xl font-semibold tracking-tight">Title 600</span>
              <span className="text-base">Body 400, the reading size</span>
              <span className="text-muted-foreground font-mono text-mono uppercase">
                label 500 / mono 400
              </span>
            </div>
          ),
        },
        {
          id: 'radius',
          span: 'md',
          title: 'Radius',
          body: (
            <div className="flex items-end gap-3">
              <span className="bg-muted border-border flex size-14 items-center justify-center rounded-md border font-mono text-mono">
                md
              </span>
              <span className="bg-muted border-border flex size-14 items-center justify-center rounded-xl border font-mono text-mono">
                xl
              </span>
              <span className="bg-muted border-border flex size-14 items-center justify-center rounded-3xl border font-mono text-mono">
                3xl
              </span>
            </div>
          ),
        },
        {
          id: 'motion',
          span: 'md',
          title: 'Motion',
          body: (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-mono uppercase">feedback</span>
                <span className="text-muted-foreground text-sm">80 / 160 / 280 ms, decelerating</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-mono uppercase">ambient</span>
                <span className="text-muted-foreground text-sm">
                  travel 7.2s, scan 6s, pulse 2.4s
                </span>
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
